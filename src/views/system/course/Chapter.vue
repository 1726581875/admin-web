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
                              @click="handleAddSection(props.row.id,props.$index)"
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
                                <el-table-column label="点击播放" width="40" align="center">
                                    <template slot-scope="scope">
                                        <el-button  size="mini" icon="el-icon-caret-right" circle></el-button>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="title" label="小节名称"/>
                                <el-table-column prop="durationFormat" label="时长" sortable/>
                                <el-table-column label="操作" width="270" align="center">
                                    <template slot-scope="scope">
                                        <el-button
                                          type="text"
                                          size="small"
                                          icon="el-icon-edit"
                                          @click="handleEditSection(props.$index,scope.$index, scope.row)"
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
                                        <el-button
                                          type="text"
                                          size="small"
                                          icon="el-icon-caret-top"
                                          class="#E6A23C"
                                          @click="sectionMoveUp(props.$index,scope.$index)"
                                        >上移
                                        </el-button>
                                        <el-button
                                          type="text"
                                          size="small"
                                          icon="el-icon-caret-bottom"
                                          class="#E6A23C"
                                          @click="sectionMoveDown(props.$index,scope.$index)"
                                        >下移
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </template>
                </el-table-column>

                <!--  Chapter 属性-->
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
                <!-- 大章节总时长 -->
                <el-table-column prop="durationFormat" label="时长" />
                <!--<el-table-column prop="createTime" label="创建时间" sortable/>-->
                <el-table-column label="操作" width="270" align="center">
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
                        <el-button
                          type="text"
                          size="small"
                          icon="el-icon-caret-top"
                          class="#E6A23C"
                          @click="chapterMoveUp(scope.$index)"
                        >上移
                        </el-button>
                        <el-button
                          type="text"
                          size="small"
                          icon="el-icon-caret-bottom"
                          class="#E6A23C"
                          @click="chapterMoveDown(scope.$index)"
                        >下移
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- =========表格table end============ -->

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

        <!-- ==========================【修改/插入】 Chapter 大章 弹出框=======================   -->
        <el-dialog :title="dialogTitle" :visible.sync="editVisible" width="40%">
            <el-form ref="chapter" :model="chapter" label-width="70px">
                <el-form-item label="课程">
                    <el-link type="primary">{{chapter.courseId}}</el-link>
                </el-form-item>
                <el-form-item label="章节名">
                <el-input v-model="chapter.name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" :disabled="buttonStatus.saveButtonDisabled" @click="saveSection">确 定</el-button>
            </span>
        </el-dialog>

        <!-- ==================【修改/插入】 Section 小节弹出框  ============================== -->
        <el-dialog :title="dialogTitle" :visible.sync="editSectionVisible" width="500px">
            <el-form ref="section" :model="section" label-width="70px">
                <el-form-item label="所属课程">
                    <el-link type="primary">{{section.courseId}}</el-link>
                </el-form-item>
                <el-form-item label="所属章节">
                    <el-link type="primary">{{section.chapterId}}</el-link>
                </el-form-item>
                <el-form-item label="标题">
                    <el-input v-model="section.title"></el-input>
                </el-form-item>
                <el-form-item label="视频">
                    <div v-if="videoUrl">
                        <video width="90%" height="220" v-bind:src="videoUrl" id="video" controls="controls" class="hidden"></video>
                        <el-button style="margin-left: 10px;"
                                   size="small"
                                   type="danger"
                                   @click="handleDeleteVideoButton(section.id, section.fileId)">
                            删除视频</el-button>
                    </div>
                    <div v-else>
                    <el-upload
                      class="upload-demo"
                      ref="upload"
                      action="https://localhost:9002/video/upload"
                      :on-preview="handlePreview"
                      :on-remove="handleRemove"
                      :http-request="upload"
                      :auto-upload="false">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将视频拖到此处，或<em>点击上传</em></div>
                        <div slot="tip" class="el-upload__tip">只能上传mp4/avi视频，且不超过500M</div>
                    </el-upload>
                    <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
                    <el-progress :percentage="uploadProcess"></el-progress>
                    </div>
                </el-form-item>
                <el-form-item label="时长">
                    <span>{{sectionDurationFormat}}</span>
                </el-form-item>
                <el-form-item label="顺序">
                    <el-input v-model="section.sort"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="handleCancelEditSection">取 消</el-button>
                <el-button type="primary" :disabled="buttonStatus.saveButtonDisabled" @click="saveSection">确 定</el-button>
            </span>
        </el-dialog>


    </div>
</template>

<script>
  export default {
    name: 'chapter',
    data() {
      return {
          videoUrl:'',
          // 进度条
          uploadProcess: 0,
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
          editSectionVisible: false,
          section: {
              durationFormat: ''
          },
          oldSection: {
              durationFormat: ''
          },
          sectionDurationFormat: '',
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
      mounted() {

      },
      methods: {

        /**
         * 上移
         */
        chapterMoveUp(chapterIndex){
            if(chapterIndex > 0){
                let chapter1 = this.chapterList[chapterIndex - 1];
                let chapter2 = this.chapterList[chapterIndex];
                this.chapterSortSwap(chapter1.id,chapter1.sort,chapter2.id,chapter2.sort);
            }
        },
          /**
           * 下移
           */
          chapterMoveDown(chapterIndex){
              if(chapterIndex < this.chapterList.length - 1){
                  let chapter1 = this.chapterList[chapterIndex + 1];
                  let chapter2 = this.chapterList[chapterIndex];
                  this.chapterSortSwap(chapter1.id,chapter1.sort,chapter2.id,chapter2.sort);
              }
          },
          /**
           * chapter交换位置
           */
          chapterSortSwap(id1,sort1,id2,sort2){
            this.$axios.post(this.$requestBaseUrl.core
              + '/admin/chapters/swap?id1=' + id1 + "&sort1=" + sort1 + "&id2=" + id2 + "&sort2=" + sort2)
            .then(res => {
                if(res.data.success){
                    this.$message.success("交换位置成功");
                    this.list();
                }else {
                    this.$message.info("交换位置失败，请刷新看看");
                }
            }).catch(err=>{
                this.$message.info("交换位置失败，请刷新看看");
            });
          },
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
                   // 设置一个格式化过的时间，用于显示
                   row.sectionList.forEach(e => e.durationFormat = this.convertTime(e.duration));

                   // 计算总时间
                   let countTime = 0;
                   row.sectionList.forEach(e => countTime = countTime + e.duration);
                   row.duration = countTime;
                   row.durationFormat = this.convertTime(countTime);
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

              // 转换时间格式
              this.chapterList.forEach(e => e.durationFormat = this.convertTime(e.duration));
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
      saveChapter() {
          //1、防刷控制
          this.buttonStatus.saveButtonDisabled = true;
          setTimeout(() => this.buttonStatus.saveButtonDisabled = false, 1000);

          //2、参数校验
          // ...

          this.editVisible = false;
          //3、发请求
          this.$axios.post(this.$requestBaseUrl.core + '/admin/chapters/chapter', this.chapter)
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
     * ==========================================================
     * =========================Section相关 ======================
     * ==========================================================
     */


          /**
           * 上移
           */
          sectionMoveUp(chapterIndex,sectionIndex){
              if(sectionIndex > 0){
                  let chapter = this.chapterList[chapterIndex];
                  let section1 = chapter.sectionList[sectionIndex -1];
                  let section2 = chapter.sectionList[sectionIndex];
                  this.sectionSortSwap(section1.id,section1.sort,section2.id,section2.sort);
                  this.expandChapter(chapter,null);
              }
          },

          /**
           * 下移
           */
          sectionMoveDown(chapterIndex,sectionIndex){
              let chapter = this.chapterList[chapterIndex];
              if(sectionIndex < chapter.sectionList.length - 1){
                  let section1 = chapter.sectionList[sectionIndex + 1];
                  let section2 = chapter.sectionList[sectionIndex];
                  this.sectionSortSwap(section1.id,section1.sort,section2.id,section2.sort);
                  this.expandChapter(chapter,null);
              }
          },

     sectionSortSwap(id1,sort1,id2,sort2){
        this.$axios.post(this.$requestBaseUrl.core
          + '/admin/sections/swap?id1=' + id1 + "&sort1=" + sort1 + "&id2=" + id2 + "&sort2=" + sort2)
          .then(res => {
              if(res.data.success){
                  this.$message.success("交换位置成功");
              }else {
                  this.$message.info("交换位置失败，请刷新看看");
              }
          }).catch(err=>{
            this.$message.info("交换位置失败，请刷新看看");
        });
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


        /**
         * 根据id删除section
         */
        deleteSectionById(chapterIndex,sectionIndex, sectionId){
          // 发ajax请求后台删除
          this.$axios.delete(this.$requestBaseUrl.core + "/admin/sections/" + sectionId)
            .then(res => {
              let chapter = this.chapterList[chapterIndex];
              let time = chapter.sectionList[sectionIndex].duration;
              //计算时长
               let countTime = chapter.duration - time;
               chapter.duration = countTime;
               chapter.durationFormat = this.convertTime(countTime);
                // 从小节数组中移除
                chapter.sectionList.splice(sectionIndex,1);
              // 到数据库更改总时长
               this.$axios.post(this.$requestBaseUrl.core + '/admin/chapters/chapter', chapter);
                res.data.success ? this.$message.success('删除成功') : this.$message.error('删除失败，请刷新后重新试试');
            }).catch(err => {
            this.$message.error('删除操作发生系统内部错误');
            console.error("error = " + err)
          })
        },


         /**
         * 点击编辑按钮触发，展示编辑框
         */
        handleEditSection(chapterIndex,sectionIndex, row) {

            this.dialogTitle = '修改';
            this.uploadProcess = 0;
            this.videoUrl = '';
            this.section = row;
            this.section.durationFormat = row.durationFormat;
             this.sectionDurationFormat = row.durationFormat;
            this.chapter = this.chapterList[chapterIndex];
            // 保存旧值
            this.oldSection = JSON.parse(JSON.stringify(row));
            // 如果有地址说明已经上传视频
            if(this.section.video){
              this.videoUrl = this.$requestBaseUrl.file + this.section.video;
            }
            // 展示编辑框
            this.editSectionVisible = true;
        },
          /**
           * 取消编辑
           */
      handleCancelEditSection() {
          console.log(this.oldSection);
          // 恢复旧值
          this.section = this.oldSection;
          // 查询列表
          this.expandChapter(this.chapter,null);
          this.editSectionVisible = false;

      },

        /**
         *  点击新增，展示新增框
         */
        handleAddSection(chapterId, chapterIndex) {
            this.dialogTitle = '新增';
            this.uploadProcess = 0;
            this.section = {
                durationFormat: ''
            };
            // 时长初始化为0
            this.section.duration = 0;
            this.oldSection = {};
            this.oldSection.duration = 0;
            this.chapter = this.chapterList[chapterIndex];
            this.section.chapterId = chapterId;
            this.videoUrl = '';
            this.editSectionVisible = true;
        },


      /**
       * 点击删除视频按钮
       * 1、弹框确认
       * 2、发请求更改文件状态
       * 3、置空视频videoUrl（v-if 绑定的值，置空会隐藏视频标签，显示上传）
       * 4、ajax修改section表的video字段为空(对应就是视频url)
       */
       handleDeleteVideoButton(sectionId,fileId){

          let newSectionId = sectionId;

          let newFileId = fileId;

          // 1、弹框
         this.$confirm('确定要删除吗？', '提示', {
           type: 'warning'
         }).then(() => { // 点击确认删除
           // 2、文件表改为已删除状态

             // 小结id，如果没有则设为0
             console.log("sectionId=" + sectionId);
             console.log("fileId=" + fileId);

             if(newSectionId == undefined) {
                 newSectionId = 0;
             }

             if(newFileId == undefined || newFileId == null) {
                 newFileId = 0;
             }

             console.log("sectionId=" + sectionId);
           this.$axios.delete(this.$requestBaseUrl.file + '/video/delete/ '+ newSectionId + '/' + newFileId)
             .then(res=>{
                 if(res.data.success) {
                     this.$message.success("删除视频成功");
                     // 3、置空视频url
                     this.videoUrl = "";
                     this.section.video = "";
                     // 初始化文件上传进度条
                     this.uploadProcess = 0;
                     let time = this.section.duration;
                     // 更改页面上的显示
                     this.section.duration = 0;
                     this.section.durationFormat = this.convertTime(0);
                     this.oldSection.duration = 0;
                     this.oldSection.durationFormat = this.convertTime(0);
                     this.sectionDurationFormat = this.convertTime(0);

                     // 更新总时间
                     let chapter = this.chapter;
                     //计算时长
                     let countTime = chapter.duration - time;
                     chapter.duration = countTime;
                     chapter.durationFormat = this.convertTime(countTime);
                     // 到数据库更改总时长
                     this.$axios.post(this.$requestBaseUrl.core + '/admin/chapters/chapter', chapter);

                 }else{
                     this.$message.warning("删除视频失败，请重新试试！");
                 }
             }).catch(err=>{
               this.$message.warning("删除视频失败，请重新试试！");
           });
         }).catch(() => {// 点击取消
           console.log("已取消");
         });

       },


        /**
         * 编辑框、新增框点击保存（新增/修改）
         * 1、防刷控制
         * 2、参数校验
         * 3、向后台发ajax请求
         * 4、重新查询数据(刷新)
         */
        saveSection() {
            //1、防刷控制
            this.buttonStatus.saveButtonDisabled = true;
            setTimeout(() => this.buttonStatus.saveButtonDisabled = false, 1000);

            //2、参数校验
            // ...
            this.editSectionVisible = false;
            //3、发请求保存章节信息
            this.$axios.post(this.$requestBaseUrl.core + '/admin/sections/section', this.section)
              .then(res => {
                  if (res.data.success) {
                      // 计算大章的时长
                      let durationTime = this.chapter.duration + (this.section.duration - this.oldSection.duration);
                      // 设置时间
                      this.chapter.duration = durationTime;
                      this.chapter.durationFormat = this.convertTime(durationTime);
                      //4、发请求保存改变的总视频时长
                      this.$axios.post(this.$requestBaseUrl.core + '/admin/chapters/chapter', this.chapter);
                      // 重新查询section
                      this.expandChapter(this.chapter,null);
                      this.$message.success('保存成功');
                  } else {
                      this.$message.warning('保存失败，请重新试试');
                  }
              }).catch(err => {
                this.$message.error('保存操作发生系统内部错误');
                console.error("error = " + err)
            })
        },
        // 上传文件相关
        submitUpload() {
            this.$refs.upload.submit();
        },
        handleRemove(file) {
            console.log(file);
        },
        handlePreview(file) {
            console.log(file);
        },
        /**
         * 上传视频
         *
         */
        upload(item) {
            console.log(item.file);
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
            // let nowShardIndex = this.getShardIndex(fileKey);
            let nowShardIndex = 1;
            this.$axios.get('http://localhost:9002/video/key/' + fileKey + '/shardIndex')
              .then(res => {
                  if(res.data.success){
                      nowShardIndex = res.data.data;
                      if(nowShardIndex == shardCount){
                          this.uploadProcess = 50;
                          setTimeout(() => this.uploadProcess = 70,500);
                          setTimeout(() => this.uploadProcess = 90,500);
                          setTimeout(() => this.uploadProcess = 100,500);
                      }
                      this.sendFileShard(file,nowShardIndex,shardSize);
                  }else {
                      this.sendFileShard(file,nowShardIndex,shardSize);
                  }
              }).catch(err =>{
                this.sendFileShard(file,nowShardIndex,shardSize);
              });


        },


      checkShard(file,nowShardIndex,shardCount,shardSize){
          if(nowShardIndex == '' || nowShardIndex == undefined || nowShardIndex == null){
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
         * 向后台传文件分片
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
            // 进度条
            let process = 0;
            // 向发送请求
            this.$axios.post(this.$requestBaseUrl.file + '/video/upload', formDate,{
                onUploadProgress:function(progressEvent){
                    // 计算进度条位置
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
                      }else {
                          this.$message.success("上传视频成功");
                          // 获取文件相对路径
                          let filePath = respone.data.data.filePath;
                          let fileId = respone.data.data.fileId;
                          // 设置视频显示全路径
                          this.videoUrl = this.$requestBaseUrl.file + filePath;
                          // 设置保存到数据库的相对路径
                          this.section.video = filePath;
                          this.section.fileId = fileId;
                           // 获取视频的时长
                          let _this = this;
                          setTimeout( () => {
                              let ele = document.getElementById("video");
                              this.section.duration = parseInt(ele.duration, 10);
                              console.log("duration = " + this.section.duration);
                              // 转换时间显示
                              this.section.durationFormat = this.convertTime(this.section.duration);
                              this.sectionDurationFormat = this.convertTime(this.section.duration);
                              console.log("durationFormat = " + this.section.durationFormat);
                          }, 1000);

                          setTimeout( () => {
                              console.log("durationFormat = " + this.section.durationFormat);
                          }, 1500);
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
            let _this = this;
            _this.nowShardIndex = 1;
             return this.$axios.get('http://localhost:9002/video/key/' + key + '/shardIndex')
              .then(rep => {
                  if(rep.data.success){
                      return rep.data.data;
                  }else {
                      return 1;
                  }
              }).catch(err =>{return 1});
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

    .upload-demo-css{
        width: 90px;
    }

</style>