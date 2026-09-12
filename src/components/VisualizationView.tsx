import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  BarChart3,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Clock,
  Truck,
  Layers,
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';
import { LedgerItem, ContractAssessment, CleanedTelematicsRecord, SupportedCurrency } from '../types/telematics';
import { formatCurrency } from '../utils/currency';

interface VisualizationViewProps {
  ledgerItems: LedgerItem[];
  assessments: ContractAssessment[];
  cleanedRecords: CleanedTelematicsRecord[];
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
  onProceedToReceipt: () => void;
  currency: SupportedCurrency;
}

const TIER_COLORS = ['#38bdf8', '#f59e0b', '#10b981', '#a855f7', '#ec4899', '#6366f1'];

export const VisualizationView: React.FC<VisualizationViewProps> = ({
  ledgerItems,
  assessments,
  subtotals,
  onProceedToReceipt,
  currency
}) => {
  if (ledgerItems.length === 0) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center">
        <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white">No Subscription Data Available</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Please upload your telematics dataset to generate dynamic graphs, equipment category distribution, and contract renewal horizons.
        </p>
      </div>
    );
  }

  // 1. Dynamic Category Aggregation for Bar Chart
  const categoryChartData = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    ledgerItems.forEach(item => {
      let cat = 'General Fleet';
      const lower = (item.equipmentType || '').toLowerCase();
      if (lower.includes('excavator') || lower.includes('loader') || lower.includes('bulldozer') || lower.includes('earth')) {
        cat = 'Earthmoving';
      } else if (lower.includes('aerial') || lower.includes('scissor') || lower.includes('boom')) {
        cat = 'Aerial & Boom';
      } else if (lower.includes('telehandler') || lower.includes('crane') || lower.includes('material')) {
        cat = 'Material Handling';
      } else if (lower.includes('generator') || lower.includes('power')) {
        cat = 'Power Systems';
      } else if (lower.includes('roller') || lower.includes('compaction')) {
        cat = 'Compaction';
      }

      const prev = map.get(cat) || { total: 0, count: 0 };
      map.set(cat, {
        total: prev.total + item.finalAmountDue,
        count: prev.count + 1
      });
    });

    return Array.from(map.entries()).map(([category, d]) => ({
      category,
      amount: Number(d.total.toFixed(2)),
      units: d.count,
      avg: d.count > 0 ? Number((d.total / d.count).toFixed(2)) : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [ledgerItems]);

  // 2. Dynamic Plan Tier Aggregation for Donut Chart
  const tierChartData = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    ledgerItems.forEach(item => {
      const name = item.planTier.replace('Pulse ', '').replace('Telematics', '').trim();
      const prev = map.get(name) || { total: 0, count: 0 };
      map.set(name, {
        total: prev.total + item.finalAmountDue,
        count: prev.count + 1
      });
    });

    return Array.from(map.entries()).map(([name, d]) => ({
      name,
      value: Number(d.total.toFixed(2)),
      count: d.count
    }));
  }, [ledgerItems]);

  // 3. Dynamic Financial Net Due Breakdown
  const financialWaterfallData = useMemo(() => [
    {
      stage: 'Gross Base',
      amount: Number(subtotals.grossSum.toFixed(2)),
      description: 'Standard Contract Rates',
      fill: '#94a3b8'
    },
    {
      stage: 'SLA Rebates',
      amount: Number(subtotals.slaCreditsSum.toFixed(2)),
      description: 'Downtime Deductions',
      fill: '#f43f5e'
    },
    {
      stage: 'Fleet Discount',
      amount: Number(subtotals.volumeDiscountsSum.toFixed(2)),
      description: 'Volume Tier Savings',
      fill: '#38bdf8'
    },
    {
      stage: 'Net Due',
      amount: Number(subtotals.finalDueSum.toFixed(2)),
      description: 'Final Payable Amount',
      fill: '#f59e0b'
    }
  ], [subtotals]);

  // 4. Expiration Horizon Buckets
  const expiringUnder30 = useMemo(() => assessments.filter(a => a.daysRemaining > 0 && a.daysRemaining <= 30), [assessments]);
  const expiring30To60 = useMemo(() => assessments.filter(a => a.daysRemaining > 30 && a.daysRemaining <= 60), [assessments]);
  const autoRenewedPastDue = useMemo(() => assessments.filter(a => a.daysRemaining <= 0), [assessments]);
  const safeFuture = useMemo(() => assessments.filter(a => a.daysRemaining > 60), [assessments]);

  // Daily Cost Per Machine Average
  const activeCount = subtotals.chargedCount || 1;
  const avgCostPerMachineMonth = subtotals.finalDueSum / activeCount;
  const avgCostPerMachineDay = avgCostPerMachineMonth / 30;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <BarChart3 className="w-4 h-4" />
              <span>Step 4: Visual Analytics & Telematics Charts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Subscription Cost Analytics & Dynamic Charts
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Interactive charts dynamically calculated from your uploaded telematics data. Visualize amounts due by equipment categories, subscription tiers, SLA downtime credits, and renewal horizons.
            </p>
          </div>

          <button
            id="btn-proceed-to-step-5"
            onClick={onProceedToReceipt}
            className="inline-flex items-center space-x-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
          >
            <span>Proceed to Step 5: PDF Receipt</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium block">Total Amount Due</span>
            <span className="text-2xl font-extrabold font-mono text-amber-400 mt-1 block">
              {formatCurrency(subtotals.finalDueSum, currency)}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium block">Avg. Cost / Machine / Day</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 block">
              {formatCurrency(avgCostPerMachineDay, currency)}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium block">Expiring in &le; 30 Days</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-2xl font-extrabold font-mono text-rose-400">
                {expiringUnder30.length}
              </span>
              <span className="text-[11px] text-rose-400 font-medium bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                Notice Lock
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 font-medium block">SLA Downtime Credited</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-2xl font-extrabold font-mono text-sky-400">
                -{formatCurrency(subtotals.slaCreditsSum, currency)}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{subtotals.creditedCount} units</span>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC RECHARTS VISUALIZATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Amount Due by Equipment Category (Bar Chart) */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Amount Due by Equipment Category</h3>
            </div>
            <span className="text-xs font-mono bg-slate-900 text-amber-400 px-2.5 py-1 rounded-lg border border-slate-800">
              {formatCurrency(subtotals.finalDueSum, currency)} Total
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Interactive graph showing subscription expenditure distributed across heavy machinery divisions.
          </p>

          {/* Recharts Bar Chart */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="category"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                          <p className="font-bold text-white">{data.category}</p>
                          <p className="text-amber-400 font-mono font-semibold">
                            Total Due: {formatCurrency(data.amount, currency)}
                          </p>
                          <p className="text-slate-300">
                            Units: <span className="font-bold text-white">{data.units}</span>
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            Avg/Unit: {formatCurrency(data.avg, currency)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="amount" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Subscription Plan Tier Allocation (Donut / Pie Chart) */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">Plan Tier Packaging Distribution</h3>
            </div>
            <span className="text-xs font-mono bg-slate-900 text-sky-400 px-2.5 py-1 rounded-lg border border-slate-800">
              {ledgerItems.length} Connected Units
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Breakdown across GPS tracking, CAN-bus diagnostics, and fleet intelligence subscriptions.
          </p>

          {/* Recharts Pie Chart */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {tierChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TIER_COLORS[index % TIER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                          <p className="font-bold text-white">{data.name}</p>
                          <p className="text-amber-400 font-mono font-semibold">
                            Total Due: {formatCurrency(data.value, currency)}
                          </p>
                          <p className="text-slate-300">
                            Units Subscribed: <span className="font-bold text-white">{data.count}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }}
                  formatter={(value) => <span className="text-slate-300 text-xs font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHART 3: Financial Net Due Waterfall Reconciliation */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Financial Calculation Flow: Gross to Net Amount Due</h3>
          </div>
          <span className="text-xs text-slate-400">
            Double-checked against SLA contract policies
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Visual verification of how gross base rates are adjusted through verified uptime SLA credits and volume tier discounts.
        </p>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialWaterfallData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="stage" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                        <p className="font-bold text-white">{d.stage}</p>
                        <p className="text-amber-400 font-mono font-semibold">
                          Amount: {formatCurrency(d.amount, currency)}
                        </p>
                        <p className="text-slate-400">{d.description}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {financialWaterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expiration & Renewal Horizon Visualization */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Contract Expiration & Renewal Timeline Horizon</h3>
          </div>
          <span className="text-xs text-slate-400">
            Governed by 30-Day Auto-Renewal Clause
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Provides predictive foresight into upcoming renewals. Subscriptions entering the 30-day window automatically lock into the next 12-month billing period unless formal cancellation notice is submitted.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Box 1: Expiring in < 30 Days */}
          <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Critical Window (&le; 30d)
                </span>
                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center font-mono">
                  {expiringUnder30.length}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Renewal notification window active. Must take action or renews for 12 months.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-rose-900/30 text-xs font-mono text-slate-400">
              {expiringUnder30.map(a => a.assetId).slice(0, 2).join(', ')}
              {expiringUnder30.length > 2 && '...'}
            </div>
          </div>

          {/* Box 2: Expiring in 30-60 Days */}
          <div className="bg-amber-950/20 border border-amber-900/50 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Upcoming (30-60d)
                </span>
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center font-mono">
                  {expiring30To60.length}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Prepare fleet review for off-hired machines before the 30-day lock window opens.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-amber-900/30 text-xs font-mono text-slate-400">
              {expiring30To60.map(a => a.assetId).slice(0, 2).join(', ')}
              {expiring30To60.length > 2 && '...'}
            </div>
          </div>

          {/* Box 3: Auto-Renewed & Extended */}
          <div className="bg-sky-950/20 border border-sky-900/50 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Auto-Renewed (Past 1yr)
                </span>
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center font-mono">
                  {autoRenewedPastDue.length}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Contract matured without prior opt-out. Actively rolled over into successive 12-month term.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-sky-900/30 text-xs font-mono text-slate-400">
              {autoRenewedPastDue.map(a => a.assetId).slice(0, 2).join(', ')}
              {autoRenewedPastDue.length > 2 && '...'}
            </div>
          </div>

          {/* Box 4: Active Multi-Year Horizon */}
          <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Stable Horizon (&gt; 60d)
                </span>
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center font-mono">
                  {safeFuture.length}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Long-term telematics data connectivity secured with optimal SLA coverage.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-emerald-900/30 text-xs font-mono text-slate-400">
              {safeFuture.map(a => a.assetId).slice(0, 2).join(', ')}
              {safeFuture.length > 2 && '...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
