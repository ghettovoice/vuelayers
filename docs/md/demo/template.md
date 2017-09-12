::: content

```html
<div class="demo-app">
  <!-- app map -->
  <vl-map class="map" ref="map" :load-tiles-while-animating="true" :load-tiles-while-interacting="true"
          @click="clickCoordinate = $event.coordinate" @postcompose="onMapPostCompose">
    <!-- map view aka ol.View -->
    <vl-view ref="view" :center="center" :zoom.sync="zoom" :rotation.sync="rotation"/>

    <!-- interactions -->
    <vl-interaction-select :selected.sync="selectedFeatures">
      <vl-style-box>
        <vl-style-stroke color="#423e9e" :width="7"/>
        <vl-style-fill :color="[254, 178, 76, 0.7]"/>
        <vl-style-circle :radius="5">
          <vl-style-stroke color="#423e9e" :width="7"/>
          <vl-style-fill :color="[254, 178, 76, 0.7]"/>
        </vl-style-circle>
      </vl-style-box>
      <vl-style-box :z-index="1">
        <vl-style-stroke color="#d43f45" :width="2"/>
        <vl-style-circle :radius="5">
          <vl-style-stroke color="#d43f45" :width="2"/>
        </vl-style-circle>
      </vl-style-box>
    </vl-interaction-select>
    <!--// interactions -->

    <!-- geolocation -->
    <vl-geoloc @update:position="onUpdatePosition">
      <template scope="geoloc">
        <vl-feature v-if="geoloc.position" id="position-feature">
          <vl-geom-point :coordinates="geoloc.position"/>
          <vl-style-box>
            <vl-style-icon src="../static/img/marker.png" :scale="0.4" :anchor="[0.5, 1]"/>
          </vl-style-box>
        </vl-feature>
      </template>
    </vl-geoloc>
    <!--// geolocation -->

    <!-- overlay marker with animation -->
    <vl-feature id="marker" ref="marker" :properties="{ start: Date.now(), duration: 2500 }">
      <template scope="feature">
        <vl-geom-point :coordinates="[-10, -10]"/>
        <vl-style-box>
          <vl-style-icon src="../static/img/flag.png" :scale="0.5" :anchor="[0.1, 0.95]" :size="[128, 128]"/>
        </vl-style-box>
        <!-- overlay binded to feature -->
        <vl-overlay v-if="feature.geometry" :position="pointOnSurface(feature.geometry)" :offset="[10, 10]">
          <p class="is-light box content">
            Always opened overlay for Feature ID <strong>{{ feature.id }}</strong>
          </p>
        </vl-overlay>
      </template>
    </vl-feature>
    <!--// overlay marker -->

    <!-- base layer -->
    <vl-layer-tile id="sputnik">
      <vl-source-sputnik/>
    </vl-layer-tile>

    <!-- other layers from config -->
    <component v-for="layer in layers" :is="layer.cmp" v-if="layer.visible" :key="layer.id" v-bind="layer">
      <!-- add vl-source-* -->
      <component :is="layer.source.cmp" v-bind="layer.source">
        <!-- add static features to vl-source-vector if provided -->
        <vl-feature v-if="layer.source.staticFeatures && layer.source.staticFeatures.length"
                    v-for="feature in layer.source.staticFeatures" :key="feature.id"
                    :id="feature.id" :properties="feature.properties">
          <component :is="geometryTypeToCmpName(feature.geometry.type)" :coordinates="feature.geometry.coordinates"/>
        </vl-feature>

        <!-- add inner source if provided (like vl-source-vector inside vl-source-cluster) -->
        <component v-if="layer.source.source" :is="layer.source.source.cmp" v-bind="layer.source.source">
          <!-- add static features to vl-source-vector if provided -->
          <vl-feature v-if="layer.source.source.staticFeatures && layer.source.source.staticFeatures.length"
                      v-for="feature in layer.source.source.staticFeatures" :key="feature.id"
                      :id="feature.id" :properties="feature.properties">
            <component :is="geometryTypeToCmpName(feature.geometry.type)" :coordinates="feature.geometry.coordinates"/>
          </vl-feature>
        </component>
      </component>
      <!--// vl-source-* -->

      <!-- add style components if provided -->
      <!-- create vl-style-box or vl-style-func -->
      <component v-if="layer.style" v-for="(style, i) in layer.style" :key="i" :is="style.cmp" v-bind="style">
        <!-- create inner style components: vl-style-circle, vl-style-icon, vl-style-fill, vl-style-stroke & etc -->
        <component v-if="style.styles" v-for="(st, cmp) in style.styles" :key="cmp" :is="cmp" v-bind="st">
          <!-- vl-style-fill, vl-style-stroke if provided -->
          <vl-style-fill v-if="st.fill" v-bind="st.fill"/>
          <vl-style-fill v-if="st.stroke" v-bind="st.stroke"/>
        </component>
      </component>
      <!--// style -->
    </component>
    <!--// other layers -->

    <!-- selected feature popup -->
    <vl-overlay class="feature-popup" v-for="feature in selectedFeatures" :key="feature.id" :id="feature.id"
                :position="pointOnSurface(feature.geometry)" :auto-pan="true">
      <template scope="popup">
        <vld-card>
          <p slot="header" class="card-header-title">
            Feature ID {{ feature.id }}
          </p>
          <a slot="header" class="card-header-icon" title="Close"
             @click="selectedFeatures = selectedFeatures.filter(f => f.id !== feature.id)">
            <b-icon icon="close"/>
          </a>

          <div class="content">
            <p>
              Overlay popup content for Feature with ID <strong>{{ feature.id }}</strong>
            </p>
            <p>
              Popup: {{ JSON.stringify(popup) }}
            </p>
            <p>
              Feature: {{ JSON.stringify({ id: feature.id, properties: feature.properties }) }}
            </p>
          </div>
        </vld-card>
      </template>
    </vl-overlay>
    <!--// selected popup -->
  </vl-map>
  <!--// app map -->

  <!-- map panel, controls -->
  <div class="map-panel">
    <b-panel :has-custom-template="true" :collapsible="true">
      <strong slot="header">Map panel</strong>
      <p class="panel-tabs">
        <a @click="onMapPanelTabClick('state')" :class="mapPanelTabClasses('state')">State</a>
        <a @click="onMapPanelTabClick('layers')" :class="mapPanelTabClasses('layers')">Layers</a>
      </p>

      <div class="panel-block" v-show="mapPanel.tab === 'state'">
        <table class="table is-fullwidth">
          <tr>
            <th>Map center</th>
            <td>{{ center }}</td>
          </tr>
          <tr>
            <th>Map zoom</th>
            <td>{{ zoom }}</td>
          </tr>
          <tr>
            <th>Map rotation</th>
            <td>{{ rotation }}</td>
          </tr>
          <tr>
            <th>Device coordinate</th>
            <td>{{ deviceCoordinate }}</td>
          </tr>
          <tr>
            <th>Selected features</th>
            <td>{{ selectedFeatures.map(f => f.id) }}</td>
          </tr>
        </table>
      </div>

      <div class="panel-block" v-for="layer in layers" :key="layer.id" @click="onMapPanelLayerClick"
           :class="{ 'is-active': layer.visible }"
           v-show="mapPanel.tab === 'layers'">
        <b-switch :key="layer.id" v-model="layer.visible">
          {{ layer.title }}
        </b-switch>
      </div>
    </b-panel>
  </div>
  <!--// map panel, controls -->
</div>
```

:::
