/*
 * 相对时间模块
 */
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 按需加载
import rTime from 'dayjs/plugin/relativeTime' // 相对时间插件
dayjs.locale('zh-cn') // 全局使用中文语言
dayjs.extend(rTime) // 配置使用相对时间插件

// 处理相对时间的函数
export const relativeTime = time => {
  return dayjs().from(dayjs(time))
}

// dayjs().from(dayjs('1990')) // 2 years ago
// dayjs().from(dayjs(), true) // 2 years
