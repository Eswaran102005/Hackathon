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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Recovery Command Center</h1>
          </div>
          <p className="text-sm font-medium text-slate-300">
            Autonomous AI Agent actively monitoring, scoring, and executing recovery pipelines.
          </p>
        </div>

        <button
          onClick={fetchCommandCenter}
          className="inline-flex items-center space-x-2 rounded-xl border border-blue-500/30 bg-blue-600/20 px-4 py-2.5 text-xs font-extrabold text-blue-300 hover:bg-blue-600/30 transition-all shadow-md"
        >
          <RefreshCw className={`h-4 w-4 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Stream</span>
        </button>
      </div>

      {/* Autonomous Agent Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800 text-center glass-card-hover">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Payments Analyzed</div>
          <div className="mt-2 text-2xl font-black text-white">520</div>
          <div className="mt-1 text-[11px] font-bold text-blue-400">100% Ingested</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 text-center glass-card-hover">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">High-Yield Ops</div>
          <div className="mt-2 text-2xl font-black text-emerald-400">173</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-300">Prob &gt; 65%</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 text-center glass-card-hover">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Actions Scheduled</div>
          <div className="mt-2 text-2xl font-black text-blue-400">92</div>
          <div className="mt-1 text-[11px] font-semibold text-slate-300">Auto-Nudge Queued</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 text-center glass-card-hover">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Messages Generated</div>
          <div className="mt-2 text-2xl font-black text-purple-400">47</div>
          <div className="mt-1 text-[11px] font-semibold text-purple-300">Gemini LLM</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 text-center col-span-2 md:col-span-1 glass-card-hover">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Recoverable Value</div>
          <div className="mt-2 text-2xl font-black text-amber-400">₹1.84L</div>
          <div className="mt-1 text-[11px] font-semibold text-amber-300">Estimated Impact</div>
        </div>
      </div>

      {/* Live Activity Timeline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-white tracking-wide">
            <Activity className="h-4 w-4 text-blue-400" />
            <span>Autonomous Agent Live Action Log</span>
          </div>
          <span className="text-xs font-medium text-slate-400">Real-time database events stream</span>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 font-medium">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
              <span>Fetching event stream...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">No activity logged yet.</div>
          ) : (
            events.map((ev) => {
              let parsedData: any = {};
              try {
                parsedData = JSON.parse(ev.eventData);
              } catch (e) {}

              return (
                <div
                  key={ev.id}
                  onClick={() => navigate(`/payments/${ev.paymentId}`)}
                  className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 hover:border-slate-700 hover:bg-slate-900/60 cursor-pointer transition-all gap-3"
                >
                  <div className="flex items-start space-x-3">
                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 mt-0.5">
                      {ev.eventType === 'PAYMENT_RECOVERED' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : ev.eventType === 'PREDICTION_GENERATED' ? (
                        <Sparkles className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Zap className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-white">{ev.eventType}</span>
                        <span className="text-[11px] text-slate-400 font-mono">ID: {ev.paymentId.substring(0, 8)}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 mt-0.5">
                        {ev.eventType === 'PAYMENT_FAILED' && `Failed payment attempt of ₹${parsedData.amount?.toLocaleString('en-IN') || 5000} (${parsedData.failureReason})`}
                        {ev.eventType === 'PREDICTION_GENERATED' && `AI calculated ${(parsedData.probability * 100).toFixed(0)}% recovery probability. Recommended: ${parsedData.recommendedAction}`}
                        {ev.eventType === 'PAYMENT_RECOVERED' && `Successfully recovered ₹${parsedData.amountRecovered?.toLocaleString('en-IN') || 5000}!`}
                        {ev.eventType === 'ACTION_SCHEDULED' && `Scheduled automated ${parsedData.actionType} recovery action.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end space-x-4">
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {new Date(ev.createdAt).toLocaleTimeString('en-IN')}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
