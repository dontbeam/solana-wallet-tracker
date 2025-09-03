import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createAlertSchema = z.object({
  name: z.string(),
  walletId: z.string().optional().nullable(),
  type: z.enum(['amount_threshold', 'token_transfer', 'program_interaction', 'any_activity']),
  condition: z.object({
    operator: z.enum(['gt', 'lt', 'eq', 'contains']).optional(),
    value: z.union([z.string(), z.number()]).optional(),
    tokenMint: z.string().optional(),
    programId: z.string().optional(),
  }),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const walletId = searchParams.get('walletId')
    
    const where: any = { isActive: true }
    
    if (walletId) {
      where.walletId = walletId
    }
    
    const alerts = await prisma.alert.findMany({
      where,
      include: {
        wallet: {
          select: {
            address: true,
            name: true,
          }
        },
        _count: {
          select: {
            notifications: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createAlertSchema.parse(body)
    
    const alert = await prisma.alert.create({
      data: {
        name: validatedData.name,
        walletId: validatedData.walletId,
        type: validatedData.type,
        condition: JSON.stringify(validatedData.condition),
      },
    })
    
    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}
