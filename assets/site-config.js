// --------- change this ↓ ---------
const
    name = '云与原',
    githubName = 'yunyuyuan',
    githubEmail = '326178275@qq.com',
    repo = 'cloudflare-blog',
    domain = 'https://blog.halberd.cn'
// --------- change this ↑ ---------


module.exports = {
// --------- change this ↓ ---------
    avatar: 'favicon.svg',
    corner: 'Simple code,Simple life',
    aboutUrl: '/simple-code-simple-life',
    captainTitle: '清予生 淡予时',
    oauth: {
        client_id: '81ee614d8099242a1bce',
        client_secret: 'b05e85014297d9a3c34f8763f27dfeb6d19b392a',
        redirect_uri: domain + '/oauth'
    },
    tip: "代码改变世界(๑ˉ∀ˉ๑)",

// --------- change this ↑ ---------

    name: name+'('+githubName+')',
    domain,
    owner: githubName,
    email: githubEmail,
    repo: repo,
    cdn: `https://cdn.jsdelivr.net/gh/${githubName}/${repo}@latest`,
    corsServer: 'https://cors.bridged.cc/',
    timeStamp: new Date().getTime(),
    rss: {
        title: `${name}的博客`,
        description: `${name}的博文Rss`,
        categories: 'Blog/Web development',
        ttl: 3600,
        // 最新的10个文章
        count: 10,
        /** Time By
         @create: 创建
         @update: 更新
         */
        timeBy: 'create'
    },
}
