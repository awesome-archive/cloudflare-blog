<template>
  <router-view :record="record" :inited="inited" @refresh="getRecord"></router-view>
</template>

<script>
import record from '~/rebuild/json/record.json'

export default {
  name: "Record",
  data (){
    return {
      inited: false,
      record
    }
  },
  async created() {
    await this.getRecord()
  },
  methods: {
    async getRecord() {
      this.inited = false;
      this.inited = true
    }
  }
}
</script>

<style scoped lang="scss">

</style>
