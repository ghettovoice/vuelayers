<template lang="pug">
  div(:class="[$options.name]")
    vld-hero(:bold="bold", :color="color")
      h1.title {{ title }}
      h2.subtitle {{ subtitle }}

    section.section.content
      p #[b Map] package consists of two main components:
      ul
        li.
          #[code vl-map] - Container for #[b layers], #[b interactions], #[b controls] and #[b overlays].
          It responsible for viewport rendering and low level interaction events.
        li.
          #[code vl-view] - Represents a simple 2D view of the map. This is the component to act upon to change the #[b center],
          #[b resolution], and #[b rotation] of the map.

      h3 vl-map
      b-tabs
        b-tab-item(label="Properties")
          | TODO: describe props
        b-tab-item(label="Events")
          | TODO: describe events
        b-tab-item(label="Methods")
          | TODO: describe events
</template>

<script>
  import page from '../page'

  export default {
    name: 'vld-map-page',
    mixins: [page],
  }
</script>
