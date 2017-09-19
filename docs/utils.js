export const routerViewProxy = (PageCmp, ContentCmp) => ({
  name: 'vld-router-view-proxy',
  functional: true,
  render (h, { props }) {
    return h(PageCmp, { props }, [h(ContentCmp, { props })])
  },
})

export function extractScript (src) {
  let match = src.match(/<script[^>]*>([\s\S]*)<\/script>/)

  return match ? match[1] : ''
}

export function extractTemplate (src) {
  let match = src.match(/<template[^>]*>([\s\S]*)<\/template>/)

  return match ? match[1] : ''
}

export function extractStyle (src) {
  let match = src.match(/<style[^>]*>([\s\S]*)<\/style>/)

  return match ? match[1] : ''
}
