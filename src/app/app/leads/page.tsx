import { getCurrentTenant } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { LeadsClient } from './leads-client'

export default async function LeadsPage() {
    const { tenantId } = await getCurrentTenant()

    const leads = await prisma.lead.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' }
    })

    const stages = await prisma.pipelineStage.findMany({
        where: { tenantId },
        orderBy: { order: 'asc' }
    })

    const stageNames = stages.map((s: { name: string }) => s.name)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
                <p className="text-muted-foreground">Manage your incoming leads and customers.</p>
            </div>
            <LeadsClient initialLeads={leads} stageNames={stageNames} />
        </div>
    )
}
