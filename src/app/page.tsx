import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-6 h-16 flex items-center justify-between border-b bg-white relative z-10">
        <div className="font-bold text-xl tracking-tight text-blue-600">Contractor Companion</div>
        <div className="flex space-x-4">
          <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 mt-2">Pricing</Link>
          <Button variant="outline" asChild><Link href="/sign-in">Login</Link></Button>
          <Button asChild><Link href="/sign-up">Start Free Trial</Link></Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center text-center px-4 pt-32 pb-24">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl">
          The simplest HVAC CRM <span className="text-blue-600 block mt-2">you'll ever use.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl">
          Everything you need to quote, invoice, and win more jobs.
          Ready in 5 minutes. No complex setups. No training required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button size="lg" className="h-14 px-8 text-lg" asChild>
            <Link href="/sign-up">Start your 14-day free trial</Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white" asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-2">Automated Quotes</h3>
            <p className="text-slate-600">Generate beautiful PDF quotes in seconds. Pre-filled templates based on your AI onboarding.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-2">Lead Capture Forms</h3>
            <p className="text-slate-600">Get a custom company link to share with clients. Form submissions drop right into your pipeline.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-2">Instant Invoicing</h3>
            <p className="text-slate-600">Convert accepted quotes into invoices with one click. Track what's paid and what's outstanding.</p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-slate-500 text-sm border-t bg-white">
        © {new Date().getFullYear()} Contractor Companion. All rights reserved.
      </footer>
    </div>
  )
}
