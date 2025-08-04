/**
 * Performance Dashboard Component
 * Displays Core Web Vitals and performance metrics for monitoring
 */
'use client'

import { useState, useEffect } from 'react'
import { Activity, Clock, Zap, Eye, Wifi, TrendingUp, TrendingDown } from 'lucide-react'

interface WebVitalStats {
  avg: number
  min: number
  max: number
  p50: number
  p75: number
  p95: number
  good: number
  needsImprovement: number
  poor: number
}

interface MetricData {
  name: string
  stats: WebVitalStats
  threshold: { good: number; poor: number }
  unit: string
  icon: React.ReactNode
  description: string
}

const VITALS_CONFIG = {
  LCP: {
    icon: <Eye className="h-4 w-4" />,
    description: 'Largest Contentful Paint',
    threshold: { good: 2500, poor: 4000 },
    unit: 'ms'
  },
  INP: {
    icon: <Zap className="h-4 w-4" />,
    description: 'Interaction to Next Paint',
    threshold: { good: 200, poor: 500 },
    unit: 'ms'
  },
  CLS: {
    icon: <Activity className="h-4 w-4" />,
    description: 'Cumulative Layout Shift',
    threshold: { good: 0.1, poor: 0.25 },
    unit: ''
  },
  FCP: {
    icon: <Clock className="h-4 w-4" />,
    description: 'First Contentful Paint',
    threshold: { good: 1800, poor: 3000 },
    unit: 'ms'
  },
  TTFB: {
    icon: <Wifi className="h-4 w-4" />,
    description: 'Time to First Byte',
    threshold: { good: 800, poor: 1800 },
    unit: 'ms'
  }
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMetrics()
  }, [timeRange])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/vitals?timeRange=${timeRange}`)
      if (!response.ok) {
        throw new Error('Failed to load metrics')
      }

      const data = await response.json()
      
      // Group metrics by name and calculate stats
      const groupedMetrics: Record<string, any[]> = {}
      data.metrics.forEach((metric: any) => {
        if (!groupedMetrics[metric.name]) {
          groupedMetrics[metric.name] = []
        }
        groupedMetrics[metric.name].push(metric)
      })

      // Create metric data with stats
      const metricsData: MetricData[] = Object.entries(VITALS_CONFIG).map(([name, config]) => {
        const metricData = groupedMetrics[name] || []
        const stats = calculateStats(metricData)
        
        return {
          name,
          stats,
          threshold: config.threshold,
          unit: config.unit,
          icon: config.icon,
          description: config.description
        }
      })

      setMetrics(metricsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: any[]): WebVitalStats => {
    if (data.length === 0) {
      return {
        avg: 0, min: 0, max: 0, p50: 0, p75: 0, p95: 0,
        good: 0, needsImprovement: 0, poor: 0
      }
    }

    const values = data.map(d => d.value).sort((a, b) => a - b)
    const ratings = data.reduce((acc, d) => {
      acc[d.rating === 'good' ? 'good' : d.rating === 'needs-improvement' ? 'needsImprovement' : 'poor']++
      return acc
    }, { good: 0, needsImprovement: 0, poor: 0 })

    return {
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: values[0],
      max: values[values.length - 1],
      p50: values[Math.floor(values.length * 0.5)],
      p75: values[Math.floor(values.length * 0.75)],
      p95: values[Math.floor(values.length * 0.95)],
      ...ratings
    }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === '') return value.toFixed(3)
    return `${Math.round(value)}${unit}`
  }

  const getRatingColor = (value: number, threshold: { good: number; poor: number }) => {
    if (value <= threshold.good) return 'text-green-600 bg-green-50 border-green-200'
    if (value <= threshold.poor) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreColor = (good: number, total: number) => {
    if (total === 0) return 'text-gray-500'
    const percentage = (good / total) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 75) return 'text-amber-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-coffee-100">
        <div className="animate-pulse">
          <div className="h-6 bg-coffee-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-coffee-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-coffee-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-coffee-800 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Core Web Vitals
          </h2>
          <p className="text-coffee-600 text-sm mt-1">
            Real user performance metrics
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {['1h', '24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-coffee-600 text-white'
                  : 'bg-coffee-100 text-coffee-600 hover:bg-coffee-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 text-sm">⚠️ {error}</p>
          <button
            onClick={loadMetrics}
            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const total = metric.stats.good + metric.stats.needsImprovement + metric.stats.poor
          const goodPercentage = total > 0 ? (metric.stats.good / total) * 100 : 0

          return (
            <div
              key={metric.name}
              className="bg-white rounded-xl p-4 border border-coffee-100 hover:shadow-md transition-shadow"
            >
              {/* Metric Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span className="font-bold text-coffee-800">{metric.name}</span>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full border ${
                  getRatingColor(metric.stats.p75, metric.threshold)
                }`}>
                  P75
                </div>
              </div>

              {/* Description */}
              <p className="text-coffee-600 text-xs mb-3">{metric.description}</p>

              {/* Main Value */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className={`text-2xl font-bold ${
                  getRatingColor(metric.stats.p75, metric.threshold).split(' ')[0]
                }`}>
                  {formatValue(metric.stats.p75, metric.unit)}
                </span>
                {metric.stats.avg > 0 && (
                  <span className="text-coffee-500 text-sm">
                    avg {formatValue(metric.stats.avg, metric.unit)}
                  </span>
                )}
              </div>

              {/* Score */}
              {total > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${getScoreColor(metric.stats.good, total)}`}>
                      {goodPercentage.toFixed(1)}% Good
                    </span>
                    {goodPercentage >= 90 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : goodPercentage < 75 ? (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    ) : null}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goodPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stats */}
              {total > 0 && (
                <div className="text-xs text-coffee-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Min/Max:</span>
                    <span>{formatValue(metric.stats.min, metric.unit)} - {formatValue(metric.stats.max, metric.unit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samples:</span>
                    <span>{total}</span>
                  </div>
                </div>
              )}

              {/* No Data */}
              {total === 0 && (
                <div className="text-center py-4">
                  <p className="text-coffee-400 text-sm">No data available</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {metrics.length > 0 && (
        <div className="mt-6 p-4 bg-coffee-50 rounded-xl border border-coffee-200">
          <h3 className="font-semibold text-coffee-800 mb-2">Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-coffee-600">Total Samples:</span>
              <span className="ml-2 font-medium text-coffee-800">
                {metrics.reduce((sum, m) => sum + m.stats.good + m.stats.needsImprovement + m.stats.poor, 0)}
              </span>
            </div>
            <div>
              <span className="text-coffee-600">Time Range:</span>
              <span className="ml-2 font-medium text-coffee-800">{timeRange}</span>
            </div>
            <div>
              <span className="text-coffee-600">Last Updated:</span>
              <span className="ml-2 font-medium text-coffee-800">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div>
              <button
                onClick={loadMetrics}
                className="text-coffee-600 hover:text-coffee-700 font-medium"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}