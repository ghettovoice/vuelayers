export const routerViewProxy = (PageCmp, ContentCmp) => ({
  name: 'vld-router-view-proxy',
  functional: true,
  render (h, { props }) {
    return h(PageCmp, { props }, [h(ContentCmp, { props })])
  },
})
