import axios from 'axios'
import JSONbig from 'json-bigint'
import store from '@/store'

const request = axios.create({
  baseURL: 'http://ttapi.research.itcast.cn'
})

// 设置请求拦截器
request.interceptors.request.use(function (config) {
  const { usertoken } = store.state
  if (usertoken) {
    // 配置 token 请求头
    config.headers.Authorization = `Bearer ${usertoken.token}`
  }
  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})

// 大数值处理
request.defaults.transformResponse = [function (data) {
  //   return data ? JSONbig.parse(data) : {}
  try {
    // data 数据可能不是标准的 JSON 格式字符串，否则会导致 JSONbig.parse(data) 转换失败报错
    return JSONbig.parse(data)
  } catch (err) {
    // 无法转换的数据直接原样返回
    return data
  }
}]

export default request
