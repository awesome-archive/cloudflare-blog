<template>
  <router-view :md="md" :inited="inited"></router-view>
</template>

<script>
import md from '~/rebuild/json/md.json'

export default {
  name: "Article",
  data (){
    return {
      inited: false,
      md,
    }
  },
  async created() {
    this.inited = true
  },
}
</script>

<style scoped lang="scss">

</style>
