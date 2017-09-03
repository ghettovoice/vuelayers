/* global _, ProgressBar */
function App () {
  /**
   * @type {Element}
   * @private
   */
  this._pageLoaderContainer = document.querySelector('#page-loader')
  /**
   * @type {ProgressBar}
   * @private
   */
  this._pageLoader = new ProgressBar.Circle(
    this._pageLoaderContainer.querySelector('.rotating-loader'),
    {
      color: '#8c67ef',
      trailColor: '#eee',
      strokeWidth: 10,
      duration: 2500,
      easing: 'easeInOut'
    }
  )
}

_.assign(App.prototype, {
  run: function () {
    this.showLoader()
  },
  showLoader: function () {
    this._pageLoader.set(0.2)
    this._pageLoaderContainer.classList.remove('hidden')
  }
})
