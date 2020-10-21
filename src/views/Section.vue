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
                >刷新
                </el-button>
                <el-button
                        type="danger"
                        icon="el-icon-delete"
                        class="handle-del mr10"
                        @click="deleteSelected"
                        :disabled="buttonStatus.deleteMultipleButtonDisabled"
                >批量删除
                </el-button>
                <el-select v-model="selectValue" placeholder="查询条件" class="handle-select mr10">
                        <el-option key="0" label="id" value="id"></el-option>
                        <el-option key="1" label="标题" value="title"></el-option>
                        <el-option key="2" label="课程id" value="courseId"></el-option>
                        <el-option key="3" label="章节id" value="chapterId"></el-option>
                        <el-option key="4" label="视频" value="video"></el-option>
                        <el-option key="5" label="时长" value="duration"></el-option>
                        <el-option key="6" label="顺序" value="sort"></el-option>
                        <el-option key="7" label="创建时间" value="createTime"></el-option>
                        <el-option key="8" label="修改时间" value="updateTime"></el-option>
                </el-select>
                <!--  查找输入框 -->
                <el-input
                        v-model="inputVale"
                        :placeholder="selectValue? '请输入' + nameMap[selectValue]  : '请输入查询内容'"
                        class="handle-input mr10"></el-input>
                <el-button
                        type="primary"
                        icon="el-icon-search"
                        :disabled="buttonStatus.searchButtonDisabled"
                        @click="handleSearch">搜索
                </el-button>

                <el-button
                        type="primary"
                        icon="el-icon-plus"
                        class="handle-add mr10"
                        @click="handleAdd"
                >新增
                </el-button>
            </div>
            <!-- ============   表格table begin  =================-->
            <el-table
                    :data="sectionList"
                    border
                    class="table"
                    ref="multipleTable"
                    header-cell-class-name="table-header"
                    :default-sort="{prop: 'date', order: 'descending'}"
                    @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" align="center"/>
                        <el-table-column prop="id" label="id" width="55" align="center"/>
                        <el-table-column prop="title" label="标题"/>
                        <el-table-column prop="courseId" label="课程id"/>
                        <el-table-column prop="chapterId" label="章节id"/>
                        <el-table-column prop="video" label="视频"/>
                        <el-table-column prop="duration" label="时长"/>
                        <el-table-column prop="sort" label="顺序"/>
                        <el-table-column prop="createTime" label="创建时间"/>
                        <el-table-column prop="updateTime" label="修改时间"/>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-edit"
                                @click="handleEdit(scope.$index, scope.row)"
                        >编辑
                        </el-button>
                        <el-button
                                type="text"
                                icon="el-icon-delete"
                                class="red"
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
        </div>

        <!-- 【修改/插入】 弹出框   -->
        <el-dialog :title="dialogTitle" :visible.sync="editVisible" width="40%">
            <el-form ref="section" :model="section" label-width="70px">
                        <el-form-item label="标题">
                            <el-input v-model="section.title"></el-input>
                        </el-form-item>
                        <el-form-item label="课程id">
                            <el-input v-model="section.courseId"></el-input>
                        </el-form-item>
                        <el-form-item label="章节id">
                            <el-input v-model="section.chapterId"></el-input>
                        </el-form-item>
                        <el-form-item label="视频">
                          <el-upload
                            class="upload-demo"
                            ref="upload"
                            action="https://localhost:9002/file/upload"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :http-request="upload"
                            :auto-upload="false">
                            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                            <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                            <el-progress :percentage="uploadProcess"></el-progress>
                          </el-upload>
                        </el-form-item>
                        <el-form-item label="时长">
                            <el-input v-model="section.duration"></el-input>
                        </el-form-item>
                        <el-form-item label="顺序">
                            <el-input v-model="section.sort"></el-input>
                        </el-form-item>
                        <el-form-item label="创建时间">
                            <el-input v-model="section.createTime"></el-input>
                        </el-form-item>
                        <el-form-item label="修改时间">
                            <el-input v-model="section.updateTime"></el-input>
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
    name: 'section',
    data() {
      return {
        /* 分页查询条件 */
        queryParam: {
          id: null,
          courseId: null,
          name: null,
          pageIndex: 1,
          pageSize: 10
        },
        //分页查询结果
        sectionList: [],
        pageCount: 1,
        //多选，选择的元素
        multipleSelection: [],
        /* 控制弹出框 */
        editVisible: false,
        dialogTitle: '',
        section: {},
        //刷新 转动
        isLoading: false,
        /*搜索框，选择框*/
        inputVale: 'id',
        selectValue: 'id',
        //下拉选择框映射
        nameMap: {
        id:'id',
        title:'标题',
        courseId:'课程id',
        chapterId:'章节id',
        video:'视频',
        duration:'时长',
        sort:'顺序',
        createTime:'创建时间',
        updateTime:'修改时间',
      },
      /* 控制按钮状态 */
      buttonStatus: {
        deleteMultipleButtonDisabled: false,
         searchButtonDisabled: false,
         saveButtonDisabled: false
      },
       video: {},
      uploadProcess: 0,
    };
    },
    created() {
      this.list();
    },
    methods: {

      afterUpload(){

      },

      //初始化查询条件
      setQueryParam(id, courseId, name, pageIndex, pageSize) {
        if (pageIndex == undefined || pageIndex == null) {
          this.queryParam.pageIndex = 1;
        } else {
          this.queryParam.pageIndex = pageIndex;
        }
        if (pageSize == undefined || pageSize == null) {
          this.queryParam.pageSize = 10;
        } else {
          this.queryParam.pageSize = pageSize;
        }
        this.queryParam.id = id;
        this.queryParam.courseId = courseId;
        this.queryParam.name = name;
      },
      /**
       * 刷新
       * 说明：点击刷新按钮触发
       * 1、图标转动isLoading = true
       * 2、sectionList置空
       * 3、初始化查询条件
       * 4、延迟一秒，发ajax获取列表信息 （为了用户体验）
       */
      reloadList() {
        let _this = this;
        _this.isLoading = true;
        _this.sectionList = [];
        _this.setQueryParam(null, null, null, 1, 10);
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
        this.$axios.get('http://localhost:9001/admin/sections/list', {
          params: this.queryParam
        }).then(res => {
          let result = res.data;
          if (result.success) {
            this.sectionList = result.data.content;
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
        if (inputValue == '' || inputValue == null || inputValue == undefined) {
          this.$message.warning("你还没有输入任何内容!");
          return;
        }

        // 自己定义，参数校验
        // ...
        this.setQueryParam();
        this.$set(this.queryParam, this.selectValue, inputValue);
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
        this.$axios.delete("http://localhost:9001/admin/sections/" + id)
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
       * 1、获取到要删除的sectionId数组
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

        // 1、获取到要删除的section id数组
        const sectionIdList = [];
        // 名字 list
        let delSectionNames = [];
        this.multipleSelection.forEach((section, index) => {
          // 拿到要删除的sectionId
          sectionIdList.push(section.id);
          // 取前五个名字
          if (index <= 5) {
            delSectionNames.push(section.name);
          }
        });
        let delCount = sectionIdList.length;
        // 批量删除的名字拼接 String
        let delMsgStr = delCount <= 5 ? delSectionNames.toString() : delSectionNames.toString() + '...';

        //2、弹出框，提示信息,二次确认
        this.$confirm(`确定要批量删除 [<span style="color: red">${delMsgStr}</span>] 一共
         <span style="color: red">${sectionIdList.length}</span> 列吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }).then(() => {//当点击确认

          //3、发送批量删除请求
          this.$axios.post("http://localhost:9001/admin/sections/batch/delete", sectionIdList)
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
        this.dialogTitle = '修改';
        //为对象分配一个新地址，改变也不影响原来的值
        let newSection = JSON.parse(JSON.stringify(row));
        this.section = newSection;
        // 展示编辑框
        this.editVisible = true;
      },

      /**
       *  点击新增，展示新增框
       */
      handleAdd() {
        this.dialogTitle = '新增';
        this.section = {};
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
        this.$axios.post('http://localhost:9001/admin/sections/section', this.section)
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
        })

      },
      // 分页导航
      handlePageChange(val) {
        console.log("val = " + val)
        this.$set(this.queryParam, 'pageIndex', val);
        this.list();
      },
      // 上车文件相关
      submitUpload() {
        this.$refs.upload.submit();
      },
      handleRemove(file) {
        console.log(file);
      },
      handlePreview(file) {
        console.log(file);
      },
      upload(item){
        let file = item.file;
        let fileFullName = file.name;
        let lastModified = file.lastModified;
        let lastModifiedDate = file.lastModifiedDate;
        let fileSize = file.size;
        let type = file.type;
        let suffix = fileFullName.substring(fileFullName.lastIndexOf(".") + 1, fileFullName.length).toLowerCase();
        let webkitRelativePath = file.webkitRelativePath;

        let fileName = fileFullName.substring(0,fileFullName.lastIndexOf("."));
        let strKey = fileName + fileSize + type + lastModified + webkitRelativePath + lastModifiedDate;
        // 转换为md5,作为文件唯一标识
        let fileKey = this.$md5(strKey);

        // 分片大小
        let shardSize = 10 * 1024 * 1024;
        // 文件总分片数
        let shardCount = fileSize % shardSize == 0 ? Math.floor(fileSize/shardSize) : Math.floor(fileSize/shardSize + 1);
        // 去后台获取该文件的分片下标
        let nowShardIndex = this.getShardIndex(fileKey);

        if(nowShardIndex == '' && nowShardIndex == undefined && nowShardIndex == null){
          nowShardIndex = 1;
        }
        //如果该文件已存在，直接提示文件上传成功，返回
        if(nowShardIndex == shardCount){
          this.uploadProcess = 50;
          setTimeout(() => this.uploadProcess = 70,500);
          setTimeout(() => this.uploadProcess = 90,500);
          setTimeout(() => this.uploadProcess = 100,500);
          this.$message.success("视频上传成功");
          return;
        }

        // 从当前分片开始上传
        this.sendFileShard(file,nowShardIndex,shardSize);
      },

      /**
       * 参数
       * file:文件对象
       * shardIndex:分片下标
       * shardSize:分片大小
       *
       *对文件进行分割，向后台发送文件分片
       *
       */
      sendFileShard(file,shardIndex,shardSize){
        let fileFullName = file.name;
        let lastModified = file.lastModified;
        let lastModifiedDate = file.lastModifiedDate;
        let fileSize = file.size;
        let type = file.type;
        let suffix = fileFullName.substring(fileFullName.lastIndexOf(".") + 1, fileFullName.length).toLowerCase();
        let webkitRelativePath = file.webkitRelativePath;

        let fileName = fileFullName.substring(0,fileFullName.lastIndexOf("."));
        let strKey = fileName + fileSize + type + lastModified + webkitRelativePath + lastModifiedDate;
        // 转换为md5,作为文件唯一标识
        let fileKey = this.$md5(strKey);

        let shardCount = fileSize % shardSize == 0 ? Math.floor(fileSize/shardSize) : Math.floor(fileSize/shardSize + 1);

          // 分片发请求
          let fileShard = this.getFileShard(file, shardIndex,shardSize);
          // 数据表单
          let formDate = new FormData();
          formDate.append("fileShard", fileShard);
          formDate.append("suffix", suffix);
          formDate.append("fileKey", fileKey);
          formDate.append("fileSize", fileSize);
          formDate.append("shardIndex",shardIndex);
          formDate.append("shardSize",shardSize);
          formDate.append("shardCount",shardCount);

          let _this = this;

          let process = 0;
          // 向发送请求
          this.$axios.post('http://localhost:9002/file/upload', formDate,{
            onUploadProgress:function(progressEvent){
              process = (progressEvent.loaded / (progressEvent.total *  shardCount)) * 100;
              // 原来的，易理解，但是在运算中精度损失，上传完最后 99.99%
             // _this.uploadProcess = 1/shardCount * 100 * (shardIndex - 1) + (progressEvent.loaded / (progressEvent.total *  shardCount)) * 100;
              // 进行通分母，整理后，最后不会精度损失
              _this.uploadProcess =  100 * (progressEvent.total * (shardIndex - 1) + progressEvent.loaded) / (progressEvent.total *  shardCount) | 0;
            }
          })
            .then(respone => {
              if(respone.data.success){
               // _this.uploadProcess = _this.uploadProcess + process;
                //如果还没到最后一个，发送下一个分片
                if(shardIndex < shardCount) {
                  this.sendFileShard(file, shardIndex + 1, shardSize);
                }
              }
            }).catch(error => {
            this.$message.error('上传文件失败！');
          });

      },

      /**
       * 获取文件分片
       * @param file 文件对象
       * @param shardIndex 分片下标
       * @param shardSize 分片大小
       */
      getFileShard(file, shardIndex, shardSize){

        if(shardIndex <= 0){
          shardIndex = 0;
        }
        let fileSize = file.size;
        // 获取总分片数
        let shardCount = fileSize % shardSize == 0 ?
          Math.floor(fileSize/shardSize) : Math.floor(fileSize/shardSize + 1);

        if(shardIndex > shardIndex){
          shardIndex = shardCount;
        }

        // 当前分片起始位置
        let start = (shardIndex - 1) * shardSize;
        // 当前分片结束位置d
        let end = Math.min(file.size, start + shardSize);
        // 从文件中截取当前的分片数据
        let fileShard = file.slice(start, end);
        return fileShard;
      },

      /**
       * 获取开始上传的文件分片下标
       * 如果后台不存在该文件，返回1
       * @param key
       * @returns {Promise<AxiosResponse<any>>}
       */
      getShardIndex(key){
        let nowShardIndex = 1;
        nowShardIndex =  this.$axios.get('http://localhost:9002/file/key/' + key + '/shardIndex')
          .then(rep => {
            if(rep.data.success){
              let shardIndex  = rep.data.data;
              return shardIndex;
            }else {
              return 1;
            }
        });
        return nowShardIndex;
      },


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