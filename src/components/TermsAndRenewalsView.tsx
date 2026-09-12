import React, { useState } from 'react';
import {
  CalendarCheck,
  Sliders,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Coins,
  Calendar,
  Layers
} from 'lucide-react';
import {
  ContractAssessment,
  CleanedTelematicsRecord,
  TermsAndConditionsConfig,
  SupportedCurrency
} from '../types/telematics';
import { DEFAULT_TERMS_AND_CONDITIONS, STANDARD_TIER_RATES } from '../data/termsAndConditions';
import { formatCurrency } from '../utils/currency';

interface TermsAndRenewalsViewProps {
  assessments: ContractAssessment[];
  cleanedRecords: CleanedTelematicsRecord[];
  config: TermsAndConditionsConfig;
  onUpdateConfig: (newConfig: TermsAndConditionsConfig) => void;
  onProceedToLedger: () => void;
  currency: SupportedCurrency;
}

export const TermsAndRenewalsView: React.FC<TermsAndRenewalsViewProps> = ({
  assessments,
  cleanedRecords,
  config,
  onUpdateConfig,
  onProceedToLedger,
  currency
}) => {
  const [activeSection, setActiveSection] = useState<'renewals' | 'policies'>('renewals');
  const [filterType, setFilterType] = useState<'All' | 'WillCharge' | 'Waived' | 'SlaBreach'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const handleResetDefaults = () => {
    onUpdateConfig(DEFAULT_TERMS_AND_CONDITIONS);
  };

  const willChargeCount = assessments.filter(a => a.willCharge).length;
  const waivedCount = assessments.filter(a => !a.willCharge).length;
  const slaBreachCount = assessments.filter(a => a.slaBreach).length;

  const filteredAssessments = assessments.filter(a => {
    if (filterType === 'WillCharge' && !a.willCharge) return false;
    if (filterType === 'Waived' && a.willCharge) return false;
    if (filterType === 'SlaBreach' && !a.slaBreach) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        a.assetId.toLowerCase().includes(q) ||
        a.assetName.toLowerCase().includes(q) ||
        a.chargeReason.toLowerCase().includes(q)
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
              <CalendarCheck className="w-4 h-4" />
              <span>Step 2: Term, SLA & Renewal Charges</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Contract Terms, SLA Policies & Renewal Evaluation
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Evaluating every machine against Equip+ master terms: applying 30-day notice windows, auto-renewal clauses, uptime SLA rebates, and fee structures.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
              title="Reset terms and SLA rules to Equip+ defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              id="btn-proceed-to-step-3"
              onClick={onProceedToLedger}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <span>Proceed to Step 3: Ledger & Parity</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Summary Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Chargeable Assets</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
                {willChargeCount} Units
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-slate-800 text-slate-400 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Waived / Decom ($0)</span>
              <span className="text-xl font-bold font-mono text-slate-300 mt-0.5 block">
                {waivedCount} Units
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">SLA Outage Rebates</span>
              <span className="text-xl font-bold font-mono text-rose-400 mt-0.5 block">
                {slaBreachCount} Credited
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Currency & Notice</span>
              <span className="text-base font-bold font-mono text-amber-400 mt-0.5 block truncate">
                {currency} • {config.autoRenewalWindowDays}d Window
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navigation Switcher between Asset Renewal Evaluation & Contract Policy Rules */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSection('renewals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-2 ${
              activeSection === 'renewals'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Asset Renewal & Charges Assessment ({assessments.length} Assets)</span>
          </button>

          <button
            onClick={() => setActiveSection('policies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-2 ${
              activeSection === 'policies'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Contract Terms & SLA Rules</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          {activeSection === 'renewals' ? 'Real-time asset liability status' : 'Tunable SLA thresholds & packaging tiers'}
        </span>
      </div>

      {/* SECTION 1: ASSET RENEWAL & CHARGES ASSESSMENT */}
      {activeSection === 'renewals' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Controls */}
          <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60">
            <div className="flex flex-wrap items-center gap-2">
              {(['All', 'WillCharge', 'Waived', 'SlaBreach'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    filterType === type
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {type === 'All' && 'All Evaluated Assets'}
                  {type === 'WillCharge' && `Chargeable (${willChargeCount})`}
                  {type === 'Waived' && `Waived ($0) (${waivedCount})`}
                  {type === 'SlaBreach' && `SLA Credited (${slaBreachCount})`}
                </button>
              ))}
            </div>

            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search assessment results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Evaluation Table */}
          {cleanedRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p>No telematics records loaded. Upload your spreadsheet in Step 1.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Asset ID</th>
                    <th className="py-3 px-4">Equipment Name</th>
                    <th className="py-3 px-4 text-center">Auto-Renewal</th>
                    <th className="py-3 px-4 text-center">Charge Status</th>
                    <th className="py-3 px-4">Contractual Rule & Reason</th>
                    <th className="py-3 px-4 text-right">SLA Deduction</th>
                    <th className="py-3 px-4 text-right">Estimated Net Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                  {filteredAssessments.map(a => (
                    <tr key={a.recordId} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 font-bold text-amber-400 font-mono">{a.assetId}</td>
                      <td className="py-3.5 px-4 text-slate-200 font-semibold">{a.assetName}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.willRenew
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {a.renewalType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {a.willCharge ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Chargeable</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            <XCircle className="w-3 h-3" />
                            <span>Waived ($0)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-xs text-slate-300 leading-relaxed">{a.chargeReason}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        {a.slaCreditAmount > 0 ? (
                          <span className="text-rose-400 font-semibold">
                            -{formatCurrency(a.slaCreditAmount, currency)} ({a.slaCreditPercent}%)
                          </span>
                        ) : (
                          <span className="text-slate-500">$0.00</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100">
                        {formatCurrency(a.effectiveMonthlyRate, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: CONTRACT TERMS & SLA RULES */}
      {activeSection === 'policies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Standard Subscription Packaging Tiers */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Standard Packaging Rates</h3>
              </div>
              <p className="text-xs text-slate-400">
                Official benchmark rates across telematics tiers deployed in construction machinery.
              </p>

              <div className="space-y-3 pt-2">
                {Object.entries(STANDARD_TIER_RATES).map(([key, tier]) => {
                  let rate = tier.monthlyUSD;
                  if (currency === 'DKK') rate = tier.monthlyDKK;
                  else if (currency === 'EUR') rate = tier.monthlyEUR;

                  return (
                    <div key={key} className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                          <span>{tier.name}</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {tier.features.join(' • ')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-base font-extrabold font-mono text-amber-400 block">
                          {formatCurrency(rate, currency)}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">per asset / mo</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 2: SLA Uptime Performance & Penalty Credits */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">SLA Uptime Performance Credits</h3>
              </div>
              <p className="text-xs text-slate-400">
                Availability commitments & service credits deducted from invoice if uptime falls below 99.9%.
              </p>

              <div className="space-y-3 pt-2">
                {config.slaTiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-xl p-3.5 flex items-center justify-between gap-3 ${
                      tier.creditPercent === 0
                        ? 'bg-slate-900/60 border-slate-800'
                        : tier.creditPercent <= 10
                        ? 'bg-amber-950/20 border-amber-900/40'
                        : 'bg-rose-950/20 border-rose-900/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-200">
                          {tier.minUptime}% - {tier.maxUptime}% Ingestion
                        </span>
                        {tier.creditPercent === 0 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                            Target Met
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 font-bold">
                            SLA Breach
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {tier.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-base font-bold font-mono ${tier.creditPercent === 0 ? 'text-slate-400' : 'text-rose-400'}`}>
                        {tier.creditPercent}% Credit
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">on Subscription</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contract Policy Sliders & Thresholds */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Billing Engine Parameters & Threshold Adjustments</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Parameter 1: Auto-Renewal Notice Window */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">Renewal Notice Window</span>
                  <span className="font-mono font-bold text-amber-400">{config.autoRenewalWindowDays} Days</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={config.autoRenewalWindowDays}
                  onChange={(e) => onUpdateConfig({ ...config, autoRenewalWindowDays: parseInt(e.target.value, 10) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Contracts within this window auto-lock for 12 months unless notice was received.
                </p>
              </div>

              {/* Parameter 2: Standby Suspension Rate */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">Standby Dormancy Fee</span>
                  <span className="font-mono font-bold text-amber-400">
                    {formatCurrency(config.suspensionMonthlyRate, currency)}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min="1.00"
                  max="20.00"
                  step="0.50"
                  value={config.suspensionMonthlyRate}
                  onChange={(e) => onUpdateConfig({ ...config, suspensionMonthlyRate: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Standby cellular data fee charged when machines are paused for winter or maintenance.
                </p>
              </div>

              {/* Parameter 3: Fleet Volume Discount */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">Fleet Volume Discount</span>
                  <span className="font-mono font-bold text-amber-400">{config.fleetVolumeDiscountPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={config.fleetVolumeDiscountPercent}
                  onChange={(e) => onUpdateConfig({ ...config, fleetVolumeDiscountPercent: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Applied automatically to enterprise accounts operating 10 or more active units.
                </p>
              </div>

              {/* Parameter 4: Estimated Tax Rate */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">Sales Tax / VAT</span>
                  <span className="font-mono font-bold text-amber-400">{config.taxRatePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.25"
                  value={config.taxRatePercent}
                  onChange={(e) => onUpdateConfig({ ...config, taxRatePercent: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Local sales tax or value-added tax applied to the net taxable telematics base.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
