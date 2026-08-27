import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Clock,
  Send,
  Copy,
  RefreshCw,
  User,
  ShieldAlert,
  Calendar,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { Payment } from '../types';

export const PaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [commChannel, setCommChannel] = useState<'EMAIL' | 'WHATSAPP' | 'SMS'>('WHATSAPP');
  const [commMessage, setCommMessage] = useState<string>('');
  const [commSubject, setCommSubject] = useState<string>('');
  const [commGeneratedBy, setCommGeneratedBy] = useState<string>('');
  const [generatingComm, setGeneratingComm] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchPayment = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getPaymentById(id);
      setPayment(data);
      if (data.aiMessages?.[0]) {
        setCommMessage(data.aiMessages[0].message);
        setCommGeneratedBy(data.aiMessages[0].generatedBy);
      }
    } catch (err) {
      console.error('Failed to load payment detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const handleGenerateMessage = async () => {
    if (!payment) return;
    setGeneratingComm(true);
    try {
      const res = await api.generateMessage(payment.id, commChannel);
      setCommMessage(res.messageResult.message);
      if (res.messageResult.subject) setCommSubject(res.messageResult.subject);
      setCommGeneratedBy(res.messageResult.generatedBy);
    } catch (err) {
      console.error('Failed to generate message:', err);
    } finally {
      setGeneratingComm(false);
    }
  };

  const handleApproveRecovery = async () => {
    if (!payment) return;
    setActionLoading(true);
    try {
      await api.retryPayment(payment.id);
      await fetchPayment();
    } catch (err) {
      console.error('Failed to execute recovery:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(commMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !payment) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3">
        <RefreshCw className="h-9 w-9 animate-spin text-blue-500" />
        <span className="text-sm font-bold text-slate-200">Loading Transaction Decision Profile...</span>
      </div>
    );
  }

  const prediction = payment.predictions?.[0];
  const probPercent = Math.round((prediction?.recoveryProbability || 0.85) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Back Navigation */}
      <button
        onClick={() => navigate('/payments')}
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Failed Payments Directory</span>
      </button>

      {/* Main Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              ₹{payment.amount.toLocaleString('en-IN')}
            </h1>
            <span
              className={`rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider border ${
                payment.status === 'RECOVERED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              {payment.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 font-medium">
            <span>Payment ID: <strong className="font-mono text-white font-bold">{payment.externalPaymentId}</strong></span>
            <span>Method: <strong className="uppercase text-white font-bold">{payment.paymentMethod}</strong></span>
            <span>Failure: <strong className="text-rose-400 font-bold">{payment.failureReason?.replace(/_/g, ' ')}</strong></span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {payment.status !== 'RECOVERED' && (
            <button
              onClick={handleApproveRecovery}
              disabled={actionLoading}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{actionLoading ? 'Executing...' : 'Approve Recovery Action'}</span>
            </button>
          )}

          <button
            onClick={() => handleGenerateMessage()}
            className="flex items-center space-x-2 rounded-xl border border-blue-500/40 bg-blue-500/15 px-4 py-2.5 text-xs font-extrabold text-blue-300 hover:bg-blue-500/25 transition-all shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span>Generate Comm Message</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Prediction & Explanation */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Metrics Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2 text-sm font-bold text-white tracking-wide">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>RecoverAI Decision & Strategy Metrics</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">Model: {prediction?.modelVersion || '1.0.0-hybrid'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center">
                <div className="text-xs font-bold uppercase text-slate-400">Recovery Probability</div>
                <div className="mt-2 text-3xl font-black text-emerald-400">{probPercent}%</div>
                <div className="mt-1 text-[11px] font-bold text-slate-400">Confidence: {Math.round((prediction?.confidence || 0.91) * 100)}%</div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center">
                <div className="text-xs font-bold uppercase text-slate-400">Recommended Action</div>
                <div className="mt-2 text-base font-black text-blue-400 flex items-center justify-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{prediction?.recommendedAction || 'RETRY_LATER'}</span>
                </div>
                <div className="mt-1 text-[11px] font-bold text-slate-400">
                  Delay: {prediction?.recommendedDelayMinutes || 360} mins
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center">
                <div className="text-xs font-bold uppercase text-slate-400">Expected Recovery Yield</div>
                <div className="mt-2 text-2xl font-black text-white">
                  ₹{Math.round(prediction?.expectedRecovery || payment.amount * 0.85).toLocaleString('en-IN')}
                </div>
                <div className="mt-1 text-[11px] font-bold text-slate-400">P × Amount</div>
              </div>
            </div>

            {/* AI Explanation Box */}
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-blue-400 uppercase tracking-wide">
                <span className="flex items-center space-x-1.5">
                  <Zap className="h-4 w-4" />
                  <span>AI Natural Language Rationale</span>
                </span>
                <span className="text-[11px] bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-500/30 text-blue-300">
                  Generated by: Gemini LLM
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {prediction?.reason || "Recovery probability is rated high at 87% because this payment failed due to temporary insufficient funds. A delayed retry after 6 hours is selected to match standard bank clearing cycles."}
              </p>
            </div>
          </div>

          {/* Personalized Message Generator Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-bold text-white tracking-wide">
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span>Personalized Communication Generator</span>
              </div>
              {commGeneratedBy && (
                <span className="text-xs font-bold text-emerald-400">Source: {commGeneratedBy} Engine</span>
              )}
            </div>

            {/* Channel Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              {(['WHATSAPP', 'EMAIL', 'SMS'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => {
                    setCommChannel(ch);
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-extrabold transition-all border ${
                    commChannel === ch
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Message Display Textarea */}
            <div className="space-y-3">
              {commChannel === 'EMAIL' && (
                <div>
                  <label className="text-xs font-bold text-slate-300">Email Subject Line:</label>
                  <input
                    type="text"
                    value={commSubject || `Action Required: Complete your payment of ₹${payment.amount}`}
                    readOnly
                    className="w-full mt-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white font-medium"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300">Generated Message Content:</label>
                <textarea
                  rows={4}
                  value={commMessage || 'Click "Generate Message" to invoke Gemini personalized comm engine...'}
                  onChange={(e) => setCommMessage(e.target.value)}
                  className="w-full mt-1.5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-medium text-slate-200 focus:border-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleGenerateMessage}
                  disabled={generatingComm}
                  className="flex items-center space-x-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-blue-500 transition-all disabled:opacity-50 shadow-md shadow-blue-600/30"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{generatingComm ? 'Generating...' : 'Regenerate Message'}</span>
                </button>

                <button
                  onClick={handleCopyMessage}
                  disabled={!commMessage}
                  className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-extrabold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer History & Activity Timeline */}
        <div className="space-y-6">
          {/* Customer History Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-sm font-bold text-white border-b border-slate-800 pb-3 tracking-wide">
              <User className="h-4 w-4 text-blue-400" />
              <span>Customer Financial Profile</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="text-slate-400 font-bold">Customer Name</div>
                <div className="text-sm font-extrabold text-white mt-0.5">{payment.customer?.name || 'Valued Merchant Customer'}</div>
              </div>

              <div>
                <div className="text-slate-400 font-bold">Email / Phone</div>
                <div className="text-slate-200 font-semibold mt-0.5">{payment.customer?.email}</div>
                <div className="text-slate-400 font-medium">{payment.customer?.phone}</div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-300 font-bold">Customer Lifetime Value (LTV):</span>
                <span className="font-black text-emerald-400 text-sm">
                  ₹{payment.customer?.lifetimeValue?.toLocaleString('en-IN') || '15,000'}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Event Stream */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-sm font-bold text-white border-b border-slate-800 pb-3 tracking-wide">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span>Payment Recovery Event History</span>
            </div>

            <div className="space-y-3">
              {payment.events?.map((ev) => (
                <div key={ev.id} className="relative pl-4 border-l-2 border-slate-700 text-xs space-y-1">
                  <div className="font-bold text-slate-200">{ev.eventType}</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {new Date(ev.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
