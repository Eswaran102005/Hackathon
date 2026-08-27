import React, { useEffect, useState } from 'react';
import { Bot, Zap, CheckCircle2, Clock, Sparkles, RefreshCw, Activity, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { EventRecord } from '../types';

export const CommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommandCenter = async () => {
    setLoading(true);
    try {
      const res = await api.getRecoveryActions();
      setEvents(res.events);
    } catch (err) {
      console.error('Failed to load command center activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandCenter();
  }, []);

  return (
    <div className="relative space-y-6">
      {/* Background Ambient Glow Orbs */}
      <div className="pointer-events-none absolute top-10 right-10 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl animate-float"></div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-950/90 via-slate-900/90 to-indigo-950/90 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl glow-blue">
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Recovery Command Center</h1>
          </div>
          <p className="text-sm font-medium text-slate-300">
            Autonomous AI Agent actively monitoring, scoring, and executing recovery pipelines in real time.
          </p>
        </div>

        <button
          onClick={fetchCommandCenter}
          className="inline-flex items-center space-x-2 rounded-xl border border-blue-500/40 bg-blue-600/20 px-4 py-2.5 text-xs font-extrabold text-blue-300 hover:bg-blue-600/30 transition-all duration-200 shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <RefreshCw className={`h-4 w-4 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Stream</span>
        </button>
      </div>

      {/* Stats Quick Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glass-card-hover">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Agent Status</span>
            <Bot className="h-4 w-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
            <span>Autonomous Active</span>
          </div>
          <div className="text-xs font-medium text-slate-300">Monitoring 24/7 gateway webhooks</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glass-card-hover glow-blue">
          <div className="flex items-center justify-between text-xs font-bold text-blue-400 uppercase">
            <span>AI Models Operating</span>
            <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-white">Gemini 1.5 + ML Engine</div>
          <div className="text-xs font-medium text-slate-300">Deterministic scoring & expected yield</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 glass-card-hover glow-purple">
          <div className="flex items-center justify-between text-xs font-bold text-purple-400 uppercase">
            <span>Live Audit Stream</span>
            <Activity className="h-4 w-4 text-purple-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-white">{events.length} Events Logged</div>
          <div className="text-xs font-medium text-slate-300">Real-time ledger entries</div>
        </div>
      </div>

      {/* Real-Time Event Ledger Activity Feed */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-400 animate-pulse" />
            <h2 className="text-lg font-extrabold text-white">Live Event Stream Ticker</h2>
          </div>
          <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-mono font-bold text-blue-400 shimmer-badge">
            STREAMING ACTIVE
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">Loading Real-Time Event Stream...</div>
          </div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium">No event stream logs available yet.</div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const data = JSON.parse(event.eventData || '{}');
              return (
                <div
                  key={event.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 gap-3 hover:border-blue-500/40 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="rounded-xl bg-blue-600/20 p-2.5 text-blue-400 border border-blue-500/30 group-hover:scale-105 transition-transform">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">{event.eventType}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-300 font-mono font-medium">{event.paymentId}</span>
                      </div>
                      <div className="text-xs text-slate-200 font-semibold mt-0.5">
                        {data.reason || data.recommendedAction || data.eventType || 'Autonomous action executed'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-[11px] font-medium text-slate-400 font-mono">
                      {new Date(event.createdAt).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => navigate(`/payments/${event.paymentId}`)}
                      className="inline-flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <span>View</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
