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

/**
 * @data
 * 1. 文章发布
 * 2. 记录发布
 * 3. 评论
 * 4. 访问
 * 5. 代码成就
 */
export default {
  name: "Dashboard",
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
