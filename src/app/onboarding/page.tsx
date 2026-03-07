'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { generateTenantConfig } from '@/app/actions/generate-tenant-config'

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Step 1
    const [businessName, setBusinessName] = useState('')
    const [slug, setSlug] = useState('')

    // Step 2
    const [services, setServices] = useState<string[]>([])
    const [emergency, setEmergency] = useState('No')
    const [teamSize, setTeamSize] = useState('Just me')
    const [avgJobValue, setAvgJobValue] = useState('Under $200')
    const [serviceArea, setServiceArea] = useState('')
    const [leadSources, setLeadSources] = useState<string[]>([])
    const [salesSteps, setSalesSteps] = useState('Option A')

    const toggleArray = (arr: string[], val: string, setArr: (val: string[]) => void) => {
        if (arr.includes(val)) setArr(arr.filter(item => item !== val))
        else setArr([...arr, val])
    }

    const handleNext = () => {
        if (!businessName || !slug) return alert('Name and Slug required')
        setStep(2)
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await generateTenantConfig({ businessName, slug }, {
                services, emergency, teamSize, avgJobValue, serviceArea, leadSources, salesSteps
            })
            // Redirect to Stripe checkout
            const res = await fetch('/api/stripe/checkout', { method: 'POST' })
            if (!res.ok) throw new Error('Stripe setup failed.')
            const data = await res.json()
            window.location.href = data.url
        } catch (e: any) {
            alert(e.message)
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Welcome to Contractor Companion</CardTitle>
                    <CardDescription>Let&apos;s set up your workspace. Step {step} of 2</CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Business Name</Label>
                                <Input value={businessName} onChange={e => {
                                    setBusinessName(e.target.value)
                                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''))
                                }} placeholder="Cool Air Fix LLC" />
                            </div>
                            <div className="space-y-2">
                                <Label>Workspace URL</Label>
                                <div className="flex items-center space-x-2">
                                    <Input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="cool-air-fix" />
                                    <span className="text-sm text-gray-500 whitespace-nowrap">.jobscompanion.com</span>
                                </div>
                            </div>
                            <Button onClick={handleNext} className="w-full">Next</Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Q1: Services */}
                            <div className="space-y-2">
                                <Label>Services Offered</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {['Repair', 'Install', 'Maintenance', 'Emergency'].map(s => (
                                        <Button key={s} type="button" variant={services.includes(s) ? 'default' : 'outline'} onClick={() => toggleArray(services, s, setServices)}>
                                            {s}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Q2: Emergency callouts */}
                            <div className="space-y-2">
                                <Label>Emergency Callouts?</Label>
                                <Select value={emergency} onValueChange={setEmergency}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Yes">Yes</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Q3: Team size */}
                            <div className="space-y-2">
                                <Label>Team Size</Label>
                                <Select value={teamSize} onValueChange={setTeamSize}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Just me">Just me</SelectItem>
                                        <SelectItem value="2-3 techs">2-3 techs</SelectItem>
                                        <SelectItem value="4-5 techs">4-5 techs</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Q4: Average job value */}
                            <div className="space-y-2">
                                <Label>Average Job Value</Label>
                                <Select value={avgJobValue} onValueChange={setAvgJobValue}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Under $200">Under $200</SelectItem>
                                        <SelectItem value="$200-$500">$200-$500</SelectItem>
                                        <SelectItem value="$500-$1k">$500-$1k</SelectItem>
                                        <SelectItem value="$1k+">$1k+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Q5: Primary service area */}
                            <div className="space-y-2">
                                <Label>Primary Service Area</Label>
                                <Input value={serviceArea} onChange={e => setServiceArea(e.target.value)} placeholder="City or zip code" />
                            </div>

                            {/* Q6: Lead sources */}
                            <div className="space-y-2">
                                <Label>How Do Leads Find You?</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {['Website', 'Google', 'Referral', 'Marketplace'].map(s => (
                                        <Button key={s} type="button" variant={leadSources.includes(s) ? 'default' : 'outline'} onClick={() => toggleArray(leadSources, s, setLeadSources)}>
                                            {s}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Q7: Sales steps */}
                            <div className="space-y-2">
                                <Label>Preferred Sales Workflow</Label>
                                <Select value={salesSteps} onValueChange={setSalesSteps}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Option A">New → Contacted → Inspection → Quote → Won/Lost</SelectItem>
                                        <SelectItem value="Option B">New → Inspection → Quote → Won/Lost</SelectItem>
                                        <SelectItem value="Option C">New → Quote → Won/Lost</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>Back</Button>
                                <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Generating...' : 'Complete Setup'}</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
