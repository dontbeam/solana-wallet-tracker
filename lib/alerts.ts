import { prisma } from './prisma'
import { ParsedTransaction } from './solana'

interface AlertCondition {
  operator?: 'gt' | 'lt' | 'eq' | 'contains'
  value?: string | number
  tokenMint?: string
  programId?: string
}

export async function checkAlerts(walletId: string, transactions: any[]) {
  try {
    // Get active alerts for this wallet and global alerts
    const alerts = await prisma.alert.findMany({
      where: {
        isActive: true,
        OR: [
          { walletId },
          { walletId: null } // Global alerts
        ]
      }
    })
    
    for (const alert of alerts) {
      const condition = JSON.parse(alert.condition) as AlertCondition
      
      for (const tx of transactions) {
        if (shouldTriggerAlert(alert.type, condition, tx)) {
          await createNotification(alert.id, tx)
        }
      }
    }
  } catch (error) {
    console.error('Error checking alerts:', error)
  }
}

function shouldTriggerAlert(
  alertType: string,
  condition: AlertCondition,
  transaction: any
): boolean {
  switch (alertType) {
    case 'amount_threshold':
      if (!transaction.amount || !condition.value) return false
      const amount = parseFloat(transaction.amount)
      const threshold = typeof condition.value === 'string' 
        ? parseFloat(condition.value) 
        : condition.value
      
      switch (condition.operator) {
        case 'gt':
          return amount > threshold
        case 'lt':
          return amount < threshold
        case 'eq':
          return amount === threshold
        default:
          return false
      }
    
    case 'token_transfer':
      if (condition.tokenMint) {
        return transaction.tokenMint === condition.tokenMint
      }
      return transaction.type === 'spl_transfer' || transaction.type === 'nft_transfer'
    
    case 'program_interaction':
      if (condition.programId) {
        return transaction.programId === condition.programId
      }
      return transaction.type === 'program_interaction'
    
    case 'any_activity':
      return true
    
    default:
      return false
  }
}

async function createNotification(alertId: string, transaction: any) {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: { wallet: true }
    })
    
    if (!alert) return
    
    let title = ''
    let message = ''
    
    switch (alert.type) {
      case 'amount_threshold':
        title = `Large ${transaction.tokenSymbol || 'SOL'} Transfer`
        message = `${transaction.amount} ${transaction.tokenSymbol || 'SOL'} transferred`
        break
      
      case 'token_transfer':
        title = `Token Transfer Detected`
        message = `${transaction.amount || 'Unknown amount'} ${transaction.tokenSymbol || 'tokens'} transferred`
        break
      
      case 'program_interaction':
        title = `Program Interaction`
        message = `Interaction with program: ${transaction.programId?.slice(0, 8)}...`
        break
      
      case 'any_activity':
        title = `Wallet Activity`
        message = `New ${transaction.type.replace('_', ' ')} detected`
        break
    }
    
    if (alert.wallet) {
      message += ` for wallet ${alert.wallet.name || alert.wallet.address.slice(0, 8) + '...'}`
    }
    
    await prisma.notification.create({
      data: {
        alertId,
        title,
        message,
        data: JSON.stringify({
          transactionSignature: transaction.signature,
          transactionType: transaction.type,
          amount: transaction.amount,
          tokenSymbol: transaction.tokenSymbol,
        })
      }
    })
    
    // If browser notifications are supported, send one
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message })
      }
    }
  } catch (error) {
    console.error('Error creating notification:', error)
  }
}
