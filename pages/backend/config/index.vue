<template>
  <div class="config" flex>
    <div class="head" flex>
      <svg-icon name="config"/>
      <b>修改配置信息</b>
    </div>
    <div class="list" flex>
      <float-input v-for="k in keys" :key="k" :name="k" :value="info[k]||''" :id="k" :size="1" :isArea="['describe', 'aboutme'].indexOf(k)!==-1" @input="input"/>
      <label flex>
        <span :class="{active: info.backgroundImg==='img'}" @click="changeBg('img')">图片背景</span>
        <span :class="{active: info.backgroundImg==='color'}" @click="changeBg('color')">彩色背景</span>
        <span :class="{active: info.backgroundImg==='random'}" @click="changeBg('random')">随机</span>
      </label>
      <div class="friends" flex>
        <div v-for="item in info.friends" :key="item.id" class="list-item" flex>
          <float-input :name="'简介'" :value="item.summary" :id="item.id" :size="0.85" @input="friendsSummary"/>
          <float-input :name="'github'" :value="item.github" :id="item.id" :size="0.85" @input="friendsGithub"/>
          <float-input :name="'网站'" :value="item.site" :id="item.id" :size="0.85" @input="friendsSite"/>
          <single-button class="del-btn" @click.native="friendsDel(item)">删除</single-button>
        </div>
        <loading-button :loading="false" icon="add" :size="0.9" @click.native="friendsNew">添加</loading-button>
      </div>
    </div>
    <loading-button :loading="updating" icon="save" @click.native="commitConfig">上传</loading-button>
  </div>
</template>

<script>
import {parseAjaxError} from "@/utils/utils";
import config from '~/rebuild/json/config.json';
import {mapState} from "vuex";
import SvgIcon from "@/components/svg-icon";
import FloatInput from "@/components/float-input";
import SingleButton from "@/components/single-button";
import LoadingButton from "@/components/loading-button";

export default {
  name: "Config",
  components: {LoadingButton, SingleButton, FloatInput, SvgIcon},
  layout: 'backend',
  data() {
    return {
      config,
      updating: false,
      info: {},
      keys: ["name", "describe", "aboutme", "copyright", "github", "email"],
    }
  },
  head (){
    return {
      title: '网站配置'
    }
  },
  computed: {
    ...mapState('backend', ['gitUtil'])
  },
  watch: {
    config: {
      immediate: true,
      deep: true,
      handler (){
        this.info = JSON.parse(JSON.stringify(this.config));
        if (this.info.friends) {
          this.info.friends.forEach((v, idx) => {
            v.id = idx
          })
        }
      }
    }
  },
  methods: {
    input(payload) {
      this.info[payload[0]] = payload[1];
    },
    changeBg (v){
      this.info.backgroundImg = v;
    },
    friendsSummary ([id, text]){
      this.info.friends.find(v=>v.id===id).summary = text;
    },
    friendsGithub ([id, text]){
      this.info.friends.find(v => v.id === id).github = text;
    },
    friendsSite ([id, text]){
      this.info.friends.find(v=>v.id===id).site = text;
    },
    friendsDel (item){
      this.info.friends.splice(this.info.friends.indexOf(item), 1)
    },
    friendsNew (){
      this.info.friends.push({
        summary: '',
        github: '',
        site: '',
        id: Math.max(...this.info.friends.map(v=>v.id))+1
      })
    },
    async commitConfig() {
      if (this.gitUtil) {
        this.updating = true;
        // 更新config.json
        for (let k of this.keys) {
          this.config[k] = this.info[k]
        }
        this.config.backgroundImg = this.info.backgroundImg;
        this.config.friends = this.info.friends.map(v=>{
          const item = {};
          for (const k in v){
            if (k !== 'id'){
              item[k] = v[k]
            }
          }
          return item
        });
        const res = await this.gitUtil.updateJsonFile(`config.json`, this.config);
        this.updating = false;
        if (res[0]) {
          this.$message.success('更新成功!')
        } else {
          this.$message.error(parseAjaxError(res[1]))
        }
      } else {
        this.$message.warning('请先登录!');
        this.$emit('login')
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.config{
  flex-direction: column;
  margin: 2rem auto 1rem auto !important;
  width: 40rem !important;
  > .head{
    padding: 0.6rem 0;
    width: 100%;
    border-radius: 0.6rem 0.6rem 0 0;
    background: linear-gradient(to bottom, #686868, #3b3b3b);
    border-bottom: 1px solid #cecece;
    justify-content: center;
    > svg{
      width: 2.2rem;
      height: 2.2rem;
    }

    > b {
      margin-left: 1rem;
      font-size: 1.1rem;
      color: white;
    }
  }

  > .list {
    width: 100%;
    flex-direction: column;
    margin-top: 1rem;

    > .float-input {
      width: 60%;
      margin: 1rem 0;
    }
    > label{
        margin: 0.5rem 0;
        width: 60%;
        > span{
          cursor: pointer;
          font-size: 0.85rem;
          background: #b9b9b9;
          border-radius: 0.2rem;
          padding: 0.3rem 0.8rem;
          margin: 0 0.5rem;
          color: black;
          transition: all .15s linear;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.3);
          &:hover{
            border-color: rgba(0, 0, 0, 0.4);
          }
          &.active{
            background: #1b00ff;
            color: white;
          }
        }
      }
    >.friends{
      width: 95%;
      flex-direction: column;
      margin: 1rem 0;
      padding: 1rem 0;
      border-top: 1px solid #ff0000;
      position: relative;
      &:before{
        content: '友情链接';
        position: absolute;
        font-size: 0.95rem;
        line-height: 1rem;
        top: -0.5rem;
        left: 0.5rem;
        background: white;
      }
      >.list-item{
        margin: 0.8rem 0;
        ::v-deep .float-input{
          margin: 0 0.5rem;
          flex-shrink: 1;
          &:nth-child(1){
            width: 35%;
          }
          &:nth-child(2){
            width: 20%;
          }
          &:nth-child(3){
            width: 30%;
          }
        }
      }
      ::v-deep > .loading-button{
        background: #ff8100;
        svg{
          fill: white;
        }
      }
    }
  }
  ::v-deep > .loading-button{
    margin: 1rem 0;
    padding: 0.3rem 0.8rem;
    background: #54b361;
    box-shadow: 0 0 0.4rem rgba(0, 0, 0, 0.3);
    &.loading{
      background: gray;
      color: white;
    }
  }
  @include media{
    >.list{
      .float-input {
        width: 95% !important;
      }
      >label{
        width: 90%;
      }
    }
  }
}
</style>
