<template>
  <div class="doughnut-chart-container">
    <canvas :id="chartId" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

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
    default: 300,
  },
  height: {
    type: Number,
    default: 300,
  },
})

let chart = null

const coffeeColors = [
  '#7C5842', // Main coffee brown
  '#A0796A', // Light coffee brown
  '#D4B896', // Cream
  '#E8D5C4', // Light cream
  '#F0E8DC', // Very light cream
  '#B8860B', // Dark golden
  '#CD853F', // Peru
  '#DEB887', // Burlywood
  '#F5DEB3', // Wheat
  '#FAEBD7', // Antique white
  '#8B4513', // Saddle brown
  '#A0522D', // Sienna
]

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#7C5842',
        font: {
          size: 12,
          weight: '500',
        },
        padding: 15,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(124, 88, 66, 0.9)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#7C5842',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        title: () => null,
        label: function (context) {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = Math.round((value / total) * 100)
          return `${label}: ${value}회 (${percentage}%)`
        },
      },
    },
  },
  cutout: '50%',
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 1000,
    easing: 'easeOutQuart',
  },
  elements: {
    arc: {
      borderWidth: 2,
      borderColor: '#fff',
      hoverBorderWidth: 3,
      hoverBorderColor: '#fff',
    },
  },
}

const processData = (data) => {
  return {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || coffeeColors,
      hoverBackgroundColor:
        dataset.hoverBackgroundColor ||
        coffeeColors.map(
          (color) => color + 'CC', // Add transparency on hover
        ),
    })),
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
    ...props.options,
  }

  chart = new ChartJS(ctx, {
    type: 'doughnut',
    data: processData(props.data),
    options: mergedOptions,
  })
}

const updateChart = () => {
  if (chart) {
    chart.data = processData(props.data)
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
.doughnut-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>
