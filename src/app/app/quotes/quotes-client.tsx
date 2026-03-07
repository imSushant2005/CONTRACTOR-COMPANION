'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createQuote } from '@/app/actions/quote-actions'
import { Trash } from 'lucide-react'

export function QuotesClient({ initialQuotes, leads }: { initialQuotes: any[], leads: any[] }) {
    const [quotes, setQuotes] = useState(initialQuotes)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [leadId, setLeadId] = useState('')
    const [taxPercent, setTaxPercent] = useState('8')
    const [items, setItems] = useState<any[]>([{ description: '', quantity: 1, unitPrice: 0 }])

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const tax = subtotal * (parseFloat(taxPercent) / 100)
    const total = subtotal + tax

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!leadId) return alert('Select a lead')
        setLoading(true)
        try {
            await createQuote({ leadId, taxPercent: parseFloat(taxPercent) }, items)
            setOpen(false)
            window.location.reload() // simple reload to get new quote with lead data
        } catch {
            alert('Failed to save quote')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Create Quote</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader><DialogTitle>New Quote</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Lead / Customer</Label>
                                    <Select value={leadId} onValueChange={setLeadId}>
                                        <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
                                        <SelectContent>
                                            {leads.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Tax Rate (%)</Label>
                                    <Input type="number" step="0.1" value={taxPercent} onChange={e => setTaxPercent(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Line Items</Label>
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <Input className="flex-1" placeholder="Description" value={item.description} onChange={e => {
                                            const newItems = [...items]
                                            newItems[idx].description = e.target.value
                                            setItems(newItems)
                                        }} required />
                                        <Input type="number" className="w-20" placeholder="Qty" value={item.quantity} onChange={e => {
                                            const newItems = [...items]
                                            newItems[idx].quantity = parseFloat(e.target.value) || 0
                                            setItems(newItems)
                                        }} required />
                                        <Input type="number" className="w-24" placeholder="Price" value={item.unitPrice} onChange={e => {
                                            const newItems = [...items]
                                            newItems[idx].unitPrice = parseFloat(e.target.value) || 0
                                            setItems(newItems)
                                        }} required />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                                            <Trash className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])}>Add Item</Button>
                            </div>

                            <div className="border-t pt-4 text-right space-y-1">
                                <div className="text-sm">Subtotal: ${subtotal.toFixed(2)}</div>
                                <div className="text-sm text-muted-foreground">Tax: ${tax.toFixed(2)}</div>
                                <div className="text-lg font-bold">Total: ${total.toFixed(2)}</div>
                            </div>

                            <Button type="submit" disabled={loading || items.length === 0} className="w-full">Save Quote</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotes.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-4">No quotes found.</TableCell></TableRow>
                        ) : quotes.map(quote => (
                            <TableRow key={quote.id}>
                                <TableCell className="font-medium">{quote.lead?.name}</TableCell>
                                <TableCell className="text-muted-foreground">{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${quote.status === 'Accepted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{quote.status}</span></TableCell>
                                <TableCell className="text-right font-medium">${quote.total.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={`/api/quotes/${quote.id}/pdf`} target="_blank">Export PDF</a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
