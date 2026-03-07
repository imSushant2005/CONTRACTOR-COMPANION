import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="px-6 h-16 flex items-center justify-between border-b bg-white">
                <Link href="/" className="font-bold text-xl tracking-tight text-blue-600">Contractor Companion</Link>
                <div className="flex space-x-4">
                    <Button variant="outline" asChild><Link href="/sign-in">Login</Link></Button>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                        Simple, transparent pricing.
                    </h1>
                    <p className="text-xl text-slate-600">
                        Everything you need for an HVAC business. One low price.
                    </p>
                </div>

                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-8 text-center border-b border-slate-100 bg-slate-50">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Pro Plan</h2>
                        <div className="flex items-baseline justify-center text-5xl font-extrabold pb-2">
                            $19
                            <span className="text-xl text-slate-500 font-medium ml-1">/mo</span>
                        </div>
                        <p className="text-slate-500 text-sm">14-day free trial. Cancel anytime.</p>
                    </div>

                    <div className="p-8">
                        <ul className="space-y-4 mb-8">
                            {['Unlimited Leads & Quotes', 'Custom Public Lead Form', 'Pipeline Management', 'PDF Exports', 'Invoice Tracking', 'AI Onboarding Setup'].map(feature => (
                                <li key={feature} className="flex items-center text-slate-700">
                                    <span className="text-blue-500 mr-3 text-lg">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button size="lg" className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700" asChild>
                            <Link href="/sign-up">Start 14-day free trial</Link>
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
