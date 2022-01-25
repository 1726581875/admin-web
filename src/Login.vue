<template>
  <div style="width: 100%;height: 700px">
  <div class="login-wrap" :style="{backgroundImage: 'url(' + bgImage + ')' }">
    <div class="ms-login">
      <div class="ms-title">{{systemName}}</div>
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
        <el-form-item>
          <el-radio v-model="param.type" label="TEACHER">教师</el-radio>
          <el-radio v-model="param.type" label="MANAGER">管理员</el-radio>
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
        <p class="login-tips">Tips : 如果忘记密码请联系管理员QQ1726581875</p>
      </el-form>
    </div>
  </div>
  </div>
</template>

<script>
  import defaultImage from '@/assets/bg.jpg'
  import { encrypt } from '@/utils/rsaEncrypt'
  export default {
    data: function() {
      return {
        //登录背景图
        bgImage: defaultImage,
        //系统名
        systemName: 'MOOC后台管理系统',
        param: {
          username: 'admin',
          password: 'root',
          type: 'MANAGER',
          code:''
        },
        rules: {
          username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
          password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
          code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
        },
        vcUrl: this.$requestBaseUrl.authorize+'/mooc/admin/code/image?time='+new Date().getTime(),

      };
    },
    created() {
      //加载logo
      this.setSystemName();
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
                  localStorage.setItem('userId',respResult.data.userId);
                  //存储整个用户信息
                  localStorage.setItem('user',JSON.stringify(respResult.data));

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
      /**
       * 获取系统名/系统logo
       */
      setSystemName(){
        this.$axios.get(this.$requestBaseUrl.core + '/admin/logo/loginLogo')
          .then(res => {
            if (res.data.success) {

              let data = res.data.data
              // 设置系统名
              this.systemName = data.systemName;

              //设置背景图
              this.bgImage = this.$requestBaseUrl.core + data.loginLogoPath + '?time=' + new Date().getTime();
              // 设置浏览器头部favicon、title
              let link =
                document.querySelector("link[rel*='icon']") ||
                document.createElement('link')
              link.type = 'image/x-icon'
              link.rel = 'shortcut icon'
              link.href =
                data.faviconPath !== ''
                  ? this.$requestBaseUrl.core +
                  data.faviconPath +
                  '?time=' +
                  new Date().getTime()
                  : '../static/favicon.png'
              document.getElementsByTagName('head')[0].appendChild(link)
              document.title =
                data.systemName !== '' ? data.systemName : 'mooc|慕课后台管理系统'
            }else {
              let link =
                document.querySelector("link[rel*='icon']") ||
                document.createElement('link')
              link.type = 'image/x-icon'
              link.rel = 'icon'
              link.href = '../static/favicon.png'
              document.getElementsByTagName('head')[0].appendChild(link)
              document.title = 'mooc|慕课后台管理系统'
            }
          })
          .catch(err => {
            console.log('获取logo发生异常,err=' + err)
          });
      },
    },
  };
</script>

<style scoped>
  .login-wrap {
    position: relative;
    width: 100%;
    height: 100%;
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