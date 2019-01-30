import Interaction from 'ol/interaction/Interaction'
import Vue from 'vue'
import uuid from 'uuid/v4'

export function getInteractionId (interaction) {
  if (interaction instanceof Vue) {
    return interaction.id
  } else if (interaction instanceof Interaction) {
    return interaction.get('id')
  } else {
    throw new Error('Illegal argument')
  }
}

export function identifyInteraction (interaction) {
  if (interaction instanceof Vue) {
    if (interaction.id == null) {
      interaction.id = uuid()
    }
  } else if (interaction instanceof Interaction) {
    if (interaction.get('id') == null) {
      interaction.set('id', uuid())
    }
  } else {
    throw new Error('Illegal argument')
  }

  return interaction
}
