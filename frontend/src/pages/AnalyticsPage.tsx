import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, RefreshCw, ShieldCheck, Award, Layers } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { api } from '../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export const AnalyticsPage: React.FC = () => {
  const [methodTrends, setMethodTrends] = useState<any[]>([]);
  const [failureBreakdown, setFailureBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [trendRes, failureRes] = await Promise.all([
        api.getRecoveryTrends(),
        api.getFailureBreakdown(),
      ]);
      setMethodTrends(trendRes.byPaymentMethod || []);
      setFailureBreakdown(failureRes || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const strategyStats = [
    { name: 'RETRY_LATER (6h Delay)', count: 94, rate: '82%', yield: '₹1.84L', cost: 'Low' },
    { name: 'WHATSAPP Payment Link', count: 62, rate: '78%', yield: '₹1.22L', cost: 'Low' },
    { name: 'RETRY_NOW (Instant)', count: 38, rate: '92%', yield: '₹98,000', cost: 'Minimal' },
    { name: 'EMAIL Recovery Nudge', count: 24, rate: '58%', yield: '₹45,000', cost: 'Free' },
    { name: 'MANUAL_REVIEW', count: 12, rate: '45%', yield: '₹2.10L', cost: 'High' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Recovery Performance Analytics</h1>
          <p className="text-sm font-medium text-slate-300 mt-1">
            Deep dive strategy breakdown, channel efficacy, and merchant recovery rates.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Top Strategy Winner Highlight */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-400 border border-emerald-500/30">
            <Award className="h-8 w-8" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Top Performing Strategy</div>
            <div className="text-xl font-extrabold text-white">RETRY_LATER (6-Hour Delay Window)</div>
            <p className="text-xs text-slate-200 font-medium mt-1">
              Delivers <strong className="text-emerald-400 font-extrabold">82% recovery rate</strong> by timing retry execution with customer bank balance credit cycles.
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-emerald-400">₹1.84L</div>
          <div className="text-xs font-bold text-slate-300">Total Yield Generated</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Recovery Rate by Payment Method */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
          <h3 className="text-base font-bold text-white flex items-center justify-between tracking-wide">
            <span>Recovery Rate by Payment Method (%)</span>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={methodTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="method" stroke="#cbd5e1" fontSize={11} fontWeight={600} />
                <YAxis stroke="#cbd5e1" fontSize={11} fontWeight={600} unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6', borderRadius: '12px', fontSize: '12px', color: '#ffffff' }}
                  itemStyle={{ color: '#ffffff', fontWeight: 700 }}
                  labelStyle={{ color: '#93c5fd', fontWeight: 700 }}
                  formatter={(val: any) => [`${val}%`, 'Recovery Rate']}
                />
                <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                  {methodTrends.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Revenue Exposed by Failure Reason */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
          <h3 className="text-base font-bold text-white flex items-center justify-between tracking-wide">
            <span>Revenue Exposure by Failure Reason (₹)</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failureBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="reason" stroke="#cbd5e1" fontSize={10} fontWeight={600} />
                <YAxis stroke="#cbd5e1" fontSize={11} fontWeight={600} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6', borderRadius: '12px', fontSize: '12px', color: '#ffffff' }}
                  itemStyle={{ color: '#ffffff', fontWeight: 700 }}
                  labelStyle={{ color: '#93c5fd', fontWeight: 700 }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Exposed Revenue']}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recovery Strategy Benchmark Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white tracking-wide">Strategy Matrix & Yield Benchmark</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950 text-slate-300 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Strategy Action</th>
                <th className="px-4 py-3.5">Executions</th>
                <th className="px-4 py-3.5">Recovery Rate</th>
                <th className="px-4 py-3.5">Simulated Yield</th>
                <th className="px-4 py-3.5">Execution Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {strategyStats.map((st, idx) => (
                <tr key={idx} className="hover:bg-slate-800/60 transition-colors">
                  <td className="px-4 py-4 font-bold text-white">{st.name}</td>
                  <td className="px-4 py-4 font-semibold">{st.count}</td>
                  <td className="px-4 py-4 font-black text-emerald-400 text-sm">{st.rate}</td>
                  <td className="px-4 py-4 font-extrabold text-blue-400 text-sm">{st.yield}</td>
                  <td className="px-4 py-4 font-semibold text-slate-300">{st.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
