const path = require('path');
const siteConfig = require('./assets/site-config.js');

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: siteConfig.captainTitle,
    htmlAttrs: {
      lang: 'zh-cn'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no' },
      { hid: 'description', name: 'description', content: siteConfig.rss.title }
    ],
    link: [
      { rel: 'shortcut icon', href: '/favicon.svg' },
      { rel: 'stylesheet', href: '', id: 'markdown-stylesheet' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/style/source-code-pro.css',
    '~/assets/style/write-font.css',
    '~/assets/style/main.scss',
    '~/assets/style/index.scss'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/codemirror.js', ssr: false }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend(config, context) {
      config.node = {
        fs: 'empty'
      }
      const svgFolder = path.resolve(__dirname, 'assets/svg');

      const svgRule = config.module.rules.find(rule => rule.test.test('.svg'))
      svgRule.exclude = [svgFolder]

      config.module
        .rules.push({
          test: /\.svg$/,
          loader: 'svg-sprite-loader',
          include: [svgFolder],
          options: {
            symbolId: 'icon-[name]'
          }
        })
      config.module
        .rules.push({
          test: /\.md$/,
          loader: 'raw-loader',
          include: [path.resolve(__dirname, 'rebuild/md')],
        })
    }
  },
}
