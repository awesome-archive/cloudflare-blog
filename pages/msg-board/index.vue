<template>
  <div>
    <h1>article</h1>
  </div>
</template>

<script>
import siteConfig from "assets/site-config";

export default {
  name: "index",
  head () {
    return {
      meta: [
        { hid: 'description', name: 'description', content: `${siteConfig.name}的博客 留言板` }
      ],
      title: '留言板'
    }
  },
}
</script>

<style scoped lang="scss">

</style>
