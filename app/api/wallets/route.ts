import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { PublicKey } from '@solana/web3.js'

const createWalletSchema = z.object({
  address: z.string().refine((val) => {
    try {
      new PublicKey(val)
      return true
    } catch {
      return false
    }
  }, 'Invalid Solana address'),
  name: z.string().optional(),
  tag: z.string().optional(),
  priority: z.number().min(0).max(2).default(0),
})

export async function GET() {
  try {
    const wallets = await prisma.wallet.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        _count: {
          select: {
            transactions: true,
            alerts: true,
          }
        }
      }
    })
    
    return NextResponse.json(wallets)
  } catch (error) {
    console.error('Error fetching wallets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createWalletSchema.parse(body)
    
    // Check if wallet already exists
    const existing = await prisma.wallet.findUnique({
      where: { address: validatedData.address }
    })
    
    if (existing) {
      return NextResponse.json(
        { error: 'Wallet already exists' },
        { status: 400 }
      )
    }
    
    const wallet = await prisma.wallet.create({
      data: validatedData,
    })
    
    return NextResponse.json(wallet, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating wallet:', error)
    return NextResponse.json(
      { error: 'Failed to create wallet' },
      { status: 500 }
    )
  }
}
