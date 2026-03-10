import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function getCurrentTenant() {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const users = await prisma.user.findMany({
        where: { authProviderUserId: userId },
        include: { tenant: true }
    })

    if (!users || users.length === 0) throw new Error('User not found')

    const cookieStore = await cookies()
    const activeTenantId = cookieStore.get('active_tenant_id')?.value

    // Determine the active user/tenant pair:
    // 1. If cookie exists and matches one of their tenants, use that
    // 2. Otherwise default to their first tenant
    let activeUser = users.find(u => u.tenantId === activeTenantId)
    if (!activeUser) {
        activeUser = users[0]
    }

    const availableTenants = users.map(u => u.tenant)

    return {
        user: activeUser,
        tenant: activeUser.tenant,
        tenantId: activeUser.tenantId,
        availableTenants
    }
}
