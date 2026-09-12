import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileCheck2,
  Layers,
  Sparkles,
  Info,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Check,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { RawTelematicsRow, CleanedTelematicsRecord, DataCorrection, SupportedCurrency } from '../types/telematics';
import { SpreadsheetFormulasModal } from './SpreadsheetFormulasModal';
import { formatCurrency } from '../utils/currency';

interface DataCleaningViewProps {
  rawRows: RawTelematicsRow[];
  cleanedRecords: CleanedTelematicsRecord[];
  corrections: DataCorrection[];
  duplicatesCount: number;
  onFileUpload: (data: RawTelematicsRow[], fileName?: string) => void;
  onLoadSample: () => void;
  onToggleCorrection: (id: string) => void;
  onProceedToTerms: () => void;
  onUpdateRecord: (id: string, field: keyof CleanedTelematicsRecord, value: any) => void;
  currency: SupportedCurrency;
}

export const DataCleaningView: React.FC<DataCleaningViewProps> = ({
  rawRows,
  cleanedRecords,
  corrections,
  duplicatesCount,
  onFileUpload,
  onLoadSample,
  onToggleCorrection,
  onProceedToTerms,
  currency
}) => {
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'corrections' | 'cleanedData'>('corrections');
  const [searchQuery, setSearchQuery] = useState('');
  const [fieldFilter, setFieldFilter] = useState<string>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<RawTelematicsRow>(ws, { defval: '' });
        if (data.length > 0) {
          onFileUpload(data, file.name);
        }
      } catch (err) {
        console.error('File parsing error:', err);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<RawTelematicsRow>(ws, { defval: '' });
        if (data.length > 0) {
          onFileUpload(data, file.name);
        }
      } catch (err) {
        console.error('Drop parsing error:', err);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Blank State Check
  if (rawRows.length === 0) {
    return (
      <div className="space-y-6">
        {/* Waiting For Upload Container */}
        <div className="bg-slate-950 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl p-10 sm:p-16 text-center transition shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Step 1: Raw Fleet Telematics Ingestion
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Waiting for Subscription Data to be Uploaded
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Upload your telematics fleet file (CSV, Excel <span className="text-slate-200">.xlsx / .xls</span>, or Google Sheets export).
                The engine will instantly inspect dates for inversions, isolate duplicate cellular IMEIs, normalize pricing tiers, and generate an audit report.
              </p>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-8 cursor-pointer transition group"
            >
              <FileSpreadsheet className="w-10 h-10 text-slate-500 group-hover:text-amber-400 mx-auto transition" />
              <p className="text-sm font-bold text-slate-200 mt-3 group-hover:text-white">
                Drag and drop your spreadsheet here, or <span className="text-amber-400 underline">browse files</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports .csv, .xlsx, .xls • Multi-currency detection: Danish Krone (DKK), Euro (EUR), US Dollars (USD)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Quick Actions & Demo Sample Option */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                id="btn-load-sample-empty-state"
                onClick={onLoadSample}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Load Sample Fleet Dataset (With Anomalies to Test Engine)</span>
              </button>

              <button
                onClick={() => setIsFormulaModalOpen(true)}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>View Spreadsheet Formula Guide</span>
              </button>
            </div>
          </div>
        </div>

        <SpreadsheetFormulasModal
          isOpen={isFormulaModalOpen}
          onClose={() => setIsFormulaModalOpen(false)}
        />
      </div>
    );
  }

  // Active State: Data is loaded and cleaned
  const invertedDatesCount = corrections.filter(c => c.field === 'contractDates').length;
  const filteredCorrections = corrections.filter(c => {
    if (fieldFilter !== 'ALL' && c.field !== fieldFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.assetId.toLowerCase().includes(q) ||
        c.field.toLowerCase().includes(q) ||
        c.reason.toLowerCase().includes(q) ||
        c.ruleApplied.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <FileCheck2 className="w-4 h-4" />
              <span>Step 1: Meticulous Data Cleaning & Audit Trail</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Telematics Data Cleansed & Validated
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Every row was rigorously verified for date chronological order, cellular modem IMEI uniqueness, tier standardizations, and pricing anomalies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-open-formula-modal"
              onClick={() => setIsFormulaModalOpen(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Spreadsheet Formulas Guide</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Upload New File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              id="btn-proceed-to-step-2"
              onClick={onProceedToTerms}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <span>Step 2: Terms & Renewals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cleaning KPI Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Inverted Dates Rectified</span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                {invertedDatesCount} detected & swapped
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Duplicate IMEIs Quarantined</span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                {duplicatesCount} flagged ($0 bill)
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Total Corrections Made</span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                {corrections.length} recorded
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Active Billing Currency</span>
              <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 block">
                {currency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex space-x-2">
          <button
            id="tab-btn-corrections-audit"
            onClick={() => setActiveSubTab('corrections')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'corrections'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>Corrections & Audit Findings</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-amber-400">
              {corrections.length}
            </span>
          </button>

          <button
            id="tab-btn-clean-fleet-data"
            onClick={() => setActiveSubTab('cleanedData')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'cleanedData'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>Clean Fleet Data Grid</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {cleanedRecords.length}
            </span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by asset or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Sub-tab 1: Corrections Audit Table */}
      {activeSubTab === 'corrections' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div>
              <h3 className="text-sm font-bold text-white">
                Detailed Cleaning Actions Applied to Uploaded Data
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every transformation is logged with original raw input, corrected value, and Excel / Google Sheets formula recommendation.
              </p>
            </div>
            <button
              onClick={() => setIsFormulaModalOpen(true)}
              className="text-xs font-semibold text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Learn spreadsheet formulas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Row</th>
                  <th className="py-3 px-4">Asset ID</th>
                  <th className="py-3 px-4">Field</th>
                  <th className="py-3 px-4">Original Raw Input</th>
                  <th className="py-3 px-4">Corrected Output</th>
                  <th className="py-3 px-4">Rule & Finding</th>
                  <th className="py-3 px-4 font-mono">Spreadsheet Formula</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                {filteredCorrections.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 font-mono text-slate-400">#{c.rowNumber}</td>
                    <td className="py-3 px-4 font-bold text-white font-mono">{c.assetId}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[11px] border border-slate-700">
                        {c.field}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-rose-300 font-mono line-through bg-rose-950/10">
                      {String(c.originalValue)}
                    </td>
                    <td className="py-3 px-4 text-emerald-300 font-mono font-bold bg-emerald-950/10">
                      {String(c.correctedValue)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200 block text-xs">{c.ruleApplied}</span>
                      <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">{c.reason}</span>
                    </td>
                    <td className="py-3 px-4">
                      {c.excelFormulaTip && (
                        <code className="text-[10px] text-sky-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 block whitespace-nowrap overflow-x-auto max-w-xs font-mono">
                          {c.excelFormulaTip}
                        </code>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Cleaned Records Grid */}
      {activeSubTab === 'cleanedData' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Asset ID</th>
                  <th className="py-3 px-4">Machine Name & Type</th>
                  <th className="py-3 px-4">Telematics IMEI</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4">Contract Dates</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Uptime SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                {cleanedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/50 transition font-mono">
                    <td className="py-3 px-4 font-bold text-white">{r.assetId}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="font-semibold text-slate-200 block text-xs">{r.assetName}</span>
                      <span className="text-[11px] text-slate-400">{r.equipmentType}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {r.telematicsImei}
                      {r.isDuplicate && (
                        <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-400 font-bold">
                          DUP
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-amber-400">{r.planTier}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-300">
                      {r.contractStartDate} &rarr; {r.contractEndDate}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {formatCurrency(r.baseMonthlyRate, currency)}/mo
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : r.status === 'Suspended'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-bold ${
                        r.slaUptimePercent >= 99.9
                          ? 'text-emerald-400'
                          : r.slaUptimePercent >= 99.0
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>
                        {r.slaUptimePercent.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Formulas & Tips Modal */}
      <SpreadsheetFormulasModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
      />
    </div>
  );
};
