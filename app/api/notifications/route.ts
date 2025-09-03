import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const where: any = {}
    
    if (unreadOnly) {
      where.isRead = false
    }
    
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        alert: {
          include: {
            wallet: {
              select: {
                address: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    
    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, isRead } = body
    
    if (!Array.isArray(ids) || typeof isRead !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }
    
    await prisma.notification.updateMany({
      where: { id: { in: ids } },
      data: { isRead },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}
