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
      name: 'keyboardEventTarget',
      description: `<p>The element to listen to keyboard events on. For example, if this option is set to 
                    <code>document</code> the keyboard interactions will always trigger. If this option is not 
                    specified, the element the library listens to keyboard events on is the component root element.</p>`,
      type: 'string, Element, Document',
      required: false,
      sync: false,
      default: 'this.$el',
    },
    {
      name: 'loadTilesWhileAnimating',
      description: `<p>When set to <code>true</code>, tiles will be loaded during animations.</p>`,
      type: 'boolean',
      required: false,
      sync: false,
      default: 'false',
    },
    {
      name: 'loadTilesWhileInteracting',
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
      name: 'moveTolerance',
      description: `<p>The minimum distance in pixels the cursor must move to be detected as a map move event 
                    instead of a click. Increasing this value can make it easier to click on the map.</p>`,
      type: 'Number',
      required: false,
      sync: false,
      default: 1,
    },
    {
      name: 'pixelRatio',
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
      name: 'tabIndex',
      description: `<p><code>tabindex</code> value to enable keyboard interaction.</p>`,
      type: 'number',
      required: false,
      sync: false,
      default: 0,
    },
  ],
  members:
    [
      {
        name: '$map',
        description: `<p>OpenLayers map instance.</p>`,
        type: 'ol.Map, undefined',
      },
      {
        name: '$view',
        description: `<p>OpenLayers view instance.</p>`,
        type: 'ol.View, undefined',
      },
    ],
  methods:
    [
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
        description: '',
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
        description: '',
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
        description: '',
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
        description: `<p>Triggers map re-render.</p>`,
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
        description: '',
        arguments: [],
        returns: [
          {
            type: 'Promise',
            description: '',
          },
        ],
      },
      {
        name: 'setView',
        description: '',
        arguments: [
          {
            name: 'view',
            description: '',
            optional: false,
            type: 'ol.View, Vue, undefined',
          },
        ],
        returns: [
          {
            type: 'void',
            description: '',
          },
        ],
      },
      {
        name: 'updateSize',
        description: '',
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
      name: 'dblclick',
      description: `<p>A true double click, with no dragging.</p>`,
      argument: 'ol.MapBrowserEvent',
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
