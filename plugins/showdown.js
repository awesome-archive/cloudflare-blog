import codemirror from "vue-codemirror/src/codemirror";

const install = (Vue, config) => {
  if (config) {
    if (config.options) {
      codemirror.props.globalOptions.default = () => config.options
    }
    if (config.events) {
      codemirror.props.globalEvents.default = () => config.events
    }
  }
  Vue.component(codemirror.name, codemirror)
}
