<template>
  <div class="chart-wrap">
    <v-chart :option="chartOption" autoresize class="chart" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, GridComponent, LegendComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent])

const props = defineProps({
  data: { type: Array, default: () => [] }, // [{time, count}] 或 [{timestamp, cpu, memory}]
  mode: { type: String, default: 'online' } // 'online' | 'resource'
})

const chartOption = computed(() => {
  if (props.mode === 'resource') {
    // 服务器资源时序图
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: '#0d1220', borderColor: 'rgba(99,102,241,0.3)', textStyle: { color: '#e2e8f0' } },
      legend: { data: ['CPU%', '内存%'], textStyle: { color: '#94a3b8' }, top: 4 },
      grid: { left: 10, right: 10, top: 36, bottom: 4, containLabel: true },
      xAxis: {
        type: 'category',
        data: props.data.map(d => d.timestamp),
        axisLine: { lineStyle: { color: 'rgba(99,102,241,0.2)' } },
        axisLabel: { color: '#475569', fontSize: 10 },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 0, max: 100,
        axisLabel: { color: '#475569', fontSize: 10, formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(99,102,241,0.08)' } }
      },
      series: [
        {
          name: 'CPU%',
          type: 'line',
          data: props.data.map(d => d.cpu),
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#6366f1', width: 2 },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(99,102,241,0.3)' }, { offset: 1, color: 'rgba(99,102,241,0)' }] } }
        },
        {
          name: '内存%',
          type: 'line',
          data: props.data.map(d => d.memory),
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#10b981', width: 2 },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16,185,129,0.2)' }, { offset: 1, color: 'rgba(16,185,129,0)' }] } }
        }
      ]
    }
  }

  // 在线数量折线图
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#0d1220', borderColor: 'rgba(99,102,241,0.3)', textStyle: { color: '#e2e8f0' }, formatter: '{b}<br/>在线服务器: <b>{c}</b>' },
    grid: { left: 10, right: 10, top: 10, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category',
      data: props.data.map(d => d.time),
      axisLine: { lineStyle: { color: 'rgba(99,102,241,0.2)' } },
      axisLabel: { color: '#475569', fontSize: 10, interval: 'auto' },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: '#475569', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(99,102,241,0.08)' } }
    },
    series: [{
      type: 'line',
      data: props.data.map(d => d.count),
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#38bdf8', width: 2.5 },
      itemStyle: { color: '#38bdf8' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(56,189,248,0.3)' }, { offset: 1, color: 'rgba(56,189,248,0)' }]
        }
      }
    }]
  }
})
</script>

<style scoped>
.chart-wrap {
  width: 100%;
  height: 100%;
}
.chart {
  width: 100%;
  height: 100%;
}
</style>
