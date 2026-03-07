import { prisma } from '@/lib/prisma'
import { PublicLeadForm } from './public-form-client'
import { notFound } from 'next/navigation'

export default async function LeadFormPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const tenant = await prisma.tenant.findUnique({ where: { slug } })
    if (!tenant) return notFound()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-blue-600 text-white p-6 text-center">
                    <h1 className="text-2xl font-bold">{tenant.businessName}</h1>
                    <p className="text-blue-100 mt-2 text-sm">Request a Service Quote</p>
                </div>
                <div className="p-6">
                    <PublicLeadForm slug={tenant.slug} businessName={tenant.businessName} />
                </div>
            </div>
        </div>
    )
}
