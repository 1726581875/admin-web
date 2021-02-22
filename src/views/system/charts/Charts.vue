<template>
    <div style="float: left">
        <div id="main1" style="width: 600px;height:300px; float: left"></div>
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

                //饼图，分类占比
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
            }

        },
        mounted() {
            this.myEcharts();
            //初始化分类占比数据，饼图
            this.getCountClassification();
        }
    }
</script>

<style>

</style>