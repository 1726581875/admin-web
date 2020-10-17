//import { Message } from './../../../src/element-ui'
let Validator = {
  isNotNull: function (value, text) {
    if (this.isEmpty(value)) {
      _this.$message.warning(text + "不能为空");
      return false;
    } else {
      return true
    }
  },

  length: function (value,min, max) {
    if (this.isEmpty(value)) {
      return true;
    }
    if (!this.isLength(value, min, max)) {
     // _this.$message.warning(text + "长度" + min + "~" + max + "位");
      return false;
    } else {
      return true
    }
  },
  /**
   * 空校验 null或""都返回true
   */
  isEmpty: function (obj) {
    if ((typeof obj == 'string')) {
      return !obj || obj.replace(/\s+/g, "") == ""
    } else {
      return (!obj || JSON.stringify(obj) === "{}" || obj.length === 0);
    }
  },
  /**
   * 长度校验
   * 是否在这个长度之间
   * 是则返回true
   * 否则返回false
   */
  isLength: function (str, min, max) {
    return this.trim(str).length >= min && this.trim(str).length <= max;
  },
  //去空格
  trim(str){
    return str.replace(/^\s+|\s+$/g,"");
  },

  isInteger(str){
    return /^\+?[1-9][0-9]*$/.test(str);
  }


};