import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Sparkles,
  PieChart as PieIcon,
  RefreshCw,
  Activity,
  DollarSign
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import { DashboardSummary } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [failureBreakdown, setFailureBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, trendRes, failureRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getRevenueTrends(),
        api.getFailureBreakdown(),
      ]);
      setSummary(sumRes);
      setTrends(trendRes);
      setFailureBreakdown(failureRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3">
        <RefreshCw className="h-9 w-9 animate-spin text-blue-500" />
        <span className="text-sm font-semibold text-slate-300">Loading Revenue Intelligence Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Revenue Recovery Intelligence
          </h1>
          <p className="text-sm font-medium text-slate-300 mt-1">
            Real-time analytics, AI predictions, and autonomous recovery execution for Nova Retail India.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className="h-4 w-4 text-blue-400" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Revenue */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3 glass-card-hover">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Total Processed Revenue</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ₹{summary?.totalRevenue?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="flex items-center text-xs text-emerald-400 font-semibold">
            <ArrowUpRight className="h-4 w-4 mr-0.5" />
            <span>Successful checkout volume</span>
          </div>
        </div>

        {/* Card 2: Revenue At Risk */}
        <div className="glass-card rounded-2xl p-5 border border-rose-500/20 bg-rose-500/5 space-y-3 glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Revenue At Risk</span>
            <div className="rounded-lg bg-rose-500/15 p-2 text-rose-400">
              <AlertOctagon className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">
            ₹{summary?.revenueAtRisk?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-xs text-slate-300 font-medium">
            {summary?.failedPaymentsCount || 0} failed transaction attempts
          </div>
        </div>

        {/* Card 3: Recoverable Revenue */}
        <div className="glass-card rounded-2xl p-5 border border-blue-500/30 bg-blue-500/10 space-y-3 glass-card-hover glow-blue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Estimated Recoverable</span>
            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400">
            ₹{Math.round(summary?.recoverableRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-200 font-medium">
            AI Yield Model Prediction
          </div>
        </div>

        {/* Card 4: Simulated Recovered Revenue & Rate */}
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/10 space-y-3 glass-card-hover glow-emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Simulated Recovered</span>
            <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            ₹{summary?.simulatedRecoveredRevenue?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-xs text-slate-200 font-semibold flex items-center justify-between pt-0.5">
            <span>Recovery Rate:</span>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-emerald-300 font-bold text-xs">
              {summary?.recoveryRate || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="rounded-2xl border border-blue-500/30 bg-slate-900/90 p-5 space-y-3 shadow-lg">
        <div className="flex items-center space-x-2 text-blue-400 font-extrabold text-sm tracking-wide uppercase">
          <Sparkles className="h-4 w-4" />
          <span>AI Revenue Intelligence Insights</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summary?.insights?.map((insight, idx) => (
            <div key={idx} className="flex items-start space-x-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 text-xs text-slate-200 font-medium">
              <Zap className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-bold text-white tracking-wide">Revenue Flow Trend (14 Days)</h3>
            <div className="flex items-center space-x-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-1.5"></span> Successful</span>
              <span className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-rose-500 mr-1.5"></span> Failed</span>
              <span className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 mr-1.5"></span> Recovered</span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#cbd5e1" fontSize={11} fontWeight={600} />
                <YAxis stroke="#cbd5e1" fontSize={11} fontWeight={600} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6', borderRadius: '12px', fontSize: '12px', color: '#ffffff' }}
                  itemStyle={{ color: '#ffffff', fontWeight: 700 }}
                  labelStyle={{ color: '#93c5fd', fontWeight: 700 }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="successful" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSuccess)" name="Successful" />
                <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFailed)" name="Failed" />
                <Area type="monotone" dataKey="recovered" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRecovered)" name="Recovered" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Failure Breakdown Pie */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
          <h3 className="text-base font-bold text-white flex items-center justify-between tracking-wide">
            <span>Failure Reason Distribution</span>
            <PieIcon className="h-4 w-4 text-slate-300" />
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={failureBreakdown}
                  dataKey="count"
                  nameKey="reason"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {failureBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6', borderRadius: '12px', fontSize: '12px', color: '#ffffff' }}
                  itemStyle={{ color: '#ffffff', fontWeight: 700 }}
                  labelStyle={{ color: '#93c5fd', fontWeight: 700 }}
                  formatter={(val: any, name: any) => [`${val} Failures`, String(name || '').replace(/_/g, ' ').toUpperCase()]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
