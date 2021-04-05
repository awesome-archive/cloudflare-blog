<template>
  <div class="md" flex>
    <div class="head" flex>
      <label class="search">
        <span>搜索</span>
        <input v-model="search"/>
      </label>
      <single-button class="select-" :active="selecting"
                     @click.native="selecting=!selecting">{{selecting?'取消':'选择'}}</single-button>
      <loading-button :icon="selecting?'download':'add'" class="new" :class="{white: !selecting}"
                      @click.native="clickBtn">{{selecting?'导出':'新建'}}</loading-button>
    </div>
    <div class="delete" v-if="selecting" flex>
      <a>{{deleting.state}}</a>
      <single-button class="del-btn" :disabled="deleting.b" @click.native="deleteSome">删除</single-button>
      <span class="check-box" :class="{active: allSelected}" @click="changeSelectAll"></span>
      <span class="txt">全选</span>
    </div>
    <div class="delete" v-else-if="deleting.b" flex>
      <a>{{deleting.state}}</a>
    </div>
    <div class="list" flex>
      <div class="init-load" v-if="!inited" flex>
        <svg-icon name="loading"/>
      </div>
      <table v-else>
        <thead>
        <tr>
          <td class="cover">封面</td>
          <td class="title">标题</td>
          <td class="summary">简介</td>
          <td class="time">时间</td>
          <td class="tags">标签</td>
          <td class="operate">操作</td>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in searchResult" :key="item.file">
          <router-link tag="td" class="cover" :to="'/article/'+item.file">
            <loading-img :src="item.cover || '/image/i.png'" :size="[-1, 8]"/>
          </router-link>
          <td class="title"><span>{{ item.name }}</span></td>
          <td class="summary"><span>{{ item.summary }}</span></td>
          <td class="time">
            <div flex>
              <span>创建:</span>
              <a>{{ item.time | time(true) }}</a>
            </div>
            <div flex>
              <span>修改:</span>
              <a>{{ item.modifyTime | time(true) }}</a>
            </div>
          </td>
          <td class="tags">
            <div flex="">
              <span :style="{background: $options.filters.color(tag)}" v-for="tag in item.tags">{{ tag }}</span>
            </div>
          </td>
          <td class="operate">
            <span v-if="selecting" :class="{active: selectList.indexOf(item.file)!==-1}" class="check-box"
                  @click="toggleSelect(item)"></span>
            <single-button v-else class="del-btn" @click.native="removeMd([item.file])"
                           :disabled="deleting.b">删除</single-button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import {parseAjaxError, sortByTime} from "@/utils/utils";
import jszip from "jszip";
import * as fileSaver from "file-saver";
import {genRss} from "~/pages/backend/utils";

export default {
  name: "ArticleList",
  props: {
    md: {
      type: Array,
      default: () => []
    },
    inited: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      deleting: {
        b: false,
        state: ''
      },
      selecting: false,
      selectList: [],
      search: '',
    }
  },
  computed: {
    searchResult() {
      if (this.search === '') return this.md;
      const lis = [];
      this.md.forEach(e => {
        if (e.name.search(this.search) !== -1) {
          lis.push(e)
        }
      })
      return lis
    },
    allSelected (){
      return this.selectList.length===this.searchResult.length;
    },
    gitUtil() {
      return this._gitUtil()
    }
  },

  methods: {
    changeSelectAll (){
      if (!this.allSelected) {
        this.selectList = [];
        this.searchResult.forEach(v => {
          this.selectList.push(v.file);
        })
      }else{
          this.selectList = [];
      }
    },
    toggleSelect(item) {
      const idx = this.selectList.indexOf(item.file);
      if (idx === -1) {
        this.selectList.push(item.file)
      } else {
        this.selectList.splice(idx, 1);
      }
    },
    async deleteSome() {
      if (this.selectList.length) {
        await this.removeMd(this.selectList);
      }
    },
    async clickBtn() {
      if (this.selecting) {
        if (this.deleting.b) return;
        if (!this.selectList.length) {
          this.$message.warning('请选择需要导出的项目!');
          return
        }
        this.deleting = {
          b: true,
          state: '导出中...'
        }
        const zip = new jszip(),
            ranTime = new Date().getTime();
        try {
          this.deleting.state = '下载:md.json';
          let res = await fetch(`/json/md.json?ran=${ranTime}`);
          let txt = await res.text();
          zip.file('md.json', txt);
          for (const file of this.selectList) {
            this.deleting.state = `下载:${file}.md`;
            res = await fetch(`/md/${file}.md?ran=${ranTime}`);
            txt = await res.text();
            zip.file(`${file}.md`, txt);
          }
          this.deleting.state = `正在压缩...`;
          const content = await zip.generateAsync({type: "blob"});
          fileSaver.saveAs(content, "md-export.zip");
        } catch (err) {
          this.$message.error(parseAjaxError(err));
        }
        this.deleting = {
          b: false,
          state: ''
        }
      } else {
        await this.$router.push('/article/new')
      }
    },
    async removeMd(files) {
      if (this.deleting.b) return;
      if (this.gitUtil) {
        if (confirm('确认删除?')) {
          let err = null;
          this.deleting = {
            b: true,
            state: '更新md.json'
          };
          // 更新md
          const newMdList = [];
          for (let i = 0; i < this.md.length; i++) {
            if (files.indexOf(this.md[i].file) === -1) {
              newMdList.push(this.md[i]);
            }
          }
          sortByTime(newMdList);
          let res = await this.gitUtil.updateJsonFile('md.json', newMdList);
          this.deleting.state = '准备删除';
          if (res[0]) {
            // 删除文件夹
            res = await this.gitUtil.removeSome(files, this.deleting, 'md');
            if (res[0]) {
              // 更新rss
              this.deleting.state = '更新 RSS';
              const res = await this.gitUtil.updateSingleFile('dynamic/rss.xml', genRss(newMdList));
              if (res[1]){
                this.$message.success('删除成功!');
                this.$emit('refresh')
              } else {
                err = res[1];
              }
            } else {
              err = res[1];
            }
          } else {
            err = res[1];
          }
          if (err) {
            this.$message.error(parseAjaxError(err));
          }
          this.deleting = {
            b: false,
            state: ''
          };
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
.md{
  min-height: 90%;
  flex-direction: column;
  > .head{
    width: 100%;
    margin: 1rem 0 0.5rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid gray;
    justify-content: space-between;
    flex-wrap: wrap;
    > .search{
      margin-left: 1rem;
      > span{
        margin-right: 1rem;
        font-size: 0.95rem;
      }
      > input{
        padding: 0.2rem;
        border-radius: 0.25em;
        font-size: 0.88rem;
        border: 1px solid gray;
        width: 10rem;
      }
    }
    > ::v-deep .new{
      margin: 0 1rem 0 0;
      padding: 0.6rem 1.2rem;
      background: linear-gradient(to right, #e02bd2, #4444ff);
      &.white{
        >svg{
          fill: white;
        }
      }
      > svg{
        width: 1.4rem;
        height: 1.4rem;
      }
      > span{
        margin-left: 0.5rem;
        font-size: 0.95rem;
        color: white;
      }
    }
    > .select-{
      margin: 0 1rem 0 auto;
      background: #00bb00;
    }
  }
  >.delete{
    justify-content: flex-end;
    margin: 0.5rem 0;
    width: 100%;
    >a{
      margin-right: 0.5rem;
      font-size: 0.8rem;
      color: red;
    }
    >.check-box{
      margin: 0 0.5rem 0 1.5rem;
    }
    >.txt{
      margin-right: 0.5rem;
      font-size: 0.9rem;
    }
  }
  > .list{
    width: 95%;
    margin: 1rem 0;
    > table{
      width: 100%;
      tbody{
        tr{
          height: 8rem;
          td{
            text-align: center;
            &.title, &.summary{
              > span{
                @include text-overflow(4);
              }
            }
            &.cover{
              cursor: pointer;
              width: 15%;
              ::v-deep img{
                height: 8rem !important;
                object-fit: contain !important;
              }
            }
            &.title{
              width: 25%;
              font-size: 1.04rem;
              word-break: break-all;
              white-space: pre-line;
            }
            &.summary{
              width: 26%;
              font-size: 0.85rem;
              color: #545454;
            }
            &.time{
              width: 12%;
              font-weight: 500;
              max-width: 10rem;
              > div{
                flex-direction: column;
                span, a{
                  word-break: keep-all;
                  white-space: nowrap;
                }
                > span{
                  font-size: 0.8rem;
                  margin-right: 0.4rem;
                }
                > a{
                  font-size: 0.88rem;
                  color: #0003ff;
                }
              }
            }
            &.tags{
              width: 15%;
              > div{
                flex-wrap: wrap;
                > span{
                  margin: 0.4rem 0.2rem;
                  padding: 0.3rem 0.8rem;
                  font-size: 0.8rem;
                  border-radius: 0.2rem;
                  color: white;
                }
              }
            }
            &.operate{
              width: 8%;
              > *{
                margin: auto;
              }
            }
          }
        }
      }
    }
  }
  @include media{
    td.cover{
      width: 30% !important;
    }
    td.summary, td.time, td.tags{
      display: none;
    }
  }
}
</style>
