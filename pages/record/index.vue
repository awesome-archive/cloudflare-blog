<template>
  <div class="record">
    <div class="player">
      <div v-for="item in record" :key="item.file">

      </div>
    </div>
  </div>
</template>

<script>
import record from '~/rebuild/json/record.json'
import config from "~/rebuild/json/config.json";

export default {
  name: "index",
  data() {
    return {
      record,
    }
  },
  head () {
    return {
      meta: [
        { hid: 'description', name: 'description', content: `${config.name}的博客 记录 record` }
      ],
      title: '记录'
    }
  },
  computed: {
  },
  async created (){
  },
  methods: {
  },
  mounted() {
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.record{
}
</style>
