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


axios.defaults.withCredentials = true
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
