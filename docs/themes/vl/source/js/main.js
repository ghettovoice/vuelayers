/* global Vue, VueLayers, ProgressBar */
(function (window, document) {
  // run page loader
  var pageLoaderContainer = document.querySelector('#page-loader')
  var pageLoader

  showLoader()
    .then(init)
    .then(hideLoader)

  /* ----------------------------
   Functions
   ------------------------------ */
  function init () {
    // run bg map on home
    if (document.body.classList.contains('is-home')) {
      Vue.use(VueLayers)

      var root = new Vue({
        el: '#bg-map'
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

  function showLoader () {
    pageLoaderContainer.style.display = 'block'
    pageLoader = new ProgressBar.Circle(pageLoaderContainer.querySelector('.rotating-loader'), {
      color: '#8c67ef',
      trailColor: '#eee',
      strokeWidth: 10,
      duration: 2500,
      easing: 'easeInOut'
    })

    pageLoader.set(0.2)
    pageLoaderContainer.classList.remove('hidden')

    return new Promise(function (resolve) {
      setTimeout(resolve, 1000)
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
