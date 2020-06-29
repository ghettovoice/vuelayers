global.URL.createObjectURL = window.URL.createObjectURL = function () {}

global.requestAnimationFrame = window.requestAnimationFrame = function (callback) {
  return setTimeout(callback, 1)
}

global.cancelAnimationFrame = window.cancelAnimationFrame = function (id) {
  return clearTimeout(id)
}
