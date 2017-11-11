export default {
  props: [
    {
      name: 'controls',
      description: `<p>Options for default controls added to the map by default. Set to <code>false</code> to disable 
                    all map controls. Objectvalue is used to configure controls.</p>`,
      type: 'Object, boolean',
      required: false,
      sync: false,
      default: 'true',
    },
    {
      name: 'keyboard-event-target',
      description: `<p>The element to listen to keyboard events on. For example, if this option is set to 
                    <code>document</code> the keyboard interactions will always trigger. If this option is not 
                    specified, the element the library listens to keyboard events on is the component root element.</p>`,
      type: 'string, Element, Document',
      required: false,
      sync: false,
      default: 'this.$el',
    },
    {
      name: 'load-tiles-while-animating',
      description: `<p>When set to <code>true</code>, tiles will be loaded during animations.</p>`,
      type: 'boolean',
      required: false,
      sync: false,
      default: 'false',
    },
    {
      name: 'load-tiles-while-interacting',
      description: `<p>When set to <code>true</code>, tiles will be loaded while interacting with the map.</p>`,
      type: 'boolean',
      required: false,
      sync: false,
      default: 'false',
    },
    {
      name: 'logo',
      description: `<p>The map logo. If a <strong>string</strong> is provided, it will be set as the image source of 
                    the logo. If an <strong>object</strong> is provided, the <code>src</code> property should be the 
                    <strong>URL</strong> for an image and the <code>href</code> property should be a <strong>URL</strong> 
                    for creating a link. If an <strong>element</strong> is provided, the <strong>element</strong> will 
                    be used. To disable the map logo, set the option to <code>false</code>. By default, the 
                    <strong>OpenLayers</strong> logo is shown.</p>`,
      type: 'boolean, string, Object, Element',
      required: false,
      sync: false,
      default: 'undefined',
    },
    {
      name: 'move-tolerance',
      description: `<p>The minimum distance in pixels the cursor must move to be detected as a map move event 
                    instead of a click. Increasing this value can make it easier to click on the map.</p>`,
      type: 'Number',
      required: false,
      sync: false,
      default: 1,
    },
    {
      name: 'pixel-ratio',
      description: `<p>The ratio between physical pixels and device-independent pixels (dips) on the device.</p>`,
      type: 'number',
      required: false,
      sync: false,
      default: 1,
    },
    {
      name: 'renderer',
      description: `<p>Renderer. By default, <strong>Canvas</strong> and <strong>WebGL</strong> renderers are tested 
                    for support in that order, and the first supported used. <strong>Note</strong> that the 
                    <strong>Canvas</strong> renderer fully supports vector data, but <strong>WebGL</strong> 
                    can only render <strong>Point</strong> geometries.</p>`,
      type: 'string, string[]',
      required: false,
      sync: false,
      default: `['canvas', 'webgl']`,
    },
    {
      name: 'tabindex',
      description: `<p>Root element <code>tabindex</code> attribute value. Value should be provided to allow keyboard events on map.</p>`,
      type: 'number, string',
      required: false,
      sync: false,
      default: 'undefined',
    },
  ],
  members: [
    {
      name: '$createPromise',
      description: `<p>Promise that resolves when underlying <b>OpenLayers</b> instance created.</p>`,
      type: 'Promise',
    },
    {
      name: '$map',
      description: `<p>Reference to <code>ol.Map</code> instance.</p>`,
      type: 'ol.Map, undefined',
    },
    {
      name: '$mountPromise',
      description: `<p>Promise that resolves when underlying <b>OpenLayers</b> instance mounted.</p>`,
      type: 'Promise',
    },
    {
      name: '$view',
      description: `<p>Reference to <code>ol.View</code> instance.</p>`,
      type: 'ol.View, undefined',
    },
  ],
  methods: [
    {
      name: 'focus',
      description: `<p>Triggers focus on map container.</p>`,
      arguments: [],
      returns: [
        {
          type: 'void',
          description: '',
        },
      ],
    },
    {
      name: 'forEachFeatureAtPixel',
      description: `<p>Detect features that intersect a pixel on the viewport, and execute a callback with each 
                    intersecting feature. Layers included in the detection can be configured through the <code>layerFilter</code> 
                    option in <code>opts</code>.</p>`,
      arguments: [
        {
          name: 'pixel',
          description: '',
          optional: false,
          type: 'number[]',
        },
        {
          name: 'callback',
          description: '',
          optional: false,
          type: 'function((ol.Feature, ol.render.Feature), ?ol.layer.Layer): *',
        },
        {
          name: 'opts',
          description: '',
          optional: true,
          type: 'Object',
        },
      ],
      returns: [
        {
          type: '*, undefined',
          description: '',
        },
      ],
    },
    {
      name: 'forEachLayerAtPixel',
      description: `<p>Detect layers that have a color value at a pixel on the viewport, and execute a callback with 
                    each matching layer. Layers included in the detection can be configured through <code>layerFilter</code>.</p>`,
      arguments: [
        {
          name: 'pixel',
          description: '',
          optional: false,
          type: 'number[]',
        },
        {
          name: 'callback',
          description: '',
          optional: false,
          type: 'function(ol.layer.Layer, ?(number[], Uint8Array)): *',
        },
        {
          name: 'layerFilter',
          description: '',
          optional: true,
          type: 'function(ol.layer.Layer): boolean',
        },
      ],
      returns: [
        {
          type: '*, undefined',
          description: '',
        },
      ],
    },
    {
      name: 'getCoordinateFromPixel',
      description: `Get the coordinate for a given pixel. This returns a coordinate in the <b>EPSG:4326</b> projection.`,
      arguments: [
        {
          name: 'pixel',
          description: '',
          optional: false,
          type: 'number[]',
        },
      ],
      returns: [
        {
          type: 'number[]',
          description: `<p>Coordinates in <b>EPSG:4326</b></p>`,
        },
      ],
    },
    {
      name: 'refresh',
      description: `<p>Updates map size and re-renders map.</p>`,
      arguments: [],
      returns: [
        {
          type: 'Promise',
          description: '',
        },
      ],
    },
    {
      name: 'render',
      description: `<p>Request a map rendering (at the next animation frame).</p>`,
      arguments: [],
      returns: [
        {
          type: 'Promise',
          description: '',
        },
      ],
    },
    {
      name: 'updateSize',
      description: `<p>Updates map size.</p>`,
      arguments: [],
      returns: [
        {
          type: 'void',
          description: '',
        },
      ],
    },
  ],
  events: [
    {
      name: 'click',
      description: `<p>A click with no dragging. A double click will fire two of this.</p>`,
      argument: 'ol.MapBrowserEvent',
    },
    {
      name: 'created',
      description: `<p>Emitted when underlying <b>OpenLayers</b> instance created.</p>`,
      argument: 'void',
    },
    {
      name: 'dblclick',
      description: `<p>A true double click, with no dragging.</p>`,
      argument: 'ol.MapBrowserEvent',
    },
    {
      name: 'destroyed',
      description: `<p>Emitted when underlying <b>OpenLayers</b> instance destroyed.</p>`,
      argument: 'void',
    },
    {
      name: 'mounted',
      description: `<p>Emitted when underlying <b>OpenLayers</b> instance mounted to parent.</p>`,
      argument: 'void',
    },
  ],
  slots: [
    {
      name: 'default',
      description: `<p>Default slot for all child components.</p>`,
      scoped: false,
    },
  ],
}
