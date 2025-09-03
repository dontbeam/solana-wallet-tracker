'use client'

import { useQuery } from '@tanstack/react-query'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { format, subDays, startOfDay } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface ChartsProps {
  selectedWallet: string | null
}

export function Charts({ selectedWallet }: ChartsProps) {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['charts', selectedWallet],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedWallet) params.append('walletId', selectedWallet)
      
      const res = await fetch(`/api/transactions?${params}&limit=1000`)
      if (!res.ok) throw new Error('Failed to fetch transactions')
      const data = await res.json()
      
      return processChartData(data.transactions)
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-solana-purple" />
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No data available for charts
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Analytics
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Over Time */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Activity Over Time (Last 30 Days)
          </h3>
          <div className="h-64">
            <Line
              data={chartData.activityOverTime}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: '#9CA3AF',
                    },
                  },
                  x: {
                    ticks: {
                      color: '#9CA3AF',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Transaction Types */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Transaction Types
          </h3>
          <div className="h-64">
            <Doughnut
              data={chartData.transactionTypes}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#9CA3AF',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Inflow/Outflow */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            SOL Flow (Last 30 Days)
          </h3>
          <div className="h-64">
            <Line
              data={chartData.flowOverTime}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: '#9CA3AF',
                    },
                  },
                },
                scales: {
                  y: {
                    ticks: {
                      color: '#9CA3AF',
                    },
                  },
                  x: {
                    ticks: {
                      color: '#9CA3AF',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Summary Statistics
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {chartData.stats.totalTransactions}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Inflow</p>
              <p className="text-2xl font-bold text-green-600">
                +{chartData.stats.totalInflow.toFixed(4)} SOL
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Outflow</p>
              <p className="text-2xl font-bold text-red-600">
                -{chartData.stats.totalOutflow.toFixed(4)} SOL
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Flow</p>
              <p className={`text-2xl font-bold ${chartData.stats.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {chartData.stats.netFlow >= 0 ? '+' : ''}{chartData.stats.netFlow.toFixed(4)} SOL
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function processChartData(transactions: any[]) {
  // Last 30 days
  const days = 30
  const labels = []
  const activityData = []
  const inflowData = []
  const outflowData = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = startOfDay(subDays(new Date(), i))
    labels.push(format(date, 'MMM d'))
    
    const dayTransactions = transactions.filter(tx => {
      if (!tx.blockTime) return false
      const txDate = startOfDay(new Date(tx.blockTime))
      return txDate.getTime() === date.getTime()
    })
    
    activityData.push(dayTransactions.length)
    
    const inflow = dayTransactions
      .filter(tx => tx.type === 'sol_transfer' && tx.to === tx.wallet.address)
      .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0)
    
    const outflow = dayTransactions
      .filter(tx => tx.type === 'sol_transfer' && tx.from === tx.wallet.address)
      .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0)
    
    inflowData.push(inflow)
    outflowData.push(outflow)
  }
  
  // Transaction types
  const typeCount: Record<string, number> = {}
  transactions.forEach(tx => {
    typeCount[tx.type] = (typeCount[tx.type] || 0) + 1
  })
  
  // Stats
  const totalInflow = transactions
    .filter(tx => tx.type === 'sol_transfer' && tx.to === tx.wallet.address)
    .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0)
  
  const totalOutflow = transactions
    .filter(tx => tx.type === 'sol_transfer' && tx.from === tx.wallet.address)
    .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0)
  
  return {
    activityOverTime: {
      labels,
      datasets: [
        {
          label: 'Transactions',
          data: activityData,
          borderColor: '#9945FF',
          backgroundColor: 'rgba(153, 69, 255, 0.1)',
          tension: 0.4,
        },
      ],
    },
    flowOverTime: {
      labels,
      datasets: [
        {
          label: 'Inflow',
          data: inflowData,
          borderColor: '#14F195',
          backgroundColor: 'rgba(20, 241, 149, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Outflow',
          data: outflowData,
          borderColor: '#F5426C',
          backgroundColor: 'rgba(245, 66, 108, 0.1)',
          tension: 0.4,
        },
      ],
    },
    transactionTypes: {
      labels: Object.keys(typeCount).map(type => type.replace('_', ' ')),
      datasets: [
        {
          data: Object.values(typeCount),
          backgroundColor: [
            '#9945FF',
            '#14F195',
            '#F5426C',
            '#FFB700',
          ],
        },
      ],
    },
    stats: {
      totalTransactions: transactions.length,
      totalInflow,
      totalOutflow,
      netFlow: totalInflow - totalOutflow,
    },
  }
}
