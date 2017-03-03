import styleFunc from './func'

styleFunc.install = function (Vue) {
  Vue.directive(styleFunc.name, styleFunc)
}
export default styleFunc
