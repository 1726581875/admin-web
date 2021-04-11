<template>
  <div>
    <div class="container">
      <div class="handle-box">
        <el-button
          icon="el-icon-refresh-right"
          class="handle-del mr10"
          size="small"
          :loading="isLoading"
          @click="reloadList"
        >刷新
        </el-button>
        <el-button
          icon="el-icon-delete"
          class="handle-del mr10"
          size="small"
          @click="deleteSelected"
          :disabled="buttonStatus.offlineMultipleButtonDisabled"
        >批量删除
        </el-button>
        <!--  查找输入框 -->
        <el-input
          size="small"
          v-model="inputVale"
          placeholder="请输入课程名称/教师名称"
          class="handle-input mr10"></el-input>
        <el-button
          size="small"
          icon="el-icon-search"
          :disabled="buttonStatus.searchButtonDisabled"
          @click="handleSearch">搜索
        </el-button>

        <el-select v-model="selectValue" placeholder="查询条件" class="handle-select mr10"  size="small" @change="list">
          <el-option key="0" label="全部" value="全部"></el-option>
          <el-option key="1" label="正常" value="正常"></el-option>
          <el-option key="2" label="未审核" value="未审核"></el-option>
          <el-option key="3" label="禁用" value="禁用"></el-option>
          <el-option key="4" label="已删除" value="已删除"></el-option>
        </el-select>

        <el-button
                icon="el-icon-plus"
                class="handle-add mr10"
                size="small"
                @click="handleAddCourse"
        >新增
        </el-button>
      </div>

      <div style="background: #fff;">
        <!-- ============   表格table begin  =================-->
        <el-table
          :data="courseList"
          border
          class="table"
          size="mini"
          height="437px"
          :row-style="{height:'12px'}"
          :cell-style="{padding:'3px 1px'}"
          ref="multipleTable"
          header-cell-class-name="table-header"
          :default-sort="{prop: 'date', order: 'descending'}"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center"/>
          <el-table-column label="封面图片" align="center">
            <template slot-scope="scope">
              <el-image
                class="table-td-thumb"
                :src="scope.row.imageUrl"
                :preview-src-list="[scope.row.imageUrl]"
              ></el-image>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="课程名称"/>
          <el-table-column prop="teacherName" label="讲师名字"/>
          <el-table-column prop="durationFormat" label="时长" width="80"/>
          <el-table-column prop="learningNum" label="学习人数" width="80"/>
          <el-table-column label="状态">
            <template slot-scope="scope">
              <el-tag size="small" type="success" effect="dark" v-if="scope.row.status =='正常'">正常</el-tag>
              <el-tag size="small" type="warning" effect="dark" v-if="scope.row.status =='未审核'">未审核</el-tag>
              <el-tag size="small" type="danger" effect="dark" v-if="scope.row.status =='禁用'">禁用</el-tag>
              <el-tag size="small" type="danger" effect="dark" v-if="scope.row.status =='已删除'">已删除</el-tag>
              <el-tag size="small" type="danger" effect="dark" v-if="scope.row.status =='审核不通过'">审核不通过</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间"/>
          <!-- 课程操作 编辑/删除  -->
          <el-table-column label="操作" width="180" align="center">
            <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  icon="el-icon-edit"
                  @click="toChapter(scope.row.id)"
                >章节
                </el-button>
              <el-button
                type="text"
                size="small"
                icon="el-icon-edit"
                @click="handleEdit(scope.row.id)"
              >编辑
              </el-button>
              <el-button
                type="text"
                size="small"
                icon="el-icon-delete"
                class="#E6A23C"
                @click="handleDelete(scope.$index, scope.row.id)"
              >删除
              </el-button>
            </template>
          </el-table-column>
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
    name: 'Course',
    data() {
      return {
        /* 分页查询条件 */
        queryParam: {
          status: 1,
          name: '',
          pageIndex: 1,
          pageSize: 10
        },
        //分页查询结果
        courseList: [],
        pageCount: 1,
        //多选，选择的元素
        multipleSelection: [],
        //刷新 转动
        isLoading: false,
        /*搜索框，选择框*/
        inputVale: '',
        /* 控制按钮状态 */
        buttonStatus: {
          offlineMultipleButtonDisabled: false,
          searchButtonDisabled: false,
        },
        //选择框选择的值
        selectValue: '全部'

      };
    },
    created() {
      //如果是从消息通知跳转过来，默认看出未审核的课程
      let selectValue = sessionStorage.getItem('selectValue');
      if(selectValue){
        this.selectValue = selectValue;
        sessionStorage.removeItem('selectValue');
      }
      this.list();

    },
    methods: {

      //初始化查询条件
      resetQueryParam() {
        this.queryParam = {};
        this.queryParam.pageIndex = 1;
        this.queryParam.pageSize = 10;
      },
      /**
       * 刷新
       * 说明：点击刷新按钮触发
       * 1、图标转动isLoading = true
       * 2、courseList置空
       * 3、初始化查询条件
       * 4、延迟一秒，发ajax获取列表信息 （为了用户体验）
       */
      reloadList() {
        let _this = this;
        _this.isLoading = true;
        _this.courseList = [];
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
        //判断选择框里的选择
        if(this.selectValue == '未审核'){
          this.queryParam.status = 0;
        }else if(this.selectValue == '禁用'){
          this.queryParam.status = 2;
        }else if(this.selectValue == '已删除'){
          this.queryParam.status = 3;
        }else if(this.selectValue == '正常'){
          this.queryParam.status = 1;
        }else {
          //查询全部状态
          this.queryParam.status = null;
        }

        this.$axios.get(this.$requestBaseUrl.core + '/admin/courses/list', {
          params: this.queryParam
        }).then(res => {
          let result = res.data;
          if (result.success) {
            this.courseList = result.data.content;
            this.pageCount = result.data.pageCount;
            let basePath = this.$requestBaseUrl.file;
            this.courseList.forEach(course =>{
              //拼接要显示的图片路径
              course.imageUrl = basePath + course.image;
              //转换时间，格式化成00:00:00格式显示
              course.durationFormat = this.convertTime(course.duration);
            });
          }
        }).catch(err => {
          this.$message.error('发生系统内部错误');
          console.error("error = " + err)
        });
      },

      /**
       * 转换时间
       */
      convertTime(second){
        let hour = 0;
        let minute = 0;
        if(second >= 3600){
          hour = Math.floor(second / 3600);
          second = second % 3600;
        }
        if(second >= 60){
          minute = Math.floor(second / 60);
          second = second % 60;
        }
        let timeStr = hour < 10 ? '0' + hour : hour;
        timeStr = timeStr + ':' + (minute < 10 ? '0' + minute : minute);
        timeStr = timeStr + ':' + (second < 10 ? '0' + second : second);
        return timeStr;

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

        // 2、输入框参数校验
        //获取输入的值，并去掉字符串两边空格
        let inputValue = this.inputVale.replace(/^\s+|\s+$/g, "");
        // 如果没有输入值，不需要发ajax
        if (!inputValue) {
          this.$message.warning("你还没有输入任何内容!");
          return;
        }
        this.resetQueryParam();
        this.$set(this.queryParam, 'name', inputValue);
        this.list();
      },

      /**
       *  点击下线按钮触发该方法
       */
      handleDelete(index, account) {
        let name = this.courseList[index].name;
        // 弹框，二次确认下线
        this.$confirm(`确定要删除课程 <span style="color: red">${name}</span> 吗`, '提示', {
          type: 'warning',
          dangerouslyUseHTMLString: true
        }).then(() => { // 点击确认删除
          this.offlineUserByAccount(account);
        }).catch(() => {// 点击取消
          console.log("已取消");
        });
      },

      /**
       * 点击编辑按钮触发，展示编辑框
       */
      handleEdit(id) {
        console.log("点击了编辑.." + id);
        this.$router.push({
          path: `/courseInfo/${id}`,
        });
      },

      /**
       * 点击编辑按钮触发，展示编辑框
       */
      handleAddCourse(id) {
        this.$router.push({
          path: `/courseInfo/add`,
        });
      },


      /**
       * 根据账号下线用户
       */
      offlineUserByAccount(account) {
        this.$axios.post(this.$requestBaseUrl.authorize + '/onlineUser/offline/' + account)
          .then(res => {
            res.data.success ? this.$message.success('成功下线用户') : this.$message.error('下线用户失败，请刷新后重新试试');
            this.list();
          }).catch(err => {
          this.$message.error('下线操作发生异常');
          console.error("error = " + err)
        })
      },

      /**
       *  多选时触发
       */
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },

      /**
       * 说明：点击批量删除按钮时触发
       */
      deleteSelected() {
        // 防刷
        this.buttonStatus.offlineMultipleButtonDisabled = true;
        setTimeout(() => this.buttonStatus.offlineMultipleButtonDisabled = false, 1000);
        //参数检测
        if (this.multipleSelection.length == 0) {
          this.$message.warning("你还没有选择任何人");
          return;
        }

        // 1、获取到要删除的数组
        const accountList = [];
        // 名字 list
        let delUserNames = [];
        this.multipleSelection.forEach((user, index) => {
          // 拿到要删除的account
          accountList.push(user.account);
          // 取前五个名字
          if (index <= 5) {
            delUserNames.push(user.name);
          }
        });
        let delCount = accountList.length;
        // 批量下线的名字拼接 String
        let delMsgStr = delCount <= 5 ? delUserNames.toString() : delUserNames.toString() + '...';

        //2、弹出框，提示信息,二次确认
        this.$confirm(`确定要批量下线 [<span style="color: red">${delMsgStr}</span>] 一共
         <span style="color: red">${accountList.length}</span> 列吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }).then(() => {//当点击确认

          //3、发送批量下线请求
          this.$axios.post(this.$requestBaseUrl.authorize + "/onlineUser/offline/list", accountList)
            .then(res => {
              res.data.success ? this.$message.success(`下线了 ${delMsgStr}`) : this.$message.error('批量下线用户失败，请刷新后重新试试');
              //延迟一秒执行
              setTimeout(() => this.list(), 1000);
            })
            .catch(err => {
              this.$message.error('批量下线用户发生异常');
              console.error("error = " + err)
            })

        }).catch(() => {//当点击取消
          console.log('批量下线用户已取消');
        });

        this.multipleSelection = [];
      },
      // 分页导航
      handlePageChange(val) {
        console.log("val = " + val)
        this.$set(this.queryParam, 'pageIndex', val);
        this.list();
      },
      /**
       * 跳转到章节页面
       */
      toChapter(courseId){
        this.$router.push('/'+ courseId +'/chapter');
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
    width: 300px;
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

  .pagination {
    margin: 20px 0 20px 0;
    text-align: right;
  }
</style>