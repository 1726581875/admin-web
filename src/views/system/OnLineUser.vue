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
        >批量下线
        </el-button>
        <!--  查找输入框 -->
        <el-input
          size="small"
          v-model="inputVale"
          placeholder="账号或者昵称匹配"
          class="handle-input mr10"></el-input>
        <el-button
          size="small"
          icon="el-icon-search"
          :disabled="buttonStatus.searchButtonDisabled"
          @click="handleSearch">搜索
        </el-button>
      </div>

      <div style="background: #fff;">
        <!-- ============   表格table begin  =================-->
        <el-table
          :data="userList"
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
          <el-table-column prop="name" label="用户昵称"/>
          <el-table-column prop="account" label="用户账号"/>
          <el-table-column prop="ip" label="ip"/>
          <el-table-column prop="loginTime" label="登录时间"/>
          <el-table-column label="操作" width="180" align="center">
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                icon="el-icon-caret-bottom"
                class="#E6A23C"
                @click="handleDelete(scope.$index, scope.row.account)"
              >下线
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
    name: 'OnlineUser',
    data() {
      return {
        /* 分页查询条件 */
        queryParam: {
          matchStr: '',
          pageIndex: 1,
          pageSize: 10
        },
        //分页查询结果
        userList: [],
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

      };
    },
    created() {
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
       * 2、userList置空
       * 3、初始化查询条件
       * 4、延迟一秒，发ajax获取列表信息 （为了用户体验）
       */
      reloadList() {
        let _this = this;
        _this.isLoading = true;
        _this.userList = [];
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
        this.$axios.get(this.$requestBaseUrl.authorize + '/onlineUser/list', {
          params: this.queryParam
        }).then(res => {
          let result = res.data;
          if (result.success) {
            this.userList = result.data.content;
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

        // 2、输入框参数校验
        //获取输入的值，并去掉字符串两边空格
        let inputValue = this.inputVale.replace(/^\s+|\s+$/g, "");
        // 如果没有输入值，不需要发ajax
        if (!inputValue) {
          this.$message.warning("你还没有输入任何内容!");
          return;
        }
        this.resetQueryParam();
        this.$set(this.queryParam, 'matchStr', inputValue);
        this.list();
      },

      /**
       *  点击下线按钮触发该方法
       */
      handleDelete(index, account) {
        let name = this.userList[index].name;
        // 弹框，二次确认下线
        this.$confirm(`确定要下线用户 <span style="color: red">${name}</span> 吗`, '提示', {
          type: 'warning',
          dangerouslyUseHTMLString: true
        }).then(() => { // 点击确认下线用户
          this.offlineUserByAccount(account);
        }).catch(() => {// 点击取消
          console.log("已取消");
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
       * 说明：点击批量下线按钮时触发
       *  批量下线,下线已经选择的
       * 1、获取到要下线的account数组
       * 2、弹出框，提示信息，二次确认
       * 3、发ajax，批量下线
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

        // 1、获取到要下线的account数组
        const accountList = [];
        // 名字 list
        let delUserNames = [];
        this.multipleSelection.forEach((user, index) => {
          // 拿到要下线的account
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