// 这里先封装一个用于操作本地存储的存储模块。

// 获取本地存储数据
export const getItem = token => {
  return JSON.parse(window.localStorage.getItem(token))
}

// 设置本地存储数据
export const setItem = (token, data) => {
  return window.localStorage.setItem(token, JSON.stringify(data))
}

// 移除本地存储数据
export const removeItem = name => {
  window.localStorage.removeItem(name)
}
