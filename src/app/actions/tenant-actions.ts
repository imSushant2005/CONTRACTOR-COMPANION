'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function setActiveTenant(tenantId: string) {
    const cookieStore = await cookies()
    // Set the cookie to expire in 30 days
    cookieStore.set('active_tenant_id', tenantId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    })

    redirect('/app/dashboard')
}
