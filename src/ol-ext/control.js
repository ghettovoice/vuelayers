import { Control } from 'ol/control'
import uuid from 'uuid/v4'
import Vue from 'vue'

export function getControlId (control) {
  if (control instanceof Vue) {
    return control.id
  } else if (control instanceof Control) {
    return control.get('id')
  }

  throw new Error('Illegal control argument')
}

export function setControlId (control, controlId) {
  if (control instanceof Vue) {
    control.id = controlId

    return control
  } else if (control instanceof Control) {
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
