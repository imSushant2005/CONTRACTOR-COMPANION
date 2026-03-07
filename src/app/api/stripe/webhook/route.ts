import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' as any })

export async function POST(req: Request) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder')
    } catch {
        return new NextResponse('Webhook signature invalid', { status: 400 })
    }

    const sub = event.data.object as any
    const tenantId = sub.metadata?.tenantId
    if (!tenantId) return new NextResponse('No tenantId', { status: 400 })

    if (['customer.subscription.created', 'customer.subscription.updated'].includes(event.type)) {
        await prisma.stripeSubscription.upsert({
            where: { tenantId },
            create: {
                tenantId,
                stripeCustomerId: sub.customer as string,
                stripeSubscriptionId: sub.id,
                status: sub.status,
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
            update: {
                status: sub.status,
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
            }
        })
    }

    if (event.type === 'customer.subscription.deleted') {
        await prisma.stripeSubscription.update({
            where: { tenantId },
            data: { status: 'canceled' }
        })
    }

    return new NextResponse('OK', { status: 200 })
}
