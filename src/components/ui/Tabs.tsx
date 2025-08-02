/**
 * Unified Tabs Component
 * 탭 인터페이스에 일관된 스타일을 제공합니다
 */
'use client'

import { ReactNode, useState } from 'react'

interface Tab {
  id: string
  label: string
  content: ReactNode
  icon?: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  className?: string
  variant?: 'default' | 'pills' | 'underline'
  size?: 'small' | 'medium' | 'large'
}

export default function Tabs({
  tabs,
  defaultTab,
  className = '',
  variant = 'default',
  size = 'medium'
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const variantStyles = {
    default: {
      container: 'border-b border-coffee-200/50',
      tab: 'border-b-2 border-transparent',
      activeTab: 'border-coffee-500 text-coffee-700'
    },
    pills: {
      container: 'bg-white/70 backdrop-blur-sm p-1 rounded-xl border border-coffee-200/30 shadow-sm',
      tab: 'rounded-xl transition-all duration-200',
      activeTab: 'bg-coffee-500 text-white shadow-md hover:shadow-lg'
    },
    underline: {
      container: '',
      tab: 'relative',
      activeTab: 'text-coffee-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-coffee-500'
    }
  }

  const sizeStyles = {
    small: 'text-sm px-3 py-1.5',
    medium: 'text-base px-4 py-2',
    large: 'text-lg px-6 py-3'
  }

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={`flex ${variantStyles[variant].container}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center space-x-2
              font-medium transition-all duration-200
              ${sizeStyles[size]}
              ${variantStyles[variant].tab}
              ${activeTab === tab.id 
                ? variantStyles[variant].activeTab 
                : 'text-coffee-600 hover:text-coffee-800 hover:bg-white/50'
              }
            `}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTabContent}
      </div>
    </div>
  )
}