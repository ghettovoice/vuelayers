::: content

```html
<div class="demo-app">
  <vl-map ref="map" :load-tiles-while-animating="true" :load-tiles-while-interacting="true">
    <!-- map view aka ol.View -->
    <vl-view ref="view" :center.sync="center" :zoom.sync="zoom" :rotation.sync="rotation"/>

    <!-- ol.Geolocation -->
    <vl-geoloc @update:position="onUpdatePosition">
      <template scope="ctx">
        <vl-feature v-if="ctx.position" id="position-feature">
          <vl-geom-point :coordinates="ctx.position"/>
          <vl-style-box>
            <vl-style-icon src="../static/marker.png" :scale="0.4" :anchor="[0.5, 1]"/>
          </vl-style-box>
        </vl-feature>
      </template>
    </vl-geoloc>

    <!-- base layer -->
    <vl-layer-tile id="sputnik">
      <vl-source-sputnik/>
    </vl-layer-tile>

    <!-- other layers -->
    <component v-for="layer in layers" :is="layer.cmp" :key="layer.id" v-bind="layer">
      <!-- vl-source-* -->
      <component :is="layer.source.cmp" v-bind="layer.source">
        <!-- add static features to vl-source-vector if provided -->
        <vl-feature v-if="layer.source.staticFeatures && layer.source.staticFeatures.length"
                    v-for="feature in layer.source.staticFeatures" :key="feature.id"
                    :id="feature.id" :properties="feature.properties">
          <component :is="geometryTypeToCmpName(feature.geometry.type)" :coordinates="feature.geometry.coordinates"/>
        </vl-feature>
      </component>

      <!-- add style components if provided -->
      <!-- create vl-style-box or vl-style-func -->
      <component v-if="layer.style" v-for="(style, i) in layer.style" :key="i" :is="style.cmp" v-bind="style">
        <!-- if vl-style-box used, create vl-style-circle, vl-style-icon, vl-style-fill, vl-style-stroke & etc -->
        <component v-if="style.styles" v-for="(style, cmp) in style.styles" :key="cmp" :is="cmp" v-bind="style">
          <!-- vl-style-fill, vl-style-stroke if provided -->
          <vl-style-fill v-if="style.fill" v-bind="style.fill"/>
          <vl-style-fill v-if="style.stroke" v-bind="style.stroke"/>
        </component>
      </component>
    </component>
  </vl-map>
</div>
```

::: content
