<template>
  <div id="index">
    <img class="bg" src="/image/home.png" alt="bg"/>
    <section class="body" :class="{'show-bg': showBg}" flex>
      <Nuxt />
    </section>
    <message ref="message"/>
  </div>
</template>

<script>
import Message from "~/block/Message";
import Vue from 'vue';
import '~/utils/filter';

export default {
  components: {Message},
  data (){
    return {
      showBg: false,
    }
  },
  mounted() {
    if (process.server) return ;
    const fontSize = localStorage.getItem('font-size');
    if (fontSize) {
      document.documentElement.style.fontSize = fontSize + 'px';
    }
    Vue.prototype.$message = this.$refs.message;
  },
}
</script>

<style>
</style>
