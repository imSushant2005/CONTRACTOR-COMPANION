'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function PublicLeadForm({ slug, businessName }: { slug: string, businessName: string }) {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', address: '', serviceType: '', message: '', website: ''
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/leads/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, slug })
            })
            if (!res.ok) {
                if (res.status === 429) throw new Error('Too many requests. Please try again later.')
                throw new Error('Failed to submit')
            }
            setSubmitted(true)
        } catch (err: any) {
            alert(err.message || 'Error submitting request. Please try again later.')
        }
        setLoading(false)
    }

    if (submitted) {
        return (
            <div className="text-center py-8 space-y-4">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <h2 className="text-xl font-bold text-gray-800">Request Sent!</h2>
                <p className="text-gray-600 border-t pt-4 border-gray-100">
                    Thank you for contacting {businessName}. We&apos;ll be in touch shortly!
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field — hidden from users, bots will fill it */}
            <input
                name="website"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                tabIndex={-1}
                autoComplete="off"
            />

            <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Jane Doe" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(555) 555-5555" />
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="jane@example.com" />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Address</Label>
                <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="123 Main St, City" />
            </div>
            <div className="space-y-2">
                <Label>Type of Service Needed</Label>
                <Select value={formData.serviceType} onValueChange={v => setFormData({ ...formData, serviceType: v })}>
                    <SelectTrigger><SelectValue placeholder="Select service type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Repair">Repair</SelectItem>
                        <SelectItem value="Install">Install</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Details / Notes</Label>
                <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your issue or request..."
                />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700">
                {loading ? 'Submitting...' : 'Request Quote'}
            </Button>
        </form>
    )
}
