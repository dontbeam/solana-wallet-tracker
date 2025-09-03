'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { WalletList } from '@/components/wallet-list'
import { ActivityFeed } from '@/components/activity-feed'
import { AlertsPanel } from '@/components/alerts-panel'
import { NotificationCenter } from '@/components/notification-center'
import { Charts } from '@/components/charts'

export default function Home() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'wallets' | 'activity' | 'alerts' | 'charts'>('wallets')

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Solana Wallet Tracker
              </h1>
              <NotificationCenter />
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6">
            {activeView === 'wallets' && (
              <WalletList 
                selectedWallet={selectedWallet}
                onSelectWallet={setSelectedWallet}
              />
            )}
            
            {activeView === 'activity' && (
              <ActivityFeed selectedWallet={selectedWallet} />
            )}
            
            {activeView === 'alerts' && (
              <AlertsPanel selectedWallet={selectedWallet} />
            )}
            
            {activeView === 'charts' && (
              <Charts selectedWallet={selectedWallet} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
