import { Interaction } from 'ol/interaction'
import uuid from 'uuid/v4'
import { hasProp } from '../util/minilo'

/**
 * @param {module:ol/interaction/Interaction~Interaction|Object} interaction
 * @returns {string|null}
 */
export function getInteractionId (interaction) {
  if (interaction instanceof Interaction) {
    return interaction.get('id')
  } else if (hasProp(interaction, 'id')) {
    return interaction.id
  }

  throw new Error('Illegal interaction argument')
}

/**
 * @param {module:ol/interaction/Interaction~Interaction|Object} interaction
 * @param {string} interactionId
 * @returns {module:ol/interaction/Interaction~Interaction|Object}
 */
export function setInteractionId (interaction, interactionId) {
  if (interaction instanceof Interaction) {
    interaction.set('id', interactionId)

    return interaction
  } else if (hasProp(interaction, 'id')) {
    interaction.id = interactionId

    return interaction
  }

  throw new Error('Illegal interaction argument')
}

export function getInteractionPriority (interaction) {
  if (interaction instanceof Interaction) {
    return interaction.get('priority')
  } else if (hasProp(interaction, 'id')) {
    return interaction.priority
  }

  throw new Error('Illegal interaction argument')
}

export function setInteractionPriority (interaction, priority) {
  if (interaction instanceof Interaction) {
    interaction.set('priority', priority)

    return interaction
  } else if (hasProp(interaction, 'id')) {
    interaction.id = priority

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
