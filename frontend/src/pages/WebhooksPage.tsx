import React, { useState } from 'react';
import { Webhook, Send, CheckCircle, RefreshCw, Code, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export const WebhooksPage: React.FC = () => {
  const [amount, setAmount] = useState<number>(4999);
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [failureReason, setFailureReason] = useState<string>('insufficient_funds');
  const [customerName, setCustomerName] = useState<string>('Rahul Verma');
  const [customerEmail, setCustomerEmail] = useState<string>('rahul.verma@example.com');

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const payload = {
    externalPaymentId: `pay_webhook_${Date.now()}`,
    amount,
    paymentMethod,
    failureReason,
    customerName,
    customerEmail,
  };

  const handleSendWebhook = async () => {
    setLoading(true);
    try {
      const res = await api.triggerWebhook(payload);
      setResponse(res);
    } catch (err: any) {
      setResponse({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Webhook Event Sandbox</h1>
        <p className="text-sm font-medium text-slate-300 mt-1">
          Simulate incoming Razorpay/gateway <code className="text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">PAYMENT_FAILED</code> webhooks to trigger real-time AI predictions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-sm font-bold text-white border-b border-slate-800 pb-3 tracking-wide">
            <Webhook className="h-4 w-4 text-blue-400" />
            <span>Webhook Payload Generator</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-200 font-bold">Customer Name:</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full mt-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-200 font-bold">Customer Email:</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full mt-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-200 font-bold">Amount (₹):</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full mt-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-200 font-bold">Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full mt-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white font-bold focus:border-blue-500 focus:outline-none"
                >
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Netbanking</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-200 font-bold">Failure Reason:</label>
              <select
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="w-full mt-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white font-bold focus:border-blue-500 focus:outline-none"
              >
                <option value="insufficient_funds">Insufficient Funds</option>
                <option value="network_timeout">Network Timeout</option>
                <option value="bank_declined">Bank Declined</option>
                <option value="authentication_failed">Authentication Failed</option>
                <option value="card_expired">Card Expired</option>
              </select>
            </div>

            <div className="pt-3">
              <button
                onClick={handleSendWebhook}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Dispatching Webhook...' : 'Dispatch PAYMENT_FAILED Webhook'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Code Response Display */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-sm font-bold text-white tracking-wide">
              <Code className="h-4 w-4 text-emerald-400" />
              <span>API Request & Response Payload</span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">POST /api/webhooks/payment</span>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-300 mb-1">Outgoing Request Body:</div>
            <pre className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-[11px] font-mono text-slate-200 overflow-x-auto">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-300 mb-1">Server Response:</div>
            <pre className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-[11px] font-mono text-emerald-400 overflow-x-auto h-44">
              {response ? JSON.stringify(response, null, 2) : '// Response payload will appear here after dispatching...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
