import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
    title: { fontSize: 24, fontWeight: 'bold' },
    businessName: { fontSize: 16, color: '#333' },
    section: { marginBottom: 20 },
    heading: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 5, textTransform: 'uppercase' },
    text: { fontSize: 11, marginBottom: 3 },
    table: { width: '100%', marginBottom: 30 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 8 },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#333', paddingVertical: 8 },
    col1: { width: '50%' },
    col2: { width: '15%', textAlign: 'right' },
    col3: { width: '15%', textAlign: 'right' },
    col4: { width: '20%', textAlign: 'right' },
    summary: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    summaryText: { fontSize: 11, width: 80 },
    summaryAmount: { fontSize: 11, width: 80, textAlign: 'right' },
    summaryBold: { fontSize: 12, fontWeight: 'bold', width: 80 },
    summaryAmountBold: { fontSize: 12, fontWeight: 'bold', width: 80, textAlign: 'right' },
    footer: { position: 'absolute', bottom: 40, left: 40, right: 40, textAlign: 'center', fontSize: 10, color: '#888' }
})

export const QuotePDF = ({ quote }: { quote: any }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>QUOTE</Text>
                    <Text style={styles.text}>#{quote.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.text}>{new Date(quote.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.businessName}>{quote.tenant.businessName}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>Bill To:</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>{quote.lead.name}</Text>
                {quote.lead.address && <Text style={styles.text}>{quote.lead.address}</Text>}
                {quote.lead.email && <Text style={styles.text}>{quote.lead.email}</Text>}
                {quote.lead.phone && <Text style={styles.text}>{quote.lead.phone}</Text>}
            </View>

            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.col1, { fontSize: 11, fontWeight: 'bold' }]}>Description</Text>
                    <Text style={[styles.col2, { fontSize: 11, fontWeight: 'bold' }]}>Qty</Text>
                    <Text style={[styles.col3, { fontSize: 11, fontWeight: 'bold' }]}>Price</Text>
                    <Text style={[styles.col4, { fontSize: 11, fontWeight: 'bold' }]}>Total</Text>
                </View>

                {quote.items.map((item: any) => (
                    <View key={item.id} style={styles.tableRow}>
                        <Text style={[styles.col1, styles.text]}>{item.description}</Text>
                        <Text style={[styles.col2, styles.text]}>{item.quantity}</Text>
                        <Text style={[styles.col3, styles.text]}>${item.unitPrice.toFixed(2)}</Text>
                        <Text style={[styles.col4, styles.text]}>${item.lineTotal.toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.summary}>
                <View>
                    <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                        <Text style={styles.summaryText}>Subtotal:</Text>
                        <Text style={styles.summaryAmount}>${quote.subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                        <Text style={styles.summaryText}>Tax ({quote.taxPercent}%):</Text>
                        <Text style={styles.summaryAmount}>${quote.tax.toFixed(2)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#333' }}>
                        <Text style={styles.summaryBold}>Total:</Text>
                        <Text style={styles.summaryAmountBold}>${quote.total.toFixed(2)}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Text>Thank you for your business. Quote valid for 30 days.</Text>
            </View>
        </Page>
    </Document>
)
