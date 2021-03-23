import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)


const routes = [
    {
        path: '/',
        component: () => import('../components/common/Home.vue'),
        meta: {title: '自述文件'},
        children: [
            {
                path: '/monitor',
                component: () => import('../views/system/monitor/Monitor'),
                meta: {title: '监控中心'}
            }, {
                path: '/manager',
                component: () => import('../views/system/Manager.vue'),
                meta: { title: '管理员管理' }
            },{
                path: '/role',
                component: () => import( '../views/system/Role.vue'),
                meta: { title: '角色管理' }
            },{
                path: '/log',
                component: () => import('../views/system/LoginLog.vue'),
                meta: { title: '登录日志' }
            },{
                path: '/online',
                component: () => import('../views/system/OnLineUser.vue'),
                meta: { title: '在线用户管理' }
            },{
                path: '/ipBlacklist',
                component: () => import('../views/system/IpBlacklist/IpBlacklist.vue'),
                meta: { title: 'IP黑名单管理' }
            },{
                path: '/personalizedSet',
                component: () => import('../views/system/personalizedSet/PersonalizedSet'),
                meta: { title: '系统图标设置' }
            },{
                path: '/courseInfo',
                component: () => import('../views/system/course/CourseInfo.vue'),
                meta: { title: '课程信息管理' }
            },{
                path: '/courseInfo/:id',
                component: () => import('../views/system/course/CourseDetail.vue'),
                meta: { title: '课程详情' }
            },{
                path: '/chapter',
                component: () => import('../views/system/course/Chapter.vue'),
                meta: { title: '章节管理' }
          },{
                path: '/:id/chapter',
                component: () => import('../views/system/course/Chapter.vue'),
                meta: { title: '章节管理' }
            }, {
                path: '/category',
                component: () => import('../views/system/category/Category.vue'),
                meta: { title: '分类管理' }
            },{
                path: '/user',
                component: () => import('../views/system/user/MoocUser.vue'),
                meta: { title: '普通用户管理' }
            },{
                path: '/teacher',
                component: () => import('../views/system/user/Teacher.vue'),
                meta: { title: '教师管理' }
            },{
                path: '/file',
                component: () => import('../views/system/fileManage/FileManage'),
                meta: { title: '文件管理' }
            },{
                path: '/charts',
                component: () => import('../views/system/charts/Charts'),
                meta: { title: '报表管理' }
            }
        ]
    },
    {
        path: '/login',
        component: () => import('../Login.vue'),
        meta: {title: '登录'}
    },
]


const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router