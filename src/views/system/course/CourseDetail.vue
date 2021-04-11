<template>
  <div class="course-detail-container">

    <el-page-header @back="goBack" content="详情页面" style="margin-left:60px"/>

   <div class="course-detail-form">
   <el-form ref="form" :model="form" label-width="80px">
    <el-form-item label="课程名称:">
      <el-input v-model="course.name" style="width:60%" size="small"></el-input>
    </el-form-item>
    <el-form-item label="课程封面:">
      <el-upload
        class="avatar-uploader"
        action="https://localhost:9002/image/upload"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
        :http-request="uploadImage">
        <img v-if="imageUrl" :src="imageUrl" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
    </el-form-item>
    <el-form-item label="状态" v-if="isUpdate">
      <el-tag size="small" type="success" effect="dark" v-if="course.status =='正常'">正常</el-tag>
      <el-tag size="small" type="warning" effect="dark" v-if="course.status =='未审核'">未审核</el-tag>
      <el-tag size="small" type="danger" effect="dark" v-if="course.status =='禁用'">禁用</el-tag>
      <el-tag size="small" type="danger" effect="dark" v-if="course.status =='已删除'">已删除</el-tag>
      <el-tag size="small" type="danger" effect="dark" v-if="course.status =='审核不通过'">审核不通过</el-tag>
      <span v-if="isManager">
        <el-select v-model="course.status" placeholder="更改状态" class="handle-select mr10"
                   size="small" style="margin-left:10px; width: 100px">
          <el-option key="0" label="正常" value="正常"></el-option>
          <el-option key="1" label="未审核" value="未审核"></el-option>
          <el-option key="2" label="禁用" value="禁用"></el-option>
          <el-option key="3" label="已删除" value="已删除"></el-option>
          <el-option key="4" label="审核不通过" value="审核不通过"></el-option>
        </el-select>
         <el-button size="small" @click="changeCourseStatus" style="margin-left: 10px">修改状态</el-button>
      </span>
    </el-form-item>
    <el-form-item label="分类标签:">
      <!-- ============= 已有的课程标签列表============== -->
        <!-- 添加课程标签按钮-->
        <el-button
          icon="el-icon-plus"
          size="small"
          @click="handleAddCourseTagButton">
        </el-button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <el-tag
          v-for="role in tagList"
          :key="role.name"
          closable
          @close="handleCourseTagClose(role)"
          effect="dark"
          type="success">
          {{role.name}}
        </el-tag>&nbsp;&nbsp;&nbsp;&nbsp;
      </el-form-item>

      <!--  课程标签选择框  -->
      <el-form-item :label="showTag?'可选分类':''">
        <div v-if="showTag" class="course-tag-box">
          <!-- 所有课程分类 category-->
          <el-checkbox-group v-model="checkboxGroup" size="mini">
            <el-checkbox-button
              v-for="category in categoryList"
              :label="category.name"
              :key="category.id"
              @change="checkSelectedCategory()">
              {{category.name}}
            </el-checkbox-button>
          </el-checkbox-group>

          <div style="margin-top: 5px"></div>
          <span  v-if="noSelectedTag.length == 0">没有课程标签可以选择</span>
          <!-- 分类对应的标签 tag -->
          <el-tag
            v-for="tag in noSelectedTag"
            :key="tag.id"
            style="cursor:pointer"
            @click="handleClickCourseTab(tag)"
            effect="dark"
            type="success">
            {{tag.name}}
          </el-tag>&nbsp;&nbsp;
        </div>
    </el-form-item>
    <el-form-item label="课程描述:">
      <el-input
        type="textarea"
        v-model="course.summary"
        :autosize="{ minRows: 6, maxRows: 6}">
      </el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit" size="small">{{saveButtonName}}</el-button>
      <el-button size="small">取消</el-button>
    </el-form-item>
  </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: "CourseDetail",
    data() {
      return {
        form: {
          name: '',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        },
        // 课程封面图片url
        imageUrl: '',
        course: {},
        /** 课程标签相关 */
        //当前课程标签列表
        tagList: [],
        //没有被选择的课程标签列表
        noSelectedTag:[],
        // 是否展示课程标签列表选择框
        showTag: false,
        // 分类list
        categoryList: [],
        // 选中的分类
        checkboxGroup: [],

          /** 保存课程按钮 立即创建/确认修改  */
         saveButtonName: '立即创建',
         /**
          * 是更新=true,新增=false
          */
         isUpdate: true,
        /**
         * 是否是管理员
         */
        isManager: false,
      }
    },
    created() {
      let courseId = this.$route.params.id;
      if(courseId != 'add') {
          this.saveButtonName = '确认修改';
          this.findCourseById(courseId);
          this.isUpdate = true;
      }else {
        this.isUpdate = false;
      }
      //检查是否是管理员
      let user = localStorage.getItem('user');
      if(user){
        let loginUser = JSON.parse(user);
        //转态1是管理员，状态2是教师
        this.isManager = loginUser.type == 1 ? true : false;
      }


    },
    methods: {

        /**
         *  自定义http请求
         */
        uploadImage(item) {
            // 获取上传文件信息
            let fileObj = item.file;
            let formData = new FormData();
            formData.append("file",fileObj);
            this.$axios.post(this.$requestBaseUrl.file + '/image/upload',formData)
                .then((res) => {
                    if (res.data.success) {
                        this.$message.success('上传课程图片成功!');
                        this.imageUrl = this.$requestBaseUrl.file + res.data.data;
                        this.course.image = res.data.data;
                        console.log("imageUrl=" + this.imageUrl);
                    } else {
                        this.$message.error('上传课程图片发生异常!')
                    }
                }).catch((error) => {
                console.log(error);
                this.$message.error('上传课程图片发生异常!')
            });
        },


      /**
       * 点击选择分类触发
       * 展示分类下可选择的标签
       *
       */
      checkSelectedCategory(){
        //1、清空可选择的课程标签
        this.noSelectedTag = [];
        //2、获取已选择的分类下的标签
        let categoryTagList = [];
        this.categoryList.forEach(category=>{
          if(this.checkboxGroup.indexOf(category.name) != -1){
            category.tagList.forEach(tag=>categoryTagList.push(tag));
          }
        });
        console.log(categoryTagList);
        // 过滤当前课程已经具有的标签
        // 当前课程已经具备的课程标签id
        let tagIdList = [];
        this.tagList.forEach(tag=>tagIdList.push(tag.id));
        //设置可选择的课程标签列表
        categoryTagList.forEach(tag=>{
          if(tagIdList.indexOf(tag.id) == -1){
            this.noSelectedTag.push(tag);
          }
        });
      },
      /**
       *  点击选择标签
       */
      handleClickCourseTab(tag){
        if(this.tagList.length < 10) {
          this.noSelectedTag.splice(this.noSelectedTag.indexOf(tag), 1);
          this.tagList.push(tag);
        }else {
          this.$message.info("课程标签不允许超过十个")
        }

      },
      /**
       * 当点击添加课程标签按钮触发
       */
      handleAddCourseTagButton() {
        //初始化可选择的课程标签
        this.noSelectedTag =[];
        // 展示课程标签选择框
        this.showTag = true;
        // 发请求获取全部课程标签列表
        this.$axios.get(this.$requestBaseUrl.core + '/admin/categorys/all')
          .then(resp => {
            let respData = resp.data;
            if (respData.success) {
              //全部课程分类
              this.categoryList = respData.data;
              if(this.categoryList.length > 0) {
                let firstCategory = this.categoryList[0];
                //设置第一个分类为选中状态
                this.checkboxGroup.push(firstCategory.name);

                //当前课程已经具备的课程标签id
                let tagIdList = [];
                this.tagList.forEach(tag=>tagIdList.push(tag.id));

                //设置可选择的课程标签列表
                firstCategory.tagList.forEach(tag=>{
                  if(tagIdList.indexOf(tag.id) == -1){
                    this.noSelectedTag.push(tag);
                  }
                });
              }

            }
          })

      },
      /**
       *
       * 点击移除课程标签
       */
      handleCourseTagClose(tag) {
        // 从标签数组移除
        this.tagList.splice(this.tagList.indexOf(tag), 1);

        //若是选中分类才加到下面显示
        this.categoryList.forEach(category => {
          if (category.id == tag.categoryId) {
            if (this.checkboxGroup.indexOf(category.name) != -1) {
              this.noSelectedTag.push(tag);
            }
          }
        });
      },


      handleAvatarSuccess(res, file) {
        this.imageUrl = URL.createObjectURL(file.raw);
      },
      
      
      beforeAvatarUpload(file) {
        const isLt5M = file.size / 1024 / 1024 < 5
        const isType = file.type === 'image/jpeg' || file.type === 'image/png'
        if (!isType) {
          this.$message.warning('请上传jpg/png类型的图片!');
          return false
        }
        if (!isLt5M) {
          this.$message.warning('上传图片大小不能超过 5M!');
          return false
        }
        return isType && isLt5M;
      },

      /**
       * 查询课程信息
       *
       */
      findCourseById(courseId){
        this.$axios.get(this.$requestBaseUrl.core + '/admin/courses/'+courseId)
        .then(res => {
          if(res.data.success){
            this.course = res.data.data;
            this.tagList =  this.course.tagList;
            this.imageUrl = this.$requestBaseUrl.file + this.course.image;
          }
        })
      },

        /**
         * 点击返回
         */
      goBack(){
          this.$router.push('/courseInfo');
      },
        /**
         * 点击提交保存按钮
         */
      onSubmit() {
        console.log('submit!');
        this. saveCourse();
      },
        /**
         * 保存课程信息 新增/修改
         */
      saveCourse(){
          let course = this.course;
          course.tagList = this.tagList;
          this.$axios.post(this.$requestBaseUrl.core + '/admin/courses/save',course)
              .then(res=>{
                  if(res.data.success){
                      this.$router.push('/courseInfo');
                      this.$message.success('保存课程成功');
                  }else {
                      this.$message.info('保存课程失败');
                  }
              }).catch(err=>{
               this.$message.error('保存课程发生异常');
          });


      },
      /**
       * 更改课程状态
       */
      changeCourseStatus(){
        this.$axios.post(this.$requestBaseUrl.core + '/admin/courses/changeStatus',this.course)
          .then(res=>{
            if(res.data.success){
              this.$message.success(res.data.msg);
            }else {
              this.$message.info(res.data.msg);
            }
          }).catch(err=>{
          this.$message.error('更改课程状态发生异常');
        });

      }


    }

  }
</script>

<style scoped>

  .course-detail-container{
    background: #ffffff;
    width: 100%;
    height: 600px;
    overflow-y: scroll;
  }

  .course-detail-form{
    float: left;
    background: #ffffff;
    width: 60%;
    height: 800px;
    display: block;
    margin-left: 100px;
    margin-top:20px;
    border:  solid 1px #20a0ff;
  }


  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 356px;
    height: 178px;
    display: block;
  }

  .course-tag-box{
    width:100%;
    height: 140px;
    overflow-y:auto;
    border:solid 1px #C0C4CC

  }

  .el-tag + .el-tag {
    margin-left: 10px;
  }
</style>