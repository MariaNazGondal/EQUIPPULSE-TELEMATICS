# EquipPulse Telematics — Subscription Due & Billing Ledger

> **Connecting construction to eliminate downtime.**  
> An enterprise-grade telematics subscription billing, SLA auditing, and ledger reconciliation system. Clean messy IoT fleet datasets, resolve inverted date anomalies, quarantine duplicate device IMEIs, evaluate contract terms, calculate error-free amounts due across multiple currencies (USD, EUR, DKK), and export official branded PDF receipts.

---

## 📹 Video Walkthrough

Watch a comprehensive walkthrough of the application in action:

[![Watch the Video Walkthrough](https://cdn.loom.com/sessions/thumbnails/ac1830712024478e894a2e97bbf99a61-with-play.gif)](https://www.loom.com/share/ac1830712024478e894a2e97bbf99a61)

👉 **[Watch the Loom Video Walkthrough](https://www.loom.com/share/ac1830712024478e894a2e97bbf99a61)**

---

## 🚀 Key Features

### 1. Robust Data Cleansing & Normalization Engine
- **Inverted Date Auto-Correction:** Detects and rectifies mixed European/US date format inconsistencies (`DD/MM/YYYY` vs `MM/DD/YYYY`) against billing contract bounds.
- **Device IMEI Deduplication & Quarantine:** Surfaces duplicate hardware device IDs and isolates corrupt telemetry rows to prevent overbilling.
- **Audit Alert Modal:** Displays an explicit breakdown of sanitization adjustments whenever new datasets are ingested.
- **Flexible Ingestion:** Drag-and-drop or browse upload supporting standard `.xlsx`, `.xls`, and `.csv` files.

### 2. Contract Assessment & Dynamic SLA Rules
- **Configurable Terms & Conditions:** Adjust equipment subscription tiers, grace period durations (default 14 days), SLA uptime targets (default 99.5%), credit rates, and volume discount brackets in real time.
- **Automated Billing Logic:** Evaluates active machines, waives subscription fees for devices within grace periods, and applies SLA penalty credits for underperforming assets.

### 3. Financial Ledger & Parity Verification
- **Multi-Currency Support:** Instant conversion and currency formatting across **USD ($)**, **EUR (€)**, and **DKK (kr)**.
- **Cryptographic Parity Checksum:** Computes an audit hash across all itemized charges to ensure complete mathematical integrity.
- **Real-Time Financial Summary:** Detailed breakdown of Gross Charges, SLA Credits, Volume Discounts, Net Taxable Amount, Applicable Tax, and Final Amount Due.

### 4. Official Invoice & PDF Receipt Generator
- **Interactive Receipt View:** On-screen invoice view with customizable billing details (Invoice #, PO Number, Due Date, Customer Tax ID, Project Site).
- **Quick-Access Modal:** 1-click modal preview directly from the header navigation or ledger.
- **High-Fidelity PDF Export:** Built-in vector PDF generator powered by `jsPDF`, complete with corporate branding, itemized charge breakdowns, remittance wire/ACH instructions (JPMorgan Chase), and audit stamps.

---

## 🛠️ Tech Stack

- **Framework:** React 19 with TypeScript
- **Bundler & Dev Server:** Vite 6
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Animations:** Motion (`motion/react`)
- **Document Generation:** jsPDF
- **Spreadsheet Parsing:** SheetJS (XLSX)
- **Data Visualizations:** Recharts

---

## 📂 Project Structure

```text
├── public/                # Static public assets
├── src/
│   ├── components/        # UI Views and Modals
│   │   ├── CleansingModal.tsx    # Cleansing breakdown notification modal
│   │   ├── ContractConfig.tsx    # SLA and terms configuration drawer
│   │   ├── FileUploader.tsx      # Drag-and-drop spreadsheet uploader
│   │   ├── LedgerView.tsx        # Itemized telematics billing ledger table
│   │   ├── Navbar.tsx            # Global topbar with quick actions & currency selector
│   │   ├── ReceiptModal.tsx      # Quick PDF preview modal
│   │   └── ReceiptView.tsx       # Dedicated printable invoice and receipt tab
│   ├── types/
│   │   └── telematics.ts         # TypeScript data contracts, interfaces & defaults
│   ├── utils/
│   │   ├── contractEngine.ts     # SLA evaluation and credit computation logic
│   │   ├── currency.ts           # Currency conversion rates and formatting
│   │   ├── dataCleaner.ts        # Date inversion heuristics & IMEI deduplication
│   │   ├── dummyData.ts          # Sample telematics fleet dataset for demonstration
│   │   └── pdfGenerator.ts       # jsPDF invoice receipt layout & export engine
│   ├── App.tsx            # Main application layout and centralized state
│   ├── index.css          # Tailwind CSS global stylesheet
│   └── main.tsx           # React DOM root entrypoint
├── .env.example           # Documented environment variables
├── .gitignore             # Standard git ignore patterns
├── metadata.json          # Application configuration and metadata
├── package.json           # Dependencies and build scripts
├── tsconfig.json          # TypeScript compiler configuration
└── vite.config.ts         # Vite configuration
```

---

## ⚡ Getting Started

### Prerequisites

Ensure you have Node.js (v18 or later) installed:
```bash
node -v
npm -v
```

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   cd YOUR_REPOSITORY_NAME
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` if custom environment variables are required:
   ```bash
   cp .env.example .env.local
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` to interact with the application.

5. **Build for Production:**
   ```bash
   npm run build
   ```

6. **Preview Production Build:**
   ```bash
   npm run preview
   ```

---

## 📤 Publishing to GitHub

### Option A: Using the AI Studio UI (Recommended)
1. In Google AI Studio Build, click on the **Settings** or **Export** menu in the top navigation.
2. Select **Export to GitHub** (or **Download ZIP**).
3. Connect your GitHub account and authorize repository creation.
4. AI Studio will automatically push the entire repository with all commits and documentation.

### Option B: Using Git Command Line

If you are cloning or pushing manually from your terminal:

```bash
# 1. Initialize git repository (if not already initialized)
git init -b main

# 2. Add all project files
git add .

# 3. Create your initial commit
git commit -m "feat: initial release of EquipPulse Telematics billing ledger and receipt generator"

# 4. Create a new repository on GitHub (via github.com or GitHub CLI)
# Example using GitHub CLI:
# gh repo create equippulse-telematics --public --source=. --remote=origin --push

# Or link an existing empty GitHub repository:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
```

---

## 📄 License

This project is licensed under the MIT License — see the repository for details.
