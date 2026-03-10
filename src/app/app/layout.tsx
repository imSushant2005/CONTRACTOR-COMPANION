import Link from 'next/link'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, Users, Trello, FileText, FileSpreadsheet, Settings } from 'lucide-react'
import { getCurrentTenant } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    // Subscription gate — redirect if no active/trialing subscription
    let tenantId: string
    try {
        const result = await getCurrentTenant()
        tenantId = result.tenantId
    } catch (error: any) {
        if (error.message === 'User not found') {
            redirect('/onboarding')
        }
        // Not logged in
        redirect('/sign-in')
    }

    const sub = await prisma.stripeSubscription.findUnique({ where: { tenantId } })
    const isActive = sub && ['active', 'trialing'].includes(sub.status)
    // Temporarily bypass gate for MVP / Prototype phase
    const bypassGate = true // process.env.NODE_ENV === 'development' || process.env.BYPASS_SUBSCRIPTION_GATE === 'true'
    if (!isActive && !bypassGate) {
        redirect('/pricing')
    }

    const navItems = [
        { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
        { label: 'Leads', href: '/app/leads', icon: Users },
        { label: 'Pipeline', href: '/app/pipeline', icon: Trello },
        { label: 'Quotes', href: '/app/quotes', icon: FileText },
        { label: 'Invoices', href: '/app/invoices', icon: FileSpreadsheet },
        { label: 'Settings', href: '/app/settings', icon: Settings },
    ]

    // Mobile bottom nav shows first 4 items only
    const mobileNavItems = navItems.slice(0, 4)

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
            {/* Desktop sidebar */}
            <aside className="hidden md:flex md:flex-col md:w-60 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <span className="font-bold text-lg">Contractor CRM</span>
                </div>
                <nav className="p-4 space-y-1 flex-1">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 text-sm font-medium">
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col md:ml-60">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 sticky top-0 z-20">
                    <UserButton afterSignOutUrl="/" />
                </header>
                <div className="p-4 md:p-6 flex-1 overflow-auto pb-20 md:pb-6">
                    {children}
                </div>
            </main>

            {/* Mobile bottom navigation */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-30 safe-area-bottom">
                <div className="flex justify-around items-center h-16">
                    {mobileNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}
