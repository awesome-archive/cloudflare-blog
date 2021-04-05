<template>
  <div class="record">
  </div>
</template>

<script>
import record from '~/rebuild/json/record.json'
import siteConfig from "assets/site-config";

export default {
  name: "index",
  data() {
    return {
      record,
      loading: true,
      pageNow: 1,
      perCount: 20,
      activeInfo: {},
    }
  },
  head () {
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
</style>
