'use client'

import { useState } from 'react'
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { updateLeadStatus } from '@/app/actions/pipeline-actions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function KanbanBoard({ stages, initialLeads }: { stages: any[], initialLeads: any[] }) {
    const [leads, setLeads] = useState(initialLeads)

    // A very simplified drag implementation for the prototype
    // We just use native HTML5 drag and drop for a simplified prototype codebase
    // as setting up complete dnd-kit can be very verbose (requires many custom components).

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        e.dataTransfer.setData('leadId', leadId)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault() // necessary to allow dropping
    }

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault()
        const leadId = e.dataTransfer.getData('leadId')
        const lead = leads.find(l => l.id === leadId)
        if (!lead || lead.status === newStatus) return

        // Optimistic update
        setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))

        try {
            await updateLeadStatus(leadId, newStatus)
        } catch {
            // Revert on failure
            setLeads(leads.map(l => l.id === leadId ? { ...l, status: lead.status } : l))
        }
    }

    return (
        <div className="flex gap-4 h-full min-h-[600px]">
            {stages.map(stage => {
                const stageLeads = leads.filter(l => l.status === stage.name)
                return (
                    <div
                        key={stage.id}
                        className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-3 flex flex-col"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.name)}
                    >
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h3 className="font-semibold text-gray-700">{stage.name}</h3>
                            <Badge variant="secondary">{stageLeads.length}</Badge>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {stageLeads.map(lead => (
                                <div
                                    key={lead.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, lead.id)}
                                    className="bg-white p-3 rounded shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-400 transition-colors"
                                >
                                    <div className="font-medium text-sm">{lead.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">{lead.serviceType || 'General'}</div>
                                    <div className="text-xs font-semibold text-green-600 mt-2">${lead.valueEstimate || 0}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
