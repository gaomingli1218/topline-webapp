// 这里先封装一个用于操作本地存储的存储模块。

// 获取本地存储数据
export const getItem = name => {
  return JSON.parse(window.localStorage.getItem(name))
}

// 设置本地存储数据
export const setItem = (name, data) => {
  return window.localStorage.setItem(name, JSON.stringify(data))
}

// 移除本地存储数据
export const removeItem = name => {
  window.localStorage.removeItem(name)
}
