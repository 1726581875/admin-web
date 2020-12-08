<template>
  <div class="course-detail-container">

    <el-page-header @back="goBack" content="详情页面" style="margin-left:60px"/>

   <div class="course-detail-form">
   <el-form ref="form" :model="form" label-width="80px">
    <el-form-item label="课程名称">
      <el-input v-model="course.name"></el-input>
    </el-form-item>
    <el-form-item label="课程封面">
      <el-upload
        class="avatar-uploader"
        action="https://jsonplaceholder.typicode.com/posts/"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload">
        <img v-if="course.image" :src="course.image" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
    </el-form-item>
    <el-form-item label="是否启用">
      <el-switch v-model="form.delivery"></el-switch>
    </el-form-item>
    <el-form-item label="分类标签">
      <el-checkbox-group v-model="form.type">
        <el-checkbox label="美食/餐厅线上活动" name="type"></el-checkbox>
        <el-checkbox label="地推活动" name="type"></el-checkbox>
        <el-checkbox label="线下主题活动" name="type"></el-checkbox>
        <el-checkbox label="单纯品牌曝光" name="type"></el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item label="类型">
      <el-radio-group v-model="form.resource">
        <el-radio label="免费"></el-radio>
        <el-radio label="付费"></el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="课程描述">
      <el-input
        type="textarea"
        v-model="course.summary"
        :autosize="{ minRows: 6, maxRows: 6}">
      </el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">立即创建</el-button>
      <el-button>取消</el-button>
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
      }
    },
    created() {
      let courseId = this.$route.params.id;
      console.log(courseId);
      this.findCourseById(courseId);
    },
    methods: {

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
            console.log(res.data.data);
          }
        })
      },

      goBack(){
        console.log("点击了返回");
        this.$router.push({
          path: '/course',
        })
      },
      onSubmit() {
        console.log('submit!');
      }
    }

  }
</script>

<style scoped>

  .course-detail-container{
    background: #ffffff;
    width: 100%;
    height: 770px;
  }

  .course-detail-form{
    float: left;
    background: #ffffff;
    width: 60%;
    height: 700px;
    display: block;
    margin-left: 100px;
    margin-top: 40px;
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

</style>