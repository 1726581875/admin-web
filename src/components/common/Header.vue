<template>
    <div class="mooc-header">
        <el-alert v-if="isShowStayMessage"
                  type="info"
                  effect="dark"
                  @close="closeStayHeadMessage">
            <span style="margin-left: 200px"> {{webSockMessage.content}}
            <a href="javascript:void(0)" @click="toNotice"> 去看看</a>
                </span>
        </el-alert>

        <!-- 折叠按钮 -->
        <div class="collapse-btn" @click="collapseChage">
            <i v-if="!collapse" class="el-icon-s-fold"></i>
            <i v-else class="el-icon-s-unfold"></i>
        </div>
        <!-- 系统logo图片 -->
         <div style="display: inline-block;margin-top: 10px;float: left">
             <img :src="systemLogoUrl" height="40px" style="display: inline-block"/>
         </div>
        <!-- 系统名-->
        <div class="systemName">{{getSystemName}}</div>
        <div class="header-right">
            <div class="header-user-con">
                <!-- 全屏显示 -->
                <div class="btn-fullscreen" @click="handleFullScreen">
                    <el-tooltip effect="dark" :content="fullscreen?`取消全屏`:`全屏`" placement="bottom">
                        <i class="el-icon-rank"></i>
                    </el-tooltip>
                </div>
                <!-- 消息中心 -->
                <div class="btn-bell">
                    <el-tooltip
                        effect="dark"
                        :content="messageNum?`有${messageNum}条未读消息`:`消息中心`"
                        placement="bottom"
                    >
                        <router-link to="/notice">
                            <i class="el-icon-bell"></i>
                        </router-link>
                    </el-tooltip>
                    <span class="btn-bell-badge" v-if="messageNum != 0"></span>
                </div>
                <!-- 用户名下拉菜单 -->
                <el-dropdown class="user-name" trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{account}}
                        <i class="el-icon-caret-bottom"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item v-if="account != 'admin'"command="showUpdateDialog">修改密码</el-dropdown-item>
                        <el-dropdown-item divided command="loginOut" >退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>

        <!-- 修改密码 弹出框1   -->
        <el-dialog title="修改密码" :visible.sync="updatePasswordVisible" width="40%">
            <el-form ref="chapter" :model="passwordForm" label-width="70px">
                <el-form-item label="原密码">
                    <el-input v-model="passwordForm.oldPassword" type="password"></el-input>
                </el-form-item>
                <el-form-item label="新密码">
                    <el-input v-model="passwordForm.newPassword" type="password"></el-input>
                </el-form-item>
                <el-form-item label="确认密码">
                    <el-input v-model="passwordForm.confirmPassword" type="password"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="updatePasswordVisible = false">取 消</el-button>
                <el-button type="primary"  @click="updatePassword">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 弹出框2 消息通知-->
        <el-dialog title="消息通知" :visible.sync="confirmMsgVisible" width="40%">
            <el-form ref="reply" label-width="70px">
                <el-form-item>
                    {{webSockMessage.content}}
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="confirmMsgVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmMsg()">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>
<script>
import bus from './bus'
import { encrypt } from '@/utils/rsaEncrypt'
export default {
    data() {
        return {
            collapse: true,
            fullscreen: false,
            defaultName: 'admin',
            messageNum: 2,
            systemName: 'MOOC后台管理系统',
            //系统logo
            systemLogoUrl: '../../views/system/personalizedSet/images/systemLogo.jpg',
            //修改管理员密码
            passwordForm:{
                oldPassword: null,
                newPassword: null,
                confirmPassword: null
            },
            //修改密码弹出框
            updatePasswordVisible: false,
            //是否展示头部停留消息
            isShowStayMessage: false,
            //是否展示确认消息
            confirmMsgVisible: false,
            //webSock消息内容
            webSockMessage:{
                type: 1,
                content: 'test message'
            },
            //消息内容
            messageContent: 'test message'
        };
    },
    created() {
        //获取用户Id
        let user = JSON.parse(localStorage.getItem('user'));
        if(user) {
            let userId = user.userId;
            //type=1 表示管理员 type=2表示为教师
            let type = user.type;
            //检查有多少条未读消息
            this.checkMessage(userId);

            //建立webSocket连接
            let websocket = null;
            if ('WebSocket' in window) {
                websocket = new WebSocket('ws://'+ this.$requestBaseUrl.webSockUrl +'/webSocket/' + type + '/'+ userId);
            } else {
                alert('该浏览器不支持websocket');
            }
            //连接时
            websocket.onopen = function (event) {
                console.log('=== 建立连接websocket连接 ===');
            };
            //关闭时
            websocket.onclose = (event) => {
                console.log('=== websocke连接关闭 ====');
            };
            //收到信息
            websocket.onmessage = (event) => {
                console.log('收到消息：' + event.data);
                let webSocketMessage = JSON.parse(event.data);
                this.webSockMessage = webSocketMessage;

                //分析消息内容
                if(webSocketMessage.type == 1) {
                    //普通提示
                    this.$message.success(webSocketMessage.content);
                }else if(webSocketMessage.type == 2){
                    //停留提示
                    console.log('接收到停留消息，content=' + webSocketMessage.content)
                    this.isShowStayMessage = true;
                    this.messageContent = '你有一条新消息：' + webSocketMessage.content;
                }else if(webSocketMessage.type == 3){
                    //弹框消息,踢除下线
                    console.log('接收到弹框消息，content=' + webSocketMessage.content)
                    this.confirmMsgVisible = true;
                    this.messageContent = '你有一条新消息：' + webSocketMessage.content;
                    return;
                }

               //检查有多少条未读消息
                this.checkMessage();

            };
            //发生错误弹框
            websocket.onerror = function (event) {
                console.log('=== websocket通信发生错误！===');
            };
            //当关闭窗口关闭websocket
            window.onbeforeunload = function () {
                websocket.close();
            };
        }

    },
    computed: {
        /**
         * 获取当前登录账号
         */
        account() {
            let account = localStorage.getItem('account');
            return account ? account : this.defaultName;
        },
        /**
         * 获取系统名
         */
        getSystemName(){
            this.setSystemName();
            return this.systemName;
        }

    },
    methods: {
        confirmMsg(){
            if(this.webSockMessage.type == 3){
                this.$router.push('/login');
            }
            this.confirmMsgVisible = false;
            console.log('点击了确认消息..');
        },
        toNotice(){
            this.isShowStayMessage = false;
            this.$router.push('/notice');
        },
        /**
         * 点击关闭StayHeadMessage信息时触发
         */
        closeStayHeadMessage(){
            this.isShowStayMessage = false;
        },

        /**
         * 检查有多少条未读消息
         */
        checkMessage(){
            this.$axios.get(this.$requestBaseUrl.notice + '/notice/count')
                .then(response => {
                    if(response.data.success) {
                        //消息数
                        this.messageNum = response.data.data;
                    }else {
                        this.$message.warning("统计消息总数失败");
                    }
                })
                .catch(error=>{
                    this.$message.error("统计消息总数失败");
                });

        },

        /**
         * 更新密码
         */
        updatePassword(){

            if(!this.passwordForm.oldPassword){
                this.$message.warning('旧密码不能为空');
                return;
            }
            if(!this.passwordForm.newPassword){
                this.$message.warning('新密码不能为空');
                return;
            }
            if(!this.passwordForm.confirmPassword){
                this.$message.warning('确认密码不能为空');
                return;
            }
            if(this.passwordForm.confirmPassword != this.passwordForm.newPassword){
                this.$message.warning('确认密码不一致');
                return;
            }
            let updateForm = {};
            //加密
            updateForm.oldPassword = encrypt(this.passwordForm.oldPassword);
            updateForm.newPassword = encrypt(this.passwordForm.newPassword);
            updateForm.confirmPassword = encrypt(this.passwordForm.confirmPassword);

            this.$axios.post(this.$requestBaseUrl.authorize + '/manager/updatePassword',updateForm)
              .then(resp=>{
                  if(resp.data.success){
                      this.$message.success('修改密码成功');
                      this.updatePasswordVisible = false;
                  }else {
                      this.$message.warning(resp.data.msg);
                  }
              }).catch(err=>{
                this.$message.error('修改密码失败');
            })
        },
        /**
         * 获取系统名/系统logo
         */
        setSystemName(){
            this.$axios.get(this.$requestBaseUrl.core + '/admin/logo/get')
                .then(res => {
                    if (res.data.success) {

                        let data = res.data.data
                        // 设置系统名
                        this.systemName = data.systemName;
                        //设置系统logo
                        this.systemLogoUrl = this.$requestBaseUrl.core + data.systemLogoPath + '?time=' + new Date().getTime();
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
        /**
         * 用户名下拉菜单选择事件
         */
        handleCommand(command) {
            //如果选择登出
            if (command == 'loginOut') {
                this.$axios.get(this.$requestBaseUrl.authorize + '/mooc/admin/loginOut')
                  .then(res => {
                      if (res.data.success) {
                          localStorage.removeItem('account');
                          localStorage.removeItem('menuList');
                          localStorage.removeItem('token');
                          this.$router.push('/login');
                          this.$message.info("登出成功");
                      }else {
                          this.$message.warning("登出发生异常");
                          localStorage.removeItem('account');
                          localStorage.removeItem('menuList');
                          localStorage.removeItem('token');
                          this.$router.push('/login');
                      }
                  })
                .catch(err => {
                    this.$message.warning("登出失败");
                    this.$router.push('/login');
                });
                //如果是选择跟新密码
            }else if(command == 'showUpdateDialog'){
                this.updatePasswordVisible = true;
            }
        },
        // 侧边栏折叠
        collapseChage() {
            this.collapse = !this.collapse;
            bus.$emit('collapse', this.collapse);
        },
        // 全屏事件
        handleFullScreen() {
            let element = document.documentElement;
            if (this.fullscreen) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullScreen) {
                    element.webkitRequestFullScreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.msRequestFullscreen) {
                    // IE11
                    element.msRequestFullscreen();
                }
            }
            this.fullscreen = !this.fullscreen;
        },

    },
    mounted() {
        if (document.body.clientWidth < 1500) {
            this.collapseChage();
        }
    }
};
</script>
<style scoped>
.mooc-header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 60px;
    font-size: 22px;
    color: #fff;
    background: #324157;
    float: left;
}
.collapse-btn {
    float: left;
    padding: 0 21px;
    cursor: pointer;
    line-height: 60px;
}
 /deep/ .systemName {
    display: inline-block;
    float: left;
    width: 250px;
    line-height: 60px;
}
.header-right {
    float: right;
    padding-right: 60px;
}
.header-user-con {
    display: flex;
    height: 60px;
    align-items: center;
}
.btn-fullscreen {
    transform: rotate(45deg);
    margin-right: 5px;
    font-size: 24px;
}
.btn-bell,
.btn-fullscreen {
    position: relative;
    width: 30px;
    height: 30px;
    text-align: center;
    border-radius: 15px;
    cursor: pointer;
}
.btn-bell-badge {
    position: absolute;
    right: 0;
    top: -2px;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: #f56c6c;
    color: #fff;
}
.btn-bell .el-icon-bell {
    color: #fff;
}
.user-name {
    margin-left: 10px;
}
.user-avator {
    margin-left: 20px;
}
.user-avator img {
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
}
.el-dropdown-link {
    color: #fff;
    cursor: pointer;
}
.el-dropdown-menu__item {
    text-align: center;
}
</style>
