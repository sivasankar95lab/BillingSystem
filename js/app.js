document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        items: [],
        taxType: 'Same State', // 'Same State' or 'Inter State'
        logoImage: null,
        signatureImage: null
    };

    // DOM Elements - Main
    const itemsBody = document.getElementById('itemsBody');
    const emptyState = document.getElementById('emptyState');
    const addItemBtn = document.getElementById('addItemBtn');
    const clientStateSelect = document.getElementById('clientState');
    const invoiceDate = document.getElementById('invoiceDate');

    // DOM Elements - Branding
    const logoFile = document.getElementById('logoFile');
    const logoUrl = document.getElementById('logoUrl');
    const previewLogoUrlBtn = document.getElementById('previewLogoUrlBtn');
    const logoPreview = document.getElementById('logoPreview');
    const logoPlaceholder = document.getElementById('logoPlaceholder');
    const signatureFile = document.getElementById('signatureFile');
    const signatureCanvas = document.getElementById('signatureCanvas');
    const clearSignatureBtn = document.getElementById('clearSignatureBtn');
    const signaturePreview = document.getElementById('signaturePreview');
    const signaturePlaceholder = document.getElementById('signaturePlaceholder');

    // Toggle Inputs
    document.querySelectorAll('input[name="logoOption"]').forEach(el => {
        el.addEventListener('change', (e) => {
            if (e.target.value === 'upload') {
                document.getElementById('logoUploadInput').classList.remove('d-none');
                document.getElementById('logoUrlInput').classList.add('d-none');
            } else {
                document.getElementById('logoUploadInput').classList.add('d-none');
                document.getElementById('logoUrlInput').classList.remove('d-none');
            }
        });
    });

    document.querySelectorAll('input[name="signatureOption"]').forEach(el => {
        el.addEventListener('change', (e) => {
            const val = e.target.value;
            document.getElementById('sigDrawInput').classList.toggle('d-none', val !== 'draw');
            document.getElementById('sigUploadInput').classList.toggle('d-none', val !== 'upload');
            document.getElementById('sigUrlInput').classList.toggle('d-none', val !== 'url');
        });
    });

    // Signature URL
    const signatureUrl = document.getElementById('signatureUrl');
    signatureUrl.addEventListener('input', (e) => {
        const url = e.target.value;
        if (url) {
            // Basic Check or direct assignment. 
            // Note: external images might have CORS issues in PDF generation unless handled.
            // But for now, we just set it.
            // Converting to Base64 (like logo) is safer.
            convertImgToBase64(url, (base64) => {
                state.signatureImage = base64;
                document.getElementById('signatureUrlPreview').src = base64;
                document.getElementById('signatureUrlPreview').style.display = 'block';
                document.getElementById('signatureUrlPlaceholder').style.display = 'none';
            });
        }
    });

    // Logo Handling
    logoFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (evt) {
                state.logoImage = evt.target.result;
                logoPreview.src = state.logoImage;
                logoPreview.style.display = 'block';
                logoPlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    previewLogoUrlBtn.addEventListener('click', () => {
        const url = logoUrl.value;
        if (url) {
            // Need to convert URL to Base64 for pdfMake
            convertImgToBase64(url, (base64) => {
                state.logoImage = base64;
                logoPreview.src = base64;
                logoPreview.style.display = 'block';
                logoPlaceholder.style.display = 'none';
            });
        }
    });

    // Signature Upload
    signatureFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (evt) {
                state.signatureImage = evt.target.result;
                signaturePreview.src = state.signatureImage;
                signaturePreview.style.display = 'block';
                signaturePlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // Signature Canvas
    const ctx = signatureCanvas.getContext('2d');
    let isDrawing = false;

    // Handle resizing
    function resizeCanvas() {
        const rect = signatureCanvas.parentElement.getBoundingClientRect();
        // Saving drawing content before resize? Ideally yes, but let's just clear for simple implementation or keep fixed width
        // Better to set fixed internal resolution
        signatureCanvas.width = rect.width;
        signatureCanvas.height = 150;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000";
    }
    // Call once
    setTimeout(resizeCanvas, 100); // Small delay to let layout settle

    function getPos(e) {
        const rect = signatureCanvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function startDraw(e) {
        isDrawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        e.preventDefault();
    }

    function draw(e) {
        if (!isDrawing) return;
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        e.preventDefault();
    }

    function endDraw() {
        if (!isDrawing) return;
        isDrawing = false;
        // Save to state
        state.signatureImage = signatureCanvas.toDataURL();
    }

    signatureCanvas.addEventListener('mousedown', startDraw);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', endDraw);
    signatureCanvas.addEventListener('mouseout', endDraw);

    // Touch support
    signatureCanvas.addEventListener('touchstart', startDraw);
    signatureCanvas.addEventListener('touchmove', draw);
    signatureCanvas.addEventListener('touchend', endDraw);

    clearSignatureBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        state.signatureImage = null;
        // If they switch modes, this state might conflict, but "Draw" mode prioritizes canvas
    });

    function convertImgToBase64(url, callback) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            callback(canvas.toDataURL('image/png'));
        };
        img.onerror = function () {
            alert('Could not load image. Likely CORS restriction. Try uploading the file instead.');
        };
        img.src = url;
    }

    // Set default date
    invoiceDate.valueAsDate = new Date();

    // Event Listeners
    addItemBtn.addEventListener('click', addItem);
    clientStateSelect.addEventListener('change', (e) => {
        state.taxType = e.target.value;
        toggleTaxDisplay();
        calculateTotals();
    });

    // Add initial item
    addItem();

    // Auto-load default images
    if (logoUrl.value && !document.getElementById('logoUrlInput').classList.contains('d-none')) {
        previewLogoUrlBtn.click();
    }
    if (signatureUrl.value && !document.getElementById('sigUrlInput').classList.contains('d-none')) {
        signatureUrl.dispatchEvent(new Event('input'));
    }

    function addItem() {
        const id = Date.now();
        state.items.push({
            id,
            name: '',
            hsn: '',
            qty: 1,
            rate: 0,
            gst: 18
        });
        renderItems();
        calculateTotals();
    }

    function removeItem(id) {
        state.items = state.items.filter(item => item.id !== id);
        renderItems();
        calculateTotals();
    }

    // New Window function for inline calls
    window.updateItemData = (id, field, value) => {
        const item = state.items.find(i => i.id === id);
        if (item) {
            item[field] = value;
            updateRowTotal(id); // Only update this row's total text to avoid full re-render
            calculateTotals();
        }
    };

    window.deleteItem = (id) => {
        removeItem(id);
    };

    function updateRowTotal(id) {
        const item = state.items.find(i => i.id === id);
        if (!item) return;

        const taxable = (item.qty || 0) * (item.rate || 0);
        const taxAmt = taxable * ((item.gst || 0) / 100);
        const total = taxable + taxAmt;

        // Find the specific row element
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            const amountCell = row.querySelector('.row-amount');
            if (amountCell) amountCell.textContent = total.toFixed(2);
        }
    }

    function renderItems() {
        itemsBody.innerHTML = '';

        if (state.items.length === 0) {
            emptyState.classList.remove('d-none');
            return;
        } else {
            emptyState.classList.add('d-none');
        }

        state.items.forEach(item => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', item.id);

            const taxable = item.qty * item.rate;
            const taxAmt = taxable * (item.gst / 100);
            const total = taxable + taxAmt;

            tr.innerHTML = `
                <td>
                    <input type="text" class="form-control" placeholder="Item Name" 
                        value="${item.name}" 
                        oninput="updateItemData(${item.id}, 'name', this.value)">
                </td>
                <td>
                    <input type="text" class="form-control" placeholder="HSN" 
                        value="${item.hsn}" 
                        oninput="updateItemData(${item.id}, 'hsn', this.value)">
                </td>
                <td>
                    <input type="number" class="form-control" placeholder="0" min="1" 
                        value="${item.qty}" 
                        oninput="updateItemData(${item.id}, 'qty', parseFloat(this.value))">
                </td>
                <td>
                    <input type="number" class="form-control" placeholder="0.00" min="0" 
                        value="${item.rate}" 
                        oninput="updateItemData(${item.id}, 'rate', parseFloat(this.value))">
                </td>
                <td>
                    <select class="form-select" 
                        onchange="updateItemData(${item.id}, 'gst', parseFloat(this.value))">
                        <option value="0" ${item.gst === 0 ? 'selected' : ''}>0%</option>
                        <option value="5" ${item.gst === 5 ? 'selected' : ''}>5%</option>
                        <option value="12" ${item.gst === 12 ? 'selected' : ''}>12%</option>
                        <option value="18" ${item.gst === 18 ? 'selected' : ''}>18%</option>
                        <option value="28" ${item.gst === 28 ? 'selected' : ''}>28%</option>
                    </select>
                </td>
                <td class="text-end pe-4 fw-medium row-amount">${total.toFixed(2)}</td>
                <td class="text-center">
                    <button type="button" class="delete-row-btn" onclick="deleteItem(${item.id})" title="Remove Item">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;
            itemsBody.appendChild(tr);
        });
    }

    function toggleTaxDisplay() {
        const cgstRow = document.getElementById('cgstRow');
        const sgstRow = document.getElementById('sgstRow');
        const igstRow = document.getElementById('igstRow');

        if (state.taxType === 'Same State') {
            cgstRow.classList.remove('d-none');
            sgstRow.classList.remove('d-none');
            igstRow.classList.add('d-none');
        } else {
            cgstRow.classList.add('d-none');
            sgstRow.classList.add('d-none');
            igstRow.classList.remove('d-none');
        }
    }

    function calculateTotals() {
        let subtotal = 0;
        let totalCGST = 0;
        let totalSGST = 0;
        let totalIGST = 0;

        state.items.forEach(item => {
            const qty = item.qty || 0;
            const rate = item.rate || 0;
            const taxable = qty * rate;
            const taxRate = item.gst || 0;
            const taxAmt = taxable * (taxRate / 100);

            subtotal += taxable;

            if (state.taxType === 'Same State') {
                totalCGST += taxAmt / 2;
                totalSGST += taxAmt / 2;
            } else {
                totalIGST += taxAmt;
            }
        });

        // Discount Calculation
        const discountType = document.querySelector('input[name="discountType"]:checked').value;
        const discountVal = parseFloat(document.getElementById('discountValue').value) || 0;
        let discountAmount = 0;

        if (discountType === 'fixed') {
            discountAmount = discountVal;
        } else {
            discountAmount = subtotal * (discountVal / 100);
        }

        if (discountAmount > subtotal) discountAmount = subtotal; // Cap discount at subtotal

        const grandTotal = (subtotal - discountAmount) + totalCGST + totalSGST + totalIGST;

        document.getElementById('summarySubtotal').textContent = '₹' + subtotal.toFixed(2);
        document.getElementById('summaryDiscount').textContent = '- ₹' + discountAmount.toFixed(2);
        document.getElementById('summaryCGST').textContent = '₹' + totalCGST.toFixed(2);
        document.getElementById('summarySGST').textContent = '₹' + totalSGST.toFixed(2);
        document.getElementById('summaryIGST').textContent = '₹' + totalIGST.toFixed(2);
        document.getElementById('summaryTotal').textContent = '₹' + grandTotal.toFixed(2);

        // Save to state
        state.totals = {
            subtotal: subtotal,
            discount: discountAmount,
            cgst: totalCGST,
            sgst: totalSGST,
            igst: totalIGST,
            total: grandTotal
        };
    }

    // Discount Event Listeners
    document.querySelectorAll('input[name="discountType"]').forEach(el => {
        el.addEventListener('change', calculateTotals);
    });
    document.getElementById('discountValue').addEventListener('input', calculateTotals);

    // Exports
    // Reset Button
    document.getElementById('resetBtn').addEventListener('click', () => {
        if (!confirm('Are you sure you want to reset all values to default?')) return;

        // Reset Form
        document.getElementById('invoiceForm').reset();
        invoiceDate.valueAsDate = new Date(); // Reset date to today

        // Reset State
        state.items = [];
        state.taxType = 'Same State';
        state.logoImage = null;
        state.signatureImage = null;

        // Reset Visuals
        itemsBody.innerHTML = '';
        addItem(); // add initial item

        // Clear Images & Canvas
        logoPreview.style.display = 'none';
        logoPlaceholder.style.display = 'block';
        signaturePreview.style.display = 'none';
        signaturePlaceholder.style.display = 'block';
        document.getElementById('signatureUrlPreview').style.display = 'none';
        document.getElementById('signatureUrlPlaceholder').style.display = 'block';
        ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);

        // Retrigger Toggles checks (to ensure correct inputs are shown)
        const logoOpt = document.querySelector('input[name="logoOption"]:checked');
        if (logoOpt) logoOpt.dispatchEvent(new Event('change'));
        const sigOpt = document.querySelector('input[name="signatureOption"]:checked');
        if (sigOpt) sigOpt.dispatchEvent(new Event('change'));

        // Retrigger Auto-load if URLs are present (Defaults)
        setTimeout(() => {
            if (logoUrl.value && !document.getElementById('logoUrlInput').classList.contains('d-none')) {
                previewLogoUrlBtn.click();
            }
            if (signatureUrl.value && !document.getElementById('sigUrlInput').classList.contains('d-none')) {
                // Manually trigger input to load sig
                signatureUrl.dispatchEvent(new Event('input'));
            }
        }, 100);

        calculateTotals();
    });

    document.getElementById('btnTaxInvoice').addEventListener('click', () => {
        generateTaxInvoice(gatherData());
    });

    document.getElementById('btnSimpleInvoice').addEventListener('click', () => {
        generateSimpleInvoice(gatherData());
    });

    document.getElementById('btnChallan').addEventListener('click', () => {
        generateDeliveryChallan(gatherData());
    });

    function gatherData() {
        const totals = state.totals || { subtotal: 0, discount: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
        return {
            details: {
                invoiceNumber: document.getElementById('invoiceNumber').value,
                date: document.getElementById('invoiceDate').value,
                companyName: document.getElementById('companyName').value,
                companyGst: document.getElementById('companyGst').value,
                companyPhone: document.getElementById('companyPhone').value,
                companyAddress: document.getElementById('companyAddress').value,
                clientName: document.getElementById('clientName').value,
                clientGst: document.getElementById('clientGst').value,
                clientPhone: document.getElementById('clientPhone').value,
                clientAddress: document.getElementById('clientAddress').value,
                taxType: state.taxType,
                logo: state.logoImage,
                signature: state.signatureImage,
                transportMode: document.getElementById('transportMode').value,
                vehicleNumber: document.getElementById('vehicleNumber').value,
                accountName: document.getElementById('accountName').value,
                bankName: document.getElementById('bankName').value,
                accountNumber: document.getElementById('accountNumber').value,
                ifscCode: document.getElementById('ifscCode').value,
                upiId: document.getElementById('upiId').value
            },
            items: state.items,
            totals: totals,
            numberInWords: numberToWords(totals.total),
            numberInWordsSimple: numberToWords(totals.subtotal - totals.discount)
        };
    }

    function numberToWords(amount) {
        if (!amount || amount === 0) return 'Zero Rupees Only';

        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        function convert(n) {
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
            if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
            if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
            if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
            return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
        }

        const integerPart = Math.floor(amount);
        const decimalPart = Math.round((amount - integerPart) * 100);

        let str = convert(integerPart) + ' Rupees';
        if (decimalPart > 0) {
            str += ' and ' + convert(decimalPart) + ' Paise';
        }

        return str + ' Only';
    }
});
