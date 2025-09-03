'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiPlus, FiTrash2, FiRefreshCw, FiTag, FiStar } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { AddWalletModal } from './add-wallet-modal'

interface Wallet {
  id: string
  address: string
  name: string | null
  tag: string | null
  priority: number
  isActive: boolean
  lastSync: string | null
  _count: {
    transactions: number
    alerts: number
  }
}

interface WalletListProps {
  selectedWallet: string | null
  onSelectWallet: (walletId: string | null) => void
}

export function WalletList({ selectedWallet, onSelectWallet }: WalletListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: wallets, isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const res = await fetch('/api/wallets')
      if (!res.ok) throw new Error('Failed to fetch wallets')
      return res.json() as Promise<Wallet[]>
    },
  })

  const syncWallet = useMutation({
    mutationFn: async (walletId: string) => {
      const res = await fetch(`/api/wallets/${walletId}/sync`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to sync wallet')
      return res.json()
    },
    onSuccess: (data, walletId) => {
      toast.success(`Synced! Found ${data.newTransactions} new transactions`)
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: () => {
      toast.error('Failed to sync wallet')
    },
  })

  const deleteWallet = useMutation({
    mutationFn: async (walletId: string) => {
      const res = await fetch(`/api/wallets/${walletId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete wallet')
      return res.json()
    },
    onSuccess: (_, walletId) => {
      toast.success('Wallet removed')
      if (selectedWallet === walletId) {
        onSelectWallet(null)
      }
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
    onError: () => {
      toast.error('Failed to remove wallet')
    },
  })

  const priorityColors = ['text-gray-400', 'text-yellow-500', 'text-red-500']
  const priorityLabels = ['Low', 'Medium', 'High']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-solana-purple" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Tracked Wallets
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-solana-purple text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Add Wallet
        </button>
      </div>

      <div className="grid gap-4">
        {wallets?.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No wallets tracked yet
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-solana-purple hover:text-opacity-80"
            >
              Add your first wallet
            </button>
          </div>
        ) : (
          wallets?.map((wallet) => (
            <div
              key={wallet.id}
              onClick={() => onSelectWallet(wallet.id)}
              className={`
                p-4 bg-white dark:bg-gray-800 rounded-lg border-2 transition-all cursor-pointer
                ${selectedWallet === wallet.id
                  ? 'border-solana-purple shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {wallet.name || 'Unnamed Wallet'}
                    </h3>
                    {wallet.tag && (
                      <span className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        <FiTag className="w-3 h-3" />
                        {wallet.tag}
                      </span>
                    )}
                    <FiStar className={`w-4 h-4 ${priorityColors[wallet.priority]}`} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mb-2">
                    {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{wallet._count.transactions} transactions</span>
                    <span>{wallet._count.alerts} alerts</span>
                    {wallet.lastSync && (
                      <span>
                        Last sync: {new Date(wallet.lastSync).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      syncWallet.mutate(wallet.id)
                    }}
                    disabled={syncWallet.isPending}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-solana-purple dark:hover:text-solana-purple transition-colors"
                  >
                    <FiRefreshCw className={`w-4 h-4 ${syncWallet.isPending ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Are you sure you want to remove this wallet?')) {
                        deleteWallet.mutate(wallet.id)
                      }
                    }}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AddWalletModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}
