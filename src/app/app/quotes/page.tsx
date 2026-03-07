import { getCurrentTenant } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { QuotesClient } from './quotes-client'

export default async function QuotesPage() {
    const { tenantId } = await getCurrentTenant()

    const leads = await prisma.lead.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' }
    })

    const quotes = await prisma.quote.findMany({
        where: { tenantId },
        include: { lead: true, items: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
                <p className="text-muted-foreground">Build quotes for leads and export them to PDF.</p>
            </div>
            <QuotesClient initialQuotes={quotes} leads={leads} />
        </div>
    )
}
