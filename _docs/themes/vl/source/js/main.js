/* global App */
(function (window, document) {
  new App().run()

  /* ----------------------------
   Functions
   ------------------------------ */
  function init () {
    // run map on home
    var mapElem = document.getElementById('home-map')
    if (mapElem) {
      Vue.use(VueLayers)

      var root = new Vue({
        el: mapElem,
        data () {
          return {
            position: []
          }
        },
        methods: {
          updateGeoloc (evt) {
            this.position = evt.position
          }
        }
      })

      return new Promise(function (resolve) {
        root.$nextTick(function () {
          setTimeout(resolve, 10)
        })
      })
    }

    return new Promise(function (resolve) {
      setTimeout(resolve, 10)
    })
  }

  function hideLoader () {
    pageLoaderContainer.classList.add('hidden')

    return new Promise(function (resolve) {
      setTimeout(function () {
        pageLoaderContainer.style.display = 'none'
        pageLoader && pageLoader.destroy()
        resolve()
      }, 1000)
    })
  }
}(this, this.document))
