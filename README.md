# 🧾 Invoice Generator

A professional, free, and easy-to-use **Indian Invoice Generator**. Built with a focus on speed, privacy, and GST compliance, it allows users to generate high-quality PDF invoices, challans, and quotations directly from their browser.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.1.0-green.svg)
![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-orange.svg)

---

## ✨ Key Features

- **GST Compliant**: Accurate support for CGST, SGST, and IGST calculations with automatic tax splitting.
- **Multiple Document Types**:
    - **Tax Invoice**: Standard GST invoice for B2B/B2C transactions.
    - **Simple Invoice**: Simplified billing for small businesses (non-tax).
    - **Delivery Challan**: For transport and delivery documentation accompanied by goods.
    - **Quotation**: Professional quotes/estimates for potential clients.
- **Advanced PWA Support**:
    - **Fully Offline**: Works without internet access.
    - **Smart Caching**: Local fonts and assets are cached for instant loading (Service Worker v6).
- **User Experience (UX)**:
    - **Custom Modals**: Replaced intrusive browser alerts with smooth Bootstrap-based confirmations and notifications.
    - **Dark Mode**: Integrated dark theme for low-light usage.
    - **Responsive Design**: Works perfectly on mobile, tablet, and desktop.
- **Powerful Tools**:
    - **Profile Management**: Save and manage multiple Company and Client profiles.
    - **Digital Signatures**: Draw your signature on-screen or upload an image.
    - **Amount in Words**: Automatic conversion of total amounts into Indian Rupees text.
    - **Error Logging**: Built-in system captures console errors for easier debugging.
- **Local-First Privacy**:
    - All data is stored locally in your browser (`localStorage`).
    - **Optional Cloud Sync**: Connect your own Supabase backend for cross-device synchronization.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla + Bootstrap 5.3.2), Vanilla JavaScript (ES6+).
- **PDF Generation**: [pdfmake](http://pdfmake.org/) for client-side PDF creation with custom layouts.
- **Database (Optional)**: [Supabase v2](https://supabase.com/) for real-time cloud sync.
- **Icons**: Font Awesome 6.
- **Typography**: Outfit (Google Fonts) + Local Fallbacks.

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

*Note: For full PWA capabilities (Service Worker) and Cloud Sync, it is recommended to serve the files via a local server (e.g., Live Server in VS Code) rather than opening the file directly.*

---

## ☁️ Cloud Backup Setup (Optional)

This application supports optional cloud synchronization using your own **Supabase** project.

1. **Create a Supabase Project** at [database.new](https://database.new).
2. **Create the Table**:
   Run this SQL in your Supabase SQL Editor:
   ```sql
   create table if not exists user_data (
     key text primary key,
     value jsonb,
     updated_at timestamp with time zone default timezone('utc'::text, now())
   );
   
   -- Enable Row Level Security (RLS)
   alter table user_data enable row level security;
   
   -- Allow open access (Demo Policy) - RESTRICT THIS IN PRODUCTION!
   create policy "Allow public access" on user_data for all using (true) with check (true);
   ```
3. **Configure the App**:
   - Open `js/app.js`.
   - Update `SyncManager.url` and `SyncManager.key` with your project credentials.

---

## 🛡️ Privacy & Security

The Invoice Generator follows a strictly **local-first** approach:
- **No Data Collection**: We do not track your usage or collect personal data.
- **Client-Side Generation**: PDFs are generated entirely within your browser using JavaScript. No data is sent to any server for processing.
- **You Own Your Data**: Your client definitions, invoice history, and settings live in your browser's Local Storage.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request for bug fixes or new features.

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
