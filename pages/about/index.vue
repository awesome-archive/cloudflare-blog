<template>
  <div class="about" flex>
    <p>Hello there,Geeker.</p>
    <span>Maybe you want to check <NuxtLink :to="siteConfig.aboutUrl">this</NuxtLink>.</span>
  </div>
</template>

<script>
import siteConfig from '~/assets/site-config'

export default {
  name: "realAbout",
  data() {
    return{
      siteConfig
    }
  },
  mounted() {
  }
}
</script>

<style scoped lang="scss">
.about{
  flex-direction: column;
  font-size: 1rem;
  width: 99%;
  height: 99%;
  justify-content: center;
  background: linear-gradient(45deg, #ffcfda, #71e5ffb5);
  p{

  }
  span{

  }
  a{

  }
}
</style>
