import request from '@/utils/request'

/**
 * 全部频道列表
 */
export const allChannels = () => {
  return request({
    method: 'get',
    url: '/app/v1_0/channels'
  })
}

/**
 * 用户频道列表或默认频道列表
 */
export const getUserOrDefaultChannels = () => {
  return request({
    method: 'get',
    url: '/app/v1_0/user/channels'
  })
}

/**
 * 重置用户频道列表
 */
export const resetUserChannels = channels => {
  return request({
    method: 'PUT',
    url: '/app/v1_0/user/channels',
    data: {
      channels
    }
  })
}

/**
 * 删除用户频道列表
 */
export const deleteUserChannel = channelId => {
  return request({
    method: 'delete',
    url: '/app/v1_0/user/channels/' + channelId
  })
}
