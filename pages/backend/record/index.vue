<template>
  <div class="record" flex>
    <div class="head" flex>
      <label class="search">
        <span>搜索</span>
        <input v-model="search"/>
      </label>
      <single-button class="select-" :active="selecting"
                     @click.native="selecting=!selecting">{{selecting?'取消':'选择'}}</single-button>
      <loading-button :icon="selecting?'download':'add'" class="new" :class="{white: !selecting}"
                      @click.native="clickBtn">{{ selecting ? '导出' : '新建' }}</loading-button>
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
    <div class="body">
      <table>
        <thead>
        <tr>
          <td>图</td>
          <td>文</td>
          <td>操作</td>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in searchResult" :key="item.file">
          <router-link class="link" tag="td" :to="'/backend/record/'+item.file">
            <loading-img :src="item.images[0]" :size="[-1,-1]"/>
          </router-link>
          <td>
            <span>{{ item.summary }}</span>
          </td>
          <td>
            <span v-if="selecting" :class="{active: selectList.indexOf(item.file)!==-1}" class="check-box"
                  @click="toggleSelect(item.file)"></span>
            <single-button class="del-btn" v-else @click.native="deleteItem([item.file])">删除</single-button>
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

import record from '~/rebuild/json/record.json'
import SingleButton from "@/components/single-button";
import LoadingImg from "@/components/loading-img";
import LoadingButton from "@/components/loading-button";

export default {
  name: "RecordList",
  components: {LoadingButton, LoadingImg, SingleButton},
  layout: 'backend',
  data() {
    return {
      record,
      search: '',
      deleting: {
        b: false,
        state: ''
      },
      selecting: false,
      selectList: []
    }
  },
  computed: {
    searchResult() {
      if (this.search === '') return this.record;
      const lis = [];
      this.record.forEach(e => {
        if (e.summary.search(this.search) !== -1) {
          lis.push(e)
        }
      })
      return lis
    },
    allSelected (){
      return this.selectList.length===this.searchResult.length;
    },
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
      const idx = this.selectList.indexOf(item);
      if (idx === -1) {
        this.selectList.push(item)
      } else {
        this.selectList.splice(idx, 1);
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
          this.deleting.state = '下载:record.json';
          let res = await fetch(`/json/record.json?ran=${ranTime}`);
          let txt = await res.text();
          zip.file('record.json', txt);
          for (const item of this.selectList) {
            this.deleting.state = `下载:${item}.txt`;
            res = await fetch(`/record/${item}.txt?ran=${ranTime}`);
            txt = await res.text();
            zip.file(`${item}.txt`, txt);
          }
          this.deleting.state = `正在压缩...`;
          const content = await zip.generateAsync({type: "blob"});
          fileSaver.saveAs(content, "record-export.zip");
        } catch (err) {
          this.$message.error(parseAjaxError(err));
        }
        this.deleting = {
          b: false,
          state: ''
        }
      } else {
        await this.$router.push('/record/new')
      }
    },
    async deleteSome() {
      if (this.selectList.length) {
        await this.deleteItem(this.selectList.slice())
      }
    },
    async deleteItem(files) {
      if (this.deleting.b) return;
      if (this.gitUtil) {
        if (confirm('确认删除?')) {
          let err = null;
          this.deleting = {
            bool: true,
            state: '更新record.json'
          };
          // 更新record
          const newRecordList = [];
          for (let i = 0; i < this.record.length; i++) {
            if (files.indexOf(this.record[i].file) === -1) {
              newRecordList.push(this.record[i]);
            }
          }
          sortByTime(newRecordList);
          let res = await this.gitUtil.updateJsonFile('record.json', newRecordList);
          this.deleting.state = '准备删除';
          if (res[0]) {
            // 删除文件夹
            res = await this.gitUtil.removeSome(files, this.deleting, 'record');
            if (res[0]) {
              this.$message.success('删除成功!');
              this.$emit('refresh')
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
            bool: false,
            state: ''
          };
        }
      } else {
        this.$message.warning('请先登录!');
        this.$emit('login')
      }
    },
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/public";
.record{
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
        > svg{
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
  > .body{
    width: 95%;
    margin: 1rem 0;
    > table{
      width: 100%;
      tbody{
        tr{
          height: 8rem;
          td{
            text-align: center;
            &:nth-child(1){
              width: 25%;
            }
            &:nth-child(2){
              width: 65%;
            }
            &.link{
              cursor: pointer;
            }
            .loading-img{
              width: 100%;
              img{
                width: 100%;
                object-fit: contain;
              }
            }
            > span{
              @include text-overflow(4);
            }
            > *{
              margin: 0 auto;
            }
          }
        }
      }
    }
  }
}
</style>
