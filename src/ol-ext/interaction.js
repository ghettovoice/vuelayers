import Interaction from 'ol/interaction/Interaction'
import uuid from 'uuid/v4'
import Vue from 'vue'

/**
 * @param {Interaction|Vue} interaction
 * @returns {string|null}
 */
export function getInteractionId (interaction) {
  if (interaction instanceof Vue) {
    return interaction.id
  } else if (interaction instanceof Interaction) {
    return interaction.get('id')
  }

  throw new Error('Illegal interaction argument')
}

/**
 * @param {Interaction|Vue} interaction
 * @param {string} interactionId
 * @returns {Vue|Interaction}
 */
export function setInteractionId (interaction, interactionId) {
  if (interaction instanceof Vue) {
    interaction.id = interactionId

    return interaction
  } else if (interaction instanceof Interaction) {
    interaction.set('id', interactionId)

    return interaction
  }

  throw new Error('Illegal interaction argument')
}

export function getInteractionPriority (interaction) {
  if (interaction instanceof Vue) {
    return interaction.priority
  } else if (interaction instanceof Interaction) {
    return interaction.get('priority')
  }

  throw new Error('Illegal interaction argument')
}

export function setInteractionPriority (interaction, priority) {
  if (interaction instanceof Vue) {
    interaction.id = priority

    return interaction
  } else if (interaction instanceof Interaction) {
    interaction.set('priority', priority)

    return interaction
  }

  throw new Error('Illegal interaction argument')
}

export function initializeInteraction (interaction, defaultInteractionId, defaultPriority) {
  if (getInteractionId(interaction) == null) {
    setInteractionId(interaction, defaultInteractionId || uuid())
  }
  if (getInteractionPriority(interaction) == null) {
    setInteractionPriority(interaction, defaultPriority || 0)
  }

  return interaction
}
