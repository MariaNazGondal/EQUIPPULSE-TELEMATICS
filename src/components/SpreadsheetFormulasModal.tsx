import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Copy,
  Check,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { SPREADSHEET_FORMULA_GUIDE, TELEMATICS_DATA_HYGIENE_TIPS } from '../utils/spreadsheetFormulas';

interface SpreadsheetFormulasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpreadsheetFormulasModal: React.FC<SpreadsheetFormulasModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Date Correction', 'Deduplication', 'Text & Whitespace Cleaning', 'Telematics & IMEI Validation', 'Contract & SLA Calculation'];

  const filteredItems = activeCategory === 'All'
    ? SPREADSHEET_FORMULA_GUIDE
    : SPREADSHEET_FORMULA_GUIDE.filter(item => item.category === activeCategory);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Spreadsheet Remediation & Formula Library</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Excel & Google Sheets
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Formulas and algorithmic corrections to fix inverted dates, eliminate duplicate IMEIs, and enforce telematics standards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/60 flex space-x-2 overflow-x-auto scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Best Practices Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-slate-800/60 to-slate-900 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Crucial Telematics Fleet Data Hygiene Guidelines</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Inverted dates occur when start and end timestamps are manually swapped during spreadsheet entry, or when regional date conventions (US MM/DD/YYYY vs ISO YYYY-MM-DD) clash. Copy the verified formulas below directly into your workbook.
                </p>
              </div>
            </div>
          </div>

          {/* Formulas Grid */}
          <div className="space-y-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.problem}
                    </p>
                  </div>
                </div>

                {/* Formula Boxes */}
                <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Excel Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        Microsoft Excel
                      </span>
                      <button
                        onClick={() => handleCopy(item.excelFormula, `${item.id}-excel`)}
                        className="inline-flex items-center space-x-1 text-[10px] font-medium text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        {copiedId === `${item.id}-excel` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="text-xs font-mono text-amber-300 block break-all select-all bg-slate-950 p-2 rounded border border-slate-800">
                      {item.excelFormula}
                    </code>
                  </div>

                  {/* Google Sheets Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                        Google Sheets
                      </span>
                      <button
                        onClick={() => handleCopy(item.sheetsFormula, `${item.id}-sheets`)}
                        className="inline-flex items-center space-x-1 text-[10px] font-medium text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        {copiedId === `${item.id}-sheets` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="text-xs font-mono text-sky-300 block break-all select-all bg-slate-950 p-2 rounded border border-slate-800">
                      {item.sheetsFormula}
                    </code>
                  </div>
                </div>

                {/* Explanation & Example */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-slate-300 font-medium">How it works: </span>
                    <span>{item.explanation}</span>
                  </div>
                  <div className="shrink-0 bg-slate-900 px-2.5 py-1 rounded text-[11px] font-mono border border-slate-800 text-slate-300">
                    <span className="text-rose-400 line-through mr-2">{item.exampleInput}</span>
                    <span className="text-emerald-400">➔ {item.exampleOutput}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 5 Data Hygiene Best Practices */}
          <div className="mt-6 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Pro-Grade Telematics Fleet Data Standards</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {TELEMATICS_DATA_HYGIENE_TIPS.map((tip, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                  <span className="text-[10px] font-extrabold text-amber-400 font-mono">0{idx + 1}.</span>
                  <h5 className="text-xs font-bold text-slate-200 mt-1">{tip.title}</h5>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Click any formula to copy directly to your clipboard.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
