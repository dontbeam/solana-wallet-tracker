import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchWalletTransactions } from '@/lib/solana'
import { checkAlerts } from '@/lib/alerts'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { id: params.id },
    })
    
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      )
    }
    
    // Fetch transactions from Solana
    const transactions = await fetchWalletTransactions(wallet.address)
    
    // Store new transactions
    let newTransactionsCount = 0
    for (const tx of transactions) {
      try {
        await prisma.transaction.create({
          data: {
            ...tx,
            walletId: wallet.id,
          },
        })
        newTransactionsCount++
      } catch (error: any) {
        // Skip if transaction already exists (unique constraint)
        if (error.code !== 'P2002') {
          console.error('Error storing transaction:', error)
        }
      }
    }
    
    // Update wallet last sync time
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { lastSync: new Date() },
    })
    
    // Check alerts for new transactions
    if (newTransactionsCount > 0) {
      await checkAlerts(wallet.id, transactions)
    }
    
    return NextResponse.json({
      success: true,
      newTransactions: newTransactionsCount,
      totalTransactions: transactions.length,
    })
  } catch (error) {
    console.error('Error syncing wallet:', error)
    return NextResponse.json(
      { error: 'Failed to sync wallet' },
      { status: 500 }
    )
  }
}
