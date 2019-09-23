<template>
  <div>
    <van-nav-bar title="登录" />
    <!--
      ValidationObserver 组件会渲染成一个form表单
      可以通过 ref 调用这个组件的方法：validate 来进行js验证
    -->
    <ValidationObserver tag="form" ref="loginForm">
      <!--
        把需要验证的字段用 ValidationProvider 包裹起来
        在其上面配置对应的验证规则等信息
      -->
      <ValidationProvider tag="div" name="手机号" rules="required|phone" v-slot="{ errors }">
        <van-field
          v-model="user.mobile"
          required
          clearable
          label="手机"
          placeholder="请输入手机号"
          :error-message="errors[0]"
        />
      </ValidationProvider>
      <ValidationProvider tag="div" name="验证码" rules="required|code" v-slot="{ errors }">
        <van-field
          v-model="user.code"
          label="验证码"
          placeholder="请输入验证码"
          required
          :error-message="errors[0]"
        />
      </ValidationProvider>
    </ValidationObserver>
    <div class="login-btn">
      <van-button type="info" :loading="isLoading" @click="onLogin">登录</van-button>
    </div>
  </div>
</template>

<script>
// import request from "@/utils/request";
import { login } from '@/api/user'
import { mapMutations } from 'vuex'
export default {
  data () {
    return {
      user: {
        mobile: '',
        code: ''
      },
      isLoading: false
    }
  },
  methods: {
    ...mapMutations(['setUsertoken']),
    async onLogin () {
      // 发送请求
      try {
        const isValid = await this.$refs.loginForm.validate()
        if (!isValid) {
          return
        }
        this.isLoading = true
        const { data } = await login(this.user)
        console.log(data)
        this.setUsertoken(data.data)
        // this.$store.commit("setUsertoken", data.data);
        this.$toast.success('登录成功')
        this.$router.push('/')
        this.isLoading = false
      } catch (err) {
        if (err.response && err.response.status === 400) {
          this.$toast.fail('手机号或验证码错误')
        }
      }
      this.isLoading = false
    }
  }
}
</script>

<style lang='less' scoped>
.login-btn {
  padding: 20px;
  .van-button {
    width: 100%;
  }
}
</style>
