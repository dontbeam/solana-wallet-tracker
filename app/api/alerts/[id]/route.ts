import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateAlertSchema = z.object({
  name: z.string().optional(),
  isActive: z.boolean().optional(),
  condition: z.object({}).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateAlertSchema.parse(body)
    
    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive
    if (validatedData.condition !== undefined) updateData.condition = JSON.stringify(validatedData.condition)
    
    const alert = await prisma.alert.update({
      where: { id: params.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    })
    
    return NextResponse.json(alert)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.alert.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}
