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
                        placeholder="请输入角色ID或者名称"
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
                    :data="chapterList"
                    class="table"
                    size="mini"
                    height="437px"
                    :row-style="{height:'12px'}"
                    :cell-style="{padding:'3px 1px'}"
                    row-key="id"
                    header-cell-class-name="table-header"
                    @expand-change="expandChapter"
            >
                <!-- 表格单元行展开 -->
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <div>
                            <el-button
                              icon="el-icon-plus"
                              class="handle-add mr10"
                              size="mini"
                              @click="handleAdd"
                            >新增小节
                            </el-button>
                            <!-- 大章节下的小节列表-->
                            <el-table
                              :show-header=false
                              :data="props.row.sectionList"
                              class="table"
                              size="mini"
                              row-key="id"
                              style="width: 100%"
                            >
                                <el-table-column prop="title" label="小节名称"/>
                                <el-table-column prop="duration" label="时长" sortable/>
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
                                          @click="handleDeleteSection(props.$index,scope.$index, scope.row.id)"
                                        >删除
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="courseName" label="所属课程"/>
                <el-table-column min-width="300px" label="大章名称">
                    <template slot-scope="{row}">
                        <template v-if="row.edit">
                            <el-input v-model="row.name" class="edit-input" size="small" />
                            <el-button
                              class="cancel-btn"
                              size="small"
                              icon="el-icon-refresh"
                              type="warning"
                              @click="cancelEdit(row)"
                            >
                               取消
                            </el-button>
                        </template>
                        <span v-else>{{ row.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" sortable/>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button
                          v-if="scope.row.edit"
                          type="success"
                          size="small"
                          icon="el-icon-circle-check-outline"
                          @click="confirmEdit(scope.row)"
                        >
                          确认
                        </el-button>
                        <el-button
                          v-else
                          type="text"
                          size="small"
                          icon="el-icon-edit"
                          @click="scope.row.edit=!scope.row.edit"
                        >
                          编辑
                        </el-button>
                        <el-button
                                type="text"
                                size="small"
                                icon="el-icon-delete"
                                class="#E6A23C"
                                @click="handleDeleteChapter(scope.$index, scope.row.id)"
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
            <el-form ref="chapter" :model="chapter" label-width="70px">
            <el-form-item label="分类名称">
                <el-input v-model="chapter.name"></el-input>
            </el-form-item>
            <el-form-item label="分类描述">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  placeholder="请输入内容"
                  v-model="chapter.description">
                </el-input>
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
    name: 'chapter',
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
        chapterList: [],
        pageCount: 1,
        //多选，选择的元素
        multipleSelection: [],
        /* 控制弹出框 */
        editVisible: false,
        dialogTitle: '',
        chapter: {},
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
         * 取消行内编辑
         */
        cancelEdit(row) {
            row.name = row.originalTitle
            row.edit = false
            this.$message({
                message: '你取消了编辑',
                type: 'warning'
            })
        },
      /**
       *点击确认编辑
       */
        confirmEdit(row) {
            row.edit = false
            row.originalTitle = row.name
            // 构造参数
            let chapter = {
              id : row.id,
              name : row.name
            };
            this.$axios.post(this.$requestBaseUrl.core + '/admin/chapters/chapter',chapter)
        .then(res => {
          if(res.data.success){
            this.$message({
              message: '修改成功',
              type: 'success'
            })
          }else {
            this.$message.warning("更改章节名失败");
            this.list();
          }
        })

        },

        /**
         * 点击展开大章触发
         */
        expandChapter(row, expandedRows) {
         this.$axios.get(this.$requestBaseUrl.core + '/admin/sections/listByChapter/' + row.id)
           .then(res => {
               if(res.data.success){
                   row.sectionList = res.data.data;
               }else {
                   row.sectionList = [];
                   this.$message.warning(res.data.msg);
               }
           }).catch(err => {
             this.$message.warning("系统发生内部错误");
         });

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
       * 2、chapterList置空
       * 3、初始化查询条件
       * 4、延迟一秒，发ajax获取列表信息 （为了用户体验）
       */
      reloadList() {
        let _this = this;
        _this.isLoading = true;
        _this.chapterList = [];
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
        this.$axios.get('http://localhost:9001/admin/chapters/list', {
          params: this.queryParam
        }).then(res => {
          let result = res.data;
          if (result.success) {
            this.chapterList = result.data.content;
            this.pageCount = result.data.pageCount;
            // 初始化一些值
            this.chapterList = this.chapterList.map(v =>{
            this.$set(v, 'edit', false);
            // 在点击取消保存按钮时用上
            v.originalTitle = v.name;
            return v});
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

          //如果不是数字就是根据名字查询，如果是数字根据id查
        let queryColumn = isNaN(inputValue) ? 'name' : 'id';
        this.resetQueryParam();
        this.$set(this.queryParam, queryColumn, inputValue);
        this.list();
      },

      /**
       *  点击删除按钮触发
       */
      handleDeleteChapter(index, id) {
        // 弹框，二次确认删除
        this.$confirm('确定要删除吗？', '提示', {
          type: 'warning'
        }).then(() => { // 点击确认删除
          this.deleteChapterById(id);
        }).catch(() => {// 点击取消
          console.log("已取消");
        });
      },

      /**
       * 根据id删除
       */
      deleteChapterById(id){
        this.$axios.delete("http://localhost:9001/admin/chapters/" + id)
          .then(res => {
            res.data.success ? this.$message.success('删除成功') : this.$message.error('删除失败，请刷新后重新试试');
            this.list();
          }).catch(err => {
          this.$message.error('删除操作发生系统内部错误');
          console.error("error = " + err)
        })
      },

      /**
       *  点击删除按钮触发
       */
      handleDeleteSection(chapterIndex,sectionIndex, sectionId) {

        console.log(chapterIndex + " " + sectionIndex + " " + sectionId);
        // 弹框，二次确认删除
        this.$confirm('确定要删除吗？', '提示', {
          type: 'warning'
        }).then(() => { // 点击确认删除
          this.deleteSectionById(chapterIndex,sectionIndex, sectionId);
        }).catch(() => {// 点击取消
          console.log("已取消");
        });
      },

      deleteSectionById(chapterIndex,sectionIndex, sectionId){
          // 发ajax请求后台删除
          this.$axios.delete(this.$requestBaseUrl.core + "/admin/sections/" + sectionId)
            .then(res => {
                res.data.success ? this.$message.success('删除成功') : this.$message.error('删除失败，请刷新后重新试试');
                // 从数组中移除
                this.chapterList[chapterIndex].sectionList.splice(sectionIndex,1);
            }).catch(err => {
              this.$message.error('删除操作发生系统内部错误');
              console.error("error = " + err)
          })
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
            let newChapter = JSON.parse(JSON.stringify(row));
            this.chapter = newChapter;
            // 展示编辑框
            this.editVisible = true;
        },

      /**
       *  点击新增，展示新增框
       */
      handleAdd() {
          this.dialogTitle = '新增';
          this.chapter = {};
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
          this.$axios.post('http://localhost:9001/admin/chapters/chapter', this.chapter)
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

    .edit-input {
        padding-right: 100px;
    }
    .cancel-btn {
        position: absolute;
        right: 15px;
    }

</style>