<template>
  <div style="width: 100%;height: 700px">
  <div class="login-wrap">
    <div class="ms-login">
      <div class="ms-title">MOOC后台管理系统</div>
      <el-form :model="param" :rules="rules" ref="login" label-width="0px" class="ms-content">
        <el-form-item prop="username">
          <el-input v-model="param.username" placeholder="username">
            <el-button slot="prepend" icon="el-icon-user"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            placeholder="password"
            v-model="param.password"
            @keyup.enter.native="submitForm()"
          >
            <el-button slot="prepend" icon="el-icon-lock"></el-button>
          </el-input>
        </el-form-item>

        <el-form-item prop="code">
          <el-input v-model="param.code" placeholder="code">
            <el-button slot="prepend" icon="el-icon-picture-outline"></el-button>
          </el-input>
          <div @click="updateVerificationCode"><img :src="vcUrl"></div>
        </el-form-item>

        <div class="login-btn">
          <el-button type="primary" @click="submitForm()">登录</el-button>
        </div>
        <p class="login-tips">Tips : 如果忘记密码请联系管理员</p>
      </el-form>
    </div>
  </div>
  </div>
</template>

<script>

  import { encrypt } from '@/utils/rsaEncrypt'
  export default {
    data: function() {
      return {
        param: {
          username: 'admin',
          password: 'root',
          code:''
        },
        rules: {
          username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
          password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
          code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
        },
        vcUrl: this.$requestBaseUrl.authorize+'/mooc/admin/code/image?time='+new Date(),

      };
    },
    methods: {
      submitForm() {
        this.$refs.login.validate(valid => {
          if (valid) {
            let loginParam =JSON.parse(JSON.stringify(this.param));
            //密码加密传输
            loginParam.password = encrypt(this.param.password);
            this.$axios.post(this.$requestBaseUrl.authorize+'/mooc/admin/login',loginParam)
              .then(resp => {
                let respResult = resp.data;
                // 如果登录成功
                if(respResult.success) {
                  // let path = this.$route.query.redirect;
                  // this.$router.replace((path == '/' || path == undefined) ? '/about' : path);
                  console.log("登录成功...")
                  localStorage.setItem('token', respResult.data.token);
                  localStorage.setItem('menuList', JSON.stringify(respResult.data.menuList));
                  localStorage.setItem('account', this.param.username);


                  let menuList = respResult.data.menuList;
                  console.log('menuList=' + menuList);
                  if((!menuList) || (menuList.length == 0)){
                    this.$message.warning('你没有任何菜单权限');
                    return;
                  }
                  //加载跳转到第0个菜单
                  let menu = menuList[0];
                  console.log('menu.subs=' + menu.subs);
                  if(menu.subs && menu.subs.length > 0){
                    this.$router.push('/' + menu.subs[0].index);
                  }else {
                    this.$router.push('/' + menu.index);
                  }
                }else {
                  this.$message.warning(respResult.msg);
                  this.updateVerificationCode();
                }
              });
          } else {
            this.$message.error('请输入账号和密码');
            return false;
          }
        });
      },
      updateVerificationCode() {
        this.vcUrl = this.$requestBaseUrl.authorize+'/mooc/admin/code/image?time='+new Date().getTime();
      },

    },
  };
</script>

<style scoped>
  .login-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url(./assets/bg.jpg);
    background-size: 100%;
  }
  .ms-title {
    width: 100%;
    line-height: 50px;
    text-align: center;
    font-size: 20px;
    color: #fff;
    border-bottom: 1px solid #ddd;
  }
  .ms-login {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 350px;
    margin: -190px 0 0 -175px;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.3);
    overflow: hidden;
  }
  .ms-content {
    padding: 30px 30px;
  }
  .login-btn {
    text-align: center;
  }
  .login-btn button {
    width: 100%;
    height: 36px;
    margin-bottom: 10px;
  }
  .login-tips {
    font-size: 12px;
    line-height: 30px;
    color: #fff;
  }
</style>