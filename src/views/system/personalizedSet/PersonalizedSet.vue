<template>
  <div class="personalizedSet_view">
    <header class="personalizedSet_header">系统图标设置</header>
    <div class="personalizedSet_cotent ">
      <div class="modify_name">
        <span class="modify_title">系统名称：</span>
        <el-input placeholder="请输入系统名称"
          v-model="systematicName"
          style="width: 40%"/>
      </div>
      <!--网站logo -->
      <div class="modify_photo">
        <span class="modify_title">网页图标：</span>
        <div class="upload-frame">
          <!-- 上传图片弹框 -->
          <el-upload v-loading="faviconLoading"
            element-loading-custom-class="loading_color"
            element-loading-spinner="el-icon-loading"
            ref="faviconUpload"
            class="avatar-uploader"
            action="uploadUrl"
            accept=".jpg,.jpeg,.png,.JPG,.JPEG"
            :show-file-list="false"
            :before-upload="beforeAvatarUploadFavicon"
            :limit="limitNum"
            :http-request="newWebUrl">
            <div class="upload_again"
              v-show="!faviconLoading">
              <span>重新上传</span>
            </div>
            <img v-if="faviconPath"
              :src="faviconPath"
              class="avatar" />
            <i class="el-icon-camera-solid avatar-uploader-icon"
              v-else></i>
            <div slot="tip"
              class="el-upload__tip">
              <i class="el-icon-warning-outline"></i>
              只能上传jpg/png文件，且不超过<span style="color:#F56262">5M</span>
              建议大小:16px*16px
            </div>
          </el-upload>
        </div>
      </div>
      <!-- 系统页logo -->
      <div class="modify_photo">
        <span class="modify_title">系统logo：</span>
        <div class="upload-frame">
          <!-- 上传图片弹框 -->
          <el-upload v-loading="systemLogoLoading"
            element-loading-custom-class="loading_color"
            element-loading-spinner="el-icon-loading"
            ref="systemLogoUpload"
            class="avatar-uploader"
            action="uploadUrl"
            accept=".jpg,.jpeg,.png,.JPG,.JPEG"
            :show-file-list="false"
            :before-upload="beforeAvatarUploadSystem"
            :limit="limitNum"
            :http-request="newWebUrl">
            <div class="upload_again"
              v-show="!systemLogoLoading">
              <span>重新上传</span>
            </div>
            <img v-if="systemLogoPath"
              :src="systemLogoPath"
              class="avatar" />
            <i class="el-icon-camera-solid avatar-uploader-icon"
              v-else></i>
            <div slot="tip"
              class="el-upload__tip">
              <i class="el-icon-warning-outline"></i>
              只能上传jpg/png文件，且不超过<span style="color:#F56262">5M</span>
              建议大小:长度（取决于字数大小）*32px
            </div>
          </el-upload>
        </div>
      </div>
      <!-- 登录页logo -->
      <div class="modify_photo">
        <span class="modify_title">登录背景：</span>
        <div class="upload-frame">
          <!-- 上传图片弹框 -->
          <el-upload v-loading="loginLogoLoading"
            element-loading-custom-class="loading_color"
            element-loading-spinner="el-icon-loading"
            ref="loginLogoUpload"
            class="avatar-uploader"
            action="uploadUrl"
            accept=".jpg,.jpeg,.png,.JPG,.JPEG,.PNG"
            :show-file-list="false"
            :before-upload="beforeAvatarUploadLogin"
            :limit="limitNum"
            :http-request="newWebUrl">
            <div class="upload_again"
              v-show="!loginLogoLoading">
              <span>重新上传</span>
            </div>

            <img v-if="loginLogoPath"
              :src="loginLogoPath"
              class="avatar" />
            <i class="el-icon-camera-solid avatar-uploader-icon"
              v-else></i>
            <div slot="tip"
              class="el-upload__tip">
              <i class="el-icon-warning-outline"></i>
              只能上传jpg/png文件，且不超过<span style="color:#F56262">5M</span>
              建议大小:长度（取决于字数大小）*32px
            </div>
          </el-upload>
        </div>
      </div>
      <!-- 底部按钮 -->
      <div class="footer_btn">
        <el-button type="primary"
          @click="confirmUpdate()"
          class="save_upload">
          保存</el-button>
        <el-button @click="cancelUpdate()">取消</el-button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'personalizedSet',
  components: {},
  props: {},
  vuex: {},
  data() {
    return {
      title: ' 系统图标设置',
      systematicName: '',
      limitNum: 1,
      // 前端显示路径
      systemLogoPath: '',
      loginLogoPath: '',
      faviconPath: '',
      // 无时间戳传递到后端的参数
      systemLogoUrl: '',
      loginLogoUrl: '',
      faviconUrl: '',
      // 1.登录页logo, 2. 系统logo 3. 网页logo
      type: 1,
      faviconLoading: false,
      systemLogoLoading: false,
      loginLogoLoading: false
    }
  },
  mounted() {
    this.getSystemData()
  },
  methods: {
    /**
     * 校验系统名称
     */
    nameValidate() {
      let warningTip = ''
      let regEn = /[`~!@#%^&*()_+<>?:"{},.;'[\]\\-]/im
      let regCn = /[·！#￥（——）：；“”‘、，《。》？、【】[\]]/im
      let item = this.systematicName.trim()

      if (item.trim().length > 36) {
        return '系统名称不能大于36个字符'
      }
      if (regEn.test(item) || regCn.test(item)) {
        return '系统名称不允许输入特殊字符'
      }
    },
    /**
     *  自定义http请求
     */
    newWebUrl(item) {
      // 映射上传logo类型
      const typeMap = {
        1: 'loginLogo',
        2: 'systemLogo',
        3: 'favicon'
      }
      // 获取上传文件信息
      let fileObj = item.file
      let type = this.type

      // 控制loading图标的显示隐藏
      let typeKey = `${typeMap[type]}`;
      if (this[`${typeKey}Loading`]) return;
      this[`${typeKey}Loading`] = true;
      // 请求接口参数
      const form = new FormData(); // FormData 对象
      form.append('logoImage', fileObj);
      form.append('type', type);

      this.$axios.post(this.$requestBaseUrl.core + '/admin/logo/upload',form)
              .then((res) => {
                if (res.data.success) {
                  let data = res.data.data
                  let path = `${typeMap[type]}` + 'Path'
                  let upload = `${typeMap[type]}` + 'Upload'

                  this[`${typeKey}Path`] =
                          this.$requestBaseUrl.core + data[path] + '?time=' + new Date().getTime()
                  this[`${typeKey}Url`] = data[path]
                  this.$refs[upload].clearFiles()
                  this[`${typeKey}Loading`] = false
                } else {
                  let upload = `${typeMap[type]}` + 'Upload'
                  this.$refs[upload].clearFiles()
                  this[`${typeKey}Loading`] = false
                  this.$message.warning('上传图片失败,' + res.data.msg);
                }
              }).catch((error) => {
                console.log(error);
               this.$message.error('上传logo图片发生异常!')
              });
    },
    /**
     * 获取系统数据
     */
    getSystemData() {
      this.$axios.get(this.$requestBaseUrl.core + '/admin/logo/get')
      .then((res) => {
        if (res.data.success) {
          let {
            systemName,
            systemLogoPath,
            loginLogoPath,
            faviconPath
          } = res.data.data
          // 当后端数据为null，前端初始化默认显示的logo
          if (res.data.data === null) {
            this.systematicName = '会话内容存档'
            this.faviconPath = require('./images/favicon.jpg')
            this.systemLogoPath = require('./images/systemLogo.jpg')
            this.loginLogoPath = require('./images/loginLogo.jpg')
          } else {
            let base = this.$requestBaseUrl.core;
            this.systematicName = systemName
            this.systemLogoPath =
              systemLogoPath !== ''
                ? base + systemLogoPath + '?time=' + new Date().getTime()
                : require('./images/systemLogo.jpg')
            this.loginLogoPath =
              loginLogoPath !== ''
                ? base + loginLogoPath + '?time=' + new Date().getTime()
                : require('./images/loginLogo.jpg')
            this.faviconPath =
              faviconPath !== ''
                ? base + faviconPath + '?time=' + new Date().getTime()
                : require('./images/favicon.jpg')
            this.loginLogoUrl = loginLogoPath
            this.systemLogoUrl = systemLogoPath
            this.faviconUrl = faviconPath
          }
        }
      })
    },
    /**
     * 上传文件前校验
     */
    beforeAvatarUploadFavicon(file) {
      this.type = 3
      const isLt5M = file.size / 1024 / 1024 < 5
      const isType = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isType) {
        this.$message.warning('请上传jpg/png类型的图片!');
        return false
      }
      if (!isLt5M) {
        this.$message.warning('上传图片大小不能超过 5M!');
        return false
      }

      return new Promise((resolve, reject) => {
        let uploadUrl = URL.createObjectURL(file)
        let newImg = new Image()
        newImg.src = uploadUrl
        newImg.onload = () => {
          if (newImg.width > 3000 || newImg.height > 3000) {
            this.$message.warning('上传图片宽高不能超过3000px');
            reject(new Error());
          }
          resolve();
        }
      })
    },
    beforeAvatarUploadLogin(file) {
      this.type = 1
      const isLt5M = file.size / 1024 / 1024 < 5
      const isType = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isType) {
        this.$message.warning('请上传jpg/png类型的图片!');
        return false;
      }
      if (!isLt5M) {
        this.$message.warning('上传图片大小不能超过 5M!');
      }
      return isLt5M;
    },
    beforeAvatarUploadSystem(file) {
      this.type = 2
      const isLt5M = file.size / 1024 / 1024 < 5
      const isType = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isType) {
        this.$message.warning('请上传jpg/png类型的图片!');
        return false
      }
      if (!isLt5M) {
        this.$message.warning('上传图片大小不能超过 5M!');
      }
      return isLt5M
    },
    /**
     * 二次确认更新
     */
    confirmUpdate() {
      let warningTip = this.nameValidate()
      if (warningTip) {
        this.$message.warning(warningTip);
        return false
      }
      this.$confirm('您正在执行系统图标设置操作，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.updateSystemData()
        })
        .catch(() => {})
    },
    /**
     * 确定更新系统图标设置
     */
    updateSystemData() {
      let data = {
        systemName: this.systematicName,
        systemLogoPath: this.systemLogoUrl,
        loginLogoPath: this.loginLogoUrl,
        faviconPath: this.faviconUrl
      }
      this.$axios.post(this.$requestBaseUrl.core + '/admin/logo/update',data)
      .then((res) => {
        if (res.data.success) {
          this.$message.success('设置成功');
          location.reload(true);
        }
      })
    },
    /**
     * 取消系统图标设置
     */
    cancelUpdate() {
      this.getSystemData()
      this.$refs.faviconUpload.clearFiles()
      this.$refs.systemLogoUpload.clearFiles()
      this.$refs.loginLogoUpload.clearFiles()
    }
  }
}
</script>
<style scoped>

  .personalizedSet_view {
    position: relative;
    width: 100%;
    height: 100%;
    background: #f5f5f5;
    overflow-y: auto;
  }
  .personalizedSet_header {

    margin: 15px auto 20px auto;
    background-color: #f5f5f5;
    width: 801px;
    color: #333333;
    padding-left: 10px;
    font-size: 16px;
    font-weight: 600;
  }

  .personalizedSet_cotent {
    position: relative;
    padding-left: 32px;
    margin: 0 auto;
    width: 801px;
    height: 700px;
    background: #ffffff;
    border-radius: 6px;
  }
  .modify_name {
    padding-top: 37px;
  }
  .dy-input input {
    width: 300px;
  }

  .modify_title {
    display: inline-block;
    width: 82px;
    color: #666666;
  }

  .modify_photo {
    margin-top: 20px;
  }
  .el-upload__tip {
    margin-top: 0px;
    color: #999;
    width: 220px;
  }

  .modify_title {
    float: left;
    width: 87px;
    color: #666666;
  }

  .upload-frame {
    display: flex;
    justify-content: flex-start;
  }
  .loading_color {
    width: 100px;
    height: 100px;
    border-radius: 2px;
    background-color: rgba(0, 0, 0, 0.555);
  }
   .avatar-uploader .el-upload {
    position: relative;
    border: 1px dashed #d9d9d9;
    border-radius: 2px;
    cursor: pointer;
    overflow: hidden;
  }

   .avatar-uploader .el-upload:hover {
    border-color: #409eff;
  }

   .avatar-uploader-icon {
    font-size: 36px;
    color: #cacaca;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
  }

   .upload_again {
    position: absolute;
    bottom: 0;
    width: 100px;
    height: 25px;
    background: rgba(0, 0, 0, 0.5);
  }

   .avatar {
    width: 100px;
    height: 100px;
    display: block;
    border-radius: 2px;
  }

  .footer_btn {
    position: absolute;
    left: 0;
    width: 801px;
    height: 72px;
    margin: 0 auto;
    bottom: 0;
    border-top: 1px solid #dddddd;
    background-color: #ffffff;
  }


  /deep/ .el-upload--text{
    width: 100px;
    height: 100px;
  }


  .dy-btn-primary {
    margin-top: 20px;
    width: 80px;
    height: 32px;
  }

  .btn-cancel {
    width: 80px;
    height: 32px;
    color: #000000;
  }

  .save_upload {
    margin: 20px 6px 0px 112px;
    text-align: center;
  }

</style>
