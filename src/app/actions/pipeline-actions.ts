'use server'

import { getCurrentTenant } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateLeadStatus(leadId: string, newStatus: string) {
    const { tenantId } = await getCurrentTenant()
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead || lead.tenantId !== tenantId) throw new Error('Forbidden')

    await prisma.lead.update({
        where: { id: leadId },
        data: { status: newStatus }
    })

    revalidatePath('/app/pipeline')
    revalidatePath('/app/dashboard')
}
