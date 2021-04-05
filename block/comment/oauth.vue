<template>
  <div class="login" flex>
    <svg-icon :name="status"/>
    <strong v-html="state"></strong>
  </div>
</template>

<script>
import {tokenKey} from "~/utils/github_graphql";

import siteConfig from '~/assets/site-config'
import axios from "axios";
import {queryMap} from "~/utils/utils";
import SvgIcon from "@/components/svg-icon";

export default {
  name: "oauth",
  components: {SvgIcon},
  data() {
    return {
      state: '处理中...',
      status: 'loading'
    }
  },
  created() {
    const query = queryMap();
    if (query.code) {
      // 获取token
      axios({
        url: siteConfig.corsServer+'https://github.com/login/oauth/access_token',
        method: 'post',
        data: {
          client_id: siteConfig.oauth.client_id,
          client_secret: siteConfig.oauth.client_secret,
          code: query.code,
        }
      }).then(res => {
        const mather = res.data.match(/^access_token=([^&]+)&.*?$/);
        if (mather){
          this.state = '登录成功!正在跳转...<br/>若此页面未自动关闭，请手动关闭本页';
          this.status = 'success';
          localStorage.setItem(tokenKey, mather[1]);
          setTimeout(()=>{
            window.close();
          }, 500)
        }else{
          this.state = '参数错误!';
          this.status = 'error';
        }
      }).catch(err=>{
        this.state = '请求失败:'+err;
        this.status = 'error';
      })
    }else{
      this.state = '缺少code?!';
      this.status = 'error';
    }
  }
}
</script>

<style scoped lang="scss">
.login{
  width: 100%;
  height: 100%;
  justify-content: center;
  background: white;
  >svg{
    width: 3rem;
    height: 3rem;
    margin-right: 1rem;
  }
  >strong{
    font-size: 1.2rem;
  }
}
</style>

<style>
#loading{
  display: none !important;
}
</style>
