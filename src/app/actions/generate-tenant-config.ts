'use server'

import { prisma } from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { isSlugValid } from '@/lib/reserved-slugs'
import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are a product setup assistant for a lightweight HVAC CRM
for micro contractors (1–5 technicians).
Your job: generate default pipeline stages and templates.
Rules:
- Keep it simple for small HVAC businesses.
- Do NOT include dispatch, scheduling, or technician tracking.
- Produce output in strict JSON only. No explanation. No markdown.
- Match the exact JSON schema provided.`

function buildUserPrompt(answers: any) {
    return `Onboarding answers:
Services: ${answers.services?.join(', ') || 'General'}
Emergency callouts: ${answers.emergency}
Team size: ${answers.teamSize}
Average job value: ${answers.avgJobValue}
Primary service area: ${answers.serviceArea || 'Not specified'}
Lead sources: ${answers.leadSources?.join(', ') || 'Not specified'}
Preferred sales steps: ${answers.salesSteps}

Return exactly this JSON structure:
{
  "pipelineStages": [
    { "name": "New", "order": 1 },
    { "name": "Contacted", "order": 2 },
    ...
    { "name": "Won", "order": 99 },
    { "name": "Lost", "order": 100 }
  ],
  "quoteTemplate": {
    "defaultTaxPercent": 0,
    "footerText": "Thank you for your business."
  },
  "invoiceTemplate": {
    "defaultTaxPercent": 0,
    "footerText": "Payment due on receipt."
  },
  "dashboard": {
    "kpis": ["Leads this month", "Open quotes", "Won revenue", "Paid invoices"]
  }
}`
}

function getMockResponse(answers: any) {
    // Default pipeline based on the selected sales steps option
    let stages: { name: string; order: number }[]
    switch (answers.salesSteps) {
        case 'Option A':
            stages = [
                { name: 'New', order: 1 },
                { name: 'Contacted', order: 2 },
                { name: 'Inspection Scheduled', order: 3 },
                { name: 'Quote Sent', order: 4 },
            ]
            break
        case 'Option B':
            stages = [
                { name: 'New', order: 1 },
                { name: 'Inspection Scheduled', order: 2 },
                { name: 'Quote Sent', order: 3 },
            ]
            break
        case 'Option C':
            stages = [
                { name: 'New', order: 1 },
                { name: 'Quote Sent', order: 2 },
            ]
            break
        default:
            stages = [
                { name: 'New', order: 1 },
                { name: 'Contacted', order: 2 },
                { name: 'Quote Sent', order: 3 },
            ]
    }

    return {
        pipelineStages: stages,
        quoteTemplate: {
            defaultTaxPercent: 8,
            footerText: 'Thank you for your business. Please remit payment within 14 days.'
        },
        invoiceTemplate: {
            defaultTaxPercent: 8,
            footerText: 'Payment due on receipt. Thank you!'
        }
    }
}

export async function generateTenantConfig(tenantInfo: { businessName: string, slug: string }, answers: any) {
    const { userId } = await auth()
    const clerkUser = await currentUser()
    if (!userId || !clerkUser) throw new Error('Unauthorized')

    const { businessName, slug } = tenantInfo

    if (!isSlugValid(slug)) {
        throw new Error('Invalid or reserved slug.')
    }

    // Check if slug exists
    const existing = await prisma.tenant.findUnique({ where: { slug } })
    if (existing) {
        throw new Error('Slug is already taken.')
    }

    // Check if user already has a tenant (re-onboarding scenario)
    const existingUser = await prisma.user.findUnique({
        where: { authProviderUserId: userId }
    })
    if (existingUser) {
        return { success: true, alreadyOnboarded: true }
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress || 'no-email@example.com'

    const tenant = await prisma.tenant.create({
        data: {
            slug,
            businessName,
            users: {
                create: {
                    authProviderUserId: userId,
                    email: userEmail,
                    role: 'OWNER'
                }
            }
        }
    })

    const tenantId = tenant.id

    // Try real OpenAI if key is set, otherwise use mock
    let parsed: any
    const apiKey = process.env.OPENAI_API_KEY
    const isRealKey = apiKey && !apiKey.includes('placeholder') && apiKey.startsWith('sk-')

    if (isRealKey) {
        try {
            const openai = new OpenAI({ apiKey })
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: buildUserPrompt(answers) }
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' }
            })

            const content = completion.choices[0]?.message?.content
            parsed = content ? JSON.parse(content) : getMockResponse(answers)
        } catch (error) {
            console.error('OpenAI call failed, using mock:', error)
            parsed = getMockResponse(answers)
        }
    } else {
        parsed = getMockResponse(answers)
    }

    // CRITICAL: Always enforce Won/Lost as last two stages
    const stages = (parsed.pipelineStages || []).filter((s: any) => s.name !== 'Won' && s.name !== 'Lost')
    stages.push({ name: 'Won', order: 98 }, { name: 'Lost', order: 99 })

    await prisma.pipelineStage.createMany({
        data: stages.map((s: any) => ({ ...s, tenantId }))
    })

    await prisma.tenantConfig.create({
        data: {
            tenantId,
            aiProfileJson: JSON.stringify(answers),
            quoteTemplateJson: JSON.stringify(parsed.quoteTemplate),
            invoiceTemplateJson: JSON.stringify(parsed.invoiceTemplate),
        }
    })

    return { success: true }
}
