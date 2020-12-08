import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)


const routes = [
    {
        path: '/',
        component: () => import(/* webpackChunkName: "home" */ '../components/common/Home.vue'),
        meta: {title: '自述文件'},
        children: [
            {
                path: '/dashboard',
                component: () => import('../components/page/Dashboard.vue'),
                meta: {title: '系统首页'}
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
                path: '/course',
                component: () => import('../views/system/course/Course.vue'),
                meta: { title: '课程管理' }
            },{
                path: '/course/:id',
                component: () => import('../views/system/course/CourseDetail.vue'),
                meta: { title: '课程详情' }
            },{
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