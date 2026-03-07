

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Simple in-memory rate limiter (resets on server restart)
const rateLimitMap = new Map<string, { count: number; firstRequest: number }>()
const RATE_LIMIT_WINDOW = 10 * 60 * 1000 // 10 minutes
const RATE_LIMIT_MAX = 5

function isRateLimited(ip: string): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(ip)
    if (!entry || now - entry.firstRequest > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, firstRequest: now })
        return false
    }
    entry.count++
    return entry.count > RATE_LIMIT_MAX
}

export async function POST(req: Request) {
    try {
        // Rate limiting by IP
        const forwarded = req.headers.get('x-forwarded-for')
        const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
        if (isRateLimited(ip)) {
            return new NextResponse('Too many requests', { status: 429 })
        }

        const { slug, name, phone, email, address, serviceType, message, website } = await req.json()

        // Honeypot check — if filled, it's a bot
        if (website) {
            // Silently accept but don't create the lead
            return NextResponse.json({ success: true })
        }

        if (!slug || !name) {
            return new NextResponse('Missing required fields', { status: 400 })
        }

        // CRITICAL: Derive tenantId from slug — never trust tenantId from the body
        const tenant = await prisma.tenant.findUnique({ where: { slug } })
        if (!tenant) {
            return new NextResponse('Tenant not found', { status: 404 })
        }

        // Verify tenant has active subscription before accepting leads
        const sub = await prisma.stripeSubscription.findUnique({
            where: { tenantId: tenant.id }
        })
        const isActive = sub && ['active', 'trialing'].includes(sub.status)
        // For local dev, allow submissions without subscription
        const isLocalDev = process.env.NODE_ENV === 'development'
        if (!isActive && !isLocalDev) {
            return new NextResponse('Tenant subscription inactive', { status: 403 })
        }

        await prisma.lead.create({
            data: {
                tenantId: tenant.id,
                name,
                phone,
                email,
                address,
                serviceType,
                source: 'Lead Form',
                status: 'New',
                notes: message
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Public lead form error:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
