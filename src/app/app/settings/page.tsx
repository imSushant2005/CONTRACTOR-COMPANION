import { getCurrentTenant } from '@/lib/get-tenant'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default async function SettingsPage() {
    const { tenant } = await getCurrentTenant()

    const sub = await prisma.stripeSubscription.findUnique({
        where: { tenantId: tenant.id }
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const isLocal = appUrl.includes('localhost')
    const protocol = isLocal ? 'http://' : 'https://'
    const rootHost = isLocal ? 'localhost:3000' : process.env.NEXT_PUBLIC_ROOT_DOMAIN

    const leadFormUrl = `${protocol}${tenant.slug}.${rootHost}`

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your workspace and billing.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>Your public company details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Business Name</Label>
                        <Input readOnly value={tenant.businessName} />
                    </div>
                    <div className="space-y-2">
                        <Label>Public Lead Form Link</Label>
                        <div className="flex space-x-2">
                            <Input readOnly value={leadFormUrl} />
                            <Button variant="outline" asChild>
                                <a href={leadFormUrl} target="_blank" rel="noreferrer">Open</a>
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Share this link with customers to collect leads.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>Your plan and payment status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm font-medium">Status</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${sub?.status === 'active' || sub?.status === 'trialing' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {sub?.status ? sub.status.toUpperCase() : 'NO SUBSCRIPTION'}
                        </span>
                    </div>
                    {sub && (
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm font-medium">Current Period Ends</span>
                            <span className="text-sm">{new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
