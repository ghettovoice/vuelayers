/**
 * OpenLayers extensions
 */
import ol from 'openlayers'
import { merge } from 'vl-utils/func'
import * as consts from './consts'
import * as style from './style'
import * as extent from './extent'
import * as coordinate from './coordinate'
import geoJson from './geojson'

merge(ol, {
  consts,
  style,
  coordinate,
  extent,
  geoJson
})

export default ol
