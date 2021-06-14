<template>
  <div
    id="clock"
  >
    <n-text depth="1"
      v-if="activeTime"
      class="time"
    >
      {{ time }}
    </n-text>
    <n-text strong depth="3"
      v-if="activeDate"
      class="date"
    >
      {{ date }}
    </n-text>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { NText } from "naive-ui"
var week = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
export default defineComponent({
  name: 'Clock',
  components: {
    NText,
  },
  props: {
    activeTime: { type: Boolean, default: true },
    activeDate: { type: Boolean, default: true }
  },
  data () {
    return {
      time: '',
      date: ''
    }
  },
  mounted () {
    this.updateTime()
    setInterval(this.updateTime, 1000)
  },
  methods: {
    updateTime () {
      var cd = new Date()
      this.time = this.zeroPadding(cd.getHours(), 2) + ':' + this.zeroPadding(cd.getMinutes(), 2) + ':' + this.zeroPadding(cd.getSeconds(), 2)
      this.date = week[cd.getDay()] + ' ' + this.zeroPadding(cd.getDate(), 2) + '/' + this.zeroPadding(cd.getMonth() + 1, 2) + '/' + this.zeroPadding(cd.getFullYear(), 4)
    },
    zeroPadding (num, digit) {
      var zero = ''
      for (var i = 0; i < digit; i++) {
        zero += '0'
      }
      return (zero + num).slice(-digit)
    }
  }

})
</script>
<style lang="scss" scoped>
</style>
