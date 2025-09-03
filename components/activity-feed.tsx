'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FiDownload, FiFilter, FiExternalLink } from 'react-icons/fi'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Transaction {
  id: string
  signature: string
  type: string
  status: string
  blockTime: string | null
  from: string
  to: string | null
  amount: string | null
  tokenSymbol: string | null
  fee: string | null
  wallet: {
    address: string
    name: string | null
  }
}

interface ActivityFeedProps {
  selectedWallet: string | null
}

export function ActivityFeed({ selectedWallet }: ActivityFeedProps) {
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [page, setPage] = useState(0)
  const limit = 50

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', selectedWallet, typeFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      })
      if (selectedWallet) params.append('walletId', selectedWallet)
      if (typeFilter) params.append('type', typeFilter)

      const res = await fetch(`/api/transactions?${params}`)
      if (!res.ok) throw new Error('Failed to fetch transactions')
      return res.json() as Promise<{
        transactions: Transaction[]
        total: number
        limit: number
        offset: number
      }>
    },
  })

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedWallet) params.append('walletId', selectedWallet)
      if (typeFilter) params.append('type', typeFilter)

      const res = await fetch(`/api/transactions/export?${params}`)
      if (!res.ok) throw new Error('Failed to export transactions')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Transactions exported successfully')
    } catch (error) {
      toast.error('Failed to export transactions')
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sol_transfer':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'spl_transfer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'nft_transfer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'program_interaction':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    return status === 'success' ? '✓' : '✗'
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
          Activity Feed
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setPage(0)
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Types</option>
            <option value="sol_transfer">SOL Transfers</option>
            <option value="spl_transfer">Token Transfers</option>
            <option value="nft_transfer">NFT Transfers</option>
            <option value="program_interaction">Program Interactions</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FiDownload className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {!selectedWallet && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Select a wallet to see its activity, or view all activity across all wallets
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  From / To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Signature
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {tx.blockTime
                      ? format(new Date(tx.blockTime), 'MMM d, HH:mm')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(tx.type)}`}>
                      {tx.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center ${tx.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {getStatusIcon(tx.status)} {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <div className="space-y-1">
                      <div className="font-mono text-xs">
                        From: {tx.from.slice(0, 8)}...{tx.from.slice(-8)}
                      </div>
                      {tx.to && (
                        <div className="font-mono text-xs">
                          To: {tx.to.slice(0, 8)}...{tx.to.slice(-8)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {tx.amount ? `${tx.amount} ${tx.tokenSymbol || 'SOL'}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href={`https://solscan.io/tx/${tx.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-solana-purple hover:text-opacity-80 flex items-center gap-1"
                    >
                      {tx.signature.slice(0, 8)}...
                      <FiExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.transactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No transactions found
            </p>
          </div>
        )}

        {data && data.total > limit && (
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing {page * limit + 1} to {Math.min((page + 1) * limit, data.total)} of {data.total} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * limit >= data.total}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
