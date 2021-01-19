<template>
  <div class="monitor-container">
    <div style="float: left;width: 100%;height: 180px;margin-top: 0px;">
      <div id="loginUserChart" style="width: 55%;height:94%; float: left"></div>
      <div id="courseChart" style="width: 40%;height:94%;float: left"></div>
    </div>
    <div style="float: left;height: 400px; width: 100%;">
      <!--  操作按钮、输入框、    -->
      <div class="handle-box">
        <el-button
          icon="el-icon-refresh-right"
          class="handle-del mr10"
          size="mini"
          :loading="isLoading"
          @click="reloadList"
        >刷新
        </el-button>
        <!--      时间选择器         -->
        <span>时间从:</span>
        <el-date-picker
          size="mini"
          value-format="yyyy-MM-dd"
          v-model="queryParam.startTime"
          :picker-options="pickerOptions"
          @change="checkTime"
          type="date"
          placeholder="选择日期">
        </el-date-picker>
        <span>到:</span>
        <el-date-picker
          size="mini"
          value-format="yyyy-MM-dd"
          @change="checkTime"
          :picker-options="pickerOptions"
          v-model="queryParam.endTime"
          type="date"
          placeholder="选择日期">
        </el-date-picker>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <!-- 类型选择框 -->
        <el-select v-model="queryParam.recordType" style="width: 100px" size="mini" placeholder="请选择">
          <el-option key="0" label="全部" value=""/>
          <el-option key="1" label="新增课程" value="新增课程"/>
          <el-option key="2" label="删除课程" value="删除课程"/>
          <el-option key="3" label="上传视频" value="上传视频"/>
        </el-select>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <!--  查找输入框 -->
        <el-input
          size="mini"
          v-model="inputValue"
          placeholder="输入账号或者昵称匹配"
          class="handle-input mr10"></el-input>
        <el-button
          size="mini"
          icon="el-icon-search"
          :disabled="buttonStatus.searchButtonDisabled"
          @click="handleSearch">搜索
        </el-button>
      </div>

      <div style="background: #fff;">
        <!-- ============   表格table begin  =================-->
        <el-table
          :data="monitorRecordList"
          class="table"
          size="mini"
          height="330px"
          :header-row-style="{height:'5px'}"
          :header-cell-style="{padding:'3px 1px'}"
          :row-style="{height:'4px'}"
          :cell-style="{padding:'3px 1px'}"
          ref="multipleTable"
          header-cell-class-name="table-header"
          :default-sort="{prop: 'date', order: 'descending'}"
        >
          <el-table-column prop="nameAccount" width="200" label="操作账号"/>
          <el-table-column prop="recordType" width="140" label="记录类型"/>
          <el-table-column prop="message" label="具体信息"/>
          <el-table-column prop="ip" width="140" label="操作ip"/>
          <el-table-column prop="createTime"  width="200" label="时间"/>
          <el-table-column label="操作" width="100" align="center">
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                icon="el-icon-view"
                class="#E6A23C"
                @click="gotoSee(scope.$index, scope.row.courseId)"
              >去看看
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- =========表格table  end============ -->

        <!-- 分页组件 -->
        <div class="monitor-pagination">
          <el-pagination
            background
            layout="total, prev, pager, next"
            :current-page="queryParam.pageIndex"
            :page-size="queryParam.pageSize"
            :page-count="pageCount"
            @current-change="handlePageChange"
          ></el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Monitor',
    data() {
      return {
        /* 分页查询条件 */
        queryParam: {
          pageIndex: 1,
          pageSize: 10,
          startTime: '',
          endTime: '',
          nameOrAccount: '',
          recordType: ''
        },
        //分页查询结果
        monitorRecordList: [],
        pageCount: 1,
        //多选，选择的元素
        multipleSelection: [],
        //刷新 转动
        isLoading: false,
        /*搜索框，选择框*/
        inputValue: '',
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

        // 图表相关
        loginUserDate:['01-01','01-02','01-03','01-04','01-05','01-06','01-07'],
        loginUserAmount:[1,2,3,4,2,1,7],
        courseDate:['01-01','01-02','01-03','01-04','01-05','01-06','01-07'],
        courseAmount:[1,5,6,7,2,0,4]

      };
    },
    mounted() {

      // 初始化图表
      //this.initCharts();
      // 初始化登录数据
      this.initLoginUserData();
      this.initCourseData();
      // 设置默认时间，默认查7天前数据
      this.setDefaultTime();
      // 初始化数据
      this.list();
    },
    methods: {

      /**
       * 加载扽了登录人数图表
       */
      loadUserLoginAmountChart(){
        // 1、折线图
        // 基于准备好的dom，初始化echarts实例
        let loginUserChart = this.$echarts.init(document.getElementById('loginUserChart'));
        // 指定图表的配置项和数据
        let loginUserOption = {
          color: ['#3398DB'],
          grid: {
            top: '3%',
            left: '2%',
            bottom: 0,
            containLabel: true
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
              type: 'line'        // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: this.loginUserDate
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            name: '登录人数',
            data: this.loginUserAmount,
            type: 'line',
            areaStyle: {}
          }]
        };
        // 使用刚指定的配置项和数据显示图表。
        loginUserChart.setOption(loginUserOption);
      },

      /**
       * 加载课程数量图表
       */
      loadCurseAmountChart() {
        let courseChart = this.$echarts.init(document.getElementById('courseChart'));
        // 指定图表的配置项和数据
        let courseOption = {
          color: ['#3398DB'],
          grid: {
            top: '3%',
            left: '2%',
            bottom: 0,
            containLabel: true
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
              type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          xAxis: [
            {
              type: 'category',
              data: this.courseDate,
              axisTick: {
                alignWithLabel: true
              }
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: '新增课程数',
              type: 'bar',
              barWidth: '60%',
              data: this.courseAmount
            }
          ]
        };
        // 使用刚指定的配置项和数据显示图表。
        courseChart.setOption(courseOption);
      },

      /**
       * 初始化图表
       */
      initCharts() {
        // 1、折线图
        this.loadUserLoginAmountChart();
        // 2、柱状图
        this.loadCurseAmountChart();
      },



      // ================================其他方法=========================================

      /**
       * 初始化登录人数图表
       *
       */
      initLoginUserData(){

        this.$axios.get(this.$requestBaseUrl.statistics + '/monitor/countLoginUser')
                .then(res => {
                  let respResult = res.data;
                  if(respResult.success){
                    // 结果转换成map
                    const dateMap = new Map(Object.entries(respResult.data));
                    // 获取key和vale 数组
                    let dateArr = [];
                    let amountArr = [];
                    dateMap.forEach((v,k) => {
                      console.log(k);
                      dateArr.push(k);
                      amountArr.push(v);
                    });
                    // 赋值给图表对应数据
                    this.loginUserDate = dateArr;
                    this.loginUserAmount = amountArr;
                    // 重新加载图表
                    this.loadUserLoginAmountChart();
                  }else {
                    this.$message.warning("加载系统登录人数异常，请刷新看看。");
                  }
                }).catch(err=>{
                   this.$message.error("加载图表发生内部错误，请刷新看看。")
             });

      },
      /**
       * 初始化新增课程图表
       */
      initCourseData(){
        this.$axios.get(this.$requestBaseUrl.statistics + '/monitor/countNewCourse')
                .then(res => {
                  let respResult = res.data;
                  if(respResult.success){
                    // 结果转换成map
                    const dateMap = new Map(Object.entries(respResult.data));
                    // 获取key和vale 数组
                    let dateArr = [];
                    let amountArr = [];
                    dateMap.forEach((v,k) => {
                      dateArr.push(k);
                      amountArr.push(v);
                    });
                    // 赋值给图表对应数据
                    this.courseDate = dateArr;
                    this.courseAmount = amountArr;
                    // 重新加载图表
                    this.loadCurseAmountChart();
                  }else {
                    this.$message.warning("加载系统登录人数异常，请刷新看看。");
                  }
                }).catch(err=>{
          this.$message.error("加载图表发生内部错误，请刷新看看。")
        });

      },


      /**
       * 检验时间是否合法
       */
      checkTime() {
        let startTime = this.queryParam.startTime;
        let endTime = this.queryParam.endTime;

        startTime = startTime.replace(/-/g, '/');
        endTime = endTime.replace(/-/g, '/');
        // 获取开始和结束时间戳
        let startTimestamp = new Date(startTime).getTime();
        let endTimestamp = new Date(endTime).getTime();

        console.log("startTimestamp=" + startTimestamp);
        console.log("endTimestamp=" + endTimestamp);

        console.log(startTimestamp > endTimestamp);
        if (startTimestamp > endTimestamp) {
          this.$message.warning("开始时间不能大于结束时间");
          return false;
        }
        return true;
      },
      setDefaultTime() {
        let nowDate = new Date();
        let char = "-";
        if (nowDate == null) {
          nowDate = new Date();
        }
        let day = nowDate.getDate();
        let month = nowDate.getMonth() + 1;//注意月份需要+1
        let year = nowDate.getFullYear();
        let beforeMonth = month - 1;
        //开始时间为一个月前，结束时间为当前时间
        let startTime = year + char + this.completeDate(beforeMonth) + char + this.completeDate(day);
        let endTime = year + char + this.completeDate(month) + char + this.completeDate(day);
        this.queryParam.startTime = startTime;
        this.queryParam.endTime = endTime;
      },
      completeDate(value) {
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
       * 2、monitorRecordList置空
       * 3、初始化查询条件
       * 4、延迟一秒，发ajax获取列表信息 （为了用户体验）
       */
      reloadList() {
        let _this = this;
        _this.isLoading = true;
        _this.monitorRecordList = [];
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
        this.$axios.get(this.$requestBaseUrl.core + '/admin/monitorRecords/listByCondition', {
          params: this.queryParam
        }).then(res => {
          let result = res.data;
          if (result.success) {
            this.monitorRecordList = result.data.content;
            this.pageCount = result.data.pageCount;
          }
        }).catch(err => {
          this.$message.error('加载监控记录失败');
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

        if (!this.checkTime()) {
          return;
        }

        this.queryParam.nameOrAccount = this.inputValue;
        this.$set(this.queryParam, 'nameOrAccount', this.inputValue);
        console.log("nameOrAccount=" + this.queryParam.nameOrAccount);
        this.list();
      },
      // 分页导航
      handlePageChange(val) {
        console.log("val = " + val)
        this.$set(this.queryParam, 'pageIndex', val);
        this.list();
      },

      gotoSee(index,courseId){
        console.log("index=" + index + ",courseId=" + courseId);
      }

    }
  }
</script>

<style scoped>
  .handle-box {
    margin-bottom: 10px;
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

  .monitor-pagination {
    margin: 0px 0 20px 0;
    text-align: right;
  }

  .monitor-container {
    padding: 10px;
    background: #E4E7ED;
    border: 1px solid #ddd;
    border-radius: 5px;
    height: 600px;
    border: 1px solid #000;
  }
</style>