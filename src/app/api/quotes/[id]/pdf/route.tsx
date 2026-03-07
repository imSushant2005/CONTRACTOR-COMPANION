import { renderToStream } from '@react-pdf/renderer'
import { QuotePDF } from '@/components/QuotePDF'
import { getCurrentTenant } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const { tenantId } = await getCurrentTenant()
        const quote = await prisma.quote.findUnique({
            where: { id },
            include: { items: true, lead: true, tenant: true }
        })

        if (!quote || quote.tenantId !== tenantId) {
            return new Response('Forbidden', { status: 403 })
        }

        const stream = await renderToStream(<QuotePDF quote={quote} />)

        return new Response(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="Quote-${quote.id.slice(-6)}.pdf"`
            }
        })
    } catch (error) {
        return new Response('Error generating PDF', { status: 500 })
    }
}
