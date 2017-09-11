const props = {
  title: {
    type: String,
    required: true,
  },
  subtitle: String,
  color: String,
  bold: {
    type: Boolean,
    default: true,
  },
}

export default {
  props,
}
