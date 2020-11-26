import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login'
import MoocManager from '../views/MoocManager'
import Chapter from '../views/Chapter'
import RoleResourceRel from '../views/RoleResourceRel'
import Role from '../views/Role'
import LoginLog from '../views/LoginLog'
import Section from '../views/Section'
import MoocFile from '../views/MoocFile'
import MoocResource from '../views/MoocResource'
import Course from '../views/Course'
import ManagerRoleRel from '../views/ManagerRoleRel'
import MoocUser from '../views/MoocUser'
import Login2 from '../Login'
import Home from '../Home'
Vue.use(VueRouter)

const routes = [
{
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/login2',
    name: 'Login2',
    component: Login2
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '/moocManager',
        name: 'MoocManager',
        component: MoocManager
      },
      {
        path: '/chapter',
        name: 'Chapter',
        component: Chapter
      },
      {
        path: '/roleResourceRel',
        name: 'RoleResourceRel',
        component: RoleResourceRel
      },
      {
        path: '/role',
        name: 'Role',
        component: Role
      },
      {
        path: '/loginLog',
        name: 'LoginLog',
        component: LoginLog
      },
      {
        path: '/section',
        name: 'Section',
        component: Section
      },
      {
        path: '/moocFile',
        name: 'MoocFile',
        component: MoocFile
      },
      {
        path: '/moocResource',
        name: 'MoocResource',
        component: MoocResource
      },
      {
        path: '/course',
        name: 'Course',
        component: Course
      },
      {
        path: '/managerRoleRel',
        name: 'ManagerRoleRel',
        component: ManagerRoleRel
      },
      {
        path: '/moocUser',
        name: 'MoocUser',
        component: MoocUser
      },
    ]
  },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
