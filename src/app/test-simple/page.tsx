/**
 * Simple test page to verify basic functionality
 */
'use client'

import { ResponsiveProvider, useResponsive } from '../../contexts/ResponsiveContext'

function SimpleTest() {
  const { deviceType, breakpoint, width, height } = useResponsive()
  
  return (
    <div className="min-h-screen bg-coffee-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-coffee-800">
          🧪 Simple Responsive Test
        </h1>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-coffee-200">
          <h2 className="text-xl font-semibold mb-4">Current State:</h2>
          <div className="space-y-2">
            <p><strong>Device Type:</strong> {deviceType}</p>
            <p><strong>Breakpoint:</strong> {breakpoint}</p>
            <p><strong>Width:</strong> {width}px</p>
            <p><strong>Height:</strong> {height}px</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-coffee-600">
            ✅ ResponsiveContext is working correctly!
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TestSimplePage() {
  return (
    <ResponsiveProvider>
      <SimpleTest />
    </ResponsiveProvider>
  )
}