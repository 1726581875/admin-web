import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import md5 from 'js-md5'
Vue.prototype.$md5 = md5
Vue.prototype.$axios = axios
Vue.config.productionTip = false
Vue.use(ElementUI);
// 跨域session
// 跨域配置 https://blog.csdn.net/zs319428/article/details/107089473/
//https://blog.csdn.net/dalangzhonghangxing/article/details/52911230
// 引入qs
import qs from 'qs'
Vue.prototype.$qs = qs

import requestBaseUrl from './api/projectSetting'
Vue.prototype.$requestBaseUrl = requestBaseUrl


//-----------------------粘贴模板的
import './assets/css/icon.css';
import './components/common/directives';
//-----------------------
//允许跨域携带cookie信息
axios.defaults.withCredentials = true
// 图表echarts
import echarts from "echarts";
Vue.prototype.$echarts = echarts;

// 拦截器在请求头部设置token
axios.interceptors.request.use(function (config) {
  let token = window.localStorage.getItem("token");
  if (token) {
    //将token放到请求头发送给服务器,将token放在请求头中
    config.headers['Authorization'] = token;
    return config;
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});
//token失效返回登录页
axios.interceptors.response.use(function (response) {
  return response
}, async function (error) {
  // 1. 如果没有refresh_token,则直接跳转登录页
  if (error.response && error.response.status === 401) {
      router.push('/login');
      return error.response;
  }
  return Promise.reject(error)
});



new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
