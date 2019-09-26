<template>
  <div class="home">
    <!-- 导航栏 -->
    <van-nav-bar title="首页" fixed />
    <!-- 频道列表 -->
    <van-tabs v-model="active">
      <!-- 面包按钮 -->
      <div slot="nav-right" class="wap-nav" @click="isshow=true">
        <van-icon name="wap-nav" size="24" />
      </div>
      <van-tab :title="channel.name" v-for="channel in channels" :key="channel.id">
        <!-- 下拉刷新 -->
        <van-pull-refresh v-model="channel.pullDownLoading" @refresh="onRefresh">
          <!-- 频道的文章列表 -->
          <van-list
            v-model="channel.loading"
            :finished="channel.finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <van-cell
              v-for="article in channel.articles"
              :key="article.art_id.toString()"
              :title="article.title"
            >
              <!-- 自定义单元格内容 -->
              <div slot="label">
                <!-- 图片 -->
                <van-grid :border="false" :column-num="3">
                  <van-grid-item v-for="(img, index) in article.cover.images" :key="index">
                    <van-image height="80" :src="img" />
                  </van-grid-item>
                </van-grid>
                <!-- 用户名 评论 时间 -->
                <div class="article-info">
                  <div class="meta">
                    <span>{{ article.aut_name }}</span>
                    <span>{{ article.comm_count }}评论</span>
                    <span>{{ article.pubdate | relativeTime }}</span>
                  </div>
                </div>
              </div>
            </van-cell>
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
    <!-- 弹窗编辑频道 -->
    <van-popup
      v-model="isshow"
      round
      closeable
      close-icon-position="top-left"
      position="bottom"
      :style="{ height: '95%' }"
    >
      <!-- 我的频道 -->
      <div style="margin-top:50px">
        <van-cell title="我的频道">
          <van-button
            round
            color="red"
            plain
            size="mini"
            @click="isEdit = !isEdit"
          >{{isEdit ? '完成':'编辑'}}</van-button>
        </van-cell>
        <van-grid :gutter="10">
          <van-grid-item
            v-for="(channel, index) in channels"
            :key="channel.id"
            :text="channel.name"
            @click="onUserChannelClick(channel,index)"
          >
            <van-icon v-show="isEdit" class="close-icon" slot="icon" name="close" />
          </van-grid-item>
        </van-grid>
      </div>
      <!-- 频道推荐 -->
      <div>
        <van-cell title="频道推荐"></van-cell>
        <van-grid :gutter="10">
          <van-grid-item
            v-for="channel in remainChannels"
            :key="channel.id"
            :text="channel.name"
            @click="onAddChannel(channel)"
          />
        </van-grid>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { allChannels, getUserOrDefaultChannels, resetUserChannels, deleteUserChannel } from '@/api/channel'

import { getArticles } from '@/api/article'
import { mapState } from 'vuex'
import { setItem, getItem } from '@/utils/storage'

export default {
  name: 'HomeIndex',
  data () {
    return {
      active: 0,
      channels: [],
      allChannels: [],
      isshow: false,
      isEdit: false
      // list: [],
      // loading: false,
      // finished: false
    }
  },
  computed: {
    ...mapState(['usertoken']),
    currentChannel () {
      return this.channels[this.active]
    },
    // 获取剩余频道
    remainChannels () {
      // 剩余频道=所有频道-我的频道
      const channels = []
      // 遍历全部频道列表  查找与我的频道id不相同的元素加入剩余频道
      this.allChannels.forEach(channel => {
        // findIndex 方法：遍历数组，查找满足 item.id === channel.id 的元素，找到就返回该元素的索引
        const index = this.channels.findIndex(item => item.id === channel.id)
        if (index === -1) {
          channels.push(channel)
        }
      })
      return channels
    }
  },
  methods: {
    // 得到用户频道列表
    async getUserChannel () {
      let channels = []
      // 1.如果用户已登录，则请求获取后端存储的用户频道列表
      if (this.usertoken) {
        const { data } = await getUserOrDefaultChannels()
        channels = data.data.channels
      } else {
        // 2.如果用户未登录，则看本地存储是否有频道列表数据
        const localChannels = getItem('channels')
        if (localChannels) {
          // 如果本地存储有数据，则获取使用
          channels = localChannels
        } else {
          // 如果本地存储没有数据，则请求默认频道数据
          const { data } = await getUserOrDefaultChannels()
          channels = data.data.channels
        }
      }
      // 定制频道的内容数据
      channels.forEach(channel => {
        channel.articles = [] // 频道的文章列表
        channel.loading = false // 频道的上拉加载状态
        channel.finished = false // 频道的上拉加载结束的状态
        channel.timestamp = null // 用于获取下一页数据的时间戳（页码）
        channel.pullDownLoading = false // 频道的下拉刷新 loading 状态
      })
      this.channels = channels
    },
    // 得到全部频道列表
    async getAllChannel () {
      const { data } = await allChannels()
      this.allChannels = data.data.channels
    },
    // 添加我的频道
    async onAddChannel (channel) {
      // 在频道推荐里点击频道添加到我的频道里
      this.channels.push(channel)
      // 持久化
      if (this.usertoken) {
        // 已登录，保存到用户后端
        const channels = []
        // 提取要重置的频道列表（除了推荐）
        this.channels.slice(1).forEach((item, index) => {
          channels.push({
            id: item.id,
            seq: index + 2
          })
        })
        await resetUserChannels(channels)
      } else {
        // 未登录，放入本地存储
        setItem('channels', this.channels)
      }
    },
    // 加载每个频道的新闻列表
    async onLoad () {
      // 1. 请求加载文章列表
      const currentChannel = this.currentChannel
      const { data } = await getArticles({
        channelId: currentChannel.id,
        // 第1页数据传递当前最新时间戳
        // 下一页数据传递上一页返回数据结果中的 pre_timestamp
        timestamp: currentChannel.timestamp || Date.now(),
        withTop: 1
      })

      // 2. 将得到的文章列表添加到当前频道.articles 中
      const { pre_timestamp: preTimestamp, results } = data.data
      // currentChannel.articles.concat(results) // 之前合并数组的方式
      currentChannel.articles.push(...results) // es6 也可以这么玩儿

      // 3. 本次 onLoad 数据加载完毕，将 loading 设置为 false
      currentChannel.loading = false

      // 4. 判断是否还有下一页数据
      if (!preTimestamp) {
        currentChannel.finished = true
      } else {
        // 还有数据，将本次得到的 preTimestamp 存储到当前频道，用于加载下一页数据
        currentChannel.timestamp = preTimestamp
      }
    },
    // 下拉刷新
    async onRefresh () {
      const currentChannel = this.currentChannel
      const { data } = await getArticles({
        channelId: currentChannel.id,
        timestamp: Date.now(), // 每次刷新都是加载的新数据，所以要获取当前最新时间
        withTop: 1
      })
      // 将数据添加到当前频道.articles数据中（顶部）
      currentChannel.articles.unshift(...data.data.results)
      // 关闭当前频道下拉刷新的 loading 状态
      currentChannel.pullDownLoading = false
      this.$toast('刷新成功')
    },
    // 我的频道中点击处理函数
    async onUserChannelClick (channel, index) {
      if (this.isEdit) {
        // 编辑状态  删除当前点击的频道
        this.channels.splice(index, 1)

        // 持久化
        if (this.usertoken) {
          // 如果登录  删除用户后端数据
          await deleteUserChannel(channel.id)
        } else {
          // 未登录 删除本地存储数据
          setItem('channels', this.channels)
        }
      } else {
        // 非编辑状态  点击切换到相应的频道显示
        this.active = index
        // 关闭弹层
        this.isshow = false
      }
    }
  },
  created () {
    this.getUserChannel()
    this.getAllChannel()
  }
}
</script>

<style lang='less'>
.home {
  .van-tabs {
    /deep/ .van-tabs__wrap--scrollable {
      position: fixed;
      top: 46px;
      left: 0;
      right: 0;
      z-index: 2;
    }
    /deep/ .van-tabs__content {
      margin-top: 90px;
    }
    .wap-nav {
      position: sticky;
      right: 0;
      display: flex;
      align-items: center;
      background-color: #fff;
      opacity: 0.8;
    }
  }
  .article-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .meta span {
      margin-right: 10px;
    }
  }
  .close-icon {
    position: absolute;
    top: -5px;
    right: -5px;
  }
}
</style>
