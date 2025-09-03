'use client'

import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface CreateAlertModalProps {
  isOpen: boolean
  onClose: () => void
  selectedWallet: string | null
}

export function CreateAlertModal({ isOpen, onClose, selectedWallet }: CreateAlertModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'amount_threshold' | 'token_transfer' | 'program_interaction' | 'any_activity'>('amount_threshold')
  const [walletId, setWalletId] = useState(selectedWallet || '')
  const [operator, setOperator] = useState<'gt' | 'lt' | 'eq'>('gt')
  const [value, setValue] = useState('')
  const [tokenMint, setTokenMint] = useState('')
  const [programId, setProgramId] = useState('')
  
  const queryClient = useQueryClient()

  const { data: wallets } = useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const res = await fetch('/api/wallets')
      if (!res.ok) throw new Error('Failed to fetch wallets')
      return res.json()
    },
  })

  const createAlert = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create alert')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Alert created successfully')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      onClose()
      resetForm()
      
      // Request notification permission if needed
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const resetForm = () => {
    setName('')
    setType('amount_threshold')
    setWalletId(selectedWallet || '')
    setOperator('gt')
    setValue('')
    setTokenMint('')
    setProgramId('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const condition: any = {}
    
    switch (type) {
      case 'amount_threshold':
        condition.operator = operator
        condition.value = parseFloat(value)
        break
      case 'token_transfer':
        if (tokenMint) condition.tokenMint = tokenMint
        break
      case 'program_interaction':
        if (programId) condition.programId = programId
        break
    }
    
    createAlert.mutate({
      name,
      type,
      walletId: walletId || null,
      condition,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create Alert Rule
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alert Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Large SOL Transfer"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-solana-purple focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alert Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-solana-purple focus:border-transparent"
            >
              <option value="amount_threshold">Amount Threshold</option>
              <option value="token_transfer">Token Transfer</option>
              <option value="program_interaction">Program Interaction</option>
              <option value="any_activity">Any Activity</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Apply to Wallet
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-solana-purple focus:border-transparent"
            >
              <option value="">All Wallets (Global)</option>
              {wallets?.map((wallet: any) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name || wallet.address}
                </option>
              ))}
            </select>
          </div>

          {type === 'amount_threshold' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Condition *
                </label>
                <div className="flex gap-2">
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as any)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-solana-purple focus:border-transparent"
                  >
                    <option value="gt">Greater than</option>
                    <option value="lt">Less than</option>
                    <option value="eq">Equal to</option>
                  </select>
                  <input
                    type="number"
                    step="0.000001"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Amount in SOL"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-solana-purple focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {type === 'token_transfer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Token Mint Address (optional)
              </label>
              <input
                type="text"
                value={tokenMint}
                onChange={(e) => setTokenMint(e.target.value)}
                placeholder="Leave empty for any token"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-solana-purple focus:border-transparent"
              />
            </div>
          )}

          {type === 'program_interaction' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Program ID (optional)
              </label>
              <input
                type="text"
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                placeholder="Leave empty for any program"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-solana-purple focus:border-transparent"
              />
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              {type === 'amount_threshold' && 'Alert will trigger when a transaction amount meets the specified condition'}
              {type === 'token_transfer' && 'Alert will trigger when a token transfer is detected'}
              {type === 'program_interaction' && 'Alert will trigger when a program interaction is detected'}
              {type === 'any_activity' && 'Alert will trigger for any transaction activity'}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAlert.isPending}
              className="flex-1 px-4 py-2 bg-solana-purple text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {createAlert.isPending ? 'Creating...' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
