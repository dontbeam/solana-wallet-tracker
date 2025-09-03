import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateWalletSchema = z.object({
  name: z.string().optional(),
  tag: z.string().optional(),
  priority: z.number().min(0).max(2).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { id: params.id },
      include: {
        transactions: {
          orderBy: { blockTime: 'desc' },
          take: 50,
        },
        alerts: {
          where: { isActive: true },
        },
        _count: {
          select: {
            transactions: true,
            alerts: true,
          }
        }
      }
    })
    
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(wallet)
  } catch (error) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateWalletSchema.parse(body)
    
    const wallet = await prisma.wallet.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    })
    
    return NextResponse.json(wallet)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating wallet:', error)
    return NextResponse.json(
      { error: 'Failed to update wallet' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.wallet.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting wallet:', error)
    return NextResponse.json(
      { error: 'Failed to delete wallet' },
      { status: 500 }
    )
  }
}
