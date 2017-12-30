export default {
  props: [
    {
      name: 'render-mode',
      description: `<p>Render mode for vector layers. Available values:</p> 
                    <ul>
                      <li><code>image</code> - vector layers are rendered as images</li>
                      <li><code>vector</code> - vector layers are rendered as vectors</li>
                    </ul>`,
      type: 'string',
      required: false,
      sync: false,
      default: 'vector',
    },
    {
      name: 'update-while-animating',
      description: '<p>When set to <code>true</code>, feature batches will be recreated during animations.</p> ',
      type: 'boolean',
      required: false,
      sync: false,
      default: 'false',
    },
    {
      name: 'update-while-interacting',
      description: '<p>When set to <code>true</code>, feature batches will be recreated during interactions.</p> ',
      type: 'boolean',
      required: false,
      sync: false,
      default: 'false',
    },
  ],
  members: [],
  methods: [],
  events: [],
  slots: [
    {
      name: 'default',
      description: '',
      scoped: false,
    },
  ],
}
