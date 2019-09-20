import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './styles/login.less'
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate'
import zhCN from 'vee-validate/dist/locale/zh_CN' // 加载验证插件的语言包
import * as rules from 'vee-validate/dist/rules'
import {
  NavBar,
  CellGroup,
  Field,
  Button,
  Loading,
  Toast
} from 'vant'

Vue
  .use(NavBar)
  .use(CellGroup)
  .use(Field)
  .use(Button)
  .use(Loading)
  .use(Toast)

// 配置使用中文语言
for (let rule in rules) {
  extend(rule, {
    ...rules[rule], // add the rule
    message: zhCN.messages[rule] // add its message
  })
}
// 自定义验证必须是是手机号
extend('phone', {
  validate (value) {
    return /^1\d{10}$/.test(value)
  },
  message: '必须是手机号'
})
extend('code', {
  validate (value) {
    return /^\d{6}$/.test(value)
  },
  message: '必须是6位验证码'
})

// 注册为全局组件
Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
