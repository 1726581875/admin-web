<template>
    <div class="">
        <div class="container">
            <el-tabs v-model="activeName" @tab-click="handleClickTab">
                <el-tab-pane :label="`未读消息(${unReadMessageNum})`" name="first">
                    <el-table :data="messageList" :show-header="false" style="width: 100%">
                        <el-table-column>
                            <template slot-scope="scope">
                                <!-- 消息类型,1新增课程，2课程提问，3评论回复，4、系统通知, 5已回复, 6下线通知 -->
                                <div v-if="scope.row.type == 1">
                                    <a @click="toCourseList"><span class="message-title">{{scope.row.content}}</span></a>
                                </div>
                                <div v-if="scope.row.type == 2">
                                    <span class="mes sage-title">{{scope.row.content}}</span>
                                </div>
                                <div v-if="scope.row.type == 3">
                                    <span class="mes sage-title">{{scope.row.content}}</span>
                                </div>
                                <dev v-if="scope.row.type == 4">
                                    <span class="mes sage-title">{{scope.row.content}}</span>
                                </dev>
                            </template>
                        </el-table-column>
                        <el-table-column prop="createTime" width="180"></el-table-column>
                        <el-table-column width="200">
                            <template slot-scope="scope">
                                <el-button size="mini" v-if="scope.row.type == 1" @click="toCourseList" >查看</el-button>
                                <el-button size="mini" v-if="scope.row.type == 2" @click="handleReply(scope.row)" >回复</el-button>
                                <el-button size="mini" v-if="scope.row.type == 3" @click="handleReply(scope.row)" >回复</el-button>
                                <el-button size="mini" @click="handleRead(scope.row.id)">标为已读</el-button>
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
        <!-- ==========================【消息回复】 弹出框=======================   -->
        <el-dialog title="消息回复" :visible.sync="replyVisible" width="40%">
            <el-form ref="reply" :model="reply" label-width="70px">
                <el-form-item label="课程:">
                    {{replyMessage.courseName}}
                </el-form-item>
                <el-form-item label="用户:">
                    {{replyMessage.fromUserName}}
                </el-form-item>
                <el-form-item label="内容:">
                    {{replyMessage.replyContent}}
                </el-form-item>
                <el-form-item label="回复:">
                    <el-input
                      type="textarea"
                      :autosize="{ minRows: 2, maxRows: 4}"
                      placeholder="请输入内容"
                      v-model="reply.content">
                    </el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="toReply">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'Notice',
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
                    pageSize: 7
                },
                pageCount: 1,
                //是否显示回复框
                replyVisible: false,
                //回复消息展示
                replyMessage:{
                    courseName: '《SpringCloud在线教学》',
                    fromUserName: '啊啊啊',
                    replyContent: '你好啊。。'
                },
                //回复对象，插入数据库
                reply:{
                    courseId: null,
                    commentId: '',
                    replyId: '',
                    userId: null,
                    toUserId: null,
                    type: null,
                    content:'',
                }
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
                sessionStorage.setItem('selectValue','未审核');
                this.$router.push('/courseInfo');
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
            },
            /**
             * 点击回复按钮
             * @param row
             */
            handleReply(row) {
                this.reply.content = '';
                let replyMessage = row;

                if(replyMessage.flag === 2){
                    //如果是课程评论
                    this.reply.commentId = replyMessage.commentId;
                    console.log('课程评论=' + replyMessage.commentId)
                }else if(replyMessage.flag === 3){
                    //如果是回复
                    this.reply.replyId = replyMessage.replyId;
                    console.log('课程回复=' + replyMessage.replyId)
                }
                //设置参数
                this.reply.courseId = replyMessage.courseId;
                this.reply.userId = replyMessage.acceptId;
                this.reply.toUserId = replyMessage.sendId;
                this.reply.type = 0;
                //查询评论详情
                this.getReplyDetail(replyMessage.id);
                //为对象分配一个新地址，改变也不影响原来的值
/*                let newCategory = JSON.parse(JSON.stringify(row));
                this.category = newCategory;*/
                // 展示编辑框
                this.replyVisible = true;
            },
            /**
             * id 对应回复id或者commentId
             * flag=1是commentId，flag=2是reply
             */
            toReply(){
                this.$axios.post(this.$requestBaseUrl.core + '/comment/insert',{},{
                    params: this.reply
                }).then(resp=>{
                    if(resp.data.success){
                        this.$message.success("回复评论成功");
                        this.replyVisible = false;
                    }else {
                        this.$message.warning("回复评论失败");
                    }
                }).catch(error=>{
                   this.$message.error("回复评论失败");
                });
            },
            getReplyDetail(id){
                this.$axios.get(this.$requestBaseUrl.notice + '/notice/reply/detail?id=' + id)
                  .then(response => {
                      if(response.data.success) {
                        this.replyMessage = response.data.data;
                      }else {
                          this.$message.warning("统计消息总数失败");
                      }
                  })
                  .catch(function(error) {
                      this.$message.error("统计消息总数失败");
                  });
            },

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
