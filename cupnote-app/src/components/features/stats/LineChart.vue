<template>
  <div class="line-chart-container">
    <canvas :id="chartId" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const props = defineProps({
  chartId: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  width: {
    type: Number,
    default: 400,
  },
  height: {
    type: Number,
    default: 200,
  },
})

let chart = null

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(124, 88, 66, 0.9)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#7C5842',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        title: function (context) {
          return context[0].label
        },
        label: function (context) {
          return `점수: ${context.parsed.y}점`
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
      },
      ticks: {
        color: '#A0796A',
        font: {
          size: 12,
        },
      },
    },
    y: {
      display: true,
      min: 0,
      max: 100,
      grid: {
        color: 'rgba(160, 121, 106, 0.1)',
        drawBorder: false,
      },
      ticks: {
        color: '#A0796A',
        font: {
          size: 12,
        },
        callback: function (value) {
          return value + '점'
        },
      },
    },
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 3,
      borderColor: '#7C5842',
      backgroundColor: 'rgba(124, 88, 66, 0.1)',
      fill: true,
    },
    point: {
      radius: 6,
      hoverRadius: 8,
      backgroundColor: '#7C5842',
      borderColor: '#fff',
      borderWidth: 2,
      hoverBackgroundColor: '#5D3F2E',
      hoverBorderColor: '#fff',
      hoverBorderWidth: 3,
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
  animation: {
    duration: 1000,
    easing: 'easeOutQuart',
  },
}

const initChart = async () => {
  await nextTick()

  const canvas = document.getElementById(props.chartId)
  if (!canvas) return

  const ctx = canvas.getContext('2d')

  if (chart) {
    chart.destroy()
  }

  const mergedOptions = {
    ...defaultOptions,
    ...props.options,
  }

  chart = new ChartJS(ctx, {
    type: 'line',
    data: props.data,
    options: mergedOptions,
  })
}

const updateChart = () => {
  if (chart) {
    chart.data = props.data
    chart.update('none')
  }
}

// Watch for data changes
watch(
  () => props.data,
  () => {
    updateChart()
  },
  { deep: true },
)

// Watch for options changes
watch(
  () => props.options,
  () => {
    initChart()
  },
  { deep: true },
)

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>

<style scoped>
.line-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>
