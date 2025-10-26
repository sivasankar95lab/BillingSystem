import React, { useState, useEffect } from 'react';
import { FileText, Building2, Lock, Download, Plus, Trash2, Save, Eye, EyeOff, Menu, X, LogOut } from 'lucide-react';

// Main Application Component
// This is the entry point of the billing application
const BillingApp = () => {
  // Authentication state - tracks if user is logged in
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Password input field state
  const [password, setPassword] = useState('');
  
  // Toggle for showing/hiding password
  const [showPassword, setShowPassword] = useState(false);
  
  // Error message for login attempts
  const [loginError, setLoginError] = useState('');

  // Default password is "billing123" - can be changed in the code
  const APP_PASSWORD = 'billing123';

  // Function to handle user login
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === APP_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  };

  // Function to handle user logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Billing Software</h1>
            <p className="text-gray-600">Secure Access Required</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
            >
              Login
            </button>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              Demo Password: billing123
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Show main billing application after authentication
  return <BillingDashboard onLogout={handleLogout} />;
};

// Main Dashboard Component
// This component manages the entire billing interface
const BillingDashboard = ({ onLogout }) => {
  // State for managing multiple companies
  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: 'ABC Enterprises Pvt Ltd',
      gstin: '29ABCDE1234F1Z5',
      address: '123, MG Road, Bangalore, Karnataka - 560001',
      phone: '+91 80 1234 5678',
      email: 'info@abcenterprises.com',
      pan: 'ABCDE1234F'
    }
  ]);

  // Currently selected company
  const [selectedCompanyId, setSelectedCompanyId] = useState(1);
  
  // Mobile menu visibility state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Current view: 'billing', 'companies', or 'manual'
  const [currentView, setCurrentView] = useState('billing');

  // Get the currently selected company object
  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  // Function to add a new company
  const addCompany = () => {
    const newId = Math.max(...companies.map(c => c.id), 0) + 1;
    setCompanies([...companies, {
      id: newId,
      name: 'New Company',
      gstin: '',
      address: '',
      phone: '',
      email: '',
      pan: ''
    }]);
    setSelectedCompanyId(newId);
    setCurrentView('companies');
  };

  // Function to update company details
  const updateCompany = (id, field, value) => {
    setCompanies(companies.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  // Function to delete a company
  const deleteCompany = (id) => {
    if (companies.length === 1) {
      alert('Cannot delete the last company');
      return;
    }
    setCompanies(companies.filter(c => c.id !== id));
    if (selectedCompanyId === id) {
      setSelectedCompanyId(companies.find(c => c.id !== id).id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Billing Software</h1>
                <p className="text-sm text-gray-600">GST Compliant Invoicing</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('billing')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentView === 'billing' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Create Bill
              </button>
              <button
                onClick={() => setCurrentView('companies')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentView === 'companies' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Manage Companies
              </button>
              <button
                onClick={() => setCurrentView('manual')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentView === 'manual' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                User Manual
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <nav className="md:hidden mt-4 space-y-2">
              <button
                onClick={() => { setCurrentView('billing'); setShowMobileMenu(false); }}
                className={`w-full px-4 py-2 rounded-lg font-medium transition text-left ${
                  currentView === 'billing' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Create Bill
              </button>
              <button
                onClick={() => { setCurrentView('companies'); setShowMobileMenu(false); }}
                className={`w-full px-4 py-2 rounded-lg font-medium transition text-left ${
                  currentView === 'companies' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Manage Companies
              </button>
              <button
                onClick={() => { setCurrentView('manual'); setShowMobileMenu(false); }}
                className={`w-full px-4 py-2 rounded-lg font-medium transition text-left ${
                  currentView === 'manual' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                User Manual
              </button>
              <button
                onClick={onLogout}
                className="w-full px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'billing' && (
          <BillingForm 
            company={selectedCompany}
            companies={companies}
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={setSelectedCompanyId}
          />
        )}
        
        {currentView === 'companies' && (
          <CompanyManagement
            companies={companies}
            onAddCompany={addCompany}
            onUpdateCompany={updateCompany}
            onDeleteCompany={deleteCompany}
          />
        )}

        {currentView === 'manual' && <UserManual />}
      </main>
    </div>
  );
};

// Billing Form Component
// This handles the invoice creation interface
const BillingForm = ({ company, companies, selectedCompanyId, onCompanyChange }) => {
  // Invoice header information
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerGSTIN, setCustomerGSTIN] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Line items for products/services
  const [items, setItems] = useState([
    { id: 1, description: '', hsn: '', quantity: 1, rate: 0, gst: 18 }
  ]);

  // Add a new line item to the invoice
  const addItem = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    setItems([...items, { id: newId, description: '', hsn: '', quantity: 1, rate: 0, gst: 18 }]);
  };

  // Remove a line item from the invoice
  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  // Update a specific field in a line item
  const updateItem = (id, field, value) => {
    setItems(items.map(i => 
      i.id === id ? { ...i, [field]: value } : i
    ));
  };

  // Calculate totals for the invoice
  const calculateTotals = () => {
    let subtotal = 0;
    let totalGST = 0;

    items.forEach(item => {
      const amount = item.quantity * item.rate;
      subtotal += amount;
      totalGST += (amount * item.gst) / 100;
    });

    return {
      subtotal: subtotal.toFixed(2),
      cgst: (totalGST / 2).toFixed(2),
      sgst: (totalGST / 2).toFixed(2),
      total: (subtotal + totalGST).toFixed(2)
    };
  };

  const totals = calculateTotals();

  // Convert number to words for Indian numbering system
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    const convert = (n) => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10];
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + convert(n % 100);
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand ' + convert(n % 1000);
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh ' + convert(n % 100000);
      return convert(Math.floor(n / 10000000)) + ' Crore ' + convert(n % 10000000);
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let result = convert(rupees) + ' Rupees';
    if (paise > 0) {
      result += ' and ' + convert(paise) + ' Paise';
    }
    return result + ' Only';
  };

  // Generate and download PDF invoice
  const generatePDF = () => {
    const content = document.getElementById('invoice-preview');
    
    // Create a new window for printing
    const printWindow = window.open('', '', 'width=800,height=600');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              font-size: 12px;
            }
            .invoice-container { 
              max-width: 800px; 
              margin: 0 auto; 
              border: 2px solid #333;
              padding: 20px;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 10px; 
              margin-bottom: 20px;
            }
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              color: #4F46E5;
              margin-bottom: 5px;
            }
            .invoice-title { 
              font-size: 20px; 
              font-weight: bold; 
              margin-top: 10px;
            }
            .section { 
              margin: 15px 0; 
            }
            .section-title { 
              font-weight: bold; 
              font-size: 14px;
              margin-bottom: 8px;
              color: #333;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 15px 0;
            }
            th, td { 
              border: 1px solid #333; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #f3f4f6; 
              font-weight: bold;
            }
            .text-right { 
              text-align: right; 
            }
            .totals-section { 
              margin-top: 20px;
              border-top: 2px solid #333;
              padding-top: 15px;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 5px 0;
              font-size: 13px;
            }
            .grand-total { 
              font-size: 16px; 
              font-weight: bold; 
              margin-top: 10px;
              padding-top: 10px;
              border-top: 2px solid #333;
            }
            .footer { 
              margin-top: 30px; 
              border-top: 2px solid #333; 
              padding-top: 15px;
            }
            @media print {
              body { margin: 0; }
              .invoice-container { border: none; }
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Company Selection Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
            Select Company
          </h2>
        </div>
        <select
          value={selectedCompanyId}
          onChange={(e) => onCompanyChange(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Invoice Details Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Customer Details Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN (Optional)</label>
            <input
              type="text"
              value={customerGSTIN}
              onChange={(e) => setCustomerGSTIN(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="29ABCDE1234F1Z5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="+91 XXXXXXXXXX"
            />
          </div>
        </div>
      </div>

      {/* Line Items Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Items</h2>
          <button
            onClick={addItem}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-4 overflow-x-auto">
          {items.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">Item {index + 1}</span>
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Product/Service description"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">HSN/SAC</label>
                  <input
                    type="text"
                    value={item.hsn}
                    onChange={(e) => updateItem(item.id, 'hsn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="HSN Code"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rate (₹)</label>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">GST %</label>
                  <select
                    value={item.gst}
                    onChange={(e) => updateItem(item.id, 'gst', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium">
                    ₹{(item.quantity * item.rate).toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">GST Amount</label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium">
                    ₹{((item.quantity * item.rate * item.gst) / 100).toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Total</label>
                  <div className="w-full px-3 py-2 bg-indigo-50 border border-indigo-300 rounded-lg text-sm font-bold text-indigo-700">
                    ₹{(item.quantity * item.rate * (1 + item.gst / 100)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Totals Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Invoice Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal:</span>
            <span className="font-medium">₹{totals.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>CGST:</span>
            <span className="font-medium">₹{totals.cgst}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>SGST:</span>
            <span className="font-medium">₹{totals.sgst}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-200 pt-2 mt-2">
            <span>Grand Total:</span>
            <span className="text-indigo-600">₹{totals.total}</span>
          </div>
          <div className="text-sm text-gray-600 italic mt-2">
            Amount in words: {numberToWords(parseFloat(totals.total))}
          </div>
        </div>

        <button
          onClick={generatePDF}
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Download PDF Invoice</span>
        </button>
      </div>

      {/* Invoice Preview for PDF Generation */}
      <div id="invoice-preview" className="hidden">
        <div className="invoice-container">
          <div className="header">
            <div className="company-name">{company.name}</div>
            <div style={{ fontSize: '11px', marginBottom: '3px' }}>{company.address}</div>
            <div style={{ fontSize: '11px' }}>
              Phone: {company.phone} | Email: {company.email}
            </div>
            <div style={{ fontSize: '11px', marginTop: '5px' }}>
              <strong>GSTIN:</strong> {company.gstin} | <strong>PAN:</strong> {company.pan}
            </div>
            <div className="invoice-title">TAX INVOICE</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Invoice To:</div>
              <div><strong>{customerName}</strong></div>
              {customerGSTIN && <div>GSTIN: {customerGSTIN}</div>}
              <div>{customerAddress}</div>
              {customerPhone && <div>Phone: {customerPhone}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div><strong>Invoice No:</strong> {invoiceNumber}</div>
              <div><strong>Date:</strong> {new Date(invoiceDate).toLocaleDateString('en-IN')}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style={{ width: '5%' }}>Sr.</th>
                <th style={{ width: '35%' }}>Description</th>
                <th style={{ width: '10%' }}>HSN/SAC</th>
                <th style={{ width: '10%' }}>Qty</th>
                <th style={{ width: '12%' }}>Rate</th>
                <th style={{ width: '8%' }}>GST%</th>
                <th style={{ width: '20%' }} className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.description}</td>
                  <td>{item.hsn}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.rate.toFixed(2)}</td>
                  <td>{item.gst}%</td>
                  <td className="text-right">₹{(item.quantity * item.rate * (1 + item.gst / 100)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals-section">
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '300px' }}>
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>₹{totals.subtotal}</span>
                </div>
                <div className="total-row">
                  <span>CGST:</span>
                  <span>₹{totals.cgst}</span>
                </div>
                <div className="total-row">
                  <span>SGST:</span>
                  <span>₹{totals.sgst}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Grand Total:</span>
                  <span>₹{totals.total}</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '15px', fontSize: '11px', fontStyle: 'italic' }}>
              <strong>Amount in words:</strong> {numberToWords(parseFloat(totals.total))}
            </div>
          </div>

          <div className="footer">
            <div style={{ textAlign: 'right' }}>
              <div style={{ marginTop: '40px', borderTop: '1px solid #333', paddingTop: '5px', display: 'inline-block' }}>
                Authorized Signatory
              </div>
            </div>
            <div style={{ marginTop: '20px', fontSize: '10px', textAlign: 'center', color: '#666' }}>
              This is a computer generated invoice and does not require a physical signature.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Company Management Component
// This allows users to add, edit, and delete companies
const CompanyManagement = ({ companies, onAddCompany, onUpdateCompany, onDeleteCompany }) => {
  const [editingId, setEditingId] = useState(null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Manage Companies</h2>
          <button
            onClick={onAddCompany}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Company</span>
          </button>
        </div>

        <div className="space-y-4">
          {companies.map(company => (
            <div key={company.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{company.name}</h3>
                <button
                  onClick={() => onDeleteCompany(company.id)}
                  className="text-red-600 hover:text-red-800 transition"
                  title="Delete company"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={company.name}
                    onChange={(e) => onUpdateCompany(company.id, 'name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
                  <input
                    type="text"
                    value={company.gstin}
                    onChange={(e) => onUpdateCompany(company.id, 'gstin', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="29ABCDE1234F1Z5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN</label>
                  <input
                    type="text"
                    value={company.pan}
                    onChange={(e) => onUpdateCompany(company.id, 'pan', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="ABCDE1234F"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="text"
                    value={company.phone}
                    onChange={(e) => onUpdateCompany(company.id, 'phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="+91 80 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={company.email}
                    onChange={(e) => onUpdateCompany(company.id, 'email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="info@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={company.address}
                    onChange={(e) => onUpdateCompany(company.id, 'address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Full address with pincode"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// User Manual Component
// This provides detailed instructions for using the software
const UserManual = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">User Manual</h2>
      
      <div className="space-y-8">
        <section>
          <h3 className="text-2xl font-semibold text-indigo-600 mb-4">1. Getting Started</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-3">
              Welcome to the Indian GST Compliant Billing Software. This application helps you create professional 
              invoices that comply with Indian GST regulations.
            </p>
            <p className="mb-3">
              <strong>Default Password:</strong> The application is password-protected. The default password is 
              <code className="bg-gray-100 px-2 py-1 rounded mx-1 font-mono">billing123</code>. 
              You can change this in the code if needed.
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-indigo-600 mb-4">2. Managing Companies</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-3">
              Before creating invoices, you need to set up your company details:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Click on "Manage Companies" in the navigation menu</li>
              <li>Click "Add Company" to create a new company profile</li>
              <li>Fill in all required details including GSTIN, PAN, address, phone, and email</li>
              <li>You can edit company details anytime by modifying the fields</li>
              <li>To delete a company, click the trash icon (note: you must have at least one company)</li>
            </ul>
            <p className="mb-3">
              <strong>Important:</strong> Ensure your GSTIN is in the correct format (15 characters) to comply 
              with Indian tax regulations.
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-indigo-600 mb-4">3. Creating Invoices</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-3">To create a new invoice:</p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Click on "Create Bill" in the navigation menu</li>
              <li>Select the company from the dropdown menu</li>
              <li>Enter the invoice number and date</li>
              <li>Fill in customer details (name, GSTIN if applicable, address, phone)</li>
              <li>Add line items by clicking "Add Item"</li>
              <li>For each item, enter:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Description of the product or service</li>
                  <li>HSN or SAC code (product/service classification code)</li>
                  <li>Quantity</li>
                  <li>Rate per unit</li>
                  <li>GST percentage (0%, 5%, 12%, 18%, or 28%)</li>
                </ul>
              </li>
              <li>The system automatically calculates GST and totals</li>
              <li>Review the invoice summary at the bottom</li>
              <li>Click "Download PDF Invoice" to generate and print/save the invoice</li>
            </ol>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-indigo-600 mb-4">4. Understanding GST Calculations</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-3">
              The software automatically calculates GST as per Indian tax regulations:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li><strong>CGST (Central GST):</strong> Half of the total GST amount</li>
              <li><strong>SGST (State GST):</strong> The other half of the total GST amount</li>
              <li><strong>Total Amount:</strong> Subtotal + CGST + SGST</li>
            </ul>
            <p className="mb-3">
              For example, if you sell an item for ₹1,000 with 18% GST:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Subtotal: ₹1,000</li>
              <li>CGST (9%): ₹90</li>
              <li>SGST (9%): ₹90</li>
              <li>Total: ₹1,180</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-indigo-600 mb-4">5. PDF Export</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-3">
              When you click "Download PDF Invoice", the system:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Opens a print dialog with the formatted invoice</li>
              <li>You can save it as PDF or print directly</li>
              <li>The PDF includes all company details, customer information, line items, and GST breakup</li>
              <li>Amount in words is automatically converted (useful for cheque payments)</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-indigo-600 mb-4">6. Mobile Usage</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-3">
              This application is fully responsive and works on mobile devices:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>On mobile, use the menu button (☰) to access navigation</li>
              <li>All forms adapt to your screen size</li>
              <li>You can create and export invoices from your phone or tablet</li>
              <li>Pinch to zoom on PDF preview if needed</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-indigo-600 mb-4">7. Security Features</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-3">
              The application includes security features:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Password protection prevents unauthorized access</li>
              <li>Click "Logout" to secure the application when not in use</li>
              <li>All data is stored in your browser (not sent to any server)</li>
            </ul>
            <p className="mb-3">
              <strong>Note:</strong> To change the password, you need to modify the code. Look for the line:
              <code className="bg-gray-100 px-2 py-1 rounded mx-1 font-mono block my-2">
                const APP_PASSWORD = 'billing123';
              </code>
              and replace 'billing123' with your desired password.
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-indigo-600 mb-4">8. Tips and Best Practices</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Always verify GSTIN numbers before creating invoices</li>
              <li>Use sequential invoice numbers for better record keeping</li>
              <li>Keep HSN/SAC codes accurate as per government classification</li>
              <li>Double-check all amounts before generating PDF</li>
              <li>Save PDF copies of all invoices for your records</li>
              <li>Regularly update company information if any details change</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-indigo-600 mb-4">9. Compliance Information</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-3">
              This software generates invoices compliant with Indian GST regulations including:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>GSTIN and PAN display on invoices</li>
              <li>HSN/SAC code requirements</li>
              <li>CGST and SGST breakdown</li>
              <li>Sequential invoice numbering</li>
              <li>Proper tax invoice format</li>
            </ul>
            <p className="mb-3">
              <strong>Disclaimer:</strong> While this software follows GST compliance standards, always consult 
              with a tax professional for specific business requirements.
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-indigo-600 mb-4">10. Troubleshooting</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-3"><strong>PDF not downloading?</strong></p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Check if pop-ups are blocked in your browser</li>
              <li>Try using a different browser</li>
              <li>Ensure all invoice fields are filled correctly</li>
            </ul>
            
            <p className="mb-3"><strong>Can't see all fields on mobile?</strong></p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Scroll down to view all sections</li>
              <li>Rotate your device to landscape mode for better view</li>
            </ul>

            <p className="mb-3"><strong>Lost your password?</strong></p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>You'll need to access the code and reset the password</li>
              <li>Look for APP_PASSWORD in the code and change it</li>
            </ul>
          </div>
        </section>

        <div className="mt-8 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
          <h4 className="text-lg font-semibold text-indigo-800 mb-2">Need Help?</h4>
          <p className="text-indigo-700">
            If you encounter any issues or need clarification on any feature, refer to this manual or 
            consult with your IT administrator for technical support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillingApp;