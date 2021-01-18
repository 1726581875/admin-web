<template>
    <div class="mooc-header">
        <!-- 折叠按钮 -->
        <div class="collapse-btn" @click="collapseChage">
            <i v-if="!collapse" class="el-icon-s-fold"></i>
            <i v-else class="el-icon-s-unfold"></i>
        </div>
         <div style="display: block"><img src="../../views/system/personalizedSet/images/systemLogo.jpg"/></div>
        <div class="logo">{{getSystemName}}</div>
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
                        :content="message?`有${message}条未读消息`:`消息中心`"
                        placement="bottom"
                    >
                        <router-link to="/tabs">
                            <i class="el-icon-bell"></i>
                        </router-link>
                    </el-tooltip>
                    <span class="btn-bell-badge" v-if="message"></span>
                </div>
                <!-- 用户名下拉菜单 -->
                <el-dropdown class="user-name" trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{account}}
                        <i class="el-icon-caret-bottom"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <a href="https://github.com/lin-xin/vue-manage-system" target="_blank">
                            <el-dropdown-item>项目仓库</el-dropdown-item>
                        </a>
                        <el-dropdown-item divided command="loginout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
    </div>
</template>
<script>
import bus from './bus';
export default {
    data() {
        return {
            collapse: true,
            fullscreen: false,
            defaultName: 'xiaomingzhang',
            message: 2,
            systemName: 'MOOC后台管理系统',
        };
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
        /**
         * 获取系统名
         */
        setSystemName(){
            this.$axios.get(this.$requestBaseUrl.core + '/admin/logo/get')
                .then(res => {
                    if (res.data.success) {
                        // 设置系统名
                        this.systemName = res.data.data.systemName;

                        // 设置浏览器头部favicon、title
                        let data = res.data.data
                        let link =
                            document.querySelector("link[rel*='icon']") ||
                            document.createElement('link')
                        link.type = 'image/x-icon'
                        link.rel = 'shortcut icon'
                        link.href =
                            data.faviconPath !== ''
                                ? '' +
                                data.faviconPath +
                                '?time=' +
                                new Date().getTime()
                                : '../static/favicon.png'
                        document.getElementsByTagName('head')[0].appendChild(link)
                        document.title =
                            data.systemName !== '' ? data.systemName : '道一云|会话内容存档'
                    }else {
                        let link =
                            document.querySelector("link[rel*='icon']") ||
                            document.createElement('link')
                        link.type = 'image/x-icon'
                        link.rel = 'icon'
                        link.href = '../static/favicon.png'
                        document.getElementsByTagName('head')[0].appendChild(link)
                        document.title = '道一云|会话内容存档'
                    }
                })
                .catch(err => {
                    this.$message.warning("获取系统名失败");
                });
        },
        // 用户名下拉菜单选择事件
        handleCommand(command) {
            if (command == 'loginout') {
                this.$axios.get('http://localhost:10000/mooc/admin/loginOut')
                  .then(res => {
                      if (res.data.success) {
                          localStorage.removeItem('account');
                          localStorage.removeItem('menuList');
                          localStorage.removeItem('token');
                          this.$router.push('/login');
                          this.$message.info("登出成功");
                      }
                  })
                .catch(err => {
                    this.$message.warning("登出失败");
                    this.$router.push('/login');
                });
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
        }
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
.mooc-header .logo {
    display: block;
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
