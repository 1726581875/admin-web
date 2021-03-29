<template>
  <div>
    <div class="container">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="登录日志" name="first"></el-tab-pane>
          <el-tab-pane label="操作日志" name="second"></el-tab-pane>
          <el-tab-pane label="异常日志" name="third"></el-tab-pane>
          <el-tab-pane label="xxx日志" name="fourth"></el-tab-pane>
        </el-tabs>

      <!--  操作按钮、输入框、    -->
      <div class="handle-box">
        <el-button
          icon="el-icon-refresh-right"
          class="handle-del mr10"
          size="small"
          :loading="isLoading"
          @click="reloadList"
        >刷新
        </el-button>
        <!--      时间选择器         -->
        <span>时间从:</span>
        <el-date-picker
          size="small"
          value-format="yyyy-MM-dd"
          v-model="queryParam.startTime"
          :picker-options="pickerOptions"
          @change="checkTime"
          type="date"
          placeholder="选择日期">
        </el-date-picker>
        <span>到:</span>
        <el-date-picker
          size="small"
          value-format="yyyy-MM-dd"
          @change="checkTime"
          :picker-options="pickerOptions"
          v-model="queryParam.endTime"
          type="date"
          placeholder="选择日期">
        </el-date-picker>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <!--  查找输入框 -->
        <el-input
          size="small"
          v-model="logInputValue"
          placeholder="输入账号或者昵称匹配"
          class="handle-input mr10"></el-input>
        <el-button
          size="small"
          icon="el-icon-search"
          :disabled="buttonStatus.searchButtonDisabled"
          @click="handleSearch">搜索
        </el-button>
        <el-button
          icon="el-icon-download"
          class="handle-add float-right"
          size="small"
          @click="handleAdd"
        >导出
        </el-button>
      </div>

      <div style="background: #fff;">
        <!-- ============   表格table begin  =================-->
        <el-table
          :data="loginLogList"
          class="table"
          size="mini"
          height="396px"
          :row-style="{height:'15px'}"
          :cell-style="{padding:'6px 1px'}"
          ref="multipleTable"
          header-cell-class-name="table-header"
          :default-sort="{prop: 'date', order: 'descending'}"
          @selection-change="handleSelectionChange"
        >
          <el-table-column prop="account" label="操作账号"/>
          <el-table-column prop="logName" label="日志名称"/>
          <el-table-column prop="succeed" label="是否成功"/>
          <el-table-column prop="message" label="具体信息"/>
          <el-table-column prop="ip" label="操作ip"/>
          <el-table-column prop="createTime" label="时间"/>
        </el-table>

        <!-- =========表格table  end============ -->

        <!-- 分页组件 -->
        <div class="pagination">
          <el-pagination
            background
            layout="total, prev, pager, next"
            :current-page="queryParam.pageIndex"
            :page-size="queryParam.pageSize"
            :page-count="pageCount"
            @current-change="handlePageChange"
          ></el-pagination>
        </div>
        <div style="margin-bottom: 10px"></div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'LoginLog',
    data() {
      return {
        /* 分页查询条件 */
        queryParam: {
          pageIndex: 1,
          pageSize: 10,
          startTime: '',
          endTime: '',
          matchStr:''
        },
        //分页查询结果
        loginLogList: [],
        pageCount: 1,
        //多选，选择的元素
        multipleSelection: [],
        //刷新 转动
        isLoading: false,
        /*搜索框，选择框*/
        logInputValue: '',
        /* 控制按钮状态 */
        buttonStatus: {
          offlineMultipleButtonDisabled: false,
          searchButtonDisabled: false,
        },
        pickerOptions: {
          // 限制预约时间
          disabledDate(time) {
            return time.getTime() > Date.now();
          }
        },
        activeName: 'first',

      };
    },
    created() {
      // 设置默认时间，默认查一个月前数据
      this.setDefaultTime();
      // 查询方法
      this.list();
    },
    methods: {

      /**
       * 切换日志类型
       */
      handleClick(tab, event) {
        console.log(tab, event);
      },

      /**
       * 检验时间是否合法
       */
      checkTime(){
        let startTime = this.queryParam.startTime;
        let endTime = this.queryParam.endTime;

        startTime = startTime.replace(/-/g,'/');
        endTime = endTime.replace(/-/g,'/');
        // 获取开始和结束时间戳
        let startTimestamp = new Date(startTime).getTime();
        let endTimestamp = new Date(endTime).getTime();

        console.log("startTimestamp=" + startTimestamp);
        console.log("endTimestamp=" + endTimestamp);

        console.log(startTimestamp > endTimestamp);
        if(startTimestamp > endTimestamp){
          this.$message.warning("开始时间不能大于结束时间");
          return false;
        }
        return true;
      },
      setDefaultTime() {
        let nowDate = new Date();
        let char = "-";
        if(nowDate == null){
          nowDate = new Date();
        }
        let day = nowDate.getDate();
        let month = nowDate.getMonth() + 1;//注意月份需要+1
        let year = nowDate.getFullYear();
        let beforeMonth = month - 1;
        //开始时间为一个月前，结束时间为当前时间
        let startTime = year + char + this.completeDate(beforeMonth) + char +this.completeDate(day);
        let endTime = year + char + this.completeDate(month) + char +this.completeDate(day);
        this.queryParam.startTime = startTime;
        this.queryParam.endTime = endTime;
      },
      completeDate(value){
      return value < 10 ? "0" + value : value;
     },
      //初始化查询条件
      resetQueryParam() {
        this.queryParam = {};
        this.setDefaultTime();
        this.queryParam.pageIndex = 1;
        this.queryParam.pageSize = 10;
      },
      /**
       * 刷新
       * 说明：点击刷新按钮触发
       * 1、图标转动isLoading = true
       * 2、loginLogList置空
       * 3、初始化查询条件
       * 4、延迟一秒，发ajax获取列表信息 （为了用户体验）
       */
      reloadList() {
        let _this = this;
        _this.isLoading = true;
        _this.loginLogList = [];
        _this.inputVale = "";
        _this.resetQueryParam();
        // 延迟一秒执行
        setTimeout(function () {
          _this.list();
          _this.isLoading = false;
        }, 1000)

      },
      /**
       * 分页获取数据
       * 1、根据目前的查询条件queryParam查询
       * 2、ajax请求分页接口获取数据
       */
      list() {
        this.$axios.get(this.$requestBaseUrl.core + '/admin/loginLogs/list', {
          params: this.queryParam
        }).then(res => {
          let result = res.data;
          if (result.success) {
            this.loginLogList = result.data.content;
            this.pageCount = result.data.pageCount;
          }
        }).catch(err => {
          this.$message.error('加载在线用户发生异常');
          console.error("error = " + err)
        });
      },

      /**
       * 说明：点击查询按钮触发，输入框的查询
       * 1、防刷控制
       * 2、输入框参数校验
       * 3、初始化查询条件
       * 4、设置查询条件
       * 5、调用查询方法
       */
      handleSearch() {
        // 1、防刷，控制按钮一秒内只能点击一次
        this.buttonStatus.searchButtonDisabled = true;
        setTimeout(() => this.buttonStatus.searchButtonDisabled = false, 1000);

        if(!this.checkTime()){
           return;
        }

        this.queryParam.matchStr = this.logInputValue;
        this.$set(this.queryParam, 'matchStr', this.logInputValue);
        console.log("matchStr=" + this.queryParam.matchStr);
        this.list();
      },

      // 分页导航
      handlePageChange(val) {
        console.log("val = " + val)
        this.$set(this.queryParam, 'pageIndex', val);
        this.list();
      }
    }
  };
</script>

<style scoped>
  .handle-box {
    margin-bottom: 20px;
  }

  .handle-select {
    width: 120px;
  }

  .handle-input {
    width: 200px;
    margin-right: 10px;
    display: inline-block;
  }

  .table {
    width: 100%;
    font-size: 14px;
  }

  .red {
    color: #ff0000;
  }

  .mr10 {
    margin-right: 10px;
  }

  .table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
  }
  .float-right {
    float: right;
  }
  .pagination {
    margin: 20px 0 20px 0;
    text-align: right;
  }
</style>