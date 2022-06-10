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
                <!--  查找输入框 -->
                <el-input
                        size="small"
                        v-model="inputVale"
                        placeholder="请输入分类ID/名称"
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
                    :data="categoryList"
                    class="table"
                    size="small"
                    ref="multipleTable"
                    header-cell-class-name="table-header"
                    :default-sort="{prop: 'date', order: 'descending'}"
                    @selection-change="handleSelectionChange"
            >
                <!-- 表格单元行展开 -->
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <el-form label-position="left" inline class="demo-table-expand">
                            <el-form-item label="分类ID:">
                                <span>{{ props.row.id }}</span>
                            </el-form-item>
                            <el-form-item label="分类名:">
                                <span>{{ props.row.name }}</span>
                            </el-form-item>
                            <el-form-item label="描述:">
                                <span>{{ props.row.description }}</span>
                            </el-form-item>
                            <el-form-item label="子标签:">
                            <el-tag
                              :key="tag.name"
                              v-for="tag in props.row.tagList"
                              effect="dark"
                              type="info"
                              :disable-transitions="false"
                              @close="handleClose(tag)">
                                <span>{{tag.name}}</span>
                            </el-tag>
                            </el-form-item>
                        </el-form>
                    </template>
                </el-table-column>

                <el-table-column prop="id" label="ID" width="80" align="center"/>
                <el-table-column prop="name" label="分类名称" width="150"/>
                <el-table-column prop="description" label="分类描述"/>
                <el-table-column prop="tagStr" label="子标签"/>
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

        <!-- ==========================【修改/插入】 弹出框=======================   -->
        <el-dialog :title="dialogTitle" :visible.sync="editVisible" width="40%">
            <el-form ref="category" :model="category" label-width="70px">
            <el-form-item label="分类名称">
                <el-input v-model="category.name"></el-input>
            </el-form-item>
            <el-form-item label="分类描述"> 
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  placeholder="请输入内容"
                  v-model="category.description">
                </el-input>
            </el-form-item>
                <!-- 编辑框，编辑子分类-->
            <el-form-item label="子分类">
                <div>
                    <el-tag
                      v-for="(tag,index) in category.tagList"
                      :key="index"
                      closable
                      effect="dark"
                      type="info"
                      :disable-transitions="false"
                      @click="editTag(tag,index)"
                      @close="handleClose(tag)">
                        <span v-if="index!=num">{{tag.name}}</span>
                        <input
                          class="custom_input"
                          type="text" v-model="words"
                          v-if="index==num"
                          ref="editInput"
                          @keyup.enter="handleTagInput(tag,index)"
                          @blur="handleTagInput(tag,index)"/>
                    </el-tag>

                    <el-input
                      class="input-new-tag"
                      v-if="inputVisible"
                      v-model="inputTagValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm"
                      @blur="handleInputConfirm"
                    >
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 新增标签</el-button>
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
  export default {
    name: 'category',
    data() {
      return {
        /* 分页查询条件 */
        queryParam: {
        id: null,
        name: null,
        description: null,
          pageIndex: 1,
          pageSize: 10
        },
        //分页查询结果
        categoryList: [],
        pageCount: 1,
        //多选，选择的元素
        multipleSelection: [],
        /* 控制弹出框 */
        editVisible: false,
        dialogTitle: '',
        category: {},
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
          /** 子标签 */
      inputVisible: false,
      inputTagValue: '',
      num: -1,
      words: ''
      };
    },
      created() {
          this.list();
      },
    methods: {
        /**
         * 点击tag触发，编辑tag
         */
        editTag(tag, index) {
            this.num = index;
            this.$nextTick(_ => {
                this.$refs.editInput[0].focus();
            });
            this.words = tag.name;
        },
        /**
         * 确认修改tag（按下回车或者失去焦点触发）
         */
        handleTagInput(tag, index) {
            let words = this.words;
            if (words) {
                tag.name = words;
            }
            this.words = '';
            this.num = -1;
        },
        /**
         * 点击移除分类标签
         */
        handleClose(tag) {
            let tagList = this.category.tagList;
            tagList.splice(tagList.indexOf(tag), 1);
        },

        showInput() {
            this.inputVisible = true;
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        /**
         * 输入标签，按下回车确认
         */
        handleInputConfirm() {
            let inputTagValue = this.inputTagValue;
            let tagList = this.category.tagList;
            if (inputTagValue) {
                if(!tagList){
                    this.category.tagList = [];
                }
                let tag = {};
                tag.name = inputTagValue;
                this.category.tagList.push(tag);
            }
            this.inputVisible = false;
            this.inputTagValue = '';
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
       * 2、categoryList置空
       * 3、初始化查询条件
       * 4、延迟一秒，发ajax获取列表信息 （为了用户体验）
       */
      reloadList() {
        let _this = this;
        _this.isLoading = true;
        _this.categoryList = [];
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
        this.$axios.get(this.$requestBaseUrl.core + '/admin/categorys/list', {
          params: this.queryParam
        }).then(res => {
          let result = res.data;
          if (result.success) {
            this.categoryList = result.data.content;
            this.pageCount = result.data.pageCount;

             // 设置拼接字符串
              this.categoryList.forEach(category => {
                  category.tagStr = this.appendTagStr(category.tagList);
              });

          }
        }).catch(err => {
          this.$message.error('发生系统内部错误');
          console.error("error = " + err)
        });
      },

        appendTagStr(tagList){
            let str = '';
            if(!tagList){
                return str;
            }
            // 最多拼接五个
            let max = 4;
            let maxIndex = tagList.length < max ? tagList.length : max;
            tagList.forEach((tag,index)=>{
                if(index < maxIndex) {
                    str = str.concat(tag.name);
                }
                if(index + 1 < maxIndex){
                    str = str.concat(',');
                }
                if(index + 1 == max){
                    str = str.concat('...');
                }
            });
            return str;
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

          //如果不是数字就是根据名字查询，如果是数字根据id查
        let queryColumn = isNaN(inputValue) ? 'name' : 'id';
        this.resetQueryParam();
        this.$set(this.queryParam, queryColumn, inputValue);
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
      deleteById(id){
        this.$axios.delete(this.$requestBaseUrl.core + '/admin/categorys/' + id)
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
       * 1、获取到要删除的categoryId数组
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

        // 1、获取到要删除的category id数组
        const categoryIdList = [];
        // 名字 list
        let delCategoryNames = [];
        this.multipleSelection.forEach((category, index) => {
          // 拿到要删除的categoryId
          categoryIdList.push(category.id);
          // 取前五个名字
          if (index <= 5) {
            delCategoryNames.push(category.name);
          }
        });
        let delCount = categoryIdList.length;
        // 批量删除的名字拼接 String
        let delMsgStr = delCount <= 5 ? delCategoryNames.toString() : delCategoryNames.toString() + '...';

        //2、弹出框，提示信息,二次确认
        this.$confirm(`确定要批量删除 [<span style="color: red">${delMsgStr}</span>] 一共
         <span style="color: red">${categoryIdList.length}</span> 列吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }).then(() => {//当点击确认

          //3、发送批量删除请求
          this.$axios.post(this.$requestBaseUrl.core + '/admin/categorys/batch/delete', categoryIdList)
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
        handleEdit: function (index, row) {
            //初始化展开和选中节点
            this.menuTree = [];
            this.selectedMenu = [];
            this.expandedMenu = [];

            this.dialogTitle = '修改';
            //为对象分配一个新地址，改变也不影响原来的值
            let newCategory = JSON.parse(JSON.stringify(row));
            this.category = newCategory;
            // 展示编辑框
            this.editVisible = true;
        },

      /**
       *  点击新增，展示新增框
       */
      handleAdd() {
          this.dialogTitle = '新增';
          this.category = {};
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
          // ...

          this.editVisible = false;
          //3、发请求
          this.$axios.post(this.$requestBaseUrl.core + '/admin/categorys/category', this.category)
                  .then(res => {
                      if (res.data.success) {
                          this.$message.success('保存成功');
                          //4、重新加载数据
                          this.list();
                      } else {
                          this.$message.success('保存失败，请重新试试');
                      }
                  }).catch(err => {
              this.$message.error('保存操作发生系统内部错误');
              console.error("error = " + err)
          });
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


    .demo-table-expand {
        font-size: 0;
    }
    .demo-table-expand label {
        width: 90px;
        color: #99a9bf;
    }
    .demo-table-expand .el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 50%;
    }




    .el-tag + .el-tag {
        margin-left: 10px;
    }
    .button-new-tag {
        margin-left: 10px;
        height: 32px;
        line-height: 30px;
        padding-top: 0;
        padding-bottom: 0;
    }
    .input-new-tag {
        width: 90px;
        margin-left: 10px;
        vertical-align: bottom;
    }
    .custom_input {
        width: 80px;
        height: 16px;
        outline: none;
        border: transparent;
        background-color: transparent;
        font-size: 12px;
        color: #ffffff;
    }
</style>