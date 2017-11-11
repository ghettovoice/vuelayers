export default {
  props: [
    {
      name: 'center',
      description: `<p>The center coordinate of the map view in <strong>EPSG:4326</strong> projection.</p>`,
      type: 'number[]',
      required: false,
      sync: true,
      default: '[0, 0]',
    },
    {
      name: 'constrain-rotation',
      description: `<p>Rotation constraint. <code>false</code> means no constraint. <code>true</code> means no 
                    constraint, but snap to zero near zero. A number constrains the rotation to that number of values. 
                    For example, <code>4</code> will constrain the rotation to <b>0</b>, <b>90</b>, <b>180</b>, and <b>270</b> degrees.</p>`,
      type: 'boolean, number',
      required: false,
      sync: false,
      default: 'true',
    },
    {
      name: 'enable-rotation',
      description: `<p>Enables rotation. If <code>false</code> a rotation constraint that always sets the rotation 
                    to zero is used. The <code>constrain-rotation</code> option has no effect if <code>enable-rotation</code> is <code>false</code>.</p>`,
      type: 'boolean',
      required: false,
      sync: false,
      default: 'true',
    },
    {
      name: 'extent',
      description: `<p>The extent that constrains the center defined in in <b>EPSG:4326</b> projection,
                    in other words, center cannot be set outside this extent.</p>`,
      type: 'array',
      required: false,
      sync: false,
      default: 'undefined',
    },
    {
      name: 'ident',
      description: `<p>Unique key in <b>identity map</b> for underlying <code>ol.View</code> instance to 
                    share it between multiple <code>vl-view</code> components in multiple <code>vl-map</code> components.</p>
                    <p><i>Experimental</i></p>`,
      type: 'string',
      required: false,
      sync: false,
      default: 'false',
    },
    {
      name: 'max-resolution',
      description: '',
      type: 'number',
      required: false,
      sync: false,
      default: 'calculates from projection',
    },
    {
      name: 'max-zoom',
      description: '',
      type: 'number',
      required: false,
      sync: false,
      default: 28,
    },
    {
      name: 'min-resolution',
      description: '',
      type: 'number',
      required: false,
      sync: false,
      default: 'calculates from projection',
    },
    {
      name: 'min-zoom',
      description: '',
      type: 'number',
      required: false,
      sync: false,
      default: 0,
    },
    {
      name: 'projection',
      description: '',
      type: 'string',
      required: false,
      sync: false,
      default: 'EPSG:4326',
    },
    {
      name: 'resolution',
      description: '',
      type: 'number',
      required: false,
      sync: true,
      default: 'undefined',
    },
    {
      name: 'resolutions',
      description: '',
      type: 'array',
      required: false,
      sync: false,
      default: 'undefined',
    },
    {
      name: 'rotation',
      description: `<p>The initial rotation for the view in <strong>radians</strong> (positive rotation clockwise).</p>`,
      type: 'number',
      required: false,
      sync: true,
      default: 0,
    },
    {
      name: 'zoom',
      description: `<p>Zoom level used to calculate the resolution for the view as <code>int</code> value. 
                    Only used if <code>resolution</code> is not defined.</p>`,
      type: 'number',
      required: false,
      sync: true,
      default: 0,
    },
    {
      name: 'zoom-factor',
      description: '',
      type: 'number',
      required: false,
      sync: false,
      default: 2,
    },
  ],
  members: [
    {
      name: '$createPromise',
      description: `<p>Promise that resolves when underlying <b>OpenLayers</b> instance created.</p>`,
      type: 'Promise',
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
      name: 'animate',
      description: `<p>
                      Animates the view. The view's <b>center</b> (coordinates in <b>EPSG:4326</b> projection), 
                      <b>zoom</b> (or <b>resolution</b>), and <b>rotation</b> can be animated for smooth transitions between view states.
                    </p>
                    <p>
                      By default, the animation lasts one second and uses in-and-out easing. The behavior can be customized
                      by including <code>duration</code> (in milliseconds) and <code>easing</code> options.
                    </p>
                    <p>
                      If you provide a function as the last argument to the animate method, it will get called at the end 
                      of an animation series. The callback will be called with <code>true</code> if the animation series 
                      completed on its own or <code>false</code> if it was cancelled.
                    </p>
                    <p>
                      See <a href="https://openlayers.org/en/latest/apidoc/ol.View.html#animate" target="_blank"><code>ol.View#animate</code> method</a> 
                      for more info.
                    </p>`,
      arguments: [
        {
          name: 'args',
          description: `<p>Animation options. Multiple animations can be run in series by passing multiple options objects. 
                        To run multiple animations in parallel, call the method multiple times.</p>`,
          optional: false,
          type: '...(olx.AnimationOptions, function(boolean))',
        },
      ],
      returns: [
        {
          type: 'Promise',
          description: `<p>Resolves when animation completes</p>`,
        },
      ],
    },
    {
      name: 'fit',
      description: `<p>Fit the given geometry or extent based on the given map size and border. The size is pixel 
                    dimensions of the box to fit the extent into. Takes care of the map angle.</p>
                    <p>
                      See <a href="https://openlayers.org/en/latest/apidoc/ol.View.html#fit" target="_blank">
                      <code>ol.View#fit</code> method</a> for more info.
                    </p>`,
      arguments: [
        {
          name: 'geometryOrExtent',
          description: `<p>The geometry or extent to fit the view to. Coordinates should be in <b>EPSG:4326</b> projection.</p>`,
          optional: false,
          type: 'GeoJSONFeature, ol.Extent',
        },
        {
          name: 'options',
          description: `<p>Fit options.</p>`,
          optional: true,
          type: 'olx.view.FitOptions',
        },
      ],
      returns: [
        {
          type: 'Promise',
          description: `<p>Resolves when view changes</p>`,
        },
      ],
    },
  ],
  events: [
    {
      name: 'created',
      description: `<p>Emitted when underlying <b>OpenLayers</b> instance created.</p>`,
      argument: 'void',
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
      description: `<p>Default <b>scoped</b> slot with current state: center, zoom, rotation and resolution.</p>`,
      scoped: true,
    },
  ],
}
