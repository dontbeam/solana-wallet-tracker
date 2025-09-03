import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const walletId = searchParams.get('walletId')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const where: any = {}
    
    if (walletId) {
      where.walletId = walletId
    }
    
    if (type) {
      where.type = type
    }
    
    if (startDate || endDate) {
      where.blockTime = {}
      if (startDate) {
        where.blockTime.gte = new Date(startDate)
      }
      if (endDate) {
        where.blockTime.lte = new Date(endDate)
      }
    }
    
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { blockTime: 'desc' },
      include: {
        wallet: {
          select: {
            address: true,
            name: true,
          }
        }
      }
    })
    
    // Format data for CSV
    const csvData = transactions.map(tx => ({
      Date: tx.blockTime?.toISOString() || '',
      Signature: tx.signature,
      Type: tx.type,
      Status: tx.status,
      From: tx.from,
      To: tx.to || '',
      Amount: tx.amount || '',
      'Token Symbol': tx.tokenSymbol || 'SOL',
      Fee: tx.fee || '',
      'Wallet Address': tx.wallet.address,
      'Wallet Name': tx.wallet.name || '',
    }))
    
    const csv = Papa.unparse(csvData)
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="solana-transactions-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting transactions:', error)
    return NextResponse.json(
      { error: 'Failed to export transactions' },
      { status: 500 }
    )
  }
}
