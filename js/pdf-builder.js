// pdfMake Configuration
// Uses default VFS fonts from vfs_fonts.js (Roboto)


const COLORS = {
    TAX: {
        primary: '#0d6efd', // Blue
        secondary: '#6c757d',
        bg: '#f8f9fa'
    },
    SIMPLE: {
        primary: '#198754', // Green
        secondary: '#6c757d',
        bg: '#f8f9fa'
    },
    CHALLAN: {
        primary: '#ffc107', // Yellow
        secondary: '#6c757d',
        bg: '#fff3cd'
    },
    QUOTE: {
        primary: '#0dcaf0', // Cyan
        secondary: '#6c757d',
        bg: '#e0faff'
    }
};

function buildHeader(data, title, color) {
    const headerColumns = [];
    if (data.details.logo) {
        headerColumns.push({
            image: data.details.logo,
            width: 80,
            margin: [0, 0, 20, 0]
        });
    }

    const showGst = title !== 'INVOICE' && title !== 'QUOTATION';

    headerColumns.push({
        width: '*',
        text: [
            { text: 'BILLED BY\n', style: 'label' },
            { text: checkEmpty(data.details.companyName) + '\n', style: 'h3' },
            { text: checkEmpty(data.details.companyAddress) + '\n', style: 'normal' },
            data.details.companyPhone ? { text: 'Ph: ' + data.details.companyPhone + '\n', style: 'normal' } : {},
            showGst ? { text: 'GSTIN: ' + checkEmpty(data.details.companyGst), style: 'normal', color: color } : {}
        ]
    });

    headerColumns.push({
        width: '*',
        text: [
            { text: 'BILLED TO\n', style: 'label' },
            { text: checkEmpty(data.details.clientName) + '\n', style: 'h3' },
            { text: checkEmpty(data.details.clientAddress) + '\n', style: 'normal' },
            data.details.clientPhone ? { text: 'Ph: ' + data.details.clientPhone + '\n', style: 'normal' } : {},
            showGst ? { text: 'GSTIN: ' + checkEmpty(data.details.clientGst), style: 'normal', color: color } : {}
        ],
        alignment: 'right'
    });

    return [
        // Top Bar
        { canvas: [{ type: 'rect', x: 0, y: 0, w: 515, h: 5, color: color }] },
        { text: title, style: 'header', alignment: 'right', color: color, margin: [0, 10, 0, 0] },
        { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: color }] },

        // Header Columns
        {
            margin: [0, 20, 0, 20],
            columns: headerColumns
        }
    ];
}

function buildFooter(data, color) {
    return [
        // Signature & Footer
        {
            margin: [0, 30, 0, 0],
            columns: [
                { width: '*', text: '' },
                {
                    width: 150,
                    stack: [
                        data.details.signature ? { image: data.details.signature, width: 100, alignment: 'right' } : {},
                        { text: 'Authorized Signatory', alignment: 'right', margin: [0, 5, 0, 0], fontSize: 10, bold: true }
                    ]
                }
            ]
        },

        // Footer Brand
        {
            margin: [0, 30, 0, 0],
            text: 'Thank you for your business!',
            alignment: 'center',
            color: color,
            italics: true,
            fontSize: 10
        }
    ];
}

function generateTaxInvoice(data) {
    const C = COLORS.TAX;
    const docDefinition = {
        content: [
            ...buildHeader(data, 'TAX INVOICE', C.primary),
            // Meta Info
            {
                columns: [
                    { width: '*', text: '' },
                    {
                        width: 'auto',
                        table: {
                            body: [
                                [{ text: 'Invoice No:', style: 'label' }, { text: data.details.invoiceNumber, bold: true }],
                                [{ text: 'Date:', style: 'label' }, { text: data.details.date, bold: true }]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ],
                margin: [0, 0, 0, 20]
            },

            // Table
            {
                table: {
                    headerRows: 1,
                    widths: (() => {
                        const base = ['*', 'auto', 'auto', 'auto', 'auto']; // Item, Qty, Rate, Tax, Amount
                        if (data.items.some(i => i.hsn)) base.splice(1, 0, 'auto');
                        return base;
                    })(),
                    body: [
                        (() => {
                            const headers = [
                                { text: 'Item Description', style: 'tableHeader', fillColor: C.primary },
                                { text: 'Qty', style: 'tableHeader', fillColor: C.primary },
                                { text: 'Rate', style: 'tableHeader', fillColor: C.primary },
                                { text: data.details.taxType === 'Same State' ? 'GST' : 'IGST', style: 'tableHeader', fillColor: C.primary },
                                { text: 'Amount', style: 'tableHeader', alignment: 'right', fillColor: C.primary }
                            ];
                            if (data.items.some(i => i.hsn)) {
                                headers.splice(1, 0, { text: 'HSN', style: 'tableHeader', fillColor: C.primary });
                            }
                            return headers;
                        })(),
                        ...data.items.map((item, i) => {
                            const taxable = item.qty * item.rate;
                            const taxAmt = taxable * (item.gst / 100);
                            const total = taxable + taxAmt;
                            const fill = i % 2 === 0 ? '#fff' : C.bg;

                            const row = [
                                { text: item.name, fillColor: fill, margin: [5, 8, 5, 8] },
                                { text: item.qty, fillColor: fill, margin: [5, 8, 5, 8] },
                                { text: '₹ ' + item.rate.toFixed(2), fillColor: fill, margin: [5, 8, 5, 8] },
                                { text: item.gst + '%', fillColor: fill, margin: [5, 8, 5, 8] },
                                { text: '₹ ' + total.toFixed(2), alignment: 'right', fillColor: fill, margin: [5, 8, 5, 8] }
                            ];

                            if (data.items.some(i => i.hsn)) {
                                row.splice(1, 0, { text: item.hsn, fillColor: fill, margin: [5, 8, 5, 8] });
                            }
                            return row;
                        })
                    ]
                },
                layout: {
                    hLineWidth: function (i, node) { return 1; },
                    vLineWidth: function (i, node) { return 1; },
                    hLineColor: function (i, node) { return '#eaeaea'; },
                    vLineColor: function (i, node) { return '#eaeaea'; }
                }
            },

            // Amount in Words
            {
                margin: [0, 20, 0, 0],
                text: [
                    { text: 'Amount in Words:\n', style: 'label' },
                    { text: data.numberInWords, style: 'normal', italics: true }
                ]
            },

            // Payment & Totals Section
            {
                margin: [0, 20, 0, 0],
                columns: [
                    // Payment Details & QR
                    {
                        width: '*',
                        stack: [
                            (data.details.bankName || data.details.upiId) ? { text: 'Payment Details:', style: 'h3', fontSize: 11, margin: [0, 0, 0, 5] } : {},
                            data.details.bankName ? {
                                table: {
                                    body: [
                                        [{ text: 'Account Name:', style: 'label', width: 60 }, { text: data.details.accountName, style: 'normal', bold: true }],
                                        [{ text: 'Bank:', style: 'label' }, { text: data.details.bankName, style: 'normal', bold: true }],
                                        [{ text: 'A/C No:', style: 'label' }, { text: data.details.accountNumber, style: 'normal' }],
                                        [{ text: 'IFSC:', style: 'label' }, { text: data.details.ifscCode, style: 'normal' }]
                                    ]
                                },
                                layout: 'noBorders',
                                margin: [0, 0, 0, 10]
                            } : {},
                            data.details.upiId ? {
                                stack: [
                                    { qr: `upi://pay?pa=${data.details.upiId}&pn=${data.details.companyName}&am=${data.totals.total}&cu=INR`, fit: 70 },
                                    { text: 'Scan to Pay', style: 'label', margin: [0, 5, 0, 0] },
                                    { text: data.details.upiId, style: 'normal', fontSize: 9 }
                                ]
                            } : {}
                        ]
                    },
                    // Totals
                    {
                        width: 'auto',
                        table: {
                            widths: [100, 80],
                            body: [
                                ['Subtotal', { text: '₹ ' + data.totals.subtotal.toFixed(2), alignment: 'right' }],
                                (data.totals.discount > 0) ? ['Discount', { text: '- ₹ ' + data.totals.discount.toFixed(2), alignment: 'right', color: 'red' }] : [],
                                ...getTaxRows(data),
                                [{ text: 'Total', bold: true, fontSize: 12, color: C.primary }, { text: '₹ ' + data.totals.total.toFixed(2), bold: true, fontSize: 12, alignment: 'right', color: C.primary }]
                            ].filter(row => row.length > 0)
                        },
                        layout: 'noBorders'
                    }
                ]
            },
            buildNote(data),
            ...buildFooter(data, C.primary)
        ],
        styles: getStyles()
    };
    pdfMake.createPdf(docDefinition).download(`Invoice_${data.details.invoiceNumber}.pdf`);
}

function generateSimpleInvoice(data) {
    const C = COLORS.SIMPLE;
    const docDefinition = {
        content: [
            ...buildHeader(data, 'INVOICE', C.primary),
            // Meta Info
            {
                columns: [
                    { width: '*', text: '' },
                    {
                        width: 'auto',
                        table: {
                            body: [
                                [{ text: 'Invoice No:', style: 'label' }, { text: data.details.invoiceNumber, bold: true }],
                                [{ text: 'Date:', style: 'label' }, { text: data.details.date, bold: true }]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ],
                margin: [0, 0, 0, 20]
            },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'Item', style: 'tableHeader', fillColor: C.primary },
                            { text: 'Qty', style: 'tableHeader', fillColor: C.primary },
                            { text: 'Rate', style: 'tableHeader', fillColor: C.primary },
                            { text: 'Amount', style: 'tableHeader', alignment: 'right', fillColor: C.primary }
                        ],
                        ...data.items.map((item, i) => {
                            const taxable = item.qty * item.rate;
                            // Simple Invoice: Amount = Qty * Rate (No Tax)
                            const fill = i % 2 === 0 ? '#fff' : C.bg;
                            return [
                                { text: item.name, fillColor: fill, margin: [5, 8, 5, 8] },
                                { text: item.qty, fillColor: fill, margin: [5, 8, 5, 8] },
                                { text: '₹ ' + item.rate.toFixed(2), fillColor: fill, margin: [5, 8, 5, 8] },
                                { text: '₹ ' + taxable.toFixed(2), alignment: 'right', fillColor: fill, margin: [5, 8, 5, 8] }
                            ];
                        })
                    ]
                },
                layout: {
                    hLineWidth: function (i, node) { return 1; },
                    vLineWidth: function (i, node) { return 1; },
                    hLineColor: function (i, node) { return '#eaeaea'; },
                    vLineColor: function (i, node) { return '#eaeaea'; }
                }
            },

            // Amount in Words
            {
                margin: [0, 20, 0, 0],
                text: [
                    { text: 'Amount in Words:\n', style: 'label' },
                    { text: data.numberInWordsSimple || data.numberInWords, style: 'normal', italics: true }
                ]
            },

            // Payment & Totals Section
            {
                margin: [0, 20, 0, 0],
                columns: [
                    // Payment Details & QR
                    {
                        width: '*',
                        stack: [
                            (data.details.bankName || data.details.upiId) ? { text: 'Payment Details:', style: 'h3', fontSize: 11, margin: [0, 0, 0, 5] } : {},
                            data.details.bankName ? {
                                table: {
                                    body: [
                                        [{ text: 'Account Name:', style: 'label', width: 60 }, { text: data.details.accountName, style: 'normal', bold: true }],
                                        [{ text: 'Bank:', style: 'label' }, { text: data.details.bankName, style: 'normal', bold: true }],
                                        [{ text: 'A/C No:', style: 'label' }, { text: data.details.accountNumber, style: 'normal' }],
                                        [{ text: 'IFSC:', style: 'label' }, { text: data.details.ifscCode, style: 'normal' }]
                                    ]
                                },
                                layout: 'noBorders',
                                margin: [0, 0, 0, 10]
                            } : {},
                            data.details.upiId ? {
                                stack: [
                                    { qr: `upi://pay?pa=${data.details.upiId}&pn=${data.details.companyName}&am=${data.totals.total}&cu=INR`, fit: 70 },
                                    { text: 'Scan to Pay', style: 'label', margin: [0, 5, 0, 0] },
                                    { text: data.details.upiId, style: 'normal', fontSize: 9 }
                                ]
                            } : {}
                        ]
                    },
                    {
                        width: 'auto',
                        alignment: 'right',
                        text: [
                            (data.totals.discount > 0) ? { text: `Discount: - ₹ ${data.totals.discount.toFixed(2)}\n`, color: 'red', margin: [0, 0, 0, 5] } : '',
                            { text: 'Grand Total: ', bold: true, color: C.primary },
                            { text: '₹ ' + (data.totals.subtotal - data.totals.discount).toFixed(2), bold: true, fontSize: 14, color: C.primary }
                        ]
                    }
                ]
            },
            buildNote(data),
            ...buildFooter(data, C.primary)
        ],
        styles: getStyles()
    };
    pdfMake.createPdf(docDefinition).download(`SimpleInvoice_${data.details.invoiceNumber}.pdf`);
}

function generateDeliveryChallan(data) {
    const C = COLORS.CHALLAN;
    const docDefinition = {
        content: [
            ...buildHeader(data, 'DELIVERY CHALLAN', '#d39e00'), // Use darker yellow for text
            { text: '(Not for Sale)', style: 'label', alignment: 'right', margin: [0, -10, 0, 20] },
            // Meta Info
            {
                columns: [
                    { width: '*', text: '' },
                    {
                        width: 'auto',
                        table: {
                            body: [
                                [{ text: 'Challan No:', style: 'label' }, { text: data.details.invoiceNumber, bold: true }],
                                [{ text: 'Date:', style: 'label' }, { text: data.details.date, bold: true }]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ],
                margin: [0, 0, 0, 20]
            },
            // Transport Info (Challan Specific)
            (data.details.transportMode || data.details.vehicleNumber) ? {
                margin: [0, 0, 0, 20],
                table: {
                    widths: ['*', '*'],
                    body: [
                        [
                            { text: 'Transport Mode', style: 'label', fillColor: '#fff3cd' },
                            { text: 'Vehicle/Ref Number', style: 'label', fillColor: '#fff3cd' }
                        ],
                        [
                            { text: checkEmpty(data.details.transportMode), style: 'h3' },
                            { text: checkEmpty(data.details.vehicleNumber), style: 'h3' }
                        ]
                    ]
                },
                layout: 'noBorders'
            } : {},
            {
                table: {
                    headerRows: 1,
                    widths: (() => {
                        const base = ['*', 'auto']; // Item, Qty
                        if (data.items.some(i => i.hsn)) base.splice(1, 0, 'auto');
                        return base;
                    })(),
                    body: [
                        (() => {
                            const headers = [
                                { text: 'Item Description', style: 'tableHeader', fillColor: C.primary, color: 'black' },
                                { text: 'Quantity', style: 'tableHeader', alignment: 'right', fillColor: C.primary, color: 'black' }
                            ];
                            if (data.items.some(i => i.hsn)) {
                                headers.splice(1, 0, { text: 'HSN', style: 'tableHeader', fillColor: C.primary, color: 'black' });
                            }
                            return headers;
                        })(),
                        ...data.items.map((item, i) => {
                            const fill = i % 2 === 0 ? '#fff' : C.bg;
                            const row = [
                                { text: item.name, fillColor: fill, margin: [5, 8, 5, 8] },
                                { text: item.qty, alignment: 'right', fillColor: fill, margin: [5, 8, 5, 8] }
                            ];
                            if (data.items.some(i => i.hsn)) {
                                row.splice(1, 0, { text: item.hsn, fillColor: fill, margin: [5, 8, 5, 8] });
                            }
                            return row;
                        })
                    ]
                },
                layout: {
                    hLineWidth: function (i, node) { return 1; },
                    vLineWidth: function (i, node) { return 1; },
                    hLineColor: function (i, node) { return '#eaeaea'; },
                    vLineColor: function (i, node) { return '#eaeaea'; }
                }
            },
            buildNote(data),
            // Signatures Section (Combined)
            {
                margin: [0, 40, 0, 0],
                columns: [
                    // Receiver Signature (Left)
                    {
                        width: 150,
                        stack: [
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 }] },
                            { text: "Receiver's Signature", style: 'label', margin: [0, 5, 0, 0] }
                        ]
                    },
                    { width: '*', text: '' },
                    // Authorized Signatory (Right)
                    {
                        width: 150,
                        stack: [
                            data.details.signature ? { image: data.details.signature, width: 100, alignment: 'right' } : {},
                            { text: 'Authorized Signatory', alignment: 'right', margin: [0, 5, 0, 0], fontSize: 10, bold: true }
                        ]
                    }
                ]
            },

            // Footer Brand
            {
                margin: [0, 30, 0, 0],
                text: 'Thank you for your business!',
                alignment: 'center',
                color: '#d39e00',
                italics: true,
            }
        ],
        styles: getStyles()
    };
    pdfMake.createPdf(docDefinition).download(`Challan_${data.details.invoiceNumber}.pdf`);
}

function generateQuote(data) {
    const C = COLORS.QUOTE;
    const docDefinition = {
        content: [
            ...buildHeader(data, 'QUOTATION', C.primary),

            // Meta Info (Date/Number)
            {
                columns: [
                    { width: '*', text: '' },
                    {
                        width: 'auto',
                        table: {
                            body: [
                                [{ text: 'Quote No:', style: 'label' }, { text: data.details.invoiceNumber, bold: true }], // Reusing Invoice Number field
                                [{ text: 'Date:', style: 'label' }, { text: data.details.date, bold: true }]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ],
                margin: [0, 0, 0, 20]
            },

            // Item Table (Reusing Simple Style or Tax Style? Let's use Tax Style layout but different colors)
            // Actually, Quotes often look like Tax Invoices but without the Tax Invoice title.
            // Let's use a unified approach: Use the custom table builder if possible, or manually build it.
            // For simplicity/consistency, I'll copy the Tax Invoice structure but change the header.

            // Client Details Section (omitted here because it's usually part of header or just below)
            // Wait, buildHeader only does "Billed By". Tax Invoice has "Billed To" below it.
            {
                margin: [0, 0, 0, 20],
                columns: [
                    {
                        width: '50%',
                        text: [
                            // Client details directly
                            { text: checkEmpty(data.details.clientName) + '\n', style: 'h3' },
                            { text: checkEmpty(data.details.clientAddress) + '\n', style: 'normal' },
                            data.details.clientPhone ? { text: 'Ph: ' + data.details.clientPhone + '\n', style: 'normal' } : {}
                        ]
                    }
                ]
            },

            // Table
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto', 'auto'], // Description, Qty, Rate, Amount
                    body: [
                        [
                            { text: 'Item Description', style: 'tableHeader', fillColor: C.primary },
                            { text: 'Qty', style: 'tableHeader', fillColor: C.primary },
                            { text: 'Rate', style: 'tableHeader', fillColor: C.primary },
                            { text: 'Amount', style: 'tableHeader', alignment: 'right', fillColor: C.primary }
                        ],
                        ...data.items.map((item, i) => {
                            const total = item.qty * item.rate;
                            const fill = i % 2 === 0 ? '#fff' : C.bg;
                            return [
                                { text: item.name, fillColor: fill, margin: [5, 8, 5, 8] },
                                { text: item.qty, fillColor: fill, margin: [5, 8, 5, 8] },
                                { text: '₹ ' + item.rate.toFixed(2), fillColor: fill, margin: [5, 8, 5, 8] },
                                { text: '₹ ' + total.toFixed(2), alignment: 'right', fillColor: fill, margin: [5, 8, 5, 8] }
                            ];
                        })
                    ]
                },
                layout: {
                    hLineWidth: function (i, node) { return 1; },
                    vLineWidth: function (i, node) { return 1; },
                    hLineColor: function (i, node) { return '#eaeaea'; },
                    vLineColor: function (i, node) { return '#eaeaea'; }
                }
            },

            // Payment & Totals Section
            {
                margin: [0, 20, 0, 0],
                columns: [
                    // Payment Details
                    {
                        width: '*',
                        stack: [
                            (data.details.bankName || data.details.upiId) ? { text: 'Payment Details:', style: 'h3', fontSize: 11, margin: [0, 0, 0, 5] } : {},
                            data.details.bankName ? {
                                table: {
                                    body: [
                                        [{ text: 'Account Name:', style: 'label', width: 60 }, { text: data.details.accountName, style: 'normal', bold: true }],
                                        [{ text: 'Bank:', style: 'label' }, { text: data.details.bankName, style: 'normal', bold: true }],
                                        [{ text: 'A/C No:', style: 'label' }, { text: data.details.accountNumber, style: 'normal' }],
                                        [{ text: 'IFSC:', style: 'label' }, { text: data.details.ifscCode, style: 'normal' }]
                                    ]
                                },
                                layout: 'noBorders',
                                margin: [0, 0, 0, 10]
                            } : {},
                            data.details.upiId ? {
                                stack: [
                                    // Use subtotal for Quote QR as taxes aren't applied yet
                                    { qr: `upi://pay?pa=${data.details.upiId}&pn=${data.details.companyName}&am=${data.totals.subtotal}&cu=INR`, fit: 70 },
                                    { text: 'Scan to Pay', style: 'label', margin: [0, 5, 0, 0] },
                                    { text: data.details.upiId, style: 'normal', fontSize: 9 }
                                ]
                            } : {}
                        ]
                    },
                    {
                        width: 'auto',
                        table: {
                            widths: [100, 80],
                            body: [
                                ['Total', { text: '₹ ' + data.totals.subtotal.toFixed(2), bold: true, fontSize: 12, alignment: 'right', color: C.primary }]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ]
            },

            // Disclaimer
            {
                margin: [0, 10, 0, 0],
                text: 'The quoted amount does not yet include any applicable taxes.',
                italics: true,
                fontSize: 9,
                alignment: 'right',
                color: '#666'
            },

            // Amount in Words
            {
                margin: [0, 20, 0, 0],
                text: [
                    { text: 'Amount in Words: ', bold: true, fontSize: 10 },
                    { text: data.numberInWordsSimple, italics: true, fontSize: 10 } // Use Simple (no tax) words
                ]
            },

            buildNote(data),
            ...buildFooter(data, C.primary)
        ],
        watermark: {
            text: 'QUOTATION',
            color: C.primary,
            opacity: 0.15,
            bold: true,
            italics: false,
            fontSize: 80,
            angle: 45
        },
        styles: getStyles()
    };
    pdfMake.createPdf(docDefinition).download(`Quote_${data.details.invoiceNumber}.pdf`);
}

function getStyles() {
    return {
        header: { fontSize: 22, bold: true },
        label: { fontSize: 9, color: '#999999', margin: [0, 0, 0, 2] },
        h3: { fontSize: 12, bold: true, margin: [0, 0, 0, 5] },
        normal: { fontSize: 10, margin: [0, 0, 0, 2] },
        tableHeader: { bold: true, fontSize: 10, color: 'white', margin: [0, 5, 0, 5] }
    };
}

function buildNote(data) {
    if (!data.details.note) return {};
    return {
        margin: [0, 20, 0, 0],
        stack: [
            { text: 'Note:', style: 'label', bold: true },
            { text: data.details.note, style: 'normal', italics: true }
        ]
    };
}

function getTaxRows(data) {
    if (data.details.taxType === 'Same State') {
        return [
            ['CGST', { text: '₹ ' + data.totals.cgst.toFixed(2), alignment: 'right' }],
            ['SGST', { text: '₹ ' + data.totals.sgst.toFixed(2), alignment: 'right' }]
        ];
    } else {
        return [
            ['IGST', { text: '₹ ' + data.totals.igst.toFixed(2), alignment: 'right' }]
        ];
    }
}

function checkEmpty(str) {
    return str ? str : '';
}
