import React from 'react';
import {
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Layers,
  Sparkles,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  X,
  FileCheck2,
  Coins,
  Building,
  RotateCcw,
  Copy,
  Info
} from 'lucide-react';
import { CleaningAuditSummary, SupportedCurrency } from '../types/telematics';
import { CURRENCY_CONFIGS } from '../utils/currency';

interface CleanAuditNotificationModalProps {
  isOpen: boolean;
  summary: CleaningAuditSummary | null;
  onClose: () => void;
  onProceedToTerms: () => void;
}

export const CleanAuditNotificationModal: React.FC<CleanAuditNotificationModalProps> = ({
  isOpen,
  summary,
  onClose,
  onProceedToTerms
}) => {
  if (!isOpen || !summary) return null;

  const currencyConfig = CURRENCY_CONFIGS[summary.detectedCurrency] || CURRENCY_CONFIGS.USD;
  const hasInversions = (summary.invertedDateItems && summary.invertedDateItems.length > 0) || summary.invertedDatesFixed > 0;
  const hasDuplicates = (summary.duplicateItems && summary.duplicateItems.length > 0) || summary.duplicatesQuarantined > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/60 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Data Cleaned & Verified
                </span>
                {summary.customerName && (
                  <span className="text-[11px] font-bold text-amber-400 bg-slate-950 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center space-x-1">
                    <Building className="w-3 h-3" />
                    <span>Customer: {summary.customerName}</span>
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {summary.totalRowsProcessed} Rows Processed
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-1">
                Data Cleansing Audit Findings & Corrections
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Top Status & Currency */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Fleet Billing Currency Auto-Configured</span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-base font-extrabold font-mono text-amber-400">{currencyConfig.label}</span>
                  <span className="text-xs text-slate-400 font-mono">({currencyConfig.symbol})</span>
                </div>
              </div>
            </div>

            {summary.fileName && (
              <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                Source File: <strong className="text-slate-200">{summary.fileName}</strong>
              </div>
            )}
          </div>

          {/* 4 Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Inverted Dates</span>
              <span className="text-2xl font-extrabold font-mono text-amber-400 mt-1 block">
                {summary.invertedDatesFixed}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Reversed & Fixed</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Duplicate Units</span>
              <span className="text-2xl font-extrabold font-mono text-rose-400 mt-1 block">
                {summary.duplicatesQuarantined}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Quarantined ($0)</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Rates Rectified</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 block">
                {summary.ratesRectified}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Catalogue Standard</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Tiers Aligned</span>
              <span className="text-2xl font-extrabold font-mono text-sky-400 mt-1 block">
                {summary.tierNamesStandardized}
              </span>
              <span className="text-[10px] text-sky-400 font-medium">Standard Packaging</span>
            </div>
          </div>

          {/* SPECIFIC FINDINGS 1: INVERTED DATES RECTIFIED */}
          {hasInversions && (
            <div className="bg-amber-950/20 border-2 border-amber-500/40 rounded-xl p-4.5 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <RotateCcw className="w-4 h-4" />
                <span>CHRONOLOGICAL DATE INVERSIONS IDENTIFIED & RESOLVED ({summary.invertedDatesFixed})</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The engine detected contract records where the <strong>End Date was earlier than the Start Date</strong>. To prevent erroneous negative contract durations, the dates were automatically swapped chronologically:
              </p>

              <div className="space-y-2 pt-1 font-mono text-xs">
                {(summary.invertedDateItems || []).slice(0, 5).map((inv, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-white font-bold font-sans">{inv.assetId}</span>
                      <span className="text-slate-400 text-[11px] font-sans ml-2">({inv.assetName})</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300 text-xs">
                      <span className="text-rose-400 line-through">
                        {inv.originalStart} &rarr; {inv.originalEnd}
                      </span>
                      <span className="text-amber-400">&rarr;</span>
                      <span className="text-emerald-400 font-bold">
                        {inv.swappedStart} &rarr; {inv.swappedEnd}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                <span className="text-amber-400 font-bold">Excel/Sheets Remediation Formula:</span>{' '}
                <code className="bg-slate-950 px-2 py-0.5 rounded text-amber-300 font-mono">
                  =IF(EndDate &lt; StartDate, EndDate, StartDate)
                </code>
              </div>
            </div>
          )}

          {/* SPECIFIC FINDINGS 2: DUPLICATES QUARANTINED */}
          {hasDuplicates && (
            <div className="bg-rose-950/20 border-2 border-rose-500/40 rounded-xl p-4.5 space-y-3">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>DUPLICATE TELEMATICS UNITS QUARANTINED ({summary.duplicatesQuarantined})</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The engine detected duplicate cellular IMEIs or equipment serials across rows. To eliminate fraudulent double billing, duplicate entries have been tagged and <strong>quarantined with $0.00 subscription liability</strong>:
              </p>

              <div className="space-y-2 pt-1 font-mono text-xs">
                {(summary.duplicateItems || []).slice(0, 5).map((dup, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-white font-bold font-sans">Row #{dup.rowNum}: {dup.assetId}</span>
                      <span className="text-slate-400 text-[11px] ml-2">IMEI: {dup.imei}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-sans text-[10px] font-bold">
                      Matches Row #{dup.duplicateOfRowNum} &bull; Billed $0.00
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                <span className="text-rose-400 font-bold">Excel/Sheets Remediation Formula:</span>{' '}
                <code className="bg-slate-950 px-2 py-0.5 rounded text-rose-300 font-mono">
                  =IF(COUNTIF($D$2:$D$100, D2)&gt;1, "DUPLICATE", "UNIQUE")
                </code>
              </div>
            </div>
          )}

          {/* Action Highlights List */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4.5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full Ingestion Log & Automated Transformations</span>
            </h4>

            <ul className="space-y-2 text-xs text-slate-300">
              {summary.summaryHighlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-400">
            Audit corrections applied dynamically across all 6 views and official receipts.
          </span>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Review Clean Data Table
            </button>
            <button
              onClick={() => {
                onClose();
                onProceedToTerms();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <span>Continue to Contract Terms</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
