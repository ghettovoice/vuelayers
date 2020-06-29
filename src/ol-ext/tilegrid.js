import { get as getProjection } from 'ol/proj'
import Units, { METERS_PER_UNIT } from 'ol/proj/Units'
import { createOrUpdate } from './extent'

// copy-paste from ol/tilegrid
export function extentFromProjection (projection) {
  projection = getProjection(projection)
  let extent = projection.getExtent()
  if (!extent) {
    const half = 180 * METERS_PER_UNIT[Units.DEGREES] / projection.getMetersPerUnit()
    extent = createOrUpdate(-half, -half, half, half)
  }
  return extent
}
