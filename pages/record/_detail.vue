<template>
  <div class="record">
  </div>
</template>

<script>
import record from '~/rebuild/json/record.json'

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
