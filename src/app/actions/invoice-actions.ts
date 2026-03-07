'use server'

import { getCurrentTenant } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createInvoiceFromQuote(quoteId: string) {
    const { tenantId } = await getCurrentTenant()

    const quote = await prisma.quote.findUnique({ where: { id: quoteId, tenantId } })
    if (!quote) throw new Error('Quote not found or access denied')

    // Prevent multiple invoices for the same quote due to the unique constraint
    const existing = await prisma.invoice.findUnique({ where: { quoteId } })
    if (existing) throw new Error('Invoice already exists for this quote')

    await prisma.invoice.create({
        data: {
            tenantId,
            leadId: quote.leadId,
            quoteId: quote.id,
            subtotal: quote.subtotal,
            tax: quote.tax,
            total: quote.total,
            status: 'Unpaid',
        }
    })

    await prisma.quote.update({
        where: { id: quoteId },
        data: { status: 'Accepted' }
    })

    revalidatePath('/app/invoices')
    revalidatePath('/app/quotes')
}

export async function markInvoicePaid(invoiceId: string) {
    const { tenantId } = await getCurrentTenant()

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (!invoice || invoice.tenantId !== tenantId) throw new Error('Forbidden')

    await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'Paid', paidAt: new Date() }
    })

    revalidatePath('/app/invoices')
    revalidatePath('/app/dashboard')
}
