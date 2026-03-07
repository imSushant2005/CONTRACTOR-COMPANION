import { getCurrentTenant } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { KanbanBoard } from './kanban-board'

export default async function PipelinePage() {
    const { tenantId } = await getCurrentTenant()

    const stages = await prisma.pipelineStage.findMany({
        where: { tenantId },
        orderBy: { order: 'asc' }
    })

    const leads = await prisma.lead.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' }
    })

    // Provide default stages if none to prevent crash on empty tenants
    const defaultStages = stages.length ? stages : [
        { id: '1', name: 'New', order: 1, tenantId },
        { id: '2', name: 'Contacted', order: 2, tenantId },
        { id: '3', name: 'Won', order: 98, tenantId },
        { id: '4', name: 'Lost', order: 99, tenantId }
    ]

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
                <p className="text-muted-foreground">Drag and drop leads to update their status.</p>
            </div>
            <div className="flex-1 overflow-x-auto pb-4">
                <KanbanBoard stages={defaultStages} initialLeads={leads} />
            </div>
        </div>
    )
}
