import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function getCurrentTenant() {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const user = await prisma.user.findUnique({
        where: { authProviderUserId: userId },
        include: { tenant: true }
    })

    if (!user) throw new Error('User not found')
    return { user, tenant: user.tenant, tenantId: user.tenantId }
}
