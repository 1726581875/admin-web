<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades"></i> 基础表格
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-button
          type="primary"
          icon="el-icon-refresh-right"
          class="handle-del mr10"
          :loading="isLoading"
          @click="reloadList"
        >刷新</el-button>
        <el-button
          type="danger"
          icon="el-icon-delete"
          class="handle-del mr10"
          @click="delAllSelection"
          :disabled="buttonStatus.deleteMultipleButtonDisabled"
        >批量删除</el-button>
        <!-- TODO 要去改善，这个下拉框 -->
        <el-select v-model="selectValue" placeholder="查询条件" class="handle-select mr10">
          <el-option key="1" label="名称" value="name"></el-option>
          <el-option key="2" label="ID" value="id"></el-option>
          <el-option key="3" label="课程ID" value="courseId"></el-option>
        </el-select>
        <!--  查找输入框 -->
        <el-input v-model="inputVale"
                  :placeholder="selectValue == 'name' ? '请输入章节名称' :
                  (selectValue == 'id' ? '请输入章节ID' : '请输入课程ID') " class="handle-input mr10"></el-input>
        <el-button
          type="primary"
          icon="el-icon-search"
          :disabled="buttonStatus.searchButtonDisabled"
          @click="handleSearch">搜索</el-button>

        <el-button
          type="primary"
          icon="el-icon-plus"
          class="handle-add mr10"
          @click="handleAdd"
        >新增</el-button>
      </div>
   <!-- ============   表格table begin  =================-->
      <el-table
        :data="chapterList"
        border
        class="table"
        ref="multipleTable"
        header-cell-class-name="table-header"
        :default-sort = "{prop: 'date', order: 'descending'}"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center"/>
        <el-table-column prop="id" label="ID" width="55" align="center"/>
        <el-table-column prop="courseId" label="课程ID" width="100" align="center"/>
        <el-table-column prop="name" label="大章名称"/>
        <el-table-column prop="createTime" label="创建时间" sortable/>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              icon="el-icon-edit"
              @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button>
            <el-button
              type="text"
              icon="el-icon-delete"
              class="red"
              @click="handleDelete(scope.$index, scope.row.id)"
            >删除</el-button>
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
    </div>

    <!-- 【修改/插入】 弹出框   -->
    <el-dialog :title="dialogTitle" :visible.sync="editVisible" width="40%">
      <el-form ref="chapter" :model="chapter" label-width="70px">
        <el-form-item label="课程Id">
          <el-input v-model="chapter.courseId"></el-input>
        </el-form-item>
        <el-form-item label="章节名称">
          <el-input v-model="chapter.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" :disabled="buttonStatus.saveButtonDisabled" @click="saveEdit">确 定</el-button>
            </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: 'chapter',
    data() {
      return {
        // 分页查询条件
        queryParam: {
            id: null,
            courseId: null,
            name: null,
            pageIndex: 1,
            pageSize: 10
        },
        //分页查询结果
        chapterList: [],
        pageCount: 1,
        //多选
        multipleSelection: [],
        // 控制弹出框
        editVisible: false,
        dialogTitle : '',
        chapter: {},
        idx: -1,
        id: -1,
        //刷新 转动
        isLoading: false,
        //搜索框，选择框
        inputVale: '',
        selectValue: 'name',
        // 控制按钮点击状态
        buttonStatus:{
          deleteMultipleButtonDisabled : false,
          searchButtonDisabled: false,
          saveButtonDisabled: false
        },

      };
    },
    created() {
      this.list();
    },
    methods: {

      //初始化查询条件
      setQueryParam(id,courseId,name,pageIndex,pageSize){
        if(pageIndex == undefined || pageIndex == null){
          this.queryParam.pageIndex = 1;
        }else {
          this.queryParam.pageIndex = pageIndex;
        }
        if(pageSize == undefined || pageSize == null){
          this.queryParam.pageSize = 10;
        }else {
          this.queryParam.pageSize = pageSize;
        }
        this.queryParam.id = id;
        this.queryParam.courseId = courseId;
        this.queryParam.name = name;
      },
      /**
       * 刷新表格
       * 1、图标转动isLoading = true
       * 2、chapterList置空
       * 3、初始化查询条件
       * 4、延迟一秒，发ajax获取列表信息 （为了用户体验）
       */
      reloadList(){
        let _this = this;
        _this.isLoading = true;
        _this.chapterList = [];
        _this.setQueryParam(null,null,null,1,10);
        // 延迟一秒执行
        setTimeout(function () {
          _this.list();
          _this.isLoading = false;
        }, 1000)

      },
      /**
       * 分页获取数据
       * 1、根据目前的查询条件,ajax分页查询获取数据
       */
      list() {
        this.$axios.get('http://localhost:9001/admin/chapters/list', {
          params: this.queryParam
        }).then(res => {
          let result = res.data;
          if(result.success) {
            this.chapterList = result.data.content;
            this.pageCount = result.data.pageCount;
          }
        }).catch(err => {
          this.$message.error('发生系统内部错误');
          console.error("error = " + err)
        });
      },

      /**
       *点击查询按钮触发，输入框查询
       * 1、防刷控制
       * 2、输入框参数校验
       * 3、初始化查询条件
       * 4、设置查询条件
       * 5、调用查询方法
       */
      handleSearch() {
        // 1、防刷，控制按钮一秒内只能点击一次
        this.buttonStatus.searchButtonDisabled = true;
        setTimeout( () => this.buttonStatus.searchButtonDisabled = false, 1000);

        // 2、输入框参数校验
        //获取输入的值，并去掉字符串两边空格
        let inputValue = this.inputVale.replace(/^\s+|\s+$/g,"");
        // 如果没有输入值，不需要发ajax
        if(inputValue == '' || inputValue==null ||inputValue == undefined){
          this.$message.warning("你还没有输入任何内容!");
          return;
        }
        if(!Validator.length(inputValue,0,20)){
          this.$message.warning("输入字符长度不得超过20!");
           return;
         }
        if(this.selectValue == "id" || this.selectValue == "courseId"){
          if(!Validator.isInteger(inputValue)) {
            this.$message.warning("输入ID必须为正整数!");
            return;
          }
        }

        this.setQueryParam();
        this.$set(this.queryParam , this.selectValue, inputValue);
        this.list();
      },

      /**
       *  删除
       */
      handleDelete(index, id) {
        // 二次确认删除
        this.$confirm('确定要删除吗？', '提示', {
          type: 'warning'
        })
          .then(() => { // 点击确认删除
            this.$axios.delete("http://localhost:9001/admin/chapters/" + id)
              .then(res => {
                res.data.success ? this.$message.success('删除成功') : this.$message.error('删除失败，请刷新后重新试试');
                this.list();
              })
              .catch(err => {
              this.$message.error('删除操作发生系统内部错误');
              console.error("error = " + err)
            })
          })
          .catch(() => {});
      },

      /**
       *  多选操作
       */
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },

      /**
       * 批量删除
       * 1、获取到要删除的chapterId数组
       * 2、弹出框，提示信息，二次确认
       * 3、发ajax，批量删除
       */
      delAllSelection() {
        // 防刷
        this.buttonStatus.deleteMultipleButtonDisabled = true;
        setTimeout( () => this.buttonStatus.deleteMultipleButtonDisabled = false, 1000);
        //参数检测
        if(this.multipleSelection.length == 0){
          this.$message.warning("你还没有选择任何元素！");
          return;
        }

        // 1、获取到要删除的chapter id数组
        const chapterIdList = [];
        // 名字 list
        let delChapterNames = [];
        this.multipleSelection.forEach((chapter,index) => {
          // 拿到要删除的chapterId
          chapterIdList.push(chapter.id);
          // 取前五个名字
          if(index <= 5) {
            delChapterNames.push(chapter.name);
          }
        });
        let delCount = chapterIdList.length;
        // 批量删除的名字拼接 String
        let delMsgStr = delCount <= 5 ? delChapterNames.toString() : delChapterNames.toString() + '...';

        //2、弹出框，提示信息,二次确认
        this.$confirm(`确定要批量删除 [<span style="color: red">${delMsgStr}</span>] 一共
         <span style="color: red">${chapterIdList.length}</span> 列吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }).then(() => {//当点击确认

          //3、发送批量删除请求
          this.$axios.post("http://localhost:9001/admin/chapters/batch/delete",chapterIdList)
            .then(res => {
              res.data.success ? this.$message.success(`删除了 ${delMsgStr}`) : this.$message.error('批量删除失败，请刷新后重新试试');
              //延迟一秒执行
              setTimeout( () => this.list(), 1000);
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
       * 点击编辑操作
       */
      handleEdit(index, row) {
        // 弹出框文字
        this.dialogTitle = '修改';
        this.idx = index;
        //为对象分配一个新地址，改变也不影响原来的值
        let newChapter =JSON.parse(JSON.stringify(row));
        this.chapter = newChapter;
        // 展示编辑框
        this.editVisible = true;
      },

      /**
       *  点击新增
       */
      handleAdd() {
        this.dialogTitle = '新增';
        this.chapter = {};
        this.editVisible = true;
      },
      /**
       *  点击保存 （新增/修改）
       */
      saveEdit() {
        this.buttonStatus.saveButtonDisabled = true;
        setTimeout( () => this.buttonStatus.saveButtonDisabled = false, 1000);

        let chapterName = this.chapter.name;
        if(chapterName == '' || chapterName == null || chapterName == undefined){
          this.$message.warning("输入的大章名称不能为空！");
          return;
        }
        if(!Validator.length(this.chapter.name,0,20)){
          this.$message.warning("输入的大章名长度不能超过20个字符！");
          return;
        }
        this.editVisible = false;
        this.$axios.post('http://localhost:9001/admin/chapters/chapter',this.chapter)
          .then(res => {
            if(res.data.success){
              this.$message.success('保存成功');
              this.list();
            }else{
              this.$message.success('保存失败，请重新试试');
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
    margin: 20px 0;
    text-align: right;
  }
</style>