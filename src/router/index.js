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
                path: '/online',
                component: () => import('../views/system/OnLineUser.vue'),
                meta: { title: '在线用户管理' }
            }
        ]
    },
    {
        path: '/login',
        component: () => import(/* webpackChunkName: "login" */ '../Login.vue'),
        meta: {title: '登录'}
    },
]


const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router