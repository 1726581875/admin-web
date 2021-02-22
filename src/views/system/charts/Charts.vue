<template>
    <div style="float: left">
        <div id="main1" style="width: 500px;height:300px; float: left"></div>
        <div id="main2" style="width: 500px;height:300px;float: left"></div>
        <div id="main3" style="width: 500px;height:300px;float: left"></div>
        <div id="main4" style="width: 500px;height:300px;float: left"></div>
    </div>
</template>

<script>
    export default {
        name: 'Charts',
        data(){
            return {
                //图表1 柱状图，新增课程数
                courseDate:['01-01','01-02','01-03','01-04','01-05','01-06','01-07'],
                courseAmount:[1,5,6,7,2,0,4],
                courseAmountMax: 8,
                //图表2 饼图，分类占比
                classificationRatio : [
                    {name: '分类1', value: 1},
                    {name: '分类2', value: 1},
                    {name: '分类3', value: 1}
                ]
            }
        },
        methods:{
            myEcharts(){
                // 1、柱状图
                // 基于准备好的dom，初始化echarts实例
                let myChart1 = this.$echarts.init(document.getElementById('main1'));
                // 指定图表的配置项和数据
               let option1 = {
                    color: ['#3398DB'],
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            axisTick: {
                                alignWithLabel: true
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    series: [
                        {
                            name: '直接访问',
                            type: 'bar',
                            barWidth: '60%',
                            data: [10, 52, 200, 334, 390, 330, 220]
                        }
                    ]
                };
                // 使用刚指定的配置项和数据显示图表。
                myChart1.setOption(option1);
//===============================================================================
                // 2、饼图
                // 绘制图表。
                this.$echarts.init(document.getElementById('main2')).setOption({
                    series: {
                        type: 'pie',
                        data: this.classificationRatio
                    }
                });
//===============================================================================
               // 3、折线图
                let myChart3 = this.$echarts.init(document.getElementById('main3'));
               let option3 = {
                    xAxis: {
                        type: 'category',
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                        data: [820, 932, 901, 934, 1290, 1330, 1320],
                        type: 'line'
                    }]
                };
                myChart3.setOption(option3);

//===============================================================================
                let myChart4 = this.$echarts.init(document.getElementById('main4'));
                // 4、三条折线图
                let option4 = {
                    title: {
                        text: '对数轴示例',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b} : {c}'
                    },
                    legend: {
                        left: 'left',
                        data: ['2的指数', '3的指数']
                    },
                    xAxis: {
                        type: 'category',
                        name: 'x',
                        splitLine: {show: false},
                        data: ['一', '二', '三', '四', '五', '六', '七', '八', '九']
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    yAxis: {
                        type: 'log',
                        name: 'y',
                        minorTick: {
                            show: true
                        },
                        minorSplitLine: {
                            show: true
                        }
                    },
                    series: [
                        {
                            name: '3的指数',
                            type: 'line',
                            data: [1, 3, 9, 27, 81, 247, 741, 2223, 6669]
                        },
                        {
                            name: '2的指数',
                            type: 'line',
                            data: [1, 2, 4, 8, 16, 32, 64, 128, 256]
                        },
                        {
                            name: '1/2的指数',
                            type: 'line',
                            data: [1/2, 1/4, 1/8, 1/16, 1/32, 1/64, 1/128, 1/256, 1/512]
                        }
                    ]
                };
                myChart4.setOption(option4);
            },

            initCountClassificationChart(){
                // 2、饼图
                // 绘制图表。
                this.$echarts.init(document.getElementById('main2')).setOption({
                    series: {
                        type: 'pie',
                        data: this.classificationRatio
                    }
                });
            },

            getCountClassification(){
                this.$axios.get(this.$requestBaseUrl.statistics + '/statistics/classification')
                  .then(resp=>{
                    if(resp.data.success){
                        this.classificationRatio = resp.data.data;
                        //加载饼图
                        this.initCountClassificationChart();
                    }else {
                        this.$message.warning("获取分类统计失败");
                    }
                }).catch(err=>this.$message.error("获取分类统计失败"));
            },

            /**
             * ====================================================图表1 柱状图================================
             * 获取数据，加载生成图表
             * =============================================================================================
             */
            getNewAddCourseNum(){
                this.$axios.get(this.$requestBaseUrl.statistics + '/monitor/countNewCourse?type=month')
                  .then(res => {
                      let respResult = res.data;
                      if(respResult.success){
                          // 结果转换成map
                          const dateMap = new Map(Object.entries(respResult.data));
                          // 获取key和vale 数组
                          let dateArr = [];
                          let amountArr = [];
                          let maxValue = 1;
                          dateMap.forEach((v,k) => {
                              dateArr.push(k);
                              amountArr.push(v);
                              if(v > maxValue){
                                  maxValue = v;
                              }
                          });
                          // 赋值给图表对应数据
                          this.courseDate = dateArr;
                          this.courseAmount = amountArr;
                          this.courseAmountMax = maxValue + 1;
                          // 重新加载图表
                          this.initCurseAmountChart();
                      }else {
                          this.$message.warning("加载系统登录人数异常，请刷新看看。");
                      }
                  }).catch(err=>{
                    this.$message.error("加载图表发生内部错误，请刷新看看。")
                });

            },
            /**
             * 加载生成新增课程数量图表
             */
            initCurseAmountChart() {
                let courseChart = this.$echarts.init(document.getElementById('main1'));
                // 指定图表的配置项和数据
                let courseOption = {
                    title: {
                        text: '近一周新增课程',
                        textStyle:{
                            //文字颜色
                            color:'#000',
                            //字体风格,'normal','italic','oblique'
                            fontStyle:'normal',
                            //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
                            fontWeight:'bold',
                            //字体系列
                            fontFamily:'sans-serif',
                            //字体大小
                            fontSize:12
                        }
                    },
                    color: ['#3398DB'],
                    grid: {
                        top: '3%',
                        left: '2%',
                        bottom: 0,
                        containLabel: true
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: this.courseDate,
                            axisTick: {
                                alignWithLabel: true
                            }
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            // 最小单位是1
                            minInterval: 1,
                            max: this.courseAmountMax
                        }
                    ],
                    series: [
                        {
                            name: '新增课程数',
                            type: 'bar',
                            barWidth: '60%',
                            data: this.courseAmount
                        }
                    ]
                };
                // 使用刚指定的配置项和数据显示图表。
                courseChart.setOption(courseOption);
            },

        },
        mounted() {
            this.myEcharts();
            //初始化新增课程数据，柱状图，图1
            this.getNewAddCourseNum();
            //初始化分类占比数据，饼图，图2
            this.getCountClassification();
        }
    }
</script>

<style>

</style>