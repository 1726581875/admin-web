<template>
    <div class="">
        <div class="container">
            <el-tabs v-model="activeName" @tab-click="handleClickTab">
                <el-tab-pane :label="`未读消息(${unReadMessageNum})`" name="first">
                    <el-table :data="messageList" :show-header="false" style="width: 100%">
                        <el-table-column>
                            <template slot-scope="scope">
                                <div v-if="scope.row.courseId && !scope.row.replyId">
                                    <a @click="toCourseList"><span class="message-title">{{scope.row.content}}</span></a>
                                </div>
                                <div v-if="scope.row.replyId">
                                    <span class="message-title">{{scope.row.content}}</span>
                                </div>
                                <dev v-if="!scope.row.replyId && !scope.row.courseId">
                                    <span class="message-title">{{scope.row.content}}</span>
                                </dev>
                            </template>
                        </el-table-column>
                        <el-table-column prop="createTime" width="180"></el-table-column>
                        <el-table-column width="120">
                            <template slot-scope="scope">
                                <el-button size="small" @click="handleRead(scope.row.id)">标为已读</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="handle-row">
                        <el-button type="primary" @click="handleAllMessage(1)">全部标为已读</el-button>
                    </div>

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
                </el-tab-pane>

                <el-tab-pane :label="`已读消息(${readMessageNum})`" name="second">
                    <template v-if="activeName === 'second'">
                        <el-table :data="messageList" :show-header="false" style="width: 100%">
                            <el-table-column>
                                <template slot-scope="scope">
                                    <span class="message-title">{{scope.row.content}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="createTime" width="150"></el-table-column>
                            <el-table-column width="120">
                                <template slot-scope="scope">
                                    <el-button type="danger" @click="handleDel(scope.row.id)">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                        <div class="handle-row">
                            <el-button type="danger" @click="handleAllMessage(2)">删除全部</el-button>
                        </div>
                    </template>
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
                </el-tab-pane>
                <el-tab-pane :label="`回收站(${deleteMessageNum})`" name="third">
                    <template v-if="activeName === 'third'">
                        <el-table :data="messageList" :show-header="false" style="width: 100%">
                            <el-table-column>
                                <template slot-scope="scope">
                                    <span class="message-title">{{scope.row.content}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="createTime" width="150"></el-table-column>
                            <el-table-column width="120">
                                <template slot-scope="scope">
                                    <el-button @click="handleRestore(scope.row.id)">还原</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                        <div class="handle-row">
                            <el-button type="danger" @click="handleAllMessage(3)">清空回收站</el-button>
                        </div>
                    </template>
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
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'notice',
        data() {
            return {
                activeName: 'first',
                showHeader: false,
                //消息数
                unReadMessageNum: 0,
                readMessageNum: 0,
                deleteMessageNum: 0,
                messageList: [{
                    createTime: '2018-04-19 20:00:00',
                    content: '【系统通知】该系统将于今晚凌晨2点到5点进行升级维护',
                },{
                    createTime: '2018-04-19 21:00:00',
                    content: '今晚12点整发大红包，先到先得',
                }],
                /* 分页查询条件  type=0 未读 1已读*/
                queryParam: {
                    status : 0,
                    pageIndex: 1,
                    pageSize: 10
                },
                pageCount: 1,
            }
        },
        created() {
            this.listMessage();
            //初始化显示的消息数
            this.getMessageNum(0);
            this.getMessageNum(1);
            this.getMessageNum(2);
        },
        methods: {
            /**
             * 点击切换消息标签
             */
            handleClickTab(tab, event) {
                if(tab.name == 'first'){
                    //选择未读消息标签
                    this.queryParam.status = 0;
                    this.listMessage();
                }else if(tab.name == 'second'){
                    //选择已读消息标签
                    this.queryParam.status = 1;
                    this.listMessage();
                }else if(tab.name == 'third'){
                    //选择回收站
                    this.queryParam.status = 2;
                    this.listMessage();
                }
            },

            handleRead(id) {
              let noticeIds = [];
              noticeIds.push(id);
              this.updateNoticeStatus(noticeIds,'/notice/read');
            },
            handleDel(id) {
                let noticeIds = [];
                noticeIds.push(id);
                this.updateNoticeStatus(noticeIds,'/notice/delete');
            },
            handleRestore(id) {
                let noticeIds = [];
                noticeIds.push(id);
                this.updateNoticeStatus(noticeIds,'/notice/recover');
            },
            /**
             * 批量处理消息，status=1批量已读/2批量删除/3批量清空回收站
             *
             */
            handleAllMessage(status){
                let formDate = new FormData();
                formDate.append("status",status);
                this.$axios.post(this.$requestBaseUrl.notice + '/notice/updateAll',formDate).then(resp => {
                    if(resp.data.success){
                        this.$message.success(resp.data.msg);
                        //刷新数据
                        this.listMessage();
                        //改变已读/未读/已删除数量
                        if(status == 1){
                            this.readMessageNum+= this.unReadMessageNum;
                            this.unReadMessageNum = 0;
                        }else if(status == 2) {
                            this.deleteMessageNum+=this.readMessageNum;
                            this.readMessageNum=0;
                        }else {
                            this.deleteMessageNum=0;
                        }
                    }else {
                        this.$message.warning("更改消息状态失败");
                    }
                }).catch(err=>{
                    this.$message.error("更改消息状态失败");
                })
            },

            /**
             * 获取消息List
             */
            listMessage(){
                this.$axios.get(this.$requestBaseUrl.notice + '/notice/list',{
                    params: this.queryParam
                }).then(resp => {
                    if(resp.data.success){
                      this.messageList = resp.data.data.content;
                      this.pageCount = resp.data.data.pageCount;
                    }else {
                        this.$message.warning("请求获取消息List失败");
                    }
                }).catch(err=>{
                    this.$message.error("请求获取消息List失败");
                })
            },
            // 分页导航
            handlePageChange(val) {
                this.$set(this.queryParam, 'pageIndex', val);
                this.listMessage();
            },
            toCourseList(){
                this.$router.push('/courseInfo');
                sessionStorage.setItem('selectValue','未审核');
            },
            /**
             * 统计消息数
             */
            getMessageNum(status){
                this.$axios.get(this.$requestBaseUrl.notice + '/notice/count?status=' + status)
                  .then(response => {
                      if(response.data.success) {
                          //消息数
                          if(status == 0){
                              this.unReadMessageNum = response.data.data;
                          }else if(status == 1){
                              this.readMessageNum = response.data.data;
                          }else {
                              this.deleteMessageNum = response.data.data;
                          }

                      }else {
                          this.$message.warning("统计消息总数失败");
                      }
                  })
                  .catch(function(error) {
                      this.$message.error("统计消息总数失败");
                  });


            },

            /**
             * 更改消息的状态
             * @param noticeIdList
             * @param url
             */
            updateNoticeStatus(noticeIdList,url){
                this.$axios.post(this.$requestBaseUrl.notice + url,noticeIdList).then(resp => {
                    if(resp.data.success){
                        this.$message.success(resp.data.msg);
                        //刷新数据
                        this.listMessage();
                        let status = this.queryParam.status;
                        //改变已读/未读/已删除数量
                        if(status == 0){
                            this.unReadMessageNum--;
                            this.readMessageNum++;
                        }else if(status == 1) {
                            this.readMessageNum--;
                            this.deleteMessageNum++;
                        }else {
                            this.readMessageNum++;
                            this.deleteMessageNum--;
                        }
                    }else {
                        this.$message.warning("更改消息状态失败");
                    }
                }).catch(err=>{
                    this.$message.error("更改消息状态失败");
                })
            }


        },
        computed: {
            messageListNum(){
                return this.messageList.length;
            }
        }
    }

</script>

<style>
    .message-title{
        cursor: pointer;
    }
    .handle-row{
        margin-top: 30px;
    }
</style>
