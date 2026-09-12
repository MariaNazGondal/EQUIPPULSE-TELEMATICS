import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  FileCheck2,
  Sliders,
  CalendarCheck,
  Calculator,
  BarChart3,
  Receipt,
  Sparkles,
  ShieldCheck,
  Coins,
  Building,
  CheckCircle2
} from 'lucide-react';
import { SupportedCurrency, RawTelematicsRow } from '../types/telematics';
import { formatCurrency } from '../utils/currency';

interface NavbarProps {
  currentTab: 'clean' | 'terms' | 'ledger' | 'visualize' | 'receipt';
  setCurrentTab: (tab: 'clean' | 'terms' | 'ledger' | 'visualize' | 'receipt') => void;
  onLoadSampleData: () => void;
  onFileUpload: (data: RawTelematicsRow[], fileName: string) => void;
  onOpenReceiptModal: () => void;
  correctionsCount: number;
  totalRecordsCount: number;
  totalDue: number;
  isParityVerified: boolean;
  currency: SupportedCurrency;
  onCurrencyChange: (c: SupportedCurrency) => void;
  hasData: boolean;
  customerName: string;
  loadedFileName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onLoadSampleData,
  onFileUpload,
  onOpenReceiptModal,
  correctionsCount,
  totalRecordsCount,
  totalDue,
  isParityVerified,
  currency,
  onCurrencyChange,
  hasData,
  customerName,
  loadedFileName
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: false });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson = XLSX.utils.sheet_to_json<RawTelematicsRow>(ws, { defval: '' });

        if (rawJson && rawJson.length > 0) {
          onFileUpload(rawJson, fileName);
        } else {
          alert('Uploaded spreadsheet contains no data rows.');
        }
      } catch (err) {
        console.error('Error reading file:', err);
        alert('Could not parse spreadsheet. Please ensure it is a valid CSV or Excel file.');
      }
    };

    reader.readAsBinaryString(file);
    // Reset file input value so user can re-upload the same file if desired
    e.target.value = '';
  };

  const steps = [
    {
      id: 'clean',
      number: '1',
      name: 'Data Cleaning',
      icon: FileCheck2,
      badge: hasData ? `${correctionsCount} Cleaned` : null
    },
    {
      id: 'terms',
      number: '2',
      name: 'Term and SLA and Renewal and Charges',
      icon: Sliders,
      badge: hasData ? `${totalRecordsCount} Assets` : '99.9% Target'
    },
    {
      id: 'ledger',
      number: '3',
      name: 'Ledger and Parity',
      icon: Calculator,
      badge: isParityVerified && hasData ? 'Parity 100%' : null
    },
    {
      id: 'visualize',
      number: '4',
      name: 'Visual Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'receipt',
      number: '5',
      name: 'PDF Receipt',
      icon: Receipt,
      badge: 'Printable'
    },
  ] as const;

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 shadow-xl no-print">
      {/* Hidden File Input for Header Upload Button */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv, .xlsx, .xls"
        className="hidden"
      />

      {/* Top Brand & Actions Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Mission */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4" />
              <path d="M2 12h4" />
              <circle cx="12" cy="12" r="3.5" fill="currentColor" fillOpacity="0.2" />
              <path d="M16 12h6" />
              <path d="M12 16v6" />
              <path d="M4.93 4.93l2.83 2.83" />
              <path d="M16.24 16.24l2.83 2.83" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight text-white">
                EQUIPPULSE <span className="text-amber-400">TELEMATICS</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ZERO DOWNTIME
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Connecting Fleets, Sites & Equipment • Subscription Billing Engine
            </p>
          </div>
        </div>

        {/* Center/Right: Upload Button, 1-Click PDF Receipt, Customer Badge, Currency & Amount Due */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
          {/* USER REQUIREMENT: UPLOAD FILE OPTION ON TOP NEAR HEADER */}
          <button
            id="btn-header-upload-file"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black rounded-xl transition shadow-lg shadow-amber-500/25 cursor-pointer transform active:scale-98"
            title="Upload CSV, XLSX or XLS fleet file"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Upload File (CSV / Excel)</span>
          </button>

          {/* USER REQUIREMENT: 1-CLICK PDF RECEIPT ON HEADER */}
          <button
            id="btn-header-pdf-receipt"
            onClick={onOpenReceiptModal}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-xs font-bold rounded-xl border border-amber-500/40 transition shadow-md cursor-pointer transform active:scale-98"
            title="1-Click: View and print PDF Receipt directly"
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>PDF Receipt</span>
          </button>

          {/* Detected Customer Badge */}
          {hasData ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-xs shadow-inner">
              <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 leading-none">Customer Account</span>
                <span className="text-white font-extrabold text-xs leading-tight truncate max-w-[150px]">
                  {customerName}
                </span>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-500 text-xs">
              <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></span>
              <span>Waiting for file upload</span>
            </div>
          )}

          {/* Currency Switcher Dropdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center space-x-1 shadow-inner">
            <div className="px-2 py-1 flex items-center space-x-1 text-slate-400 text-xs font-semibold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">Cur:</span>
            </div>
            {(['DKK', 'EUR', 'USD'] as SupportedCurrency[]).map((cur) => (
              <button
                key={cur}
                id={`currency-btn-${cur}`}
                onClick={() => onCurrencyChange(cur)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currency === cur
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={`Switch currency to ${cur}`}
              >
                {cur === 'DKK' ? 'DKK (kr.)' : cur === 'EUR' ? 'EUR (€)' : 'USD ($)'}
              </button>
            ))}
          </div>

          {/* Amount Due Indicator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center space-x-2">
            <span className="text-slate-400 text-[11px] font-semibold">Due:</span>
            <span className="font-mono font-extrabold text-sm text-amber-400">
              {hasData ? formatCurrency(totalDue, currency) : formatCurrency(0, currency)}
            </span>
          </div>

          {/* Load Sample Data Button */}
          <button
            id="btn-load-sample-data-header"
            onClick={onLoadSampleData}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Load sample demonstration file"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{hasData ? 'Reload Sample' : 'Load Sample'}</span>
          </button>
        </div>
      </div>

      {/* 6 Steps Workflow Stepper */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-2 min-w-max">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentTab === step.id;

              return (
                <button
                  key={step.id}
                  id={`nav-step-${step.id}`}
                  onClick={() => setCurrentTab(step.id as any)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {step.number}
                  </span>
                  <span>{step.name}</span>
                  {step.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-slate-800 text-amber-400 border border-slate-700'
                      }`}
                    >
                      {step.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
