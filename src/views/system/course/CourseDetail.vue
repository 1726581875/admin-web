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
        action="https://localhost:9002/video/upload"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload">
        <img v-if="course.image" :src="course.image" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
    </el-form-item>
    <el-form-item label="是否启用:">
      <el-switch v-model="form.delivery"></el-switch>
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
      <el-button type="primary" @click="onSubmit" size="small">立即创建</el-button>
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
      }
    },
    created() {
      let courseId = this.$route.params.id;
      this.findCourseById(courseId);
    },
    methods: {
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
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPG && isLt2M;
      },


      findCourseById(courseId){
        this.$axios.get(this.$requestBaseUrl.core + '/admin/courses/'+courseId)
        .then(res => {
          if(res.data.success){
            this.course = res.data.data;
            this.tagList =  this.course.tagList;
            console.log(res.data.data);
          }
        })
      },

      goBack(){
        console.log("点击了返回");
        this.$router.push({
          path: '/courseInfo',
        })
      },
      onSubmit() {
        console.log('submit!');
        this. saveCourse();
      },
        /**
         * 保存课程信息 新增/修改
         */
      saveCourse(){
          let course = this.course;
          this.$axios.post(this.$requestBaseUrl.core + '/admin/courses/save',course)
              .then(res=>{
                  if(res.data.success){

                      this.$message.success('保存课程成功');
                  }else {
                      this.$message.info('保存课程失败');
                  }
              }).catch(err=>{
               this.$message.error('保存课程发生异常');
          });


      },


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
    width: 178px;
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