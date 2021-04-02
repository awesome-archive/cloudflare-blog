import Octokat from "octokat";
import Sass from "sass.js";
import {stringToB64} from "@/utils/utils";
import {getFileContent} from "~/utils/github_graphql";

// github
export class GithubUtils {
  constructor(token, user, repo, committer) {
    this.octo = new Octokat({
      token: token,
      username: user,
    });
    this.repos = this.octo.repos(user, repo);
    this.committer = committer;
    this.login = user
  }

  async verifyToken() {
    return new Promise(resolve => {
      this.octo.user.fetch().then(res => {
        resolve([true, res])
      }).catch(err => {
        resolve([false, err])
      })
    })
  }

  async updateJsonFile(path, json) {
    path = `json/${path}`;
    return this.updateSingleFile(path, JSON.stringify(json, null, 4));
  }

  async updateSingleFile(path, content) {
    return new Promise(resolve => {
      this.repos.contents(path).fetch().then(res => {
        return this.repos.contents(path).add({
          message: `更新:${path}`,
          content: stringToB64(content),
          sha: res.sha,
          committer: this.committer
        }).then(res => {
          resolve([true, res])
        }).catch(err => {
          resolve([false, err])
        })
      }).catch(err => {
        resolve([false, err])
      })
    })
  }

  async updateMd(payload, dict) {
    return await this.createCommit([
      {
        folder: `md/${payload.file}.md`,
        content: payload.md
      }
    ], `更新 md-${payload.file}`, dict)
  };

  async updateRecord(payload, dict) {
    return await this.createCommit([
      {
        folder: `record/${payload.file}.txt`,
        content: payload.txt
      }
    ], `更新 record-${payload.file}`, dict)
  };

  async updateTheme(scss, dict) {
    return new Promise(resolve => {
      Sass.compile(scss, async res => {
        resolve(await this.createCommit([
          {
            folder: `markdown.scss`,
            content: scss
          },
          {
            folder: `markdown.css`,
            content: res.text
          }
        ], `更新 theme`, dict))

      });
    })
  }

  // create commit
  async createCommit(files, message, dict) {
    return new Promise(async resolve => {
      try {
        dict.state = '获取master的SHA';
        const main = await this.repos.git.refs('heads/master').fetch();
        // 创建tree
        const treeItems = [];
        for (const item of files) {
          dict.state = `创建blob:${item.folder.replace(/^.*\/([^/]*)$/, '$1')}`;
          const res = await this.repos.git.blobs.create({
            content: stringToB64(item.content),
            encoding: 'base64'
          });
          treeItems.push({
            path: item.folder,
            sha: res.sha,
            mode: "100644",
            type: "blob"
          });
        }
        dict.state = '创建tree';
        const tree = await this.repos.git.trees.create({
          tree: treeItems,
          base_tree: main.object.sha
        });

        // commit
        dict.state = 'commit...';
        const commit = await this.repos.git.commits.create({
          message: message,
          tree: tree.sha,
          parents: [main.object.sha]
        });
        dict.state = 'update...';
        await main.update({sha: commit.sha});
        resolve([tree])
      }catch (err){
        resolve([false, err])
      }
    })
  }

  async removeSome(folders, dic, what) {
    return new Promise(async resolve => {
      try {
        const repo = this.repos;
        dic.state = '获取 commit sha';
        // 先获取master的commit sha
        let res = await repo.git.refs('heads/master').fetch();
        dic.state = '获取 tree sha';
        // 根据commit sha获取tree sha
        res = await repo.git.commits(res.object.sha).fetch();
        // 根据tree sha递归获取sha
        const mdPath = [what];

        async function getMdSha(treeSha) {
          if (mdPath.length) {
            dic.state = `获取 ${mdPath[0]} sha`;
            res = await repo.git.trees(treeSha).fetch();
            for (const t of res.tree) {
              if (t.type === 'tree' && t.path === mdPath[0]) {
                mdPath.splice(0, 1);
                return await getMdSha(t.sha)
              }
            }
          } else {
            // 找到了
            return await repo.git.trees(treeSha).fetch();
          }
        }

        res = await getMdSha(res.tree.sha);
        for (const i of res.tree) {
          if (folders.indexOf(i.path.replace('.txt', '').replace('.md', '')) !== -1) {
            dic.state = `删除 ${i.path}`;
            await repo.contents(`${what}/${i.path}`).remove({
              sha: i.sha,
              message: '删除'
            });
          }
        }
        resolve([true])
      } catch (err) {
        resolve([false, err])
      }
    })
  }

  async getTag() {
    return new Promise(async resolve => {
      // 获取master的commit sha
      try {
        let res = await this.repos.git.refs('heads/master').fetch();
        const last = res.object.sha;
        res = await this.repos.git.refs.tags('').fetch();
        res.items.forEach(v => v.last = v.object.sha === last)
        resolve([true, res.items])
      }catch (err){
        resolve([false, err])
      }
    })
  }

  async createRelease(name, dict) {
    return new Promise(async resolve => {
      try {
        dict.state = '获取404-temp.html';
        let res = await getFileContent('404-temp.html');
        if (!res[0]){
          return resolve([false, res[1]])
        }
        const matcher = res[1].match(/^(\d+)([\s\S]*?)$/);
        if (!matcher){
          return resolve([false, '404-temp.html格式错误!'])
        }
        const timeStamp = matcher[1];
        const temp = matcher[2];
        dict.state = '检查time.stamp是否一致';
        res = await getFileContent('dist/time.stamp');
        if (!res[0]){
          return resolve([false, res[1]])
        }
        if (res[1] !== timeStamp){
          return resolve([false, 'time.stamp不一致!请重新build'])
        }
        dict.state = '获取404.html';
        res = await getFileContent('404.html');
        if (!res[0]){
          return resolve([false, res[1]])
        }
        dict.state = '对比差异';
        if (res[1] === temp){
          return resolve([false, 'github还未更新,等会再发布哦'])
        }
        dict.state = '复制404-temp.html到404.html';
        await this.updateSingleFile('404.html', temp);
        dict.state = '获取master的commit sha';
        res = await this.repos.git.refs('heads/master').fetch();
        dict.state = '创建refs';
        await this.repos.git.refs.create({
          ref: 'refs/tags/' + name,
          sha: res.object.sha
        });
        dict.state = '创建release成功!';
        resolve([true])
      }catch (err){
        resolve([false, err])
      }
    })
  }

  async deleteTag(lis, dic) {
    return new Promise(async resolve => {
      try {
        for (const tag of lis) {
          dic.state = '删除:' + tag;
          await this.repos.git(tag).remove();
        }
        resolve([true])
      }catch (err){
        resolve([false, err])
      }
    })
  }
}
