import { View } from 'ol'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'

export function getViewId (view) {
  if (view instanceof View) {
    return view.get('id')
  } else if (view instanceof Vue) {
    return view.id
  }

  throw new Error('Illegal view argument')
}

export function setViewId (view, viewId) {
  if (view instanceof View) {
    view.set('id', viewId)

    return view
  } else if (view instanceof Vue) {
    view.id = viewId

    return view
  }

  throw new Error('Illegal view argument')
}

export function initializeView (view, defaultViewId) {
  if (getViewId(view) == null) {
    setViewId(view, defaultViewId || uuid())
  }

  return view
}
