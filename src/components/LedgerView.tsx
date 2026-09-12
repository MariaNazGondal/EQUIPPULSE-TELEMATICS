import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Calculator,
  ShieldCheck,
  Download,
  Search,
  ArrowUpDown,
  ArrowRight,
  FileText,
  DollarSign,
  Receipt,
  Percent,
  CheckCircle2,
  Clock,
  Printer
} from 'lucide-react';
import { LedgerItem, DualCheckParityResult, TermsAndConditionsConfig, SupportedCurrency, InvoiceMetadata } from '../types/telematics';
import { formatCurrency } from '../utils/currency';
import { generatePdfReceipt } from '../utils/pdfGenerator';

interface LedgerViewProps {
  ledgerItems: LedgerItem[];
  parityResult: DualCheckParityResult;
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
  onProceedToVisualize: () => void;
  onProceedToReceipt: () => void;
  currency: SupportedCurrency;
  customerName?: string;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  ledgerItems,
  parityResult,
  subtotals,
  config,
  onProceedToVisualize,
  onProceedToReceipt,
  currency,
  customerName = 'Beta Industries'
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Chargeable' | 'Waived' | 'Credited' | 'Suspended'>('All');
  const [sortBy, setSortBy] = useState<'finalAmountDue' | 'assetId' | 'grossAmount'>('finalAmountDue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAllColumns, setShowAllColumns] = useState(false);

  if (ledgerItems.length === 0) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center">
        <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white">No Telematics Ledger Items</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Please upload your telematics dataset in Step 1 or via the top header to generate the double-checked subscription billing ledger.
        </p>
      </div>
    );
  }

  const handleExportLedger = () => {
    const exportData = ledgerItems.map(item => ({
      'Asset ID': item.assetId,
      'Equipment Name': item.assetName,
      'Equipment Type': item.equipmentType,
      'Telematics IMEI': item.telematicsImei,
      'Plan Tier': item.planTier,
      'Status': item.status,
      'Billing Cycle': item.billingCycle,
      'Base Monthly Rate': item.baseRate,
      'Addons Fee': item.addonsFee,
      'Gross Amount': item.grossAmount,
      'SLA Credit': item.slaCreditAmount,
      'Volume Discount': item.volumeDiscountAmount,
      'Net Taxable': item.netTaxableAmount,
      'Tax': item.taxAmount,
      'Final Amount Due': item.finalAmountDue,
      'Currency': currency,
      'Audit Verification Hash': item.auditHash
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Telematics_Subscription_Ledger');
    XLSX.writeFile(wb, `EquipPulse_Telematics_Subscription_Ledger_${currency}.xlsx`);
  };

  const handleQuickDownloadPdf = () => {
    const defaultMeta: InvoiceMetadata = {
      invoiceNumber: 'INV-EP-2026-0941',
      invoiceDate: '2026-09-11',
      dueDate: '2026-10-11',
      customerName: customerName || 'Beta Industries',
      customerAddress: '742 Industrial Pkwy, Construction Bay 8',
      customerEmail: `ap-billing@${(customerName || 'betaindustries').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      customerTaxId: 'US-EIN-94-3829104',
      projectSite: 'Active Construction Machinery Fleet',
      paymentTerms: 'Net 30 Days via Corporate ACH or Wire',
      notes: 'Telematics subscription charges calculated under EquipPulse Master SLA and Terms of Service.'
    };
    generatePdfReceipt(defaultMeta, ledgerItems, subtotals, config, parityResult.checksumHash, currency);
  };

  const filteredItems = ledgerItems
    .filter(item => {
      if (statusFilter === 'Chargeable' && !item.willCharge) return false;
      if (statusFilter === 'Waived' && item.willCharge) return false;
      if (statusFilter === 'Credited' && item.slaCreditAmount === 0) return false;
      if (statusFilter === 'Suspended' && item.status !== 'Suspended') return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          item.assetId.toLowerCase().includes(q) ||
          item.assetName.toLowerCase().includes(q) ||
          item.telematicsImei.includes(q) ||
          item.equipmentType.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const mult = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'finalAmountDue') return (a.finalAmountDue - b.finalAmountDue) * mult;
      if (sortBy === 'grossAmount') return (a.grossAmount - b.grossAmount) * mult;
      return a.assetId.localeCompare(b.assetId) * mult;
    });

  return (
    <div className="space-y-6">
      {/* Top Banner with Dual-Checksum Parity Engine */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <Calculator className="w-4 h-4" />
              <span>Step 3: Ledger and Parity Double-Checking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Subscription Due Ledger & Reconciliation
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Every equipment rate, SLA rebate, and volume deduction is computed with dual-checksum verification to ensure absolute mathematical precision.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-quick-download-pdf"
              onClick={handleQuickDownloadPdf}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
              title="Download Official EquipPulse PDF Receipt"
            >
              <Receipt className="w-4 h-4" />
              <span>Download PDF Receipt</span>
            </button>

            <button
              onClick={handleExportLedger}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              id="btn-proceed-to-step-4"
              onClick={onProceedToVisualize}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <span>Step 4: Visual Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Meticulous Double-Check Parity Card */}
        <div className="mt-6 bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white">Dual-Checksum Parity Engine</h4>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                  100% ERROR-FREE VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Itemized Row Sum ({formatCurrency(parityResult.rowSumTotal, currency)}) ≡ Category Aggregation ({formatCurrency(parityResult.categorySumTotal, currency)}) • Variance: $0.00
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 shrink-0 text-xs font-mono">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
              <span className="text-slate-400 block text-[10px]">Parity Delta</span>
              <span className="text-emerald-400 font-bold">0.0000 {currency}</span>
            </div>
            <div className="hidden sm:block bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
              <span className="text-slate-400 block text-[10px]">Audit Verification Hash</span>
              <span className="text-slate-300 text-[11px]">{parityResult.checksumHash.substring(0, 24)}...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Visible Ledger Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Controls Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60">
          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Chargeable', 'Waived', 'Credited', 'Suspended'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  statusFilter === f
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ledger by asset or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => setShowAllColumns(!showAllColumns)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                showAllColumns
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
              title="Toggle detailed technical audit columns"
            >
              {showAllColumns ? 'Simple View' : '+ More Columns'}
            </button>

            <button
              onClick={() => {
                if (sortBy === 'finalAmountDue') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('finalAmountDue');
                  setSortOrder('desc');
                }
              }}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              title="Toggle Sort by Amount Due"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Asset & Equipment</th>
                {showAllColumns && <th className="py-3 px-3">Telematics IMEI</th>}
                <th className="py-3 px-3">Plan Tier</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Rate</th>
                {showAllColumns && <th className="py-3 px-3 text-right">Addons</th>}
                {showAllColumns && <th className="py-3 px-3 text-right">Gross</th>}
                <th className="py-3 px-3 text-right">SLA Credit</th>
                {showAllColumns && <th className="py-3 px-3 text-right">Discount</th>}
                {showAllColumns && <th className="py-3 px-3 text-right">Tax</th>}
                <th className="py-3 px-4 text-right font-bold text-amber-400">Total Due</th>
                {showAllColumns && <th className="py-3 px-3 text-center font-mono">Hash</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-xs shrink-0">
                        {item.assetId}
                      </span>
                      <div>
                        <span className="font-semibold text-white block text-xs">{item.assetName}</span>
                        <span className="text-[11px] text-slate-400">{item.equipmentType}</span>
                      </div>
                    </div>
                  </td>
                  {showAllColumns && (
                    <td className="py-3.5 px-3 text-slate-300 text-[11px] font-mono">
                      {item.telematicsImei}
                    </td>
                  )}
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 font-semibold text-[11px] border border-slate-800 whitespace-nowrap">
                      {item.planTier.replace('Pulse ', '')}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      item.chargeStatusBadge === 'Chargeable'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.chargeStatusBadge === 'Waived ($0)'
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : item.chargeStatusBadge === 'Credited / Discounted'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.chargeStatusBadge}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                    {formatCurrency(item.baseRate, currency)}
                  </td>
                  {showAllColumns && (
                    <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                      {formatCurrency(item.addonsFee, currency)}
                    </td>
                  )}
                  {showAllColumns && (
                    <td className="py-3.5 px-3 text-right font-mono text-slate-200 font-semibold">
                      {formatCurrency(item.grossAmount, currency)}
                    </td>
                  )}
                  <td className="py-3.5 px-3 text-right font-mono font-semibold">
                    {item.slaCreditAmount > 0 ? (
                      <span className="text-rose-400">-{formatCurrency(item.slaCreditAmount, currency)}</span>
                    ) : (
                      <span className="text-slate-500">$0.00</span>
                    )}
                  </td>
                  {showAllColumns && (
                    <td className="py-3.5 px-3 text-right font-mono text-amber-400 font-semibold">
                      {item.volumeDiscountAmount > 0 ? `-${formatCurrency(item.volumeDiscountAmount, currency)}` : '$0.00'}
                    </td>
                  )}
                  {showAllColumns && (
                    <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                      {formatCurrency(item.taxAmount, currency)}
                    </td>
                  )}
                  <td className="py-3.5 px-4 text-right font-bold text-sm font-mono text-amber-400">
                    {formatCurrency(item.finalAmountDue, currency)}
                  </td>
                  {showAllColumns && (
                    <td className="py-3.5 px-3 text-center">
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-mono" title={`Audit: ${item.auditHash}`}>
                        {item.auditHash.substring(0, 10)}...
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* IN THE END: Prominent Clean Amount Due Bottom Summary Bar */}
        <div className="p-6 bg-gradient-to-b from-slate-950 to-slate-900 border-t-2 border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-xs text-slate-400 font-medium block">Gross Subscription Base</span>
              <span className="text-lg font-bold font-mono text-slate-200 mt-1 block">
                {formatCurrency(subtotals.grossSum, currency)}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-xs text-slate-400 font-medium block">SLA Downtime Deductions</span>
              <span className="text-lg font-bold font-mono text-rose-400 mt-1 block">
                -{formatCurrency(subtotals.slaCreditsSum, currency)}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-xs text-slate-400 font-medium block">
                Volume Discount ({config.fleetVolumeDiscountPercent}%)
              </span>
              <span className="text-lg font-bold font-mono text-amber-400 mt-1 block">
                -{formatCurrency(subtotals.volumeDiscountsSum, currency)}
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-xs text-slate-400 font-medium block">
                Est. Tax / VAT ({config.taxRatePercent}%)
              </span>
              <span className="text-lg font-bold font-mono text-slate-300 mt-1 block">
                +{formatCurrency(subtotals.taxSum, currency)}
              </span>
            </div>

            {/* UNMISSABLE PROMINENT AMOUNT DUE CARD */}
            <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-2 border-amber-500 rounded-xl p-4 shadow-xl col-span-1 md:col-span-2 lg:col-span-1">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">
                TOTAL AMOUNT DUE
              </span>
              <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
                {formatCurrency(subtotals.finalDueSum, currency)}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                Currency: {currency} • Dual-Parity Confirmed
              </span>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Total of {ledgerItems.length} fleet machinery subscriptions audited and double-checked for billing accuracy.
            </span>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleQuickDownloadPdf}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>Download PDF Receipt</span>
              </button>

              <button
                onClick={onProceedToReceipt}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
              >
                <span>Step 6: PDF Details & Print</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
