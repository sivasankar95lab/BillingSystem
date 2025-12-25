# 🧾 Invoice Generator

A professional, free, and easy-to-use **Indian Invoice Generator**. Built with a focus on speed, privacy, and GST compliance, it allows users to generate high-quality PDF invoices, challans, and quotations directly from their browser.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-orange.svg)

---

## ✨ Key Features

- **GST Compliant**: Support for CGST, SGST, and IGST calculations.
- **Multiple Document Types**:
    - **Tax Invoice**: Standard GST invoice for B2B/B2C.
    - **Simple Invoice**: No-tax billing for small businesses.
    - **Delivery Challan**: For transport and delivery documentation.
    - **Quotation**: Professional quotes for potential clients.
- **PWA Ready**: Installable on desktop and mobile for offline access.
- **Local-First Privacy**: Data is stored locally in your browser. Optional cloud backup via Supabase.
- **Dynamic Controls**:
    - Manage Company & Client profiles.
    - Predefined item list for quick selection.
    - Digital signature drawing or image upload.
    - Automatic "Amount in Words" conversion.
- **Premium PDF Design**: Elegant, clean, and paper-like PDF layouts using `pdfmake`.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla + Bootstrap 5), Vanilla JavaScript (ES6+).
- **PDF Generation**: [pdfmake](http://pdfmake.org/) for client-side PDF creation.
- **Database (Optional)**: [Supabase](https://supabase.com/) for cross-device synchronization.
- **Icons**: Font Awesome 6.
- **Typography**: Outfit (Google Fonts).

---

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari).

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/InvoiceGenerator-main.git
   ```
2. Open `index.html` in your browser.

*Note: For PWA features and Supabase sync to work correctly, it is recommended to serve the files via a local server (e.g., Live Server in VS Code).*

---

## ☁️ Cloud Backup Setup (Optional)

To enable cloud backup features, you can connect your own Supabase instance.

1. Create a table in Supabase:
   ```sql
   create table if not exists user_data (
     key text primary key,
     value jsonb,
     updated_at timestamp with time zone default timezone('utc'::text, now())
   );
   alter table user_data enable row level security;
   create policy "Allow generic access" on user_data for all using (true) with check (true);
   ```
2. Update the Supabase configuration in `js/app.js`.

---

## 🛡️ Privacy & Security

The Invoice Generator follows a **local-first** approach:
- All data entry happens on your device.
- We do not store your invoice data on our servers unless you explicitly connect a personal Supabase instance.
- PDF generation happens entirely in the browser; your sensitive financial data never leaves your computer.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Developed with ❤️ for Indian Small Businesses.
