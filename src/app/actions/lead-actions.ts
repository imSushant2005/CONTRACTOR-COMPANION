'use server'

import { getCurrentTenant } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createLead(data: any) {
    const { tenantId } = await getCurrentTenant()
    await prisma.lead.create({
        data: {
            ...data,
            tenantId,
            status: data.status || 'New'
        }
    })
    revalidatePath('/app/leads')
}

export async function updateLead(leadId: string, data: any) {
    const { tenantId } = await getCurrentTenant()
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead || lead.tenantId !== tenantId) throw new Error('Forbidden')

    await prisma.lead.update({
        where: { id: leadId },
        data
    })
    revalidatePath('/app/leads')
}

export async function deleteLead(leadId: string) {
    const { tenantId } = await getCurrentTenant()
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead || lead.tenantId !== tenantId) throw new Error('Forbidden')

    await prisma.lead.delete({
        where: { id: leadId }
    })
    revalidatePath('/app/leads')
}
