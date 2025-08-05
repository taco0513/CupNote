/**
 * AppHeader Logo Component
 */
'use client'

import { Coffee } from 'lucide-react'

export default function AppHeaderLogo() {
  return (
    <div className="flex items-center space-x-3 flex-1">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-accent-warm to-neutral-600 rounded-lg flex items-center justify-center">
          <Coffee className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-coffee-600 to-coffee-800 bg-clip-text text-transparent">
          CupNote
        </span>
      </div>
    </div>
  )
}