/**
 * Core Web Vitals API Endpoint
 * Collects and stores performance metrics for analysis and monitoring
 */
import { NextRequest, NextResponse } from 'next/server'

interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
  label: string
  timestamp: number
  url: string
  userAgent: string
}

// In production, you'd want to store these in a database or analytics service
const metrics: WebVitalMetric[] = []

export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalMetric = await request.json()
    
    // Validate the metric data
    if (!isValidMetric(metric)) {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      )
    }

    // Store the metric (in production, use database/analytics service)
    metrics.push(metric)
    
    // Log metric for development
    if (process.env.NODE_ENV === 'development') {
    }

    // Send to external analytics services if configured
    await Promise.all([
      sendToGoogleAnalytics(metric),
      sendToSentry(metric),
      sendToCustomAnalytics(metric)
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Web Vitals API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric')
    const timeRange = searchParams.get('timeRange') || '24h'
    
    // Calculate time range
    const now = Date.now()
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }
    
    const rangeMs = ranges[timeRange as keyof typeof ranges] || ranges['24h']
    const startTime = now - rangeMs
    
    // Filter metrics
    let filteredMetrics = metrics.filter(m => m.timestamp >= startTime)
    
    if (metric) {
      filteredMetrics = filteredMetrics.filter(m => m.name === metric)
    }

    // Calculate statistics
    const stats = calculateMetricStats(filteredMetrics)
    
    return NextResponse.json({
      metrics: filteredMetrics,
      stats,
      timeRange,
      count: filteredMetrics.length
    })
  } catch (error) {
    console.error('Web Vitals GET API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

function isValidMetric(metric: any): metric is WebVitalMetric {
  return (
    metric &&
    typeof metric.name === 'string' &&
    typeof metric.value === 'number' &&
    typeof metric.rating === 'string' &&
    typeof metric.id === 'string' &&
    typeof metric.label === 'string' &&
    typeof metric.timestamp === 'number' &&
    typeof metric.url === 'string' &&
    typeof metric.userAgent === 'string'
  )
}

function calculateMetricStats(metrics: WebVitalMetric[]) {
  if (metrics.length === 0) {
    return {
      avg: 0,
      min: 0,
      max: 0,
      p50: 0,
      p75: 0,
      p95: 0,
      good: 0,
      needsImprovement: 0,
      poor: 0
    }
  }

  const values = metrics.map(m => m.value).sort((a, b) => a - b)
  const ratings = metrics.reduce((acc, m) => {
    acc[m.rating === 'good' ? 'good' : m.rating === 'needs-improvement' ? 'needsImprovement' : 'poor']++
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

async function sendToGoogleAnalytics(metric: WebVitalMetric) {
  // Skip if GA not configured
  if (!process.env.NEXT_PUBLIC_GA_ID) return

  try {
    // In client-side code, this would use gtag
    // Here we could use Measurement Protocol
    const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.NEXT_PUBLIC_GA_ID}&api_secret=${process.env.GA_API_SECRET}`
    
    if (process.env.GA_API_SECRET) {
      await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          client_id: 'server-side-client',
          events: [{
            name: 'web_vital',
            parameters: {
              metric_name: metric.name,
              metric_value: metric.value,
              metric_rating: metric.rating,
              page_location: metric.url
            }
          }]
        })
      })
    }
  } catch (error) {
    // Silently fail for analytics
  }
}

async function sendToSentry(metric: WebVitalMetric) {
  // Skip if Sentry not configured
  if (!process.env.SENTRY_DSN) return

  try {
    // This would typically be handled by the Sentry SDK on the client
    // Here we're just demonstrating the concept
  } catch (error) {
    // Silently fail for analytics
  }
}

async function sendToCustomAnalytics(metric: WebVitalMetric) {
  // Custom analytics endpoint if configured
  const customEndpoint = process.env.CUSTOM_ANALYTICS_ENDPOINT
  
  if (!customEndpoint) return

  try {
    await fetch(customEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CUSTOM_ANALYTICS_TOKEN}`
      },
      body: JSON.stringify({
        ...metric,
        app: 'cupnote',
        environment: process.env.NODE_ENV
      })
    })
  } catch (error) {
    // Silently fail for analytics
  }
}