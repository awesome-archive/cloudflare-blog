<template>
  <svg aria-hidden="true">
    <use :fill="calcFill" :xlink:href="getName"></use>
  </svg>
</template>

<script>
export default {
  name: "svg-icon",
  props: {
    name: {
      type: String,
      default: ''
    },
    fill: {
      type: String,
      default: ''
    }
  },
  computed: {
    getName() {
      import(`~/assets/svg/${this.name}.svg`)
      return `#icon-${this.name}`
    },
    calcFill() {
      if (this.$props.fill) {
        return this.$props.fill
      }
      return false
    }
  }
}
</script>

<style scoped lang="scss">

</style>
