'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiBell, FiCheck, FiX } from 'react-icons/fi'
import { formatDistance } from 'date-fns'

interface Notification {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  alert: {
    name: string
    wallet: {
      address: string
      name: string | null
    } | null
  }
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: notifications, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications?limit=20')
      if (!res.ok) throw new Error('Failed to fetch notifications')
      return res.json() as Promise<Notification[]>
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0

  const markAsRead = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, isRead: true }),
      })
      if (!res.ok) throw new Error('Failed to mark as read')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllAsRead = () => {
    const unreadIds = notifications?.filter(n => !n.isRead).map(n => n.id) || []
    if (unreadIds.length > 0) {
      markAsRead.mutate(unreadIds)
    }
  }

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Show browser notifications for new unread notifications
  useEffect(() => {
    if (notifications && 'Notification' in window && Notification.permission === 'granted') {
      const unreadNotifications = notifications.filter(n => !n.isRead)
      if (unreadNotifications.length > 0) {
        const latest = unreadNotifications[0]
        new Notification(latest.title, {
          body: latest.message,
          icon: '/favicon.ico',
        })
      }
    }
  }, [notifications])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-solana-purple hover:text-opacity-80"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications?.length === 0 ? (
                <div className="p-8 text-center">
                  <FiBell className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications?.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                        notification.isRead ? 'opacity-60' : ''
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead.mutate([notification.id])
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${notification.isRead ? 'text-gray-400' : 'text-solana-purple'}`}>
                          <FiBell className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {formatDistance(new Date(notification.createdAt), new Date(), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-solana-purple rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
