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
    const logoUrl = document.getElementById('logoUrl');
    const previewLogoUrlBtn = document.getElementById('previewLogoUrlBtn');
    const logoPreview = document.getElementById('logoPreview');
    const logoPlaceholder = document.getElementById('logoPlaceholder');
    const signatureCanvas = document.getElementById('signatureCanvas');
    const clearSignatureBtn = document.getElementById('clearSignatureBtn');
    const signaturePreview = document.getElementById('signaturePreview');
    const signaturePlaceholder = document.getElementById('signaturePlaceholder');

    // Toggle Inputs
    // Logo Option - Only URL exists effectively, masking this
    // If you want to keep the listener in case of future expansion, ensure elements exist.
    // For now, simpler to remove the toggle logic if only 1 option or just remove reference to missing ID.

    document.querySelectorAll('input[name="signatureOption"]').forEach(el => {
        el.addEventListener('change', (e) => {
            const val = e.target.value;
            document.getElementById('sigDrawInput').classList.toggle('d-none', val !== 'draw');
            document.getElementById('sigUrlInput').classList.toggle('d-none', val !== 'url');
            if (val === 'draw') {
                setTimeout(resizeCanvas, 0); // Trigger resize once visible
            }
        });
    });

    // Signature URL
    const signatureUrl = document.getElementById('signatureUrl');
    signatureUrl.addEventListener('input', (e) => {
        const url = e.target.value;
        if (url) {
            convertImgToBase64(url, (base64) => {
                state.signatureImage = base64;
                document.getElementById('signatureUrlPreview').src = base64;
                document.getElementById('signatureUrlPreview').style.display = 'block';
                document.getElementById('signatureUrlPlaceholder').style.display = 'none';
            });
        } else {
            state.signatureImage = null;
            document.getElementById('signatureUrlPreview').style.display = 'none';
            document.getElementById('signatureUrlPlaceholder').style.display = 'block';
        }
    });

    // Clear Signature URL
    document.getElementById('clearSigUrlBtn').addEventListener('click', () => {
        signatureUrl.value = '';
        state.signatureImage = null;
        document.getElementById('signatureUrlPreview').style.display = 'none';
        document.getElementById('signatureUrlPreview').src = '';
        document.getElementById('signatureUrlPlaceholder').style.display = 'block';
    });

    // Logo URL Input - Auto Load
    logoUrl.addEventListener('input', (e) => {
        const url = e.target.value;
        if (url) {
            convertImgToBase64(url, (base64) => {
                state.logoImage = base64;
                logoPreview.src = base64;
                logoPreview.style.display = 'block';
                logoPlaceholder.style.display = 'none';
            });
        }
    });

    // Check if previewLogoUrlBtn exists before adding listener if needed, 
    // but assuming it does based on previous logic.
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

    // Clear Logo URL
    document.getElementById('clearLogoUrlBtn').addEventListener('click', () => {
        logoUrl.value = '';
        state.logoImage = null;
        logoPreview.style.display = 'none';
        logoPreview.src = '';
        logoPlaceholder.style.display = 'block';
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

    // Handle window resize
    window.addEventListener('resize', () => {
        // Save current signature if any
        const temp = state.signatureImage;
        resizeCanvas();
        // Restore if it was from URL or just let it clear (resizing wipes canvas)
        if (temp && temp.startsWith('data:image')) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = temp;
        }
    });

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
            <td data-label="Item Name">
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control" placeholder="Item Name" value="${item.name}" 
                        list="itemList"
                        oninput="updateItemData(${item.id}, 'name', this.value)"
                        onchange="checkAndAutoFill(${item.id}, this)">
                    <button class="btn btn-sm btn-outline-secondary" type="button" onclick="openItemModalForSelection(${item.id})" title="Pick from List">
                        <i class="fas fa-list"></i>
                    </button>
                </div>
            </td>
            <td data-label="HSN/SAC"><input type="text" class="form-control form-control-sm" placeholder="HSN" value="${item.hsn}" oninput="updateItemData(${item.id}, 'hsn', this.value)"></td>
            <td data-label="Qty"><input type="number" class="form-control form-control-sm" placeholder="Qty" value="${item.qty}" oninput="updateItemData(${item.id}, 'qty', parseFloat(this.value))"></td>
            <td data-label="Rate"><input type="number" class="form-control form-control-sm" placeholder="Rate" value="${item.rate}" oninput="updateItemData(${item.id}, 'rate', parseFloat(this.value))"></td>
            <td data-label="GST">
                <input type="number" class="form-control form-control-sm" placeholder="GST" value="${item.gst}" list="gstRates" oninput="updateItemData(${item.id}, 'gst', parseFloat(this.value))">
            </td>
            <td data-label="Amount" class="text-end pe-4 fw-medium row-amount">${total.toFixed(2)}</td>
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
        let initialCGST = 0;
        let initialSGST = 0;
        let initialIGST = 0;

        state.items.forEach(item => {
            const qty = item.qty || 0;
            const rate = item.rate || 0;
            const taxable = qty * rate;
            const taxRate = item.gst || 0;
            const taxAmt = taxable * (taxRate / 100);

            subtotal += taxable;

            if (state.taxType === 'Same State') {
                initialCGST += taxAmt / 2;
                initialSGST += taxAmt / 2;
            } else {
                initialIGST += taxAmt;
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

        // New logic: GST is calculated on Taxable Value (Subtotal - Discount)
        const taxableValue = subtotal - discountAmount;

        // Scale GST proportionally based on the discount applied to the subtotal
        const gstFactor = subtotal > 0 ? (taxableValue / subtotal) : 0;

        const totalCGST = initialCGST * gstFactor;
        const totalSGST = initialSGST * gstFactor;
        const totalIGST = initialIGST * gstFactor;

        const grandTotal = taxableValue + totalCGST + totalSGST + totalIGST;

        document.getElementById('summarySubtotal').textContent = '₹' + subtotal.toFixed(2);
        document.getElementById('summaryDiscount').textContent = '- ₹' + discountAmount.toFixed(2);
        document.getElementById('summaryCGST').textContent = '₹' + totalCGST.toFixed(2);
        document.getElementById('summarySGST').textContent = '₹' + totalSGST.toFixed(2);
        document.getElementById('summaryIGST').textContent = '₹' + totalIGST.toFixed(2);
        document.getElementById('summaryTotal').textContent = '₹' + grandTotal.toFixed(2);
        document.getElementById('summaryAmountInWords').textContent = numberToWords(grandTotal);

        // Save to state
        state.totals = {
            subtotal: subtotal,
            discount: discountAmount,
            taxableValue: taxableValue,
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
        document.getElementById('signatureUrlPlaceholder').style.display = 'block';
        ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        document.getElementById('invoiceNote').value = '';

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

    document.getElementById('btnQuote').addEventListener('click', () => {
        generateQuote(gatherData());
    });

    function gatherData() {
        const totals = state.totals || { subtotal: 0, discount: 0, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
        const getVal = (id) => document.getElementById(id)?.value || '';

        return {
            details: {
                invoiceNumber: getVal('invoiceNumber'),
                date: getVal('invoiceDate'),
                companyName: getVal('companyName'),
                companyGst: getVal('companyGst'),
                companyPhone: getVal('companyPhone'),
                companyAddress: getVal('companyAddress'),
                clientName: getVal('clientName'),
                clientGst: getVal('clientGst'),
                clientPhone: getVal('clientPhone'),
                clientAddress: getVal('clientAddress'),
                taxType: state.taxType,
                logo: state.logoImage,
                signature: state.signatureImage,
                transportMode: getVal('transportMode'),
                vehicleNumber: getVal('vehicleNumber'),
                accountName: getVal('accountName'),
                bankName: getVal('bankName'),
                accountNumber: getVal('accountNumber'),
                ifscCode: getVal('ifscCode'),
                upiId: getVal('upiId'),
                note: getVal('invoiceNote')
            },
            items: state.items,
            totals: totals,
            numberInWords: numberToWords(totals.total),
            numberInWordsSimple: numberToWords(totals.taxableValue)
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
    // Profile Manager Implementation
    const ProfileManager = {
        currentType: 'company',
        profiles: [],

        init() {
            this.modal = new bootstrap.Modal(document.getElementById('profileModal'));
            document.getElementById('addProfileRowBtn').addEventListener('click', () => this.addRow());
        },

        open(type) {
            this.currentType = type;
            let title = 'Manage Profiles';
            if (type === 'company') title = 'Manage Company Profiles';
            else if (type === 'client') title = 'Manage Client Profiles';
            else if (type === 'payment') title = 'Manage Payment Details';

            document.getElementById('profileModalTitle').textContent = title;
            this.loadProfiles();
            this.renderTable();
            this.modal.show();
        },

        loadProfiles() {
            let key = 'invoice_profiles_company';
            if (this.currentType === 'client') key = 'invoice_profiles_client';
            if (this.currentType === 'payment') key = 'invoice_profiles_payment';

            const data = localStorage.getItem(key);
            this.profiles = data ? JSON.parse(data) : [];
        },

        loadDefaults() {
            // Load Company Default
            const companyData = localStorage.getItem('invoice_profiles_company');
            if (companyData) {
                const profiles = JSON.parse(companyData);
                if (profiles.length > 0) {
                    this.currentType = 'company';
                    this.profiles = profiles;
                    this.useProfile(0);
                }
            }
            // Load Client Default (optional, maybe user doesn't want client pre-filled?)
            // User said "use top profile values", implies generic preferences. 
            // Usually Company is static, Client varies. But let's follow instruction "top profile values".
            const clientData = localStorage.getItem('invoice_profiles_client');
            if (clientData) {
                const profiles = JSON.parse(clientData);
                if (profiles.length > 0) {
                    this.currentType = 'client';
                    this.profiles = profiles;
                    this.useProfile(0);
                }
            }

            // Load Payment Default
            const paymentData = localStorage.getItem('invoice_profiles_payment');
            if (paymentData) {
                const profiles = JSON.parse(paymentData);
                if (profiles.length > 0) {
                    this.currentType = 'payment';
                    this.profiles = profiles;
                    this.useProfile(0);
                }
            }
        },

        saveProfiles() {
            let key = 'invoice_profiles_company';
            if (this.currentType === 'client') key = 'invoice_profiles_client';
            if (this.currentType === 'payment') key = 'invoice_profiles_payment';

            localStorage.setItem(key, JSON.stringify(this.profiles));
        },

        fields() {
            switch (this.currentType) {
                case 'company':
                    return [
                        { key: 'companyName', label: 'Company Name', id: 'companyName' },
                        { key: 'companyAddress', label: 'Address', id: 'companyAddress' },
                        { key: 'companyGstin', label: 'GSTIN', id: 'companyGst' },
                        { key: 'companyPhone', label: 'Phone', id: 'companyPhone' },
                        { key: 'companyEmail', label: 'Email', id: 'companyEmail' },
                        { key: 'logoUrl', label: 'Logo URL', id: 'logoUrl' },
                        { key: 'signatureUrl', label: 'Signature URL', id: 'signatureUrl' }
                    ];
                case 'client':
                    return [
                        { key: 'clientName', label: 'Client Name', id: 'clientName' },
                        { key: 'clientAddress', label: 'Address', id: 'clientAddress' },
                        { key: 'clientGstin', label: 'GSTIN', id: 'clientGst' },
                        { key: 'clientPhone', label: 'Phone', id: 'clientPhone' },
                        { key: 'clientEmail', label: 'Email', id: 'clientEmail' },
                        { key: 'clientNotes', label: 'Notes', id: 'clientNotes' },
                        { key: 'state', label: 'State', id: 'clientState', options: ['Same State', 'Inter State'] }
                    ];
                case 'payment':
                    return [
                        { key: 'accountName', label: 'Account Name', id: 'accountName' },
                        { key: 'bankName', label: 'Bank Name - Branch', id: 'bankName' },
                        { key: 'accountNumber', label: 'Account No', id: 'accountNumber' },
                        { key: 'ifscCode', label: 'IFSC', id: 'ifscCode' },
                        { key: 'upiId', label: 'UPI ID', id: 'upiId' }
                    ];
                default: return [];
            }
        },

        autoSaveClient() {
            const clientName = document.getElementById('clientName').value;
            if (!clientName) return; // Don't save empty names

            // Retrieve current client profiles without changing global state excessively
            const key = 'invoice_profiles_client';
            const data = localStorage.getItem(key);
            let profiles = data ? JSON.parse(data) : [];

            // Check if exists
            const existingIndex = profiles.findIndex(p => p.clientName === clientName);

            const currentProfile = {
                clientName: clientName,
                clientAddress: document.getElementById('clientAddress').value,
                clientGstin: document.getElementById('clientGst').value,
                clientPhone: document.getElementById('clientPhone').value,
                clientEmail: document.getElementById('clientEmail').value,
                clientNotes: document.getElementById('clientNotes').value,
                state: document.getElementById('clientState').value
            };

            if (existingIndex !== -1) {
                // Update existing
                profiles[existingIndex] = currentProfile;
            } else {
                // Add new
                profiles.push(currentProfile);
            }

            localStorage.setItem(key, JSON.stringify(profiles));
            // If the modal is open and showing clients, refresh it? 
            // Better not to disturb UI flux too much unless needed.
        },

        moveProfile(index, direction) {
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= this.profiles.length) return;

            // Swap
            [this.profiles[index], this.profiles[newIndex]] = [this.profiles[newIndex], this.profiles[index]];
            this.saveProfiles();
            this.renderTable();
        },

        renderTable() {
            const fields = this.fields();
            const thead = document.getElementById('profileTableHeader');
            const tbody = document.getElementById('profileTableBody');
            const emptyState = document.getElementById('profileEmptyState');

            // Header
            thead.innerHTML = '';
            fields.forEach(f => {
                const th = document.createElement('th');
                th.textContent = f.label;
                thead.appendChild(th);
            });
            thead.innerHTML += '<th style="width: 150px;">Actions</th>';

            // Body
            tbody.innerHTML = '';
            if (this.profiles.length === 0) {
                emptyState.classList.remove('d-none');
            } else {
                emptyState.classList.add('d-none');
                this.profiles.forEach((profile, index) => {
                    const tr = document.createElement('tr');
                    fields.forEach(f => {
                        const td = document.createElement('td');
                        td.setAttribute('data-label', f.label);
                        if (f.key === 'state') {
                            // Select for state
                            const select = document.createElement('select');
                            select.className = 'form-select form-select-sm border-0 bg-transparent';
                            f.options.forEach(opt => {
                                const option = document.createElement('option');
                                option.value = opt;
                                option.textContent = opt === 'Same State' ? 'Intra-State' : 'Inter-State';
                                if (opt === profile[f.key]) option.selected = true;
                                select.appendChild(option);
                            });
                            select.addEventListener('change', (e) => this.updateField(index, f.key, e.target.value));
                            td.appendChild(select);
                        } else {
                            // Text Input
                            const input = document.createElement('input');
                            input.type = 'text';
                            input.className = 'form-control form-control-sm border-0 bg-transparent';
                            input.value = profile[f.key] || '';
                            input.placeholder = f.label;
                            input.addEventListener('input', (e) => this.updateField(index, f.key, e.target.value));
                            td.appendChild(input);
                        }
                        tr.appendChild(td);
                    });

                    // Reorder & Actions
                    const actionTd = document.createElement('td');
                    actionTd.setAttribute('data-label', 'Actions');
                    actionTd.style.whiteSpace = 'nowrap';
                    actionTd.innerHTML = `
                         <button class="btn btn-sm btn-outline-secondary me-1" onclick="moveProfile(${index}, -1)" title="Move Up" ${index === 0 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary me-1" onclick="moveProfile(${index}, 1)" title="Move Down" ${index === this.profiles.length - 1 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button class="btn btn-sm btn-success me-1" onclick="useProfile(${index})" title="Use">
                            <i class="fas fa-check"></i> 
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteProfile(${index})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    tr.appendChild(actionTd);
                    tbody.appendChild(tr);
                });
            }
        },

        addRow() {
            const newProfile = {};
            this.fields().forEach(f => newProfile[f.key] = f.key === 'state' ? 'Same State' : '');
            this.profiles.push(newProfile);
            this.saveProfiles();
            this.renderTable();
        },

        updateField(index, key, value) {
            this.profiles[index][key] = value;
            this.saveProfiles();
        },

        deleteProfile(index) {
            if (confirm('Delete this profile?')) {
                this.profiles.splice(index, 1);
                this.saveProfiles();
                this.renderTable();
            }
        },

        useProfile(index) {
            const profile = this.profiles[index];
            const fields = this.fields();
            fields.forEach(f => {
                const el = document.getElementById(f.id);
                if (el) {
                    el.value = profile[f.key];
                    // Trigger change event for State select to update tax display
                    if (f.key === 'state') el.dispatchEvent(new Event('change'));
                    // Trigger input event for URLs to update previews
                    if (f.key === 'logoUrl' || f.key === 'signatureUrl') el.dispatchEvent(new Event('input'));
                }
            });
            this.modal.hide();
        }
    };

    // Initialize Profile Logic
    ProfileManager.init();
    ProfileManager.loadDefaults();

    // Expose global functions for HTML onclick
    window.openProfileModal = (type) => ProfileManager.open(type);
    window.deleteProfile = (index) => ProfileManager.deleteProfile(index);
    window.useProfile = (index) => ProfileManager.useProfile(index);
    window.moveProfile = (index, dir) => ProfileManager.moveProfile(index, dir);

    // Auto-Save Listeners for Client Fields
    ['clientName', 'clientAddress', 'clientGst', 'clientPhone', 'clientEmail', 'clientNotes', 'clientState'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('blur', () => ProfileManager.autoSaveClient());
        }
    });

    // Item Manager Implementation
    const ItemManager = {
        items: [],
        modal: null,
        targetRowId: null,

        init() {
            this.modal = new bootstrap.Modal(document.getElementById('itemModal'));
            this.loadItems();
            this.updateDatalist();
        },

        loadItems() {
            const data = localStorage.getItem('invoice_items_catalogue');
            this.items = data ? JSON.parse(data) : [];
        },

        saveItems() {
            localStorage.setItem('invoice_items_catalogue', JSON.stringify(this.items));
            this.updateDatalist();
        },

        updateDatalist() {
            const datalist = document.getElementById('itemList');
            if (datalist) {
                datalist.innerHTML = '';
                this.items.forEach(item => {
                    const opt = document.createElement('option');
                    opt.value = item.name;
                    datalist.appendChild(opt);
                });
            }
        },

        renderTable() {
            const tbody = document.getElementById('itemTableBody');
            const emptyState = document.getElementById('itemEmptyState');
            tbody.innerHTML = '';

            if (this.items.length === 0) {
                emptyState.classList.remove('d-none');
            } else {
                emptyState.classList.add('d-none');
                this.items.forEach((item, index) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td data-label="Item Name"><input type="text" class="form-control form-control-sm" value="${item.name}" onchange="ItemManager.updateField(${index}, 'name', this.value)"></td>
                        <td data-label="HSN/SAC"><input type="text" class="form-control form-control-sm" value="${item.hsn}" onchange="ItemManager.updateField(${index}, 'hsn', this.value)"></td>
                        <td data-label="Rate"><input type="number" class="form-control form-control-sm" value="${item.rate}" onchange="ItemManager.updateField(${index}, 'rate', parseFloat(this.value))"></td>
                        <td data-label="GST %"><input type="number" class="form-control form-control-sm" value="${item.gst}" onchange="ItemManager.updateField(${index}, 'gst', parseFloat(this.value))"></td>
                        <td data-label="Actions">
                            <button class="btn btn-sm btn-success me-1" onclick="ItemManager.useItem(${index})">
                                <i class="fas fa-check"></i> Use
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="ItemManager.deleteItem(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        },

        updateField(index, key, value) {
            this.items[index][key] = value;
            this.saveItems();
        },

        deleteItem(index) {
            if (confirm('Delete this item?')) {
                this.items.splice(index, 1);
                this.saveItems();
                this.renderTable();
            }
        },

        addRow() {
            this.items.push({ name: '', hsn: '', rate: 0, gst: 18 });
            this.saveItems();
            this.renderTable();
        },

        open(targetId = null) {
            this.targetRowId = targetId;
            this.renderTable();
            this.modal.show();
        },

        useItem(index) {
            const item = this.items[index];
            if (this.targetRowId) {
                // Populate specific row
                const rowItem = state.items.find(i => i.id === this.targetRowId);
                if (rowItem) {
                    rowItem.name = item.name;
                    rowItem.hsn = item.hsn;
                    rowItem.rate = item.rate;
                    rowItem.gst = item.gst;
                    // Trigger refresh
                    renderItems();
                    calculateTotals();
                }
            } else {
                // Add as new row
                const id = Date.now();
                state.items.push({
                    id,
                    name: item.name,
                    hsn: item.hsn,
                    qty: 1,
                    rate: item.rate,
                    gst: item.gst
                });
                renderItems();
                calculateTotals();
            }
            this.modal.hide();
        },

        // Auto Save Logic
        checkAndSave(name, hsn, rate, gst) {
            if (!name) return;
            // Only save if we have a rate (implies "fully entered" somewhat)
            if (!rate || rate <= 0) return;

            // Check if exists
            const exists = this.items.find(i => i.name.toLowerCase() === name.toLowerCase());
            if (!exists) {
                this.items.push({ name, hsn: hsn || '', rate: rate, gst: gst || 18 });
                this.saveItems();
                console.log('Auto-saved new item:', name);
            }
        }
    };

    // Initialize
    ItemManager.init();

    // Global Exposure
    window.ItemManager = ItemManager;
    window.openItemModal = () => ItemManager.open();
    window.openItemModalForSelection = (id) => ItemManager.open(id);

    // Auto-fill and Auto-save Handler
    window.checkAndAutoFill = (id, input) => {
        const val = input.value;
        const item = ItemManager.items.find(i => i.name === val);
        if (item) {
            // Auto-fill
            window.updateItemData(id, 'hsn', item.hsn);
            window.updateItemData(id, 'rate', item.rate);
            window.updateItemData(id, 'gst', item.gst);
            // Re-render to show updated values
            renderItems();
            calculateTotals();
        } else {
            // It's a new item (or name changed)
            const row = state.items.find(i => i.id === id);
            if (row && row.name) {
                ItemManager.checkAndSave(row.name, row.hsn, row.rate, row.gst);
            }
        }
    };

    // Hook into updateItemData to trigger auto-save on other fields changing too
    const originalUpdate = window.updateItemData;
    window.updateItemData = (id, field, value) => {
        originalUpdate(id, field, value); // Call original
        // Try auto-save if we have enough info
        const row = state.items.find(i => i.id === id);
        if (row && row.name && field !== 'qty') { // Don't save on qty change
            ItemManager.checkAndSave(row.name, row.hsn, row.rate, row.gst);
        }
    };

    // Invoice History & Management
    const InvoiceManager = {
        history: [],
        modal: null,

        init() {
            this.modal = new bootstrap.Modal(document.getElementById('historyModal'));
            this.loadHistory();
        },

        loadHistory() {
            const data = localStorage.getItem('invoice_history');
            this.history = data ? JSON.parse(data) : [];
        },

        saveHistory() {
            try {
                localStorage.setItem('invoice_history', JSON.stringify(this.history));
            } catch (e) {
                console.error('Storage failed:', e);
                alert('Storage full! Could not save history. Please delete old invoices or use smaller images.');
                // Remove the failed entry from memory so UI stays consistent
                this.history.shift();
            }
        },

        saveCurrent() {
            const data = gatherData();
            const snapshot = {
                id: Date.now(),
                savedAt: new Date().toLocaleString(),
                details: { ...data.details, logo: null, signature: null }, // Don't save base64 images to history to save space
                items: JSON.parse(JSON.stringify(state.items)),
                totals: data.totals,
                settings: JSON.parse(JSON.stringify(data.details)) // Use gathered details as settings
            };
            snapshot.settings.discountType = document.querySelector('input[name="discountType"]:checked').value;
            snapshot.settings.discountValue = document.getElementById('discountValue').value;


            // Check for duplicate Invoice Number
            const existingIndex = this.history.findIndex(inv => inv.details.invoiceNumber === data.details.invoiceNumber);

            if (existingIndex !== -1) {
                if (confirm(`Invoice number "${data.details.invoiceNumber}" already exists in history. Do you want to overwrite it?`)) {
                    // Update existing
                    this.history[existingIndex] = snapshot;
                    this.saveHistory();
                    alert('Invoice updated successfully!');
                }
                // If they cancel, we do nothing (don't save)
            } else {
                // New Invoice
                this.history.unshift(snapshot);
                if (this.history.length > 50) this.history.pop();
                this.saveHistory();
                alert('Invoice saved successfully!');
            }
        },

        openHistory() {
            this.renderTable();
            this.modal.show();
        },

        renderTable() {
            const tbody = document.getElementById('historyTableBody');
            const emptyState = document.getElementById('historyEmptyState');
            tbody.innerHTML = '';

            if (this.history.length === 0) {
                emptyState.classList.remove('d-none');
            } else {
                emptyState.classList.add('d-none');
                this.history.forEach((record, index) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td data-label="Date Saved">${record.savedAt}</td>
                        <td data-label="Invoice #" class="fw-bold">${record.details.invoiceNumber}</td>
                        <td data-label="Client">${record.details.clientName || '-'}</td>
                        <td data-label="Amount">₹${record.totals.total.toFixed(2)}</td>
                        <td data-label="Actions">
                            <button class="btn btn-sm btn-primary me-1" onclick="InvoiceManager.load(${index})">
                                <i class="fas fa-box-open"></i> Load
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="InvoiceManager.delete(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        },

        delete(index) {
            if (confirm('Delete this saved invoice?')) {
                this.history.splice(index, 1);
                this.saveHistory();
                this.renderTable();
            }
        },

        load(index) {
            if (!confirm('Load this invoice? Unsaved changes will be lost.')) return;

            const record = this.history[index];
            const s = record.settings;
            const d = record.details;

            // Restore Inputs
            document.getElementById('invoiceNumber').value = d.invoiceNumber;
            document.getElementById('invoiceDate').value = d.date;
            document.getElementById('invoiceNote').value = d.note || '';

            document.getElementById('companyName').value = s.companyName;
            document.getElementById('companyAddress').value = s.companyAddress;
            document.getElementById('companyGst').value = s.companyGstin;
            document.getElementById('companyPhone').value = s.companyPhone;
            document.getElementById('companyEmail').value = s.companyEmail || '';

            document.getElementById('logoUrl').value = s.logoUrl;
            document.getElementById('signatureUrl').value = s.signatureUrl;

            document.getElementById('clientName').value = s.clientName;
            document.getElementById('clientAddress').value = s.clientAddress;
            document.getElementById('clientGst').value = s.clientGstin;
            document.getElementById('clientPhone').value = s.clientPhone;
            document.getElementById('clientEmail').value = s.clientEmail || '';
            document.getElementById('clientNotes').value = s.clientNotes || '';
            document.getElementById('clientState').value = s.clientState;

            document.getElementById('transportMode').value = s.transportMode;
            document.getElementById('vehicleNumber').value = s.vehicleNumber;

            document.getElementById('bankName').value = s.bankName;
            document.getElementById('accountName').value = s.accountName || '';
            document.getElementById('accountNumber').value = s.accountNumber;
            document.getElementById('ifscCode').value = s.ifscCode;
            document.getElementById('upiId').value = s.upiId;

            // Restore Radio
            if (s.discountType === 'percent') document.getElementById('discPercent').checked = true;
            else document.getElementById('discFixed').checked = true;
            document.getElementById('discountValue').value = s.discountValue;

            // Restore State
            state.items = JSON.parse(JSON.stringify(record.items)); // Deep copy
            state.taxType = s.clientState === 'Same State' ? 'Same State' : 'Inter State';

            // Trigger Events
            document.getElementById('logoUrl').dispatchEvent(new Event('input'));
            document.getElementById('signatureUrl').dispatchEvent(new Event('input'));
            document.getElementById('clientState').dispatchEvent(new Event('change'));

            // Render
            renderItems();
            calculateTotals();

            this.modal.hide();
        }
    };

    InvoiceManager.init();
    window.InvoiceManager = InvoiceManager;

    // Sync Manager Implementation
    const SyncManager = {
        supabase: null,
        url: 'https://ucaqnrzoacndwvaqfmjc.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjYXFucnpvYWNuZHd2YXFmbWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTMwMjAsImV4cCI6MjA4MTEyOTAyMH0.4gycNFqN2Bri2TWB79q4e7lxaldoovS61RPgIO-OdtU',

        // UI Elements
        connEl: document.getElementById('connectionIcon'),
        syncEl: document.getElementById('syncIcon'),
        textEl: document.getElementById('syncText'),
        textContainer: document.getElementById('syncStatusText'),
        helpModal: null,

        keysToSync: ['invoice_history', 'invoice_profiles_company', 'invoice_profiles_client', 'invoice_profiles_payment', 'invoice_items_catalogue', 'error_log'],
        isOnline: true,

        init() {
            try {
                this.helpModal = new bootstrap.Modal(document.getElementById('setupHelpModal'));
                this.supabase = window.supabase.createClient(this.url, this.key);
                this.textEl.textContent = 'Init...';
                this.pullFromCloud(); // Initial Pull

                // Start Auto-Backup
                setInterval(() => this.pushToCloud(), 10000);
            } catch (e) {
                console.error('Supabase Init Fail:', e);
                this.setErrorState('Config Error');
            }
        },

        showHelp() {
            if (this.helpModal) this.helpModal.show();
        },

        async pullFromCloud() {
            try {
                this.setSyncingState();
                const { data, error } = await this.supabase
                    .from('user_data')
                    .select('key, value');

                if (error) {
                    // Check for missing table error (42P01 is Postgres, PGRST205 is PostgREST)
                    if (error.code === '42P01' || error.code === 'PGRST205' || (error.message && error.message.includes('relation "user_data" does not exist'))) {
                        console.warn('Table user_data not found.');
                        this.setErrorState('Setup Required');
                        return;
                    }
                    throw error;
                }
                if (!data) return;

                // Update Local Storage from Cloud Data
                let updates = 0;
                data.forEach(row => {
                    if (this.keysToSync.includes(row.key)) {
                        localStorage.setItem(row.key, JSON.stringify(row.value));
                        updates++;
                    }
                });

                if (updates > 0) {
                    console.log(`Pulled ${updates} keys from cloud. Reloading managers...`);
                    // Reload Managers to reflect new data
                    if (window.InvoiceManager && window.InvoiceManager.loadHistory) {
                        window.InvoiceManager.loadHistory();
                        window.InvoiceManager.renderTable();
                    }
                    if (window.ProfileManager && window.ProfileManager.loadProfiles) window.ProfileManager.loadProfiles();
                    if (window.ItemManager && window.ItemManager.loadItems) window.ItemManager.loadItems();
                }

                this.setSuccessState();
            } catch (err) {
                console.error('Pull Failed:', err);
                // If it's a network error or other issue
                this.setErrorState('Offline');
                this.isOnline = false;
            }
        },

        async pushToCloud() {
            if (!this.isOnline) {
                // Try to reconnect?
                // For now, let's try pushing anyway
            }

            this.setSyncingState();
            try {
                const upserts = this.keysToSync.map(key => {
                    const val = localStorage.getItem(key);
                    return {
                        key: key,
                        value: val ? JSON.parse(val) : null,
                        updated_at: new Date().toISOString()
                    };
                });

                // Upsert all keys
                const { error } = await this.supabase
                    .from('user_data')
                    .upsert(upserts);

                if (error) {
                    if (error.code === '42P01' || error.code === 'PGRST205' || (error.message && error.message.includes('relation "user_data" does not exist'))) {
                        this.setErrorState('Setup Required');
                        return;
                    }
                    throw error;
                }

                this.setSuccessState();
                this.isOnline = true;
            } catch (err) {
                console.error('Push Failed:', err);
                this.setErrorState('Failed');
            }
        },

        setSyncingState() {
            this.connEl.className = 'fas fa-wifi text-success';
            this.syncEl.className = 'fas fa-sync fa-spin text-primary';
            this.textEl.textContent = 'Syncing...';
            this.textContainer.className = 'badge bg-light text-primary border fw-normal';
            this.textContainer.title = 'Sync in progress';
        },

        setSuccessState() {
            this.connEl.className = 'fas fa-wifi text-success';
            this.syncEl.className = 'fas fa-check text-success';
            this.textEl.textContent = 'Live Backup';
            this.textContainer.className = 'badge bg-success-subtle text-success border border-success-subtle fw-normal';
            this.textContainer.title = 'Data is safe';
        },

        setErrorState(msg) {
            this.connEl.className = 'fas fa-wifi text-danger';
            this.syncEl.className = 'fas fa-exclamation-triangle text-danger';
            this.textEl.textContent = msg;

            if (msg === 'Setup Required') {
                this.textContainer.className = 'badge bg-warning-subtle text-warning border border-warning-subtle fw-normal';
                this.textContainer.style.cursor = 'pointer';
                this.textContainer.title = 'Click to see setup instructions';
            } else {
                this.textContainer.className = 'badge bg-danger-subtle text-danger border border-danger-subtle fw-normal';
                this.textContainer.style.cursor = 'default';
                this.textContainer.title = 'Sync Error';
            }
        }
    };

    // Init Sync after a slight delay to ensure DOM is ready and other managers are loaded
    setTimeout(() => SyncManager.init(), 1000);
    window.SyncManager = SyncManager;

    // Data Manager Implementation
    const DataManager = {
        modal: null,

        init() {
            this.modal = new bootstrap.Modal(document.getElementById('viewDatabaseModal'));

            // Setup import file input handler
            const fileInput = document.getElementById('importFileInput');
            if (fileInput) {
                fileInput.addEventListener('change', (e) => this.handleFileImport(e));
            }
        },

        viewDatabase() {
            // Gather all relevant localStorage data
            const data = {
                invoice_history: this.getLocalStorageItem('invoice_history'),
                invoice_profiles_company: this.getLocalStorageItem('invoice_profiles_company'),
                invoice_profiles_client: this.getLocalStorageItem('invoice_profiles_client'),
                invoice_profiles_payment: this.getLocalStorageItem('invoice_profiles_payment'),
                invoice_items_catalogue: this.getLocalStorageItem('invoice_items_catalogue')
            };

            // Format as pretty JSON
            const jsonStr = JSON.stringify(data, null, 2);
            document.getElementById('databaseJson').textContent = jsonStr;

            // Show modal
            this.modal.show();
        },

        getLocalStorageItem(key) {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        },

        exportData() {
            // Gather all data
            const data = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                data: {
                    invoice_history: this.getLocalStorageItem('invoice_history'),
                    invoice_profiles_company: this.getLocalStorageItem('invoice_profiles_company'),
                    invoice_profiles_client: this.getLocalStorageItem('invoice_profiles_client'),
                    invoice_profiles_payment: this.getLocalStorageItem('invoice_profiles_payment'),
                    invoice_items_catalogue: this.getLocalStorageItem('invoice_items_catalogue')
                }
            };

            // Create blob and download
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-data-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert('Data exported successfully!');
        },

        importData() {
            if (!confirm('Import data? This will OVERWRITE your current local data. Make sure you have a backup first!')) {
                return;
            }

            // Trigger file input
            document.getElementById('importFileInput').click();
        },

        handleFileImport(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);

                    // Validate structure
                    if (!imported.data) {
                        throw new Error('Invalid data format');
                    }

                    // Import each key
                    const keys = ['invoice_history', 'invoice_profiles_company', 'invoice_profiles_client', 'invoice_profiles_payment', 'invoice_items_catalogue'];
                    let importCount = 0;

                    keys.forEach(key => {
                        if (imported.data[key]) {
                            localStorage.setItem(key, JSON.stringify(imported.data[key]));
                            importCount++;
                        }
                    });

                    // Reload all managers
                    if (window.InvoiceManager && window.InvoiceManager.loadHistory) {
                        window.InvoiceManager.loadHistory();
                    }
                    if (window.ProfileManager && window.ProfileManager.loadProfiles) {
                        window.ProfileManager.loadProfiles();
                    }
                    if (window.ItemManager && window.ItemManager.loadItems) {
                        window.ItemManager.loadItems();
                        window.ItemManager.updateDatalist();
                    }

                    alert(`Data imported successfully! ${importCount} categories restored.\n\nExported on: ${imported.exportDate || 'Unknown'}\n\nPlease refresh the page to see all changes.`);

                    // Optionally refresh the page
                    if (confirm('Refresh the page now to apply all changes?')) {
                        location.reload();
                    }

                } catch (err) {
                    console.error('Import failed:', err);
                    alert('Failed to import data. Please make sure the file is a valid backup file exported from this application.');
                }

                // Reset file input
                event.target.value = '';
            };

            reader.readAsText(file);
        }
    };

    // Error Logger Implementation
    const ErrorLogger = {
        logs: [], // Initialize immediately
        modal: null,

        init() {
            const modalEl = document.getElementById('viewLogsModal');
            if (modalEl) this.modal = new bootstrap.Modal(modalEl);
            this.load();
            this.setupListeners();
        },

        setupListeners() {
            window.onerror = (message, source, lineno, colno, error) => {
                this.log({
                    type: 'Error',
                    message,
                    source,
                    line: lineno,
                    col: colno,
                    stack: error ? error.stack : null
                });
            };

            window.onunhandledrejection = (event) => {
                this.log({
                    type: 'Unhandled Rejection',
                    message: event.reason ? (event.reason.message || event.reason) : 'Unknown reason',
                    reason: event.reason
                });
            };
        },

        log(detail) {
            const entry = {
                timestamp: new Date().toISOString(),
                ...detail
            };
            if (!Array.isArray(this.logs)) this.logs = [];
            this.logs.unshift(entry);
            if (this.logs.length > 100) this.logs.pop();
            this.save();
        },

        load() {
            try {
                const data = localStorage.getItem('error_log');
                const parsed = data ? JSON.parse(data) : [];
                this.logs = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('Failed to load logs:', e);
                this.logs = [];
            }
        },

        save() {
            try {
                localStorage.setItem('error_log', JSON.stringify(this.logs));
            } catch (e) {
                console.error('Failed to save logs:', e);
            }
        },

        open() {
            this.load();
            const content = document.getElementById('logsContent');
            if (!content) return;

            if (this.logs.length === 0) {
                content.textContent = 'No logs found.';
            } else {
                content.textContent = this.logs.map(log => {
                    return `[${log.timestamp}] ${log.type}: ${log.message}\n` +
                        (log.source ? `Source: ${log.source}:${log.line}:${log.col}\n` : '') +
                        (log.stack ? `Stack: ${log.stack}\n` : '') +
                        '--------------------------------------------';
                }).join('\n\n');
            }
            if (this.modal) this.modal.show();
        },

        download() {
            if (this.logs.length === 0) {
                alert('No logs to download.');
                return;
            }
            const text = this.logs.map(log => JSON.stringify(log, null, 2)).join('\n\n---\n\n');
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-error-log-${new Date().toISOString()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        clear() {
            if (confirm('Are you sure you want to clear all error logs?')) {
                this.logs = [];
                this.save();
                this.open(); // Refresh view
            }
        }
    };

    // Initialize Error Logger
    ErrorLogger.init();
    window.ErrorLogger = ErrorLogger;

    // Initialize Data Manager
    DataManager.init();
    window.DataManager = DataManager;

});
