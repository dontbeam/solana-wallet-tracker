'use client'

import { FiHome, FiActivity, FiBell, FiBarChart2 } from 'react-icons/fi'

interface SidebarProps {
  activeView: string
  setActiveView: (view: 'wallets' | 'activity' | 'alerts' | 'charts') => void
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const menuItems = [
    { id: 'wallets', label: 'Wallets', icon: FiHome },
    { id: 'activity', label: 'Activity', icon: FiActivity },
    { id: 'alerts', label: 'Alerts', icon: FiBell },
    { id: 'charts', label: 'Analytics', icon: FiBarChart2 },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-solana-green rounded-full animate-pulse-slow" />
          Wallet Tracker
        </h2>
      </div>
      
      <nav className="px-4 pb-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors
                ${activeView === item.id
                  ? 'bg-solana-purple text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
