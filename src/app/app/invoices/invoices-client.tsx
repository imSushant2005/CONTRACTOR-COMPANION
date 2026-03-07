'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createInvoiceFromQuote, markInvoicePaid } from '@/app/actions/invoice-actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export function InvoicesClient({ initialInvoices, initialQuotes }: { initialInvoices: any[], initialQuotes: any[] }) {
    const [invoices, setInvoices] = useState(initialInvoices)
    const [loading, setLoading] = useState(false)
    const [quoteId, setQuoteId] = useState('')
    const [open, setOpen] = useState(false)

    async function handleCreateInvoice(e: React.FormEvent) {
        e.preventDefault()
        if (!quoteId) return alert('Select a quote')
        setLoading(true)
        try {
            await createInvoiceFromQuote(quoteId)
            window.location.reload() // easy refresh to pick up new invoice from server 
        } catch (error: any) {
            alert(error.message || 'Failed to create invoice')
        }
        setLoading(false)
    }

    async function handleMarkPaid(id: string) {
        setLoading(true)
        try {
            await markInvoicePaid(id)
            setInvoices(invoices.map(i => i.id === id ? { ...i, status: 'Paid', paidAt: new Date() } : i))
        } catch {
            alert('Failed to mark paid')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Create from Quote</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Convert Quote Sequence</DialogTitle></DialogHeader>
                        <form onSubmit={handleCreateInvoice} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Draft Quote</Label>
                                <Select value={quoteId} onValueChange={setQuoteId}>
                                    <SelectTrigger><SelectValue placeholder="Select quote" /></SelectTrigger>
                                    <SelectContent>
                                        {initialQuotes.length === 0 && <SelectItem value="none" disabled>No draft quotes available</SelectItem>}
                                        {initialQuotes.map(q => (
                                            <SelectItem key={q.id} value={q.id}>
                                                {q.lead?.name} - ${q.total.toFixed(2)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={loading || !quoteId || quoteId === 'none'} className="w-full">
                                Convert to Invoice
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Issued</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-4">No invoices found.</TableCell></TableRow>
                        ) : invoices.map(invoice => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-medium">{invoice.lead?.name}</TableCell>
                                <TableCell className="text-muted-foreground">{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {invoice.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-medium">${invoice.total.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    {invoice.status !== 'Paid' ? (
                                        <Button variant="outline" size="sm" onClick={() => handleMarkPaid(invoice.id)} disabled={loading}>
                                            Mark Paid
                                        </Button>
                                    ) : (
                                        <span className="text-sm text-green-600 font-medium">Paid</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
