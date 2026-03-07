'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createLead, updateLead } from '@/app/actions/lead-actions'

const SERVICE_TYPES = ['Repair', 'Install', 'Maintenance', 'Emergency']
const SOURCES = ['Website', 'Referral', 'Google', 'Marketplace', 'Lead Form', 'Other']

function statusVariant(status: string) {
    switch (status) {
        case 'Won': return 'bg-green-100 text-green-800'
        case 'Lost': return 'bg-red-100 text-red-800'
        case 'New': return 'bg-gray-100 text-gray-800'
        case 'Draft': return 'bg-yellow-100 text-yellow-800'
        default: return 'bg-blue-100 text-blue-800'
    }
}

const emptyForm = {
    name: '', phone: '', email: '', address: '',
    serviceType: '', source: '', status: 'New',
    valueEstimate: 0, notes: ''
}

export function LeadsClient({ initialLeads, stageNames }: { initialLeads: any[], stageNames: string[] }) {
    const [leads, setLeads] = useState(initialLeads)
    const [open, setOpen] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<any>({ ...emptyForm })

    // Filter state
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterSource, setFilterSource] = useState('all')

    const filteredLeads = leads.filter(lead => {
        if (filterStatus !== 'all' && lead.status !== filterStatus) return false
        if (filterSource !== 'all' && lead.source !== filterSource) return false
        return true
    })

    function openCreate() {
        setEditId(null)
        setFormData({ ...emptyForm })
        setOpen(true)
    }

    function openEdit(lead: any) {
        setEditId(lead.id)
        setFormData({
            name: lead.name || '',
            phone: lead.phone || '',
            email: lead.email || '',
            address: lead.address || '',
            serviceType: lead.serviceType || '',
            source: lead.source || '',
            status: lead.status || 'New',
            valueEstimate: lead.valueEstimate || 0,
            notes: lead.notes || '',
        })
        setOpen(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            const data = {
                ...formData,
                valueEstimate: parseFloat(formData.valueEstimate) || 0
            }
            if (editId) {
                await updateLead(editId, data)
                setLeads(leads.map(l => l.id === editId ? { ...l, ...data } : l))
            } else {
                await createLead(data)
                setLeads([{ ...data, id: Date.now().toString(), createdAt: new Date() }, ...leads])
            }
            setOpen(false)
        } catch (err) {
            alert('Failed to save lead')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {stageNames.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filterSource} onValueChange={setFilterSource}>
                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Source" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <div className="flex-1" />
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreate}>Add Lead</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>{editId ? 'Edit Lead' : 'Add New Lead'}</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1"><Label>Name *</Label><Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                                <div className="space-y-1"><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                                <div className="space-y-1"><Label>Email</Label><Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                                <div className="space-y-1">
                                    <Label>Service Type</Label>
                                    <Select value={formData.serviceType} onValueChange={v => setFormData({ ...formData, serviceType: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>{SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Source</Label>
                                    <Select value={formData.source} onValueChange={v => setFormData({ ...formData, source: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Status</Label>
                                    <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{stageNames.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1"><Label>Est. Value ($)</Label><Input type="number" value={formData.valueEstimate} onChange={e => setFormData({ ...formData, valueEstimate: e.target.value })} /></div>
                            </div>
                            <div className="space-y-1"><Label>Address</Label><Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                            <div className="space-y-1">
                                <Label>Notes</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Additional notes..."
                                />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Saving...' : editId ? 'Update Lead' : 'Save Lead'}</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Desktop table / Mobile cards */}
            {/* Desktop */}
            <div className="border rounded-md bg-white hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Est. Value</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLeads.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-4">No leads found.</TableCell></TableRow>
                        ) : filteredLeads.map(lead => (
                            <TableRow key={lead.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openEdit(lead)}>
                                <TableCell className="font-medium">{lead.name}</TableCell>
                                <TableCell>
                                    <div className="text-sm">{lead.phone}</div>
                                    <div className="text-xs text-muted-foreground">{lead.email}</div>
                                </TableCell>
                                <TableCell>{lead.serviceType}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{lead.source}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusVariant(lead.status)}`}>
                                        {lead.status}
                                    </span>
                                </TableCell>
                                <TableCell>${lead.valueEstimate ?? 0}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {new Date(lead.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
                {filteredLeads.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-white rounded-lg border">No leads found.</div>
                ) : filteredLeads.map(lead => (
                    <div key={lead.id} className="bg-white rounded-lg border p-4 space-y-2 cursor-pointer active:bg-gray-50" onClick={() => openEdit(lead)}>
                        <div className="flex justify-between items-start">
                            <div className="font-medium">{lead.name}</div>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusVariant(lead.status)}`}>
                                {lead.status}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground">{lead.phone} · {lead.serviceType || 'General'}</div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{lead.source}</span>
                            <span className="font-medium text-green-700">${lead.valueEstimate ?? 0}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
