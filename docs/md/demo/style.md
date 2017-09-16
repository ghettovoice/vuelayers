::: content

```stylus
@import variables
@import ~highlight.js/styles/github-gist
// import VueLayers styles
@import ~vuelayers/lib/style
// Import Buefy styles
@import ~buefy/src/scss/buefy-build

html, body
  height: 100%
  width: 100%
  box-sizing: border-box

html *
  box-sizing: border-box

.demo-app
  position: relative
  .map
    height: 500px
  .map-panel
    padding: 0
    .panel-heading
      box-shadow: 0 .25em .5em transparentize($dark, 0.8)
    .panel-content
      background: $white
      box-shadow: 0 .25em .5em transparentize($dark, 0.8)
    +widescreen()
      position: absolute
      top: 0
      right: 0
      max-height: 500px
      width: 20em
  .feature-popup
    position: absolute
    left: -50px
    bottom: 12px
    width: 20em
    max-width: none
    &:after, &:before
      top: 100%
      border: solid transparent
      content: ' '
      height: 0
      width: 0
      position: absolute
      pointer-events: none
    &:after
      border-top-color: white
      border-width: 10px
      left: 48px
      margin-left: -10px
    &:before
      border-top-color: #cccccc
      border-width: 11px
      left: 48px
      margin-left: -11px
    .card-content
      max-height: 20em
      overflow: auto
    .content
      word-break: break-all
```

:::
