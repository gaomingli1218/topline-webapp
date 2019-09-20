import Vue from 'vue'
import Vuex from 'vuex'
import { getItem, setItem } from '@/utils/storage'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 初始化一个数据
    usertoken: getItem('usertoken')
  },
  mutations: {
    // 添加一个 mutations 用于修改 state
    setUsertoken (state, usertoken) {
      // 登录成功之后 调用 mutations 中的 setUser 把 token 存在Vuex中
      state.usertoken = usertoken
      // 为了防止页面刷新数据丢失，需要把token存储在本地存储
      setItem('usertoken', state.usertoken)
    }
  },
  actions: {

  }
})
