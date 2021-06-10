<template>
  <apexchart
    width="100%"
    :type="chartOptions.chart.type"
    :options="chartOptions"
    :series="series"
  ></apexchart>
</template>

<script>
import { defineComponent, ref } from 'vue'
import VueApexCharts from "vue3-apexcharts"
export default defineComponent ({
  props: {
    graphItems: {
      type: Object,
      require: true
    }
  },
  components: { apexchart: VueApexCharts, },
  data() {
    return {
      datas: [],
      chartOptions: {
        theme: {
            mode: 'dark', 
        },
        chart: {
          id: "vuechart",
          type: 'area',
          background: 'transparent',
          toolbar: {
            show: false,
          }
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => { return this.msToTime(val); }
        },
        stroke: {
          curve: 'smooth'
        },
        xaxis: {
          categories: [],
        },
        yaxis: {
          labels: {
            show: false,
            formatter: (val) => { return this.msToTime(val); }
          }
        },
        tooltip: {
        },
      },
      series: [
        { name: "Temps de jeu", data: [] },
      ],
    }
  },
  setup(props) {
    const direction = ref('horizontal')
    const margin = ref({
      left: 0,
      top: 20,
      right: 20,
      bottom: 0
    })

    return { direction, margin }
  },
  beforeMount(){
    let data = []
    let date = []
    let time = []
    this.graphItems.forEach(elem => {
      var result = this.msToTime(elem.time)
      date.push(elem.date)
      time.push(elem.time.toFixed(4))
      data.push({date: elem.date, time: result})
    })
    this.chartOptions.xaxis.categories = date
    this.series[0].data = time
    console.log(data, date, time)
    this.datas = data
  },
  methods: {
    isToday() {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      return today = dd + '/' + mm + '/' + yyyy;
    },
    msToTime(ms) {
      var milliseconds = parseInt((ms % 1000) / 100),
          seconds = Math.floor((ms / 1000) % 60),
          minutes = Math.floor((ms / (1000 * 60)) % 60),
          hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
      hours = (hours < 10) ? "0" + hours : hours;
      minutes = (minutes < 10) ? "0" + minutes : minutes;
      seconds = (seconds < 10) ? "0" + seconds : seconds;

      return hours > 0 ? hours + "h " : '' +  minutes > 0 ? minutes + "min " : '' + seconds > 0 ? seconds + 's': ''
    },
  },
})
</script>

<style lang="scss" scoped>
@import 'https://cdn.jsdelivr.net/npm/charts.css/dist/charts.min.css';
#graphPlayed {
  display: block;
  position:relative;
  height: 500px;
  max-height: max-content;
  max-width: 100%;
  margin: 55px auto;
  padding-top: 20px;
  border-top: 1px solid rgba(white, 5%);
}
.timer {
  position: absolute;
  top: -20px;
}

</style>
