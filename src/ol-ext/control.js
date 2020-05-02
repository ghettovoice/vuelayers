import { Control } from 'ol/control'
import { v4 as uuid } from 'uuid'

export function getControlId (control) {
  if (control instanceof Control) {
    return control.get('id')
  }

  throw new Error('Illegal control argument')
}

export function setControlId (control, controlId) {
  if (control instanceof Control) {
    control.set('id', controlId)

    return control
  }

  throw new Error('Illegal control argument')
}

export function initializeControl (control, defaultControlId) {
  if (getControlId(control) == null) {
    setControlId(control, defaultControlId || uuid())
  }

  return control
}
