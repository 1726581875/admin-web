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
          :disabled="buttonStatus.deleteMultipleButtonDisabled"
        >批量删除
        </el-button>
        <!--  查找输入框 -->
        <el-input
          size="small"
          v-model="inputVale"
          placeholder="请输入名字或者账号"
          class="handle-input mr10"></el-input>
        <el-button
          size="small"
          icon="el-icon-search"
          :disabled="buttonStatus.searchButtonDisabled"
          @click="handleSearch">搜索
        </el-button>

        <el-button
          icon="el-icon-plus"
          class="handle-add mr10"
          size="small"
          @click="handleAdd"
        >新增
        </el-button>
      </div>

      <div style="background: #fff;">
        <!-- ============   表格table begin  =================-->
        <el-table
          :data="moocManagerList"
          border
          class="table"
          size="mini"
          height="427px"
          :row-style="{height:'12px'}"
          :cell-style="{padding:'3px 1px'}"
          ref="multipleTable"
          header-cell-class-name="table-header"
          :default-sort="{prop: 'date', order: 'descending'}"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center"/>
          <el-table-column prop="id" label="主键" width="75" align="center"/>
          <el-table-column prop="name" label="管理员名字"/>
          <el-table-column prop="account" label="账号"/>
          <el-table-column label="禁用|启用">
            <template slot-scope="scope">
              <el-switch
                style="display: block"
                v-model="scope.row.status"
                active-color="#409EFF"
                inactive-color="#C0C4CC"
                @change="handleEnable($event,scope.row.id,true)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间"/>
          <el-table-column label="操作" width="180" align="center">
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                icon="el-icon-edit"
                @click="handleEdit(scope.$index, scope.row)"
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
    <!-- 【修改/插入】 弹出框   -->
    <el-dialog :title="dialogTitle" :visible.sync="editVisible" width="40%">
      <el-form ref="moocManager" :model="moocManager" label-width="70px">
        <el-form-item label= "名字">
          <el-input v-model="moocManager.name" placeholder="请输入管理员姓名"></el-input>
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="moocManager.account"
                    :disabled="dialogTitle=='修改'" placeholder="请输入登录账号"></el-input>
        </el-form-item>
        <div v-if="dialogTitle=='新增'">
          <el-form-item label="密码">
            <el-input type="password"
                      v-model="moocManager.password"
                      placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input type="password" v-model="moocManager.confirmPassword"
                      placeholder="请输入确认密码"></el-input>
          </el-form-item>
        </div>
        <el-form-item label="用户状态">
          <el-switch
            style="display: block"
            v-model="moocManager.status"
            active-color="#409EFF"
            inactive-color="#C0C4CC"
            active-text="启用"
            inactive-text="禁用"
            @change="handleEnable($event,moocManager.id,false)">
          </el-switch>
        </el-form-item>
        <!-- ============= 已有的角色列表============== -->
        <el-form-item label="当前角色">
          <!-- 添加角色按钮-->
          <el-button
            icon="el-icon-plus"
            size="small"
            @click="handleAddRoleButton">
          </el-button>
          <el-tag
            v-for="role in roles"
            :key="role.name"
            closable
            @close="handleRoleTagClose(role)"
            effect="plain"
            type="info">
            {{role.name}}
          </el-tag>&nbsp;&nbsp;&nbsp;&nbsp;

        </el-form-item>
        <!--  角色选择框  -->
        <el-form-item :label="showRole?'可选角色':''">
           <div v-if="showRole" class="role-box">
             <span  v-if="noSelectedRole.length == 0">已经没有角色可以选择</span>
             <el-tag
               v-for="role in noSelectedRole"
               :key="role.name"
               style="cursor:pointer"
               @click="handleClickRoleTab(role)"
               effect="plain"
               type="info">
               {{role.name}}
             </el-tag>&nbsp;&nbsp;
           </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" :disabled="buttonStatus.saveButtonDisabled" @click="save">确 定</el-button>
            </span>
    </el-dialog>
  </div>
</template>

<script>
  import { encrypt } from '@/utils/rsaEncrypt'

  export default {
    name: 'Manager',
    data() {
      return {
        /* 分页查询条件 */
        queryParam: {
          id: null,
          name: null,
          account: null,
          password: null,
          status: null,
          pageIndex: 1,
          pageSize: 10
        },
        //分页查询结果
        moocManagerList: [],
        pageCount: 1,
        //多选，选择的元素
        multipleSelection: [],
        /* 控制弹出框 */
        editVisible: false,
        dialogTitle: '',
        moocManager: {
          status: true,
        },
        //刷新 转动
        isLoading: false,
        /*搜索框，选择框*/
        inputVale: '',
        /* 控制按钮状态 */
        buttonStatus: {
          deleteMultipleButtonDisabled: false,
          searchButtonDisabled: false,
          saveButtonDisabled: false
        },
        //当前角色列表
        roles: [],
        //没有被选择的角色列表
        noSelectedRole:[],
        // 是否展示角色列表选择框
        showRole: false,
      };
    },
    created() {
      this.list();
    },
    methods: {

      handleClickRoleTab(role){
        console.log(role);
        this.noSelectedRole.splice(this.noSelectedRole.indexOf(role), 1);
        this.roles.push(role);

      },
      /**
       * 当点击添加角色按钮触发
       * 1、
       */
      handleAddRoleButton() {
        //初始化可选择的角色
        this.noSelectedRole =[];
        // 展示角色选择框
        this.showRole = true;
        // 发请求获取全部角色列表
        this.$axios.get('http://localhost:9001/admin/roles/all')
          .then(resp => {
            let respDate = resp.data;
            if (respDate.success) {
              // 全部角色
              let allRole = respDate.data;
              // 当前用户以及具备的角色id
              let roleIdList = [];
              this.roles.forEach(r=>roleIdList.push(r.id));

              // 设置可选择的角色列表
              allRole.forEach(role=>{
                  if(roleIdList.indexOf(role.id) == -1){
                    this.noSelectedRole.push(role);
                  }
              });
            }
          })

      },

      handleRoleTagClose(role) {
        this.roles.splice(this.roles.indexOf(role), 1);
        this.noSelectedRole.push(role);
        console.log("点击关闭了 " + this.roles);
      },


      /**
       * enable当前状态启用还是禁用，当前用户id，isUpdate是否点击就更新
       * 点击禁用/启用
       */
      handleEnable(enable, id, isUpdate) {
        let status = enable ? 1 : 0;
        if (isUpdate) {
          this.$axios.post('http://localhost:9001/admin/moocManagers/'+id+'/status/'+status)
            .then(resp => {
              if (resp.data.success) {
                console.log(resp.data.success);
              }
            })
            .catch(err => {
            this.$message.warning("更改用户状态发生异常");
            this.list();
          });
        }
      },
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
       * 2、moocManagerList置空
       * 3、初始化查询条件
       * 4、延迟一秒，发ajax获取列表信息 （为了用户体验）
       */
      reloadList() {
        let _this = this;
        _this.isLoading = true;
        _this.moocManagerList = [];
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
        this.$axios.get('http://localhost:9001/admin/moocManagers/list', {
          params: this.queryParam
        }).then(res => {
          let result = res.data;
          if (result.success) {
            this.moocManagerList = result.data.content;
            this.pageCount = result.data.pageCount;
          }
        }).catch(err => {
          this.$message.error('发生系统内部错误');
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

        // 自己定义，参数校验
        // ...
        this.resetQueryParam();
        //传账号，后台会按照账号先查，查不到再按照名字
        this.$set(this.queryParam, 'matchStr', inputValue);
        this.list();
      },

      /**
       *  点击删除按钮触发
       */
      handleDelete(index, id) {
        // 弹框，二次确认删除
        this.$confirm('确定要删除吗？', '提示', {
          type: 'warning'
        }).then(() => { // 点击确认删除
          this.deleteById(id);
        }).catch(() => {// 点击取消
          console.log("已取消");
        });
      },

      /**
       * 根据id删除
       */
      deleteById(id) {
        this.$axios.delete("http://localhost:9001/admin/moocManagers/" + id)
          .then(res => {
            res.data.success ? this.$message.success('删除成功') : this.$message.error('删除失败，请刷新后重新试试');
            this.list();
          }).catch(err => {
          this.$message.error('删除操作发生系统内部错误');
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
       *  批量删除,删除已经选择的
       * 1、获取到要删除的moocManagerId数组
       * 2、弹出框，提示信息，二次确认
       * 3、发ajax，批量删除
       */
      deleteSelected() {
        // 防刷
        this.buttonStatus.searchButtonDisabled = true;
        setTimeout(() => this.buttonStatus.searchButtonDisabled = false, 1000);
        //参数检测
        if (this.multipleSelection.length == 0) {
          this.$message.warning("你还没有选择任何元素！");
          return;
        }

        // 1、获取到要删除的moocManager id数组
        const moocManagerIdList = [];
        // 名字 list
        let delMoocManagerNames = [];
        this.multipleSelection.forEach((moocManager, index) => {
          // 拿到要删除的moocManagerId
          moocManagerIdList.push(moocManager.id);
          // 取前五个名字
          if (index <= 5) {
            delMoocManagerNames.push(moocManager.name);
          }
        });
        let delCount = moocManagerIdList.length;
        // 批量删除的名字拼接 String
        let delMsgStr = delCount <= 5 ? delMoocManagerNames.toString() : delMoocManagerNames.toString() + '...';

        //2、弹出框，提示信息,二次确认
        this.$confirm(`确定要批量删除 [<span style="color: red">${delMsgStr}</span>] 一共
         <span style="color: red">${moocManagerIdList.length}</span> 列吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }).then(() => {//当点击确认

          //3、发送批量删除请求
          this.$axios.post("http://localhost:9001/admin/moocManagers/batch/delete", moocManagerIdList)
            .then(res => {
              res.data.success ? this.$message.success(`删除了 ${delMsgStr}`) : this.$message.error('批量删除失败，请刷新后重新试试');
              //延迟一秒执行
              setTimeout(() => this.list(), 1000);
            })
            .catch(err => {
              this.$message.error('批量删除操作发生错误');
              console.error("error = " + err)
            })

        }).catch(() => {//当点击取消
          console.log('批量删除已取消');
        });

        this.multipleSelection = [];
      },

      /**
       * 点击编辑按钮触发，展示编辑框
       */
      handleEdit(index, row) {
        //弹出框标题 为修改
        this.dialogTitle = '修改';
        //默认不展示角色选择框（点击"+"按钮才展示）
        this.showRole = false;
        //为对象分配一个新地址，改变也不影响原来的值
        let newMoocManager = JSON.parse(JSON.stringify(row));
        this.moocManager = newMoocManager;
        this.roles = newMoocManager.roleList;
        // 展示编辑框
        this.editVisible = true;
      },

      /**
       *  点击新增，展示新增框
       */
      handleAdd() {
        this.dialogTitle = '新增';
        this.roles = [];
        this.moocManager = {status: true};
        this.editVisible = true;
      },

      /**
       * 编辑框、新增框点击保存（新增/修改）
       * 1、防刷控制
       * 2、参数校验
       * 3、向后台发ajax请求
       * 4、重新查询数据(刷新)
       */
      save() {
        //1、防刷控制
        this.buttonStatus.saveButtonDisabled = true;
        setTimeout(() => this.buttonStatus.saveButtonDisabled = false, 1000);

        //2、参数校验
        let paramManager = this.moocManager;
        console.log(paramManager.name);
        if(!paramManager.name){
          this.$message.warning("名字不能为空");
          return;
        }
        if(!paramManager.account){
          this.$message.warning("账号不能为空");
          return;
        }
       // 如果是新增操作，校验密码
        if(this.dialogTitle == '新增') {
          if (!paramManager.password ){
            this.$message.warning("密码不能为空");
            return;
          }
          if (!paramManager.confirmPassword) {
            this.$message.warning("确认密码不能为空");
            return;
          }
          if (paramManager.confirmPassword != paramManager.password) {
            this.$message.warning("输入确认密码不对应");
            return;
          }
        }

        paramManager.status = paramManager.status ? 1 : 0;
        paramManager.roleList = this.roles;
        let password = paramManager.password;
        // 密码加密传输
        if(password){
          paramManager.password = encrypt(password);
        }
        //3、发请求
        this.$axios.post('http://localhost:9001/admin/moocManagers/moocManager', paramManager)
          .then(res => {
            if (res.data.success) {
              this.$message.success('保存成功');
              //关闭编辑框
              this.editVisible = false;
              //4、重新加载数据
              this.list();
            } else {
              this.$message.info(res.data.msg);
            }
          }).catch(err => {
          this.$message.error('保存操作发生系统内部错误');
          console.error("error = " + err)
        })

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
  .role-box{
    width:100%;
    height: 120px;
    overflow-y:auto;
    border:solid 1px #C0C4CC

  }
</style>