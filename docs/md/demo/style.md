::: content

```stylus
@import ../styles/variables
// Import Bulma and Buefy styles for UI
@import ~bulma
@import ~buefy/src/scss/buefy
// Import C_PKG_FULLNAME styles
@import ~C_PKG_NAME/dist/C_PKG_NAME

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
