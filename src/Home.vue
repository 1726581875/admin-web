<template>

  <el-container>
    <el-header>
      <h1 style="text-align: center">Hello ~ 这是Head</h1>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-row class="tac">
          <el-col :span="24">
            <h5>默认颜色</h5>
            <el-menu
              default-active="2"
              class="el-menu-vertical-demo"
              @open="handleOpen"
              @close="handleClose">
              <el-submenu index="1">
                <template slot="title">
                  <i class="el-icon-location"></i>
                  <span>系统管理</span>
                </template>
                <el-menu-item-group>
                  <el-menu-item index="1-0"><router-link to="/login">Login</router-link></el-menu-item>
                  <el-menu-item index="1-1"><router-link to="/moocManager">MoocManager</router-link></el-menu-item>
                  <el-menu-item index="1-2"><router-link to="/chapter">Chapter</router-link></el-menu-item>
                  <el-menu-item index="1-3"><router-link to="/roleResourceRel">RoleResourceRel</router-link></el-menu-item>
                  <el-menu-item index="1-4"><router-link to="/role">Role</router-link></el-menu-item>
                  <el-menu-item index="1-5"><router-link to="/loginLog">LoginLog</router-link></el-menu-item>
                  <el-menu-item index="1-6"><router-link to="/section">Section</router-link></el-menu-item>
                  <el-menu-item index="1-7"><router-link to="/moocFile">MoocFile</router-link></el-menu-item>
                  <el-menu-item index="1-8"><router-link to="/moocResource">MoocResource</router-link></el-menu-item>
                  <el-menu-item index="1-9"><router-link to="/course">Course</router-link></el-menu-item>
                  <el-menu-item index="1-10"><router-link to="/managerRoleRel">ManagerRoleRel</router-link></el-menu-item>
                  <el-menu-item index="1-11"><router-link to="/moocUser">MoocUser</router-link></el-menu-item>
                </el-menu-item-group>
              </el-submenu>
              <el-menu-item index="2">
                <i class="el-icon-menu"></i>
                <span slot="title">导航二</span>
              </el-menu-item>
              <el-menu-item index="3">
                <i class="el-icon-setting"></i>
                <span slot="title">导航三</span>
              </el-menu-item>

              <el-menu-item index="4">
                <i class="el-icon-menu"></i>
                <span slot="title">导航四</span>
              </el-menu-item>

              <el-menu-item index="5">
                <i class="el-icon-menu"></i>
                <span slot="title">导航五</span>
              </el-menu-item>

            </el-menu>
          </el-col>
        </el-row>
      </el-aside>
      <el-container>
        <el-main>
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: "Home",
    methods: {
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }
</script>

<style scoped>

</style>