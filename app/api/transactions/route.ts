import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const walletId = searchParams.get('walletId')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const where: any = {}
    
    if (walletId) {
      where.walletId = walletId
    }
    
    if (type) {
      where.type = type
    }
    
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { blockTime: 'desc' },
        take: limit,
        skip: offset,
        include: {
          wallet: {
            select: {
              address: true,
              name: true,
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ])
    
    return NextResponse.json({
      transactions,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
