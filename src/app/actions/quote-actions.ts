'use server'

import { getCurrentTenant } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createQuote(data: any, items: any[]) {
    const { tenantId } = await getCurrentTenant()

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const tax = subtotal * (data.taxPercent / 100)
    const total = subtotal + tax

    await prisma.quote.create({
        data: {
            tenantId,
            leadId: data.leadId,
            status: 'Draft',
            taxPercent: data.taxPercent,
            subtotal,
            tax,
            total,
            items: {
                create: items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    lineTotal: item.quantity * item.unitPrice
                }))
            }
        }
    })

    revalidatePath('/app/quotes')
}
