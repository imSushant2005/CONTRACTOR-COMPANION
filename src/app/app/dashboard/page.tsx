import { getCurrentTenant } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { KPICard } from '@/components/KPICard'

export default async function DashboardPage() {
    const { tenantId } = await getCurrentTenant()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [leadsThisMonth, openQuotes, wonRevenue, paidInvoices] = await Promise.all([
        prisma.lead.count({ where: { tenantId, createdAt: { gte: startOfMonth } } }),
        // Guide: COUNT quotes WHERE status IN (Draft, Sent)
        prisma.quote.count({ where: { tenantId, status: { in: ['Draft', 'Sent'] } } }),
        // Guide: SUM quotes.total WHERE status = Accepted
        prisma.quote.aggregate({ where: { tenantId, status: 'Accepted' }, _sum: { total: true } }),
        prisma.invoice.aggregate({ where: { tenantId, status: 'Paid' }, _sum: { total: true } }),
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your business performance.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Leads This Month" value={leadsThisMonth} />
                <KPICard title="Open Quotes" value={openQuotes} />
                <KPICard title="Won Revenue" value={`$${(wonRevenue._sum.total ?? 0).toLocaleString()}`} />
                <KPICard title="Paid Invoices" value={`$${(paidInvoices._sum.total ?? 0).toLocaleString()}`} />
            </div>
        </div>
    )
}
