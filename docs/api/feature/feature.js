export default {
  props: [
    {
      name: 'id',
      description: '<p>Feature identifier.</p> ',
      type: 'string, number',
      required: false,
      sync: true,
      default: 'UUID',
    },
    {
      name: 'properties',
      description: '<p>All feature properties.</p> ',
      type: 'Object',
      required: false,
      sync: true,
      default: '{}',
    },
  ],
  members: [
    {
      name: '$feature',
      description: '<p>Reference to <code>ol.Feature</code> instance.</p> ',
      type: 'ol.Feature, undefined',
    },
    {
      name: '$featuresContainer',
      description: '<p>Reference to <code>featuresContainer</code>.</p> ',
      type: 'Object, undefined',
    },
    {
      name: '$layer',
      description: '<p>Reference to parent <code>ol.Layer</code> instance.</p> ',
      type: 'ol.layer.Layer, undefined',
    },
    {
      name: '$map',
      description: '<p>Reference to <code>ol.Map</code> instance.</p> ',
      type: 'ol.Map, undefined',
    },
    {
      name: '$view',
      description: '<p>Reference to <code>ol.View</code> instance.</p> ',
      type: 'ol.View, undefined',
    },
  ],
  methods: [
    {
      name: 'isAtPixel',
      description: '<p>Checks if feature lies at <code>pixel</code>.</p> ',
      arguments: [
        {
          name: 'pixel',
          description: '',
          optional: false,
          type: 'number',
        },
      ],
      returns: [{type: 'boolean', description: ''}],
    },
  ],
  events: [],
  slots: [
    {
      name: 'default',
      description: '<p>Default <strong>scoped</strong> slot with current feature state: <code>id</code>, <code>properties</code>, GeoJSON <code>geometry</code>.</p> ',
      scoped: true,
    },
  ],
}
