<template>
  <div class="dashboard">
    <div class="row article">
      <the-article/>
    </div>
    <div class="row comment">
      <the-comment/>
    </div>
  </div>
</template>

<script>
import Article from "./article";
import Comment from "./comment";

export default {
  name: "Dashboard",
  layout: 'backend',
  components: {TheArticle: Article, TheComment: Comment},
  data (){
    return {
      md: [],
      mdInited: '',
      record: [],
      recordInited: '',
      option: {},
    }
  },
  computed: {

  },
  created() {
  },
  mounted() {
  },
  methods: {

  },
}
</script>

<style scoped lang="scss">
.dashboard{
  min-height: 90%;
  >.row{
    width: 90%;
    margin: 2rem 5%;
    display: flex;
    align-items: center;
  }
}
</style>
