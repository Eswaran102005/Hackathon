import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ArrowRight, Sparkles, AlertCircle, Clock, Zap, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface PitchModalProps {
  data: any;
  onClose: () => void;
  onRefresh: () => void;
}

export const PitchModal: React.FC<PitchModalProps> = ({ data, onClose, onRefresh }) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [step, setStep] = useState<'ANALYZED' | 'SCHEDULED' | 'RECOVERED'>('ANALYZED');
  const [loading, setLoading] = useState(false);

  const payment = data?.payment;
  const customer = data?.customer;

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const handleApprove = async () => {
    setLoading(true);
    try {
      if (payment?.id) {
        await api.scheduleAction(payment.id, 'RETRY_LATER', 360);
        setStep('SCHEDULED');
      }
    } catch (err) {
      console.error('Failed to schedule recovery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSuccess = async () => {
    setLoading(true);
    try {
      if (payment?.id) {
        await api.simulateSuccessPitch(payment.id);
        setStep('RECOVERED');
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to execute simulated recovery:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl space-y-0">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">Live Pitch Flow — RecoverAI Agent Action</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {analyzing ? (
            <div className="py-16 text-center space-y-4">
              <RefreshCw className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
              <div className="text-lg font-extrabold text-white tracking-wide">Analyzing payment failure vector...</div>
              <p className="text-xs font-semibold text-slate-300">Extracting customer history, failure signals, and optimal retry timing...</p>
            </div>
          ) : step === 'ANALYZED' ? (
            <>
              {/* Failed Payment Summary Header */}
              <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-4 shadow-sm">
                <div className="flex items-center space-x-3.5">
                  <div className="rounded-xl bg-red-500/20 p-2.5 text-red-400 border border-red-500/30">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs text-red-400 font-extrabold uppercase tracking-wider">Payment Failure Detected</div>
                    <div className="text-lg font-black text-white">₹5,000 — UPI Transaction</div>
                    <div className="text-xs text-slate-300 font-medium">Customer: {customer?.name || 'Arun Kumar'} (Temporary bank/network issue)</div>
                  </div>
                </div>
                <span className="rounded-full bg-red-500/20 px-3.5 py-1 text-xs font-black text-red-400 border border-red-500/40 uppercase tracking-wider">
                  FAILED
                </span>
              </div>

              {/* AI Prediction & Strategy Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
                  <div className="text-xs font-bold uppercase text-slate-400">Recovery Probability</div>
                  <div className="mt-2 text-3xl font-black text-emerald-400">87%</div>
                  <div className="mt-1 text-[11px] font-semibold text-slate-400">Confidence: 91%</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
                  <div className="text-xs font-bold uppercase text-slate-400">Recommended Action</div>
                  <div className="mt-2 text-base font-black text-blue-400 flex items-center justify-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Retry After 6 Hours</span>
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-slate-400">Optimal Liquidity Window</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
                  <div className="text-xs font-bold uppercase text-slate-400">Expected Recovery</div>
                  <div className="mt-2 text-2xl font-black text-white">₹4,350</div>
                  <div className="mt-1 text-[11px] font-semibold text-slate-400">Yield formula: P × Amount</div>
                </div>
              </div>

              {/* Strategy Comparison Matrix */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Strategy Comparison Matrix</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                  <div className="rounded-lg bg-slate-900 p-2 text-slate-300">Retry Now: <span className="text-white font-bold">₹3,200</span></div>
                  <div className="rounded-lg bg-blue-600/25 border border-blue-500/40 p-2 text-blue-300 font-extrabold">Retry 6h: ₹4,350</div>
                  <div className="rounded-lg bg-slate-900 p-2 text-slate-300">WhatsApp: <span className="text-white font-bold">₹3,700</span></div>
                  <div className="rounded-lg bg-slate-900 p-2 text-slate-300">Email: <span className="text-white font-bold">₹2,800</span></div>
                </div>
              </div>

              {/* AI Explanation Box */}
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-blue-400 tracking-wide uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Gemini AI Rationale Explanation</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium italic">
                  “This customer has a strong payment history with 8 successful transactions and only one previous failure. A delayed retry is more likely to succeed than an immediate retry.”
                </p>
              </div>

              {/* CTA Action */}
              <div className="pt-2">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span>Scheduling Recovery...</span>
                  ) : (
                    <>
                      <span>Approve Recovery</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : step === 'SCHEDULED' ? (
            <>
              {/* Scheduled Confirmation State */}
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40">
                  <Clock className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Recovery Scheduled</h3>
                  <p className="text-xs text-slate-200 mt-1 font-medium">
                    Auto-retry queued for execution in <span className="text-blue-400 font-bold">6 hours</span>.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <div className="text-[11px] font-bold text-slate-400">Scheduled Retry</div>
                    <div className="text-base font-extrabold text-white mt-0.5">6 Hours</div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <div className="text-[11px] font-bold text-slate-400">Expected Recovery</div>
                    <div className="text-base font-black text-emerald-400 mt-0.5">₹4,350</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <button
                    onClick={handleSimulateSuccess}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Executing Recovery Simulation...</span>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        <span>Simulate Successful Recovery</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
              <div>
                <span className="rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-black text-emerald-400 border border-emerald-500/40 uppercase tracking-wider">
                  PAYMENT RECOVERED
                </span>
                <h3 className="text-3xl font-black text-white mt-2">₹5,000</h3>
                <p className="text-xs text-slate-200 mt-1 font-medium">
                  Revenue Recovery: <strong className="text-emerald-400 font-extrabold">Successful</strong>
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 max-w-md mx-auto text-xs text-emerald-300 font-bold">
                Dashboard Metrics Updated: <span className="font-black text-white">+₹5,000</span> added to Simulated Recovered Revenue!
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-extrabold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-600/30"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
