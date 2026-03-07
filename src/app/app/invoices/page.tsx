import { getCurrentTenant } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { InvoicesClient } from './invoices-client'

export default async function InvoicesPage() {
    const { tenantId } = await getCurrentTenant()

    const invoices = await prisma.invoice.findMany({
        where: { tenantId },
        include: { lead: true, quote: true },
        orderBy: { createdAt: 'desc' }
    })

    const quotes = await prisma.quote.findMany({
        where: { tenantId, status: 'Accepted' },
        include: { lead: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                <p className="text-muted-foreground">Manage billing and converted quotes.</p>
            </div>
            <InvoicesClient initialInvoices={invoices} initialQuotes={quotes} />
        </div>
    )
}
