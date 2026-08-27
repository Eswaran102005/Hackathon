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
  DollarSign,
  Bot
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
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/40 glow-blue animate-pulse">
          <RefreshCw className="h-7 w-7 animate-spin text-blue-400" />
        </div>
        <span className="text-sm font-semibold text-slate-300 tracking-wide animate-pulse">Loading Revenue Intelligence Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {/* Background Ambient Glowing Orbs */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl animate-float"></div>
      <div className="pointer-events-none absolute top-1/3 -right-10 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Top Welcome Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">Live Agent Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Revenue Recovery Intelligence
          </h1>
          <p className="text-sm font-medium text-slate-300 mt-1">
            Real-time analytics, AI predictions, and autonomous recovery execution for Nova Retail India.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all duration-200 shadow-md hover:shadow-blue-500/20 active:scale-95"
        >
          <RefreshCw className="h-4 w-4 text-blue-400" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Revenue */}
        <div className="relative overflow-hidden glass-card rounded-2xl p-5 border border-slate-800 space-y-3 glass-card-hover group">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Total Processed Revenue</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ₹{summary?.totalRevenue?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="flex items-center text-xs text-emerald-400 font-semibold">
            <ArrowUpRight className="h-4 w-4 mr-0.5" />
            <span>Successful checkout volume</span>
          </div>
        </div>

        {/* Card 2: Revenue At Risk */}
        <div className="relative overflow-hidden glass-card rounded-2xl p-5 border border-rose-500/30 bg-rose-500/5 space-y-3 glass-card-hover group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Revenue At Risk</span>
            <div className="rounded-xl bg-rose-500/15 p-2 text-rose-400 group-hover:scale-110 transition-transform">
              <AlertOctagon className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
            ₹{summary?.revenueAtRisk?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>{summary?.failedPaymentsCount || 0} failed transaction attempts</span>
          </div>
        </div>

        {/* Card 3: Recoverable Revenue */}
        <div className="relative overflow-hidden glass-card rounded-2xl p-5 border border-blue-500/40 bg-blue-500/10 space-y-3 glass-card-hover glow-blue group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Estimated Recoverable</span>
            <div className="rounded-xl bg-blue-500/20 p-2 text-blue-400 group-hover:scale-110 transition-transform">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 tracking-tight">
            ₹{Math.round(summary?.recoverableRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-200 font-medium flex items-center justify-between">
            <span>AI Yield Model Prediction</span>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300">87% CONF</span>
          </div>
        </div>

        {/* Card 4: Simulated Recovered Revenue & Rate */}
        <div className="relative overflow-hidden glass-card rounded-2xl p-5 border border-emerald-500/40 bg-emerald-500/10 space-y-3 glass-card-hover glow-emerald group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Simulated Recovered</span>
            <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            ₹{summary?.simulatedRecoveredRevenue?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-xs text-slate-200 font-semibold flex items-center justify-between pt-0.5">
            <span>Recovery Rate:</span>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-emerald-300 font-bold text-xs shimmer-badge">
              {summary?.recoveryRate || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* AI Intelligence Insights Highlight Card */}
      {summary?.insights && summary.insights.length > 0 && (
        <div className="relative overflow-hidden glass-card rounded-2xl p-5 border border-indigo-500/30 bg-gradient-to-r from-slate-900/90 via-indigo-950/20 to-slate-900/90 space-y-3 shadow-lg glow-purple">
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-300">
              RecoverAI Key Autonomous Insights
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {summary.insights.map((insight, idx) => (
              <div key={idx} className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs font-semibold text-slate-200 leading-relaxed flex items-start space-x-2 hover:border-indigo-500/40 transition-colors">
                <Sparkles className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-4 glass-card-hover">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                14-Day Revenue & Recovery Trend
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">Comparison of successful, failed, and recovered amounts (₹)</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#3b82f6',
                    borderRadius: '12px',
                    color: '#ffffff',
                  }}
                  itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  labelStyle={{ color: '#93c5fd', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="successful" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSuccess)" name="Successful" />
                <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFailed)" name="Failed" />
                <Area type="monotone" dataKey="recovered" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRecovered)" name="Recovered" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Failure Breakdown Pie Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 glass-card-hover flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-indigo-400" />
              Failure Vector Distribution
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">Categorization by payment failure reasons</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={failureBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {failureBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#3b82f6',
                    borderRadius: '12px',
                    color: '#ffffff',
                  }}
                  itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2">
            {failureBreakdown.slice(0, 4).map((item, index) => (
              <div key={item.reason} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="text-slate-300 uppercase tracking-wide">{item.reason.replace('_', ' ')}</span>
                </div>
                <span className="text-white font-bold">{item.count} attempts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
