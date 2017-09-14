/**
 * VueLayers Core
 */
// mixins
import featuresContainers from './components/features-container'
import geom from './components/geom/geom'
import geometryContainers from './components/geometry-container'
import identMap from './components/ident-map'
import interaction from './components/interaction/interaction'
import interactionsContainers from './components/interactions-container'
import layer from './components/layer/layer'
import layersContainers from './components/layers-container'
import olCmp from './components/ol-cmp'
import olVirtCmp from './components/ol-virt-cmp'
import overlaysContainers from './components/overlays-container'
import rxSubs from './components/rx-subs'
import services from './components/services'
import sourceContainers from './components/source-container'
import source from './components/source/source'
import tileSource from './components/source/tile'
import vectSource from './components/source/vect'
import stubVNode from './components/stub-vnode'
import imageStyle from './components/style/image'
import style from './components/style/style'
import withFillStrokeStyle from './components/style/with-fill-stroke'
import stylesContainers from './components/styles-container'
import useMapCmp from './components/use-map-cmp'
import './styles/main.sass'
// utils
import * as assert from './utils/assert'
import coalesce from './utils/coalesce'
import * as debug from './utils/debug'
import IdentityMap from './utils/identity-map'
import isNumeric from './utils/is-numeric'
import mergeDescriptor from './utils/multi-merge-descriptors'
import plainProps from './utils/plain-props'
import replaceTokens from './utils/replace-tokens'

export * as ol from './ol-ext'
export * as rx from './rx-ext'
export * as consts from './consts'
export const mixins = {
  featuresContainers,
  geom,
  geometryContainers,
  identMap,
  interaction,
  interactionsContainers,
  layer,
  layersContainers,
  olCmp,
  olVirtCmp,
  overlaysContainers,
  rxSubs,
  services,
  sourceContainers,
  source,
  tileSource,
  vectSource,
  stubVNode,
  imageStyle,
  style,
  withFillStrokeStyle,
  stylesContainers,
  useMapCmp,
}
export const utils = {
  assert,
  coalesce,
  debug,
  IdentityMap,
  isNumeric,
  mergeDescriptor,
  plainProps,
  replaceTokens,
}
