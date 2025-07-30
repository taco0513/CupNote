<template>
  <div class="bar-chart-container">
    <canvas :id="chartId" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  chartId: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  },
  width: {
    type: Number,
    default: 400
  },
  height: {
    type: Number,
    default: 200
  }
})

let chart = null

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
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
        title: function(context) {
          return context[0].label
        },
        label: function(context) {
          return `${context.parsed.y}회`
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false
      },
      ticks: {
        color: '#A0796A',
        font: {
          size: 12
        }
      }
    },
    y: {
      display: true,
      beginAtZero: true,
      grid: {
        color: 'rgba(160, 121, 106, 0.1)',
        drawBorder: false
      },
      ticks: {
        color: '#A0796A',
        font: {
          size: 12
        },
        stepSize: 1,
        callback: function(value) {
          return value + '회'
        }
      }
    }
  },
  elements: {
    bar: {
      borderRadius: {
        topLeft: 4,
        topRight: 4,
        bottomLeft: 0,
        bottomRight: 0
      },
      borderSkipped: false
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeOutQuart'
  }
}

const processData = (data) => {
  return {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || 'rgba(124, 88, 66, 0.8)',
      borderColor: dataset.borderColor || '#7C5842',
      borderWidth: dataset.borderWidth || 1,
      hoverBackgroundColor: dataset.hoverBackgroundColor || 'rgba(124, 88, 66, 1)',
      hoverBorderColor: dataset.hoverBorderColor || '#5D3F2E',
      hoverBorderWidth: dataset.hoverBorderWidth || 2
    }))
  }
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
    ...props.options
  }
  
  chart = new ChartJS(ctx, {
    type: 'bar',
    data: processData(props.data),
    options: mergedOptions
  })
}

const updateChart = () => {
  if (chart) {
    chart.data = processData(props.data)
    chart.update('none')
  }
}

// Watch for data changes
watch(() => props.data, () => {
  updateChart()
}, { deep: true })

// Watch for options changes
watch(() => props.options, () => {
  initChart()
}, { deep: true })

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
.bar-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>