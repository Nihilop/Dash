<template>
  <Bar :data="datas" :options="datas.options" />
</template>
<script>
import { defineComponent, ref } from 'vue'
import _ from 'lodash'

export default defineComponent ({
  props: {
    graphItems: {
      type: Object,
      require: true
    }
  },
  data() {
    return {
      datas: {
        type: 'Bar',
        labels: [],
        datasets: [],
        options: { 
          scales: { 
            yAxes: { 
              type: 'time', 
              time: {
                tooltipFormat: 'mm:ss.SSS',
                //round: 'hour',
                // displayFormats: {
                //   millisecond: 'HH:mm:ss',
                //   second: 'mm:ss',
                //   minute: 'mm:ss',
                //   hour: 'HH:mm:ss'
                // }
              },
            }
          }
        }
      }
    }
  },
  mounted(){
    let names = []
    let val = []
    this.graphItems.forEach(elem => {
      console.log(elem.analytic.stat)
      names.push(elem.name)
      val.push(elem.analytic.played)
    })
    console.log(val)
    let result = { data: val}
    this.datas.labels = names
    this.datas.datasets = [{ data: val, backgroundColor: 'white' }]
  },
  methods: {
    msToTime(ms) {
      var milliseconds = parseInt((ms % 1000) / 100),
          seconds = (ms / 1000) % 60,
          minutes = (ms / (1000 * 60)) % 60,
          hours =(ms / (1000 * 60 * 60)) % 24;

      return minutes
    },
    msToTimeConvertor(ms) {
      var milliseconds = parseInt((ms % 1000) / 100),
          seconds = Math.floor((ms / 1000) % 60),
          minutes = Math.floor((ms / (1000 * 60)) % 60),
          hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

      hours = (hours < 10) ? hours : hours;
      minutes = (minutes < 10) ? minutes : minutes;
      seconds = (seconds < 10) ? seconds : seconds;

      return hours > 0 ? hours : '' +  minutes > 0 ? minutes : ''
    },
  },
})
</script>

<style lang="scss" scoped>
@import 'https://cdn.jsdelivr.net/npm/charts.css/dist/charts.min.css';
#graphPlayed {
  display: block;
  position:relative;
  height: auto;
  max-height: max-content;
  max-width: 100%;
  margin: 55px auto;
  padding-top: 20px;
  border-top: 1px solid rgba(white, 5%);
}
</style>
