const generate = require('astring').generate
const compiler = require('vue-template-compiler')
const catharsis = require('catharsis')

exports.handlers = {
  beforeParse (evt) {
    if (isVueFile(evt.filename)) {
      const parsedComponent = compiler.parseComponent(evt.source)
      evt.source = parsedComponent.script ? parsedComponent.script.content : ''
    }
  },
  newDoclet (evt) {
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
}

exports.astNodeVisitor = {
  visitNode (node, evt, parser) {
    if (/^\s*\*\s@vueProto\s*$/im.test(evt.comment)) {
      handleVueProto(evt.code.node, evt, parser)
    } else if (/^\s*\*\s@vueProps\s*$/im.test(evt.comment)) {
      evt.comment = setCommentTag(evt.comment, 'private')
      setTagsForProps(evt.code.node, 'vueProp')
    } else if (/^\s*\*\s@vueComputed\s*$/im.test(evt.comment)) {
      evt.comment = setCommentTag(evt.comment, 'private')
      setTagsForProps(evt.code.node, 'vueComputedProp')
    } else if (/^\s*\*\s@vueData\s*$/im.test(evt.comment)) {
      evt.comment = setCommentTag(evt.comment, 'private')
      setTagsForProps(evt.code.node, 'vueDataProp')
    } else if (/^\s*\*\s@vueMethods\s*$/im.test(evt.comment)) {
      evt.comment = setCommentTag(evt.comment, 'private')
      setTagsForProps(evt.code.node, 'vueMethod')
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
      doclet.vueProto = tag.value
    },
  })

  dict.defineTag('vueProps', {
    mustHaveValue: false,
  })
  dict.defineTag('vueProp', {
    mustHaveValue: false,
    onTagged (doclet) {
      doclet.vueProp = true
    },
  })

  dict.defineTag('vueComputed', {
    mustHaveValue: false,
  })
  dict.defineTag('vueComputedProp', {
    mustHaveValue: false,
    onTagged (doclet) {
      doclet.vueCompProp = true
    },
  })

  dict.defineTag('vueData', {
    mustHaveValue: false,
  })
  dict.defineTag('vueDataProp', {
    mustHaveValue: false,
    onTagged (doclet) {
      doclet.vueDataProp = true
    },
  })

  dict.defineTag('vueMethods', {
    mustHaveValue: false,
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

  let namePropertyNode, mixinsPropertyNode, propsPropertyNode, computedPropertyNode, methodsPropertyNode,
    dataPropertyNode

  node.properties.forEach(node => {
    if (!isIdentifier(node.key)) return

    switch (node.key.name) {
      case 'name':
        namePropertyNode = node
        break
      case 'mixins':
        mixinsPropertyNode = node
        break
      case 'props':
        propsPropertyNode = node
        break
      case 'computed':
        computedPropertyNode = node
        break
      case 'methods':
        methodsPropertyNode = node
        break
      case 'data':
        dataPropertyNode = node
        break
    }
  })

  evt.comment = setCommentTag(evt.comment, 'extends', 'Vue')

  if (namePropertyNode) {
    evt.comment = setCommentTag(evt.comment, 'vueProto', namePropertyNode.value.value)
  }

  if (mixinsPropertyNode) {
    mixinsPropertyNode.value.elements.forEach(elementNode => {
      evt.comment = setCommentTag(evt.comment, 'mixes', elementNode.name, true)
    })
  }
  // auto tag props, computed, methods
  if (propsPropertyNode && isObjectExpression(propsPropertyNode.value)) {
    setTagsForProps(propsPropertyNode.value, 'vueProp')
  }
  if (computedPropertyNode && isObjectExpression(computedPropertyNode.value)) {
    setTagsForProps(computedPropertyNode.value, 'vueComputedProp')
  }
  if (
    dataPropertyNode &&
    (isObjectExpression(dataPropertyNode.value) || isFunctionExpression(dataPropertyNode.value))
  ) {
    setTagsForProps(dataPropertyNode.value, 'vueDataProp')
  }
  if (methodsPropertyNode && isObjectExpression(methodsPropertyNode.value)) {
    setTagsForProps(methodsPropertyNode.value, 'vueMethod')
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

function setTagsForProps (node, tag) {
  if (isFunctionExpression(node)) {
    let returnStmtNode = node.body.body.find(isReturnStatement)
    if (returnStmtNode) {
      setTagsForProps(returnStmtNode.argument, tag)
    }

    return
  }

  if (!isObjectExpression(node)) return

  node.properties.forEach(propertyNode => {
    let commentBlock = getNodeCommentBlock(propertyNode)
    commentBlock.value = setCommentTag(commentBlock.value, tag, '', false, false)
  })
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

  let parentDoclets = parser.resolvePropertyParents(node.parent)
  evt.comment = setCommentTag(evt.comment, 'memberOf', parentDoclets[0].memberof + '.prototype')
}

function handleVueCompProp (node, evt, parser) {
  // todo handle getter/setter expression
  let parentDoclets = parser.resolvePropertyParents(node.parent)
  evt.comment = setCommentTag(evt.comment, 'memberOf', parentDoclets[0].memberof + '.prototype')
}

function handleVueDataProp (node, evt, parser) {
  let parentDoclets = parser.resolvePropertyParents(node.parent)
  evt.comment = setCommentTag(evt.comment, 'memberOf', parentDoclets[0].memberof + '.prototype')
}

function handleVueMethod (node, evt, parser) {
  let parentDoclets = parser.resolvePropertyParents(node.parent)
  evt.comment = setCommentTag(evt.comment, 'memberOf', parentDoclets[0].memberof + '.prototype')
}

function isVueFile (file) {
  return /\.vue$/.test(file)
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
