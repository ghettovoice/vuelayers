/**
 * VueLayers Core
 * @module core
 */
// mixins
import featuresContainer from './mixins/features-container'
import geometry from './mixins/geometry'
import geometryContainer from './mixins/geometry-container'
import identMap from './mixins/ident-map'
import imageStyle from './mixins/image-style'
import interaction from './mixins/interaction'
import interactionsContainer from './mixins/interactions-container'
import layer from './mixins/layer'
import layersContainer from './mixins/layers-container'
import olCmp from './mixins/ol-cmp'
import olVirtCmp from './mixins/ol-virt-cmp'
import overlaysContainer from './mixins/overlays-container'
import rxSubs from './mixins/rx-subs'
import services from './mixins/services'
import source from './mixins/source'
import sourceContainer from './mixins/source-container'
import stubVNode from './mixins/stub-vnode'
import style from './mixins/style'
import stylesContainer from './mixins/styles-container'
import tileSource from './mixins/tile-source'
import useMapCmp from './mixins/use-map-cmp'
import vectorSource from './mixins/vector-source'
import withFillStrokeStyle from './mixins/with-fill-stroke-style'
// utils
import * as assert from './utils/assert'
import coalesce from './utils/coalesce'
import * as debug from './utils/debug'
import IdentityMap from './utils/identity-map'
import isNumeric from './utils/is-numeric'
import mergeDescriptors from './utils/multi-merge-descriptors'
import plainProps from './utils/plain-props'
import replaceTokens from './utils/replace-tokens'

export * as ol from './ol-ext'
export * as rx from './rx-ext'
export * as consts from './consts'
export const mixins = {
  featuresContainer,
  geometry,
  geometryContainer,
  identMap,
  imageStyle,
  interaction,
  interactionsContainer,
  layer,
  layersContainer,
  olCmp,
  olVirtCmp,
  overlaysContainer,
  rxSubs,
  services,
  source,
  sourceContainer,
  stubVNode,
  style,
  stylesContainer,
  tileSource,
  useMapCmp,
  vectorSource,
  withFillStrokeStyle,
}
export const utils = {
  assert,
  coalesce,
  debug,
  IdentityMap,
  isNumeric,
  mergeDescriptors,
  plainProps,
  replaceTokens,
}
