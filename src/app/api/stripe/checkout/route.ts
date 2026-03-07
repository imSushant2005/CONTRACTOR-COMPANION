import Stripe from 'stripe'
import { getCurrentTenant } from '@/lib/get-tenant'
import { NextResponse } from 'next/server'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' as any })

export async function POST() {
    try {
        const { tenant } = await getCurrentTenant()

        // Assuming we use mock or placeholder stripe key if no real one is present
        if (stripeSecretKey === 'sk_test_placeholder') {
            return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app/dashboard?subscribed=true` })
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
            subscription_data: { trial_period_days: 14 },
            metadata: { tenantId: tenant.id },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app/dashboard?subscribed=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        return new NextResponse('Internal Error', { status: 500 })
    }
}
