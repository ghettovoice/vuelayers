const generate = require('astring').generate
const compiler = require('vue-template-compiler')
const catharsis = require('catharsis')
const jsdocName = require('jsdoc/lib/jsdoc/name')

let vueProtoObjectNodes

exports.handlers = {
  beforeParse (evt) {
    vueProtoObjectNodes = Object.create(null)

    if (isVueFile(evt.filename)) {
      const parsedComponent = compiler.parseComponent(evt.source)
      evt.source = parsedComponent.script ? parsedComponent.script.content : ''
    }
  },
  newDoclet (evt) {
    let doclets = this.results()
    // fix memberOf, scope, longname for vueProps, vueComputed, vueMethods and etc
    if (/^\s*\*\s@vueProto(\s.*)?$/im.test(evt.doclet.comment)) {
      let {
        propsNode,
        computedNode,
        methodsNode,
        dataNode,
      } = vueProtoObjectNodes

      // props
      if (propsNode && isObjectExpression(propsNode)) {
        let propNodes = propsNode.properties.map(({ value }) => value)
        let props = doclets.filter(d => d.vueProp && d.meta.code && propNodes.includes(d.meta.code.node))
        if (props.length) {
          // defined as separate variable declaration
          props.forEach(d => d.setScope(jsdocName.SCOPE.NAMES.INSTANCE))
          updateMemberOf(doclets, props, evt.doclet)
        } else {
          // defined as inner object expression
          setTagsForProps(propsNode, 'memberOf', evt.doclet.longname + jsdocName.SCOPE.PUNC.INSTANCE)
        }
      }

      // computed
      if (computedNode && isObjectExpression(computedNode)) {
        let compNodes = computedNode.properties.map(({ value }) => value)
        let computed = doclets.filter(d => d.vueComputedProp && d.meta.code && compNodes().includes(d.meta.code.node))
        if (computed.length) {
          // defined as separate variable declaration
          computed.forEach(d => d.setScope(jsdocName.SCOPE.NAMES.INSTANCE))
          updateMemberOf(doclets, computed, evt.doclet)
        } else {
          // defined as inner object expression
          setTagsForProps(computedNode, 'memberOf', evt.doclet.longname + jsdocName.SCOPE.PUNC.INSTANCE)
        }
      }

      // methods
      if (methodsNode && isObjectExpression(methodsNode)) {
        let methodNodes = methodsNode.properties.map(({ value }) => value)
        let methods = doclets.filter(d => d.vueMethod && d.meta.code && methodNodes.includes(d.meta.code.node))
        if (methods.length) {
          // defined as separate variable declaration
          methods.forEach(d => d.setScope(jsdocName.SCOPE.NAMES.INSTANCE))
          updateMemberOf(doclets, methods, evt.doclet)
        } else {
          // defined as inner object expression
          setTagsForProps(methodsNode, 'memberOf', evt.doclet.longname + jsdocName.SCOPE.PUNC.INSTANCE)
        }
      }

      // methods
      if (dataNode && isObjectExpression(nodeOrReturnArgument(dataNode))) {
        let dataNodes = nodeOrReturnArgument(dataNode).properties.map(({ value }) => value)
        let data = doclets.filter(d => d.vueDataProp && d.meta.code && dataNodes.includes(d.meta.code.node))
        if (data.length) {
          // defined as separate variable declaration
          data.forEach(d => d.setScope(jsdocName.SCOPE.NAMES.INSTANCE))
          updateMemberOf(doclets, data, evt.doclet)
        } else {
          // defined as inner object expression
          setTagsForProps(dataNode, 'memberOf', evt.doclet.longname + jsdocName.SCOPE.PUNC.INSTANCE)
        }
      }
    }

    // fix type expressions
    if (evt.doclet.type) {
      evt.doclet.typeExpression = catharsis.stringify(evt.doclet.type.parsedType)
    }

    if (evt.doclet.params) {
      evt.doclet.params.forEach(param => {
        if (param.type) {
          param.typeExpression = catharsis.stringify(param.type.parsedType)
        }
      })
    }
  },
  fileComplete () {
    vueProtoObjectNodes = undefined
  },
}

exports.astNodeVisitor = {
  visitNode (node, evt, parser) {
    if (/^\s*\*\s@vueProto\s*$/im.test(evt.comment)) {
      handleVueProto(evt.code.node, evt, parser)
    } else if (/^\s*\*\s@vueProps\s*$/im.test(evt.comment)) {
      evt.comment = setCommentTag(evt.comment, 'private')
      setTagsForProps(evt.code.node, 'vueProp')
      vueProtoObjectNodes.propsNode = evt.code.node
    } else if (/^\s*\*\s@vueComputed\s*$/im.test(evt.comment)) {
      evt.comment = setCommentTag(evt.comment, 'private')
      setTagsForProps(evt.code.node, 'vueComputedProp')
      vueProtoObjectNodes.computedNode = evt.code.node
    } else if (/^\s*\*\s@vueData\s*$/im.test(evt.comment)) {
      evt.comment = setCommentTag(evt.comment, 'private')
      setTagsForProps(evt.code.node, 'vueDataProp')
      vueProtoObjectNodes.dataNode = evt.code.node
    } else if (/^\s*\*\s@vueMethods\s*$/im.test(evt.comment)) {
      evt.comment = setCommentTag(evt.comment, 'private')
      setTagsForProps(evt.code.node, 'vueMethod')
      vueProtoObjectNodes.methodsNode = evt.code.node
    } else if (/^\s*\*\s@vueProp\s?.*$/im.test(evt.comment)) {
      handleVueProp(evt.code.node, evt, parser)
    } else if (/^\s*\*\s@vueComputedProp\s?.*$/im.test(evt.comment)) {
      handleVueCompProp(evt.code.node, evt, parser)
    } else if (/^\s*\*\s@vueDataProp\s?.*$/im.test(evt.comment)) {
      handleVueDataProp(evt.code.node, evt, parser)
    } else if (/^\s*\*\s@vueMethod\s?.*$/im.test(evt.comment)) {
      handleVueMethod(evt.code.node, evt, parser)
    }
  },
}

exports.defineTags = function (dict) {
  dict.defineTag('vueProto', {
    onTagged (doclet, tag) {
      doclet.vueProto = tag.value || true
    },
  })

  dict.defineTag('vueProps', {
    mustHaveValue: false,
    onTagged (doclet) {
      doclet.vueProps = true
    },
  })
  dict.defineTag('vueProp', {
    mustHaveValue: false,
    onTagged (doclet) {
      doclet.vueProp = true
    },
  })

  dict.defineTag('vueComputed', {
    mustHaveValue: false,
    onTagged (doclet) {
      doclet.vueComputed = true
    },
  })
  dict.defineTag('vueComputedProp', {
    mustHaveValue: false,
    onTagged (doclet) {
      doclet.vueComputedProp = true
    },
  })

  dict.defineTag('vueData', {
    mustHaveValue: false,
    onTagged (doclet) {
      doclet.vueData = true
    },
  })
  dict.defineTag('vueDataProp', {
    mustHaveValue: false,
    onTagged (doclet) {
      doclet.vueDataProp = true
    },
  })

  dict.defineTag('vueMethods', {
    mustHaveValue: false,
    onTagged (doclet) {
      doclet.vueMethods = true
    },
  })
  dict.defineTag('vueMethod', {
    mustHaveValue: false,
    onTagged (doclet) {
      doclet.vueMethod = true
    },
  })

  dict.defineTag('required', {
    mustHaveValue: false,
    onTagged (doclet) {
      doclet.required = true
    },
  })
}

function handleVueProto (node, evt, parser) {
  if (!isObjectExpression(node)) return

  let vueProtoObjectNodes = getVueProtoPropertyValueNodes(node)
  let {
    nameNode,
    mixinsNode,
    propsNode,
    computedNode,
    methodsNode,
    dataNode,
  } = vueProtoObjectNodes

  evt.comment = setCommentTag(evt.comment, 'extends', 'Vue')

  if (nameNode && isLiteral(nameNode)) {
    evt.comment = setCommentTag(evt.comment, 'vueProto', nameNode.value)
  }

  if (mixinsNode && isArrayExpression(mixinsNode)) {
    mixinsNode.elements.forEach(elementNode => {
      evt.comment = setCommentTag(evt.comment, 'mixes', elementNode.name, true)
    })
  }
  // auto tag props, computed, methods
  if (propsNode && isObjectExpression(propsNode)) {
    setTagsForProps(propsNode, 'vueProp')
  }
  if (computedNode && isObjectExpression(computedNode)) {
    setTagsForProps(computedNode, 'vueComputedProp')
  }
  if (dataNode && (isObjectExpression(dataNode) || isFunctionExpression(dataNode))) {
    setTagsForProps(dataNode, 'vueDataProp')
  }
  if (methodsNode && isObjectExpression(methodsNode)) {
    setTagsForProps(methodsNode, 'vueMethod')
  }
}

function handleVueProp (node, evt, parser) {
  const handle = typeNode => {
    switch (typeNode.type) {
      case 'Literal':
        evt.comment = setCommentTag(evt.comment, 'type', `{${ctorNameToType(typeNode.value)}`)
        break
      case 'ArrayExpression':
        evt.comment = setCommentTag(evt.comment, 'type',
          `{(${typeNode.elements.map(n => ctorNameToType(n.name)).join('|')})}`)
        break
      case 'ObjectExpression':
        let typePropNode = typeNode.properties.find(n => n.key.name === 'type')
        let defaultPropNode = typeNode.properties.find(n => n.key.name === 'default')
        let requiredPropNode = typeNode.properties.find(n => n.key.name === 'required')

        if (!typePropNode) return

        handle(typePropNode.value)
        if (defaultPropNode) {
          evt.comment = setCommentTag(evt.comment, 'default', generate(defaultPropNode.value))
        }
        if (requiredPropNode) {
          evt.comment = setCommentTag(evt.comment, 'required')
        }
        break
    }
  }

  handle(node)
}

function handleVueCompProp (node, evt, parser) {
  // todo handle getter/setter expression
}

function handleVueDataProp (node, evt, parser) {
}

function handleVueMethod (node, evt, parser) {
}

function isVueFile (file) {
  return /\.vue$/.test(file)
}

function getVueProtoPropertyValueNodes (node) {
  let nameNode, mixinsNode, propsNode, computedNode, methodsNode,
    dataNode

  node.properties.forEach(node => {
    if (!isIdentifier(node.key)) return

    switch (node.key.name) {
      case 'name':
        nameNode = node.value
        break
      case 'mixins':
        mixinsNode = node.value
        break
      case 'props':
        propsNode = node.value
        break
      case 'computed':
        computedNode = node.value
        break
      case 'methods':
        methodsNode = node.value
        break
      case 'data':
        dataNode = node.value
        break
    }
  })

  return {
    nameNode,
    mixinsNode,
    propsNode,
    computedNode,
    methodsNode,
    dataNode,
  }
}

function getNodeCommentBlock (node) {
  node.leadingComments || (node.leadingComments = [])
  let commentBlock = node.leadingComments.find(isCommentBlock)
  if (!commentBlock) {
    commentBlock = {
      type: 'CommentBlock',
      value: '',
      start: node.start,
      end: node.end,
      loc: node.loc,
      range: node.range,
    }
    node.leadingComments.push(commentBlock)
  }

  return commentBlock
}

function setTagsForProps (node, tag, value = '') {
  if (isFunctionExpression(node)) {
    setTagsForProps(getReturnArgument(node), tag, value)

    return
  }

  if (!isObjectExpression(node)) return

  let tags
  if (typeof tag === 'string') {
    tags = { [tag]: value }
  } else if (typeof tag === 'object') {
    tags = tag
  }

  if (!tags) return

  node.properties.forEach(propertyNode => {
    let commentBlock = getNodeCommentBlock(propertyNode)
    Object.keys(tags).forEach(tag => {
      commentBlock.value = setCommentTag(commentBlock.value, tag, tags[tag], false, false)
    })
  })
}

function getReturnArgument (funcExprNode) {
  let returnStmtNode = funcExprNode.body.body.find(isReturnStatement)

  return returnStmtNode ? returnStmtNode.argument : undefined
}

function nodeOrReturnArgument (node) {
  if (isFunctionExpression(node)) {
    return getReturnArgument(node)
  }

  return node
}

function updateMemberOf (allDoclets, docletsForUpdate, parent) {
  docletsForUpdate.forEach(doclet => {
    let children = allDoclets.filter(({ memberof }) => memberof === doclet.longname)

    doclet.setMemberof(parent.longname)
    doclet.setLongname('')
    jsdocName.resolve(doclet)

    if (children.length) {
      updateMemberOf(allDoclets, children, doclet)
    }
  })
}

function isFunctionExpression (node) {
  return node.type === 'FunctionExpression'
}

function isIdentifier (node) {
  return node.type === 'Identifier'
}

function isObjectExpression (node) {
  return node.type === 'ObjectExpression'
}

function isCommentBlock (node) {
  return node.type === 'CommentBlock'
}

function isReturnStatement (node) {
  return node.type === 'ReturnStatement'
}

function isArrayExpression (node) {
  return node.type === 'ArrayExpression'
}

function isLiteral (node) {
  return node.type === 'Literal'
}

function dump (value) {
  console.dir(value, { depth: null })
}

function setCommentTag (commentBlock, tag, value = '', append = false, wrap = true) {
  let commentBody = extractCommentBody(commentBlock) || ''
  let match = commentBody.match(new RegExp(`^\\s*\\*\\s@${tag}\\s?.*$`, 'im'))
  let tagLine = `* @${tag}${value ? ' ' + value : ''}`

  if (append) {
    commentBody += `\n ${tagLine}`
  } else {
    if (match) {
      commentBody = commentBody.replace(match[0], ` ${tagLine}`)
    } else {
      commentBody += `\n ${tagLine}`
    }
  }

  return wrap ? `/**\n${commentBody.trim()}\n */` : `*\n${commentBody.trim()}\n `
}

function extractCommentBody (commentBlock) {
  return commentBlock.replace(/^(\/\*)?\*\n?/, '')
    // replace closing star slash with end-marker
    .replace(/\n?\s*\*\/$/, '')
    .trim()
}

function ctorNameToType (ctorName) {
  let type = ctorName.toLowerCase()
  if (['string', 'number', 'boolean', 'array', 'function', 'symbol'].includes(type)) {
    return type
  }

  return ctorName
}
