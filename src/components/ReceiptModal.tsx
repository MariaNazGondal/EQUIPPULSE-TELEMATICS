import React, { useRef } from 'react';
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  Building,
  Calendar,
  CheckCircle2,
  FileText,
  DollarSign,
  Coins,
  CreditCard,
  Building2,
  HelpCircle
} from 'lucide-react';
import { LedgerItem, InvoiceMetadata, TermsAndConditionsConfig, SupportedCurrency } from '../types/telematics';
import { formatCurrency } from '../utils/currency';
import { generatePdfReceipt } from '../utils/pdfGenerator';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledgerItems: LedgerItem[];
  subtotals: {
    grossSum: number;
    slaCreditsSum: number;
    volumeDiscountsSum: number;
    netTaxableSum: number;
    taxSum: number;
    finalDueSum: number;
    chargedCount: number;
    waivedCount: number;
    creditedCount: number;
  };
  config: TermsAndConditionsConfig;
  auditChecksum: string;
  currency: SupportedCurrency;
  customerName: string;
  invoiceMeta?: InvoiceMetadata;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  ledgerItems,
  subtotals,
  config,
  auditChecksum,
  currency,
  customerName,
  invoiceMeta
}) => {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const effectiveMeta: InvoiceMetadata = {
    invoiceNumber: invoiceMeta?.invoiceNumber || 'INV-EP-2026-0941',
    invoiceDate: invoiceMeta?.invoiceDate || '2026-09-11',
    dueDate: invoiceMeta?.dueDate || '2026-10-11',
    customerName: invoiceMeta?.customerName || customerName || 'Beta Industries',
    customerAddress: invoiceMeta?.customerAddress || '742 Industrial Pkwy, Construction Bay 8',
    customerEmail: invoiceMeta?.customerEmail || `ap-billing@${(customerName || 'betaindustries').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    customerTaxId: invoiceMeta?.customerTaxId || 'US-EIN-94-3829104',
    projectSite: invoiceMeta?.projectSite || 'Active Construction Fleet Operations',
    paymentTerms: invoiceMeta?.paymentTerms || 'Net 30 Days via Corporate ACH or Wire Transfer',
    notes: invoiceMeta?.notes || 'Telematics subscription charges calculated under EquipPulse Master SLA and Terms of Service. Inverted dates rectified and duplicate IMEIs quarantined.'
  };

  const handleDownloadPdf = () => {
    generatePdfReceipt(effectiveMeta, ledgerItems, subtotals, config, auditChecksum, currency);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border-2 border-amber-500/50 max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Action Header (Dark / Floating Controls) */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b-4 border-amber-500 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  EQUIPPULSE <span className="text-amber-400">TELEMATICS</span>
                </h3>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  OFFICIAL RECEIPT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Subscription Billing Statement for <strong className="text-amber-300">{customerName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-modal-print-invoice"
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black rounded-xl transition shadow-md cursor-pointer"
              title="Print this invoice statement"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>

            <button
              id="btn-modal-download-pdf"
              onClick={handleDownloadPdf}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
              title="Download PDF File"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div ref={printableRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            {/* Sender / Billing Entity */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                ISSUED BY (SERVICE PROVIDER)
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                EquipPulse Telematics Solutions Inc.
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Industrial Parkway, Telematics Bay 400<br />
                Tax ID: US-EIN-88-2940192 • Support: billing@equippulse-telematics.com<br />
                Mission: Connecting construction to eliminate downtime
              </p>
            </div>

            {/* Recipient / Customer (Dynamically bound to uploaded company, e.g. Beta Industries) */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block font-bold">
                BILLED TO (CLIENT ACCOUNT)
              </span>
              <h4 className="text-base font-extrabold text-slate-900 flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-amber-500" />
                <span>{customerName}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Account ID: {effectiveMeta.customerTaxId || `CUST-${customerName.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)}`}<br />
                Project Site: {effectiveMeta.projectSite || 'Active Construction Machinery Fleet'}<br />
                Email: {effectiveMeta.customerEmail || `accounts@${customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}
              </p>
            </div>
          </div>

          {/* Invoice Date & Term Details Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Invoice Number:</span>
              <span className="font-mono font-bold text-slate-900">{effectiveMeta.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Invoice Date:</span>
              <span className="font-mono font-bold text-slate-900">{effectiveMeta.invoiceDate}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Payment Due Date:</span>
              <span className="font-mono font-bold text-slate-900">{effectiveMeta.dueDate}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Billing Currency:</span>
              <span className="font-mono font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                {currency}
              </span>
            </div>
          </div>

          {/* Itemized Fleet Equipment List */}
          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
              <span>Audited Telematics Subscription Items ({ledgerItems.length} Machinery Assets)</span>
              <span className="text-[11px] font-normal text-slate-500">Dual-Parity Checksum Verified</span>
            </h5>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Asset ID</th>
                    <th className="py-2.5 px-3">Machine & Model</th>
                    <th className="py-2.5 px-3">Telematics IMEI</th>
                    <th className="py-2.5 px-3">Plan Tier</th>
                    <th className="py-2.5 px-3 text-right">Base Rate</th>
                    <th className="py-2.5 px-3 text-right">SLA Credit</th>
                    <th className="py-2.5 px-3 text-right font-bold text-slate-900">Net Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {ledgerItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">{item.assetId}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-700">{item.assetName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.telematicsImei}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-700">{item.planTier.replace('Pulse ', '')}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatCurrency(item.baseRate, currency)}</td>
                      <td className="py-2.5 px-3 text-right text-rose-600 font-semibold">
                        {item.slaCreditAmount > 0 ? `-${formatCurrency(item.slaCreditAmount, currency)}` : '$0.00'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(item.finalAmountDue, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subtotals & Prominent TOTAL AMOUNT DUE Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* HOW THEY HAVE TO PAY - Detailed Remittance Instructions */}
            <div className="bg-amber-50/60 border-2 border-amber-300 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>HOW TO PAY / REMITTANCE INSTRUCTIONS</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                Please remit total amount due for <strong className="font-bold">{customerName}</strong> via electronic bank transfer (ACH / Wire) referencing invoice #{effectiveMeta.invoiceNumber}:
              </p>
              
              <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs font-mono space-y-1.5 text-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Beneficiary:</span>
                  <span className="font-bold">EquipPulse Telematics Solutions Inc.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Bank:</span>
                  <span className="font-bold">JPMorgan Chase NA (Industrial Banking)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">ACH Routing #:</span>
                  <span className="font-bold text-amber-700">111000614</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Wire SWIFT/BIC:</span>
                  <span className="font-bold text-amber-700">CHASUS33XXX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Account #:</span>
                  <span className="font-bold text-amber-700">89401928410</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-amber-100">
                  <span className="text-slate-500 font-sans">Payment Reference:</span>
                  <span className="font-bold text-slate-900">{effectiveMeta.invoiceNumber} / {customerName}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Payment Terms: Net 30 Days. Inquiries: billing@equippulse-telematics.com
              </p>
            </div>

            {/* Financial Calculations & Large Due Amount */}
            <div className="bg-slate-50 border border-slate-300 rounded-2xl p-5 space-y-2.5 text-xs shadow-sm">
              <div className="flex justify-between text-slate-600">
                <span>Gross Subscription Base:</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatCurrency(subtotals.grossSum, currency)}
                </span>
              </div>
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>SLA Downtime Penalty Rebates:</span>
                <span className="font-mono">
                  -{formatCurrency(subtotals.slaCreditsSum, currency)}
                </span>
              </div>
              <div className="flex justify-between text-amber-700 font-semibold">
                <span>Fleet Volume Discount ({config.fleetVolumeDiscountPercent}%):</span>
                <span className="font-mono">
                  -{formatCurrency(subtotals.volumeDiscountsSum, currency)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Sales Tax / VAT ({config.taxRatePercent}%):</span>
                <span className="font-mono font-bold text-slate-800">
                  +{formatCurrency(subtotals.taxSum, currency)}
                </span>
              </div>

              {/* HUGE UNMISSABLE TOTAL AMOUNT DUE */}
              <div className="pt-3 border-t-2 border-slate-300 flex justify-between items-center bg-amber-100 p-3.5 rounded-xl border-2 border-amber-400">
                <div>
                  <span className="text-xs font-black text-amber-900 uppercase tracking-wider block">
                    TOTAL AMOUNT DUE
                  </span>
                  <span className="text-[11px] text-amber-800 font-semibold block">
                    Billed to {customerName}
                  </span>
                </div>
                <span className="text-2xl sm:text-3xl font-mono font-black text-amber-900">
                  {formatCurrency(subtotals.finalDueSum, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Security & Parity Seal */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Certified Dual-Checksum Verification Hash: {auditChecksum.substring(0, 24)}...</span>
            </div>
            <span>EquipPulse Telematics • Connecting construction to eliminate downtime</span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end space-x-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition cursor-pointer"
          >
            Close Window
          </button>

          <button
            onClick={handleDownloadPdf}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition shadow-md shadow-amber-500/20 cursor-pointer flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
