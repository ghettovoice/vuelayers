export default {
  props: [
    {
      name: 'preload',
      description: '<p>Load low-resolution tiles up to <code>preload</code> levels.</p>',
      type: 'number',
      required: false,
      sync: false,
      default: 0,
    },
  ],
  members: [],
  methods: [],
  events: [],
  slots: [
    {
      name: 'default',
      description: '<p>Default slot for <code>vl-source-*</code> (tile-like only) components.</p>',
      scoped: false,
    },
  ],
}
