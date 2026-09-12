import React, { useState } from 'react';
import {
  Receipt,
  Download,
  Printer,
  ShieldCheck,
  Building,
  Calendar,
  DollarSign,
  FileText,
  Mail,
  Edit3,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Coins,
  CreditCard,
  Maximize2
} from 'lucide-react';
import { LedgerItem, InvoiceMetadata, TermsAndConditionsConfig, SupportedCurrency } from '../types/telematics';
import { generatePdfReceipt } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/currency';
import { ReceiptModal } from './ReceiptModal';

interface ReceiptViewProps {
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
  onUpdateInvoiceMeta?: (meta: InvoiceMetadata) => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  ledgerItems,
  subtotals,
  config,
  auditChecksum,
  currency,
  customerName,
  invoiceMeta: propInvoiceMeta,
  onUpdateInvoiceMeta
}) => {
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamic invoice metadata initialized with the customer name extracted from the uploaded file
  const [internalInvoiceMeta, setInternalInvoiceMeta] = useState<InvoiceMetadata>({
    invoiceNumber: 'INV-EP-2026-0941',
    invoiceDate: '2026-09-11',
    dueDate: '2026-10-11',
    customerName: customerName || 'Beta Industries',
    customerAddress: '742 Industrial Pkwy, Construction Bay 8',
    customerEmail: `ap-billing@${(customerName || 'betaindustries').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    customerTaxId: `US-EIN-94-3829104`,
    projectSite: 'Active Construction Fleet Operations',
    paymentTerms: 'Net 30 Days via Corporate ACH or Wire Transfer',
    notes: 'Telematics subscription charges calculated under EquipPulse Master SLA and Terms of Service. Inverted dates rectified and duplicate IMEIs quarantined.'
  });

  const invoiceMeta = propInvoiceMeta || internalInvoiceMeta;
  const setInvoiceMeta = (updater: InvoiceMetadata | ((prev: InvoiceMetadata) => InvoiceMetadata)) => {
    const nextVal = typeof updater === 'function' ? updater(invoiceMeta) : updater;
    if (onUpdateInvoiceMeta) {
      onUpdateInvoiceMeta(nextVal);
    }
    setInternalInvoiceMeta(nextVal);
  };

  // Keep invoice customer name synchronized with uploaded customer
  React.useEffect(() => {
    if (customerName) {
      setInvoiceMeta(prev => ({
        ...prev,
        customerName: customerName,
        customerEmail: `ap-billing@${customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
      }));
    }
  }, [customerName]);

  if (ledgerItems.length === 0) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center">
        <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white">No Telematics Data to Generate Receipt</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Please upload your fleet file in Step 1 or via the top header. The billing engine will dynamically calculate the subscription due and assemble the official EquipPulse PDF receipt for your account.
        </p>
      </div>
    );
  }

  const handleDownloadPdf = () => {
    generatePdfReceipt(invoiceMeta, ledgerItems, subtotals, config, auditChecksum, currency);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl no-print">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <Receipt className="w-4 h-4" />
              <span>Step 5: Official Equip+ PDF Subscription Receipt</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Customer Billing Receipt & Remittance Statement
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Official statement of charges for <strong className="text-amber-400">{invoiceMeta.customerName}</strong>. Itemizes equipment rates, SLA deductions, exact amount due, and bank payment instructions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsEditingMeta(!isEditingMeta)}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>{isEditingMeta ? 'Save Metadata' : 'Edit Customer / PO'}</span>
            </button>

            {/* Print Invoice: Opens clean pop-up window for immediate print review */}
            <button
              id="btn-print-invoice"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer shadow-md hover:border-sky-500/50"
              title="View bill and print invoice"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Print Invoice</span>
            </button>

            {/* UNMISSABLE PROMINENT PDF DOWNLOAD BUTTON */}
            <button
              id="btn-download-pdf-receipt"
              onClick={handleDownloadPdf}
              className="inline-flex items-center space-x-2.5 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-sm font-black rounded-xl transition shadow-xl shadow-amber-500/25 cursor-pointer transform active:scale-98"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Download PDF Receipt</span>
            </button>
          </div>
        </div>

        {/* Currency & Total Due Quick Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-400 font-medium">Billed To:</span>
            <span className="font-bold text-white bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span>{invoiceMeta.customerName}</span>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-medium">Active Currency:</span>
            <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              {currency}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Total Amount Due on Receipt:</span>
            <span className="font-mono font-black text-amber-400 text-base">
              {formatCurrency(subtotals.finalDueSum, currency)}
            </span>
          </div>
        </div>

        {/* Metadata Editor Drawer */}
        {isEditingMeta && (
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Account</label>
              <input
                type="text"
                value={invoiceMeta.customerName}
                onChange={(e) => setInvoiceMeta({ ...invoiceMeta, customerName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceMeta.invoiceNumber}
                onChange={(e) => setInvoiceMeta({ ...invoiceMeta, invoiceNumber: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Project Site Code</label>
              <input
                type="text"
                value={invoiceMeta.projectSite}
                onChange={(e) => setInvoiceMeta({ ...invoiceMeta, projectSite: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Payment Terms</label>
              <input
                type="text"
                value={invoiceMeta.paymentTerms}
                onChange={(e) => setInvoiceMeta({ ...invoiceMeta, paymentTerms: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Professional Full Bill Document Display */}
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-w-5xl mx-auto print:border-none print:shadow-none print:rounded-none">
        {/* Document Header */}
        <div className="bg-slate-950 text-white p-8 border-b-4 border-amber-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-extrabold shadow-lg">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4" />
                  <path d="M2 12h4" />
                  <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" />
                  <path d="M16 12h6" />
                  <path d="M12 16v6" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">
                  EQUIPPULSE <span className="text-amber-400">TELEMATICS</span>
                </h2>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Connecting Construction to Eliminate Downtime
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 block">
                Official Billing Receipt
              </span>
              <span className="text-lg font-bold font-mono text-white">
                #{invoiceMeta.invoiceNumber}
              </span>
              <span className="text-xs text-slate-400 block font-mono">
                Currency: {currency}
              </span>
            </div>
          </div>
        </div>

        {/* Metadata Grid (Issued By & Billed To) */}
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-slate-200 bg-slate-50/50">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
              ISSUED BY (SERVICE PROVIDER)
            </span>
            <h4 className="text-sm font-bold text-slate-900">EquipPulse Telematics Solutions Inc.</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Industrial Park Blvd, Suite 400<br />
              Tax ID: US-EIN-88-2940192 • Support: +1 (800) 555-PULSE<br />
              Email: billing@equippulse-telematics.com
            </p>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block mb-1 font-bold">
              BILLED TO (CUSTOMER ACCOUNT)
            </span>
            <h4 className="text-base font-extrabold text-slate-900 flex items-center space-x-1.5">
              <Building className="w-4 h-4 text-amber-500" />
              <span>{invoiceMeta?.customerName || customerName || 'Beta Industries'}</span>
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Project Site: {invoiceMeta?.projectSite || 'Active Construction Fleet Operations'}<br />
              Billing Address: {invoiceMeta?.customerAddress || '742 Industrial Pkwy, Construction Bay 8'}<br />
              Account ID: {invoiceMeta?.customerTaxId || 'US-EIN-94-3829104'} • Email: {invoiceMeta?.customerEmail || 'billing@equippulse.com'}
            </p>
          </div>
        </div>

        {/* Dates & Terms Bar */}
        <div className="px-8 py-3 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Invoice Date:</span>
              <span className="font-mono font-bold text-slate-800">{invoiceMeta.invoiceDate}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Payment Due:</span>
              <span className="font-mono font-bold text-slate-800">{invoiceMeta.dueDate}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Payment Terms:</span>
              <span className="text-slate-800">{invoiceMeta.paymentTerms}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-lg border border-emerald-300 text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-bold">Dual-Checksum Parity Verified</span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="p-8">
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Asset ID & Equipment</th>
                  <th className="py-3 px-3">Telematics IMEI</th>
                  <th className="py-3 px-3">Plan Tier</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Base</th>
                  <th className="py-3 px-3 text-right">Addons</th>
                  <th className="py-3 px-3 text-right">SLA Credit</th>
                  <th className="py-3 px-3 text-right font-bold text-slate-900">Net Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {ledgerItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-sans">
                      <span className="font-bold text-slate-900 block">{item.assetId}</span>
                      <span className="text-[11px] text-slate-500">{item.assetName}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      {item.telematicsImei}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-700">
                      {item.planTier.replace('Pulse ', '')}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.chargeStatusBadge === 'Chargeable'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.chargeStatusBadge === 'Waived ($0)'
                          ? 'bg-slate-100 text-slate-500'
                          : item.chargeStatusBadge === 'Credited / Discounted'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.chargeStatusBadge}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {formatCurrency(item.baseRate, currency)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500">
                      {formatCurrency(item.addonsFee, currency)}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-600 font-semibold">
                      {item.slaCreditAmount > 0 ? `-${formatCurrency(item.slaCreditAmount, currency)}` : '$0.00'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(item.finalAmountDue, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Financial Grid: HOW TO PAY + AMOUNT DUE */}
          <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* HOW THEY HAVE TO PAY - Detailed Wire & ACH Instructions */}
            <div className="space-y-3 text-xs bg-amber-50/60 p-5 rounded-2xl border-2 border-amber-300">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>HOW TO PAY / BANK REMITTANCE INSTRUCTIONS</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                Please remit total amount due for <strong className="font-bold">{invoiceMeta.customerName}</strong> to EquipPulse Telematics via electronic ACH or Wire Transfer:
              </p>

              <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-xs font-mono space-y-1.5 text-slate-800">
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
                  <span className="font-bold text-slate-900">{invoiceMeta.invoiceNumber} / {invoiceMeta.customerName}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Governed under EquipPulse Master Service Agreement. Subscriptions renew for successive 12-month periods unless 30-day prior written notice is given. Decommissioned machinery confirmed prior to cycle cutoff is fully exempt.
              </p>
            </div>

            {/* Calculations Total Box with Huge Gold Total Due */}
            <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-300 space-y-2.5 text-xs shadow-md">
              <div className="flex justify-between text-slate-600">
                <span>Gross Telematics Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(subtotals.grossSum, currency)}
                </span>
              </div>
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>SLA Uptime Rebates:</span>
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
                <span>Estimated Tax / VAT ({config.taxRatePercent}%):</span>
                <span className="font-mono font-bold text-slate-900">
                  +{formatCurrency(subtotals.taxSum, currency)}
                </span>
              </div>

              {/* HIGH CONTRAST GOLD TOTAL AMOUNT DUE */}
              <div className="pt-3 border-t-2 border-slate-300 flex justify-between items-center bg-amber-100 p-3.5 rounded-xl border-2 border-amber-400">
                <div>
                  <span className="text-xs font-black text-amber-900 uppercase tracking-wider block">
                    TOTAL AMOUNT DUE
                  </span>
                  <span className="text-[11px] text-amber-800 font-semibold block">
                    Billed to {invoiceMeta.customerName}
                  </span>
                </div>
                <span className="text-2xl font-mono text-amber-900 font-black">
                  {formatCurrency(subtotals.finalDueSum, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="bg-slate-900 text-slate-400 p-4 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EquipPulse Telematics • Connecting construction to eliminate downtime</span>
          <span className="font-mono text-[11px] text-slate-400">
            Audit Checksum: {auditChecksum.substring(0, 24)}...
          </span>
        </div>
      </div>

      {/* Pop-up Window Modal */}
      <ReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ledgerItems={ledgerItems}
        subtotals={subtotals}
        config={config}
        auditChecksum={auditChecksum}
        currency={currency}
        customerName={invoiceMeta.customerName}
        invoiceMeta={invoiceMeta}
      />
    </div>
  );
};
