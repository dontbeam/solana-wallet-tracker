'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiPlus, FiBell, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { CreateAlertModal } from './create-alert-modal'

interface Alert {
  id: string
  name: string
  walletId: string | null
  type: string
  condition: string
  isActive: boolean
  createdAt: string
  wallet: {
    address: string
    name: string | null
  } | null
  _count: {
    notifications: number
  }
}

interface AlertsPanelProps {
  selectedWallet: string | null
}

export function AlertsPanel({ selectedWallet }: AlertsPanelProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', selectedWallet],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedWallet) params.append('walletId', selectedWallet)
      
      const res = await fetch(`/api/alerts?${params}`)
      if (!res.ok) throw new Error('Failed to fetch alerts')
      return res.json() as Promise<Alert[]>
    },
  })

  const toggleAlert = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      if (!res.ok) throw new Error('Failed to update alert')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert updated')
    },
    onError: () => {
      toast.error('Failed to update alert')
    },
  })

  const deleteAlert = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete alert')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert deleted')
    },
    onError: () => {
      toast.error('Failed to delete alert')
    },
  })

  const getAlertDescription = (alert: Alert) => {
    const condition = JSON.parse(alert.condition)
    
    switch (alert.type) {
      case 'amount_threshold':
        return `Triggers when amount ${condition.operator || '>'} ${condition.value} SOL`
      case 'token_transfer':
        return condition.tokenMint 
          ? `Triggers for specific token: ${condition.tokenMint.slice(0, 8)}...`
          : 'Triggers for any token transfer'
      case 'program_interaction':
        return condition.programId
          ? `Triggers for program: ${condition.programId.slice(0, 8)}...`
          : 'Triggers for any program interaction'
      case 'any_activity':
        return 'Triggers for any wallet activity'
      default:
        return 'Custom alert'
    }
  }

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
          Alert Rules
        </h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-solana-purple text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Create Alert
        </button>
      </div>

      {selectedWallet && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Showing alerts for selected wallet and global alerts
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {alerts?.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FiBell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No alert rules created yet
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-solana-purple hover:text-opacity-80"
            >
              Create your first alert
            </button>
          </div>
        ) : (
          alerts?.map((alert) => (
            <div
              key={alert.id}
              className={`
                p-4 bg-white dark:bg-gray-800 rounded-lg border-2
                ${alert.isActive 
                  ? 'border-gray-200 dark:border-gray-700' 
                  : 'border-gray-100 dark:border-gray-800 opacity-60'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {alert.name}
                    </h3>
                    {alert.wallet && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        {alert.wallet.name || `${alert.wallet.address.slice(0, 4)}...${alert.wallet.address.slice(-4)}`}
                      </span>
                    )}
                    {!alert.wallet && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                        Global
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {getAlertDescription(alert)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{alert._count.notifications} notifications sent</span>
                    <span>Created {new Date(alert.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAlert.mutate({ 
                      id: alert.id, 
                      isActive: !alert.isActive 
                    })}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-solana-purple dark:hover:text-solana-purple transition-colors"
                  >
                    {alert.isActive ? (
                      <FiToggleRight className="w-5 h-5 text-solana-purple" />
                    ) : (
                      <FiToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this alert?')) {
                        deleteAlert.mutate(alert.id)
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

      <CreateAlertModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedWallet={selectedWallet}
      />
    </div>
  )
}
