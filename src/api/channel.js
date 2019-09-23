import request from '@/utils/request'

export const allChannels = () => {
  return request({
    method: 'get',
    url: '/app/v1_0/channels'
  })
}
