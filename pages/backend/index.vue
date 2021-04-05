<template>
  <div class="back-end">
    <pwd v-if="needPwd"/>
    <template v-else>
      <div class="menu" :class="{hide: !showMenu}" flex>
        <div class="pendant" flex="">
          <span class="toggle-menu" :class="{opened: showMenu}" @click="toggleMenu">
            <svg viewBox="0 0 100 100">
              <path class="line line1"
                    d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058"/>
              <path class="line line2" d="M 20,50 H 80"/>
              <path class="line line3"
                    d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942"/>
            </svg>
          </span>
        </div>
        <div class="link-list" flex>
          <NuxtLink v-for="item in menu" :key="item.name" :to="'/backend/'+item.pathName"
                       :class="{active: $route.path.split('/').pop()===item.pathName}" class="list-item" flex>
            <span class="icon">
              <svg-icon :name="item.icon"/>
            </span>
            <span class="name">{{ item.name }}</span>
          </NuxtLink>
        </div>
        <a class="home" href="/" flex="" title="回到主页">
          <img src="/image/i.png" alt="favicon"/>
        </a>
        <loading-button icon="account" :loading="loginState==='doing'" :class="loginState" @click.native="showLogin = true">
          {{ loginStateText }}
        </loading-button>
      </div>
      <login v-show="showLogin" @gitUtil="initGitUtil" @save="loginFinish" @hide="showLogin = false"/>
      <div class="body">
        <NuxtChild keep-alive/>
      </div>
    </template>
  </div>
</template>

<script>
import {checkPwd, dontInput} from "~/pages/backend/utils";
import Pwd from "./pwd";
import Login from "./Login";
import siteConfig from "~/assets/site-config";
import {mapMutations} from "vuex";
const menu = [
{
  name: '配置',
  pathName: 'config',
  icon: 'config'
},
{
  name: '文章',
  pathName: 'article',
  icon: 'article'
},
{
  name: '记录',
  pathName: 'record',
  icon: 'record'
},
{
  name: '主题',
  pathName: 'theme',
  icon: 'brash'
},
{
  name: '面板',
  pathName: 'dashboard',
  icon: 'dashboard'
},
{
  name: '评论',
  pathName: 'comment',
  icon: 'comments'
},
]

export default {
  name: "index",
  components: {Pwd, Login},
  layout: 'backend',
  head () {
    return {
      meta: [
        { hid: 'description', name: 'description', content: `${siteConfig.name}的博客 后台管理 backends` }
      ],
      title: 'manage'
    }
  },
  data() {
    return {
      needPwd: true,
      showMenu: process.server?true:(localStorage.getItem('show-menu')||'true')==='true',
      showLogin: false,
      loginState: 'none', // none | doing | ok
      token: '',
      menu,
    }
  },
  fetch({redirect, route}) {
    if (route.name === 'backend'){
      redirect('/backend/'+menu[0].pathName)
    }
  },
  computed: {
    computeToken (){
      return this.token
    },
    loginStateText (){
      switch (this.loginState){
        case "none":
          return '未登录'
        case "doing":
          return '登录中'
        case "ok":
          return '已登录'
      }
    }
  },
  provide() {
    return {
      _token: () => this.computeToken
    }
  },
  created() {
    if (process.server) return
    const pwd = localStorage.getItem('pwd') || '';
    if (checkPwd(pwd)) {
      this.needPwd = false;
    }else if (pwd === dontInput){
      this.needPwd = false;
      localStorage.removeItem('pwd');
    }
  },
  methods: {
    ...mapMutations('backend', ['setGitUtil']),
    toggleMenu() {
      this.showMenu = !this.showMenu;
      localStorage.setItem('show-menu', this.showMenu.toString());
    },
    async initGitUtil ({instance, token}){
      // verify
      this.loginState = 'doing';
      const res = await instance.verifyToken();
      if (res[0] && res[1].login === siteConfig.owner) {
        this.setGitUtil(instance);
        this.token = token;
        this.$message.success('登录成功!');
        this.loginState = 'ok';
        return
      }
      this.$message.error('token错误!');
      localStorage.removeItem('login-token');
      this.loginState = 'none';
    },
    async loginFinish() {
      this.showLogin = false;
    },
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";

.back-end {
  width: 100%;
  height: 100%;
  position: relative;
  flex-shrink: 0;
  $menu-width: 9rem;

  > .menu {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: $menu-width;
    background: rgba(43, 43, 48, 0.92);
    flex-direction: column;
    box-shadow: 0 0 0.8rem rgba(75, 75, 75, 0.5);
    z-index: $z-index-body+1;
    transition: all .2s ease-out;

    &.hide {
      transform: translateX(-100%);

      ~ .body {
        width: 100%;
      }
    }

    > .pendant {
      position: absolute;
      top: 0;
      left: 100%;
      flex-direction: column;
      background: black;

      > .toggle-menu, > .home {
        width: 2.2rem;
        height: 2.2rem;
      }

      > .toggle-menu {
        > svg {
          box-shadow: 0 0 0.4rem #00000063;
          cursor: pointer;
          transition: background .1s linear;

          &:hover {
            background: #1e1e1e;
          }

          > .line {
            fill: none;
            stroke: #00ffff;
            stroke-width: 6;
            transition: stroke-dasharray .4s cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset .4s cubic-bezier(0.4, 0, 0.2, 1);
            @each $i, $n in (1, 207), (2, 60), (3, 207) {
              &.line#{$i} {
                stroke-dasharray: 60 $n;
              }
            }
          }
        }

        @each $i, $n, $s in (1, -134, 90 207), (2, -30, 1 60), (3, -134, 90 207) {
          &.opened > svg > .line#{$i} {
            stroke-dasharray: $s;
            stroke-dashoffset: $n;
          }
        }
      }
    }

    >.link-list {
      overflow-y: auto;
      flex-direction: column;
      width: 100%;
      > .list-item {
        font-size: 1rem;
        color: black;
        text-decoration: none;
        justify-content: center;
        padding: 1rem 0;
        width: calc(100% - 0.2rem);
        border-left: 0.2rem solid transparent;

        &.active {
          background: rgba(76, 76, 76, 0.87);
          border-color: #5fff88;
        }

        &:not(.active):hover {
          background: rgba(255, 255, 255, 0.15);
        }

        > .icon {
          width: 2.2rem;
          height: 2.2rem;
          display: flex;

          > svg {
            width: 100%;
            height: 100%;
          }
        }

        > .name {
          margin-left: 1rem;
          color: white;
        }
      }
    }

    > .home {
      margin-top: auto;
      width: 3rem;
      height: 3rem;
      > img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        transition: all .15s ease-out;
      }
      &:hover{
        >img{
          box-shadow: 0 0 0.8rem rgba(255, 255, 255, 0.5);
        }
      }
    }
    ::v-deep .loading-button {
      margin: 1rem 0;

      &.none{
        background: gray;
      }
      &.doing{

      }
      &.ok{
        background: #ac60ff;
      }

      &:hover {
        background: #8c8e8d;
      }

      &.loading {
        background: #8c8e8d;
      }
    }
  }

  > .body{
    position: absolute;
    width: calc(100% - #{$menu-width});
    height: 100%;
    overflow-y: auto;
    right: 0;
    top: 0;
    align-items: flex-start;
    transition: all .2s ease-out;
    > div{
      background: white;
      width: calc(100% - 4rem);
      overflow: hidden;
      margin: 1rem 1rem 1rem 3rem;
      border-radius: 0.6rem;
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    }
  }
  ::v-deep .check-box{
    display: block;
    width: 1.5rem;
    height: 1.5rem;
    cursor: pointer;
    border: 1px solid gray;
    border-radius: 50%;
    &.active{
      background: #ff3700;
    }
  }
  ::v-deep .single-button.del-btn{
    border-radius: 0.2rem;
    background: #ff344f;
    width: 2.4rem;
    margin: 0 0.5rem;
    &:not(.disabled):hover{
      background: #f1314a;
    }
  }
  ::v-deep .init-load{
    width: 100%;
    margin-top: 2rem;
    justify-content: center;
    >svg{
      width: 5rem;
      height: 5rem;
    }
  }
  @include media{
    >.menu{
      background: rgba(43, 43, 48, 0.75);
    }
    >.body{
      width: 100%;
      >div{
        width: 99% !important;
        margin-left: 0.5% !important;
      }
    }
  }
}
</style>
