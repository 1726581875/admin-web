<template>
  <div>
    <span>LOGIN PAGE</span>
  <form action="" method="post">
    <input type="text" v-model="user.username" ><br>
    <input type="password" v-model="user.password"><br>
    <input type="text" v-model="user.code"></input>
    <div @click="updateVerificationCode"><img :src="vcUrl"></div>
    <br>
    <input type="button" value="login" @click="login">
  </form>
  </div>
</template>

<script>
  export default {
    name: "Login",
    data() {
      return {
        user : {},
        vcUrl: 'http://localhost:10000/code/image?time='+new Date(),
      }
    },
    methods: {
      login(){
        let formDate = new FormData();
        formDate.append("username",this.user.username);
        formDate.append("password",this.user.password);
        formDate.append("code",this.user.code);
        this.$axios.post('http://localhost:10000/mooc/admin/login',formDate)
          .then(resp => {
            console.log(resp.data);
            let respResult = resp.data;
            if(respResult.success){
             // let path = this.$route.query.redirect;
             // this.$router.replace((path == '/' || path == undefined) ? '/about' : path);
              console.log("登录成功...")
            }else {
              this.$message.error(respResult.msg);
              this.updateVerificationCode();
            }
          })
      },
      updateVerificationCode() {
        this.vcUrl = 'http://localhost:10000/code/image?time='+new Date();
      },

    }
  }
</script>

<style scoped>

</style>