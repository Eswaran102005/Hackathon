import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Payment } from '../types';

export const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [reasonFilter, setReasonFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getPayments({
        page,
        limit: 12,
        status: statusFilter,
        paymentMethod: methodFilter,
        failureReason: reasonFilter,
        search,
      });
      setPayments(res.payments);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [statusFilter, methodFilter, reasonFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Failed Payments Directory</h1>
          <p className="text-sm font-medium text-slate-300 mt-1">
            Monitor, inspect, and execute AI recovery strategies for failed merchant transactions.
          </p>
        </div>

        <button
          onClick={() => fetchPayments(pagination.page)}
          className="inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Table</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Payment ID, Customer Name, or Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none font-medium"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">Status: All</option>
            <option value="FAILED">Status: FAILED</option>
            <option value="RECOVERING">Status: RECOVERING</option>
            <option value="RECOVERED">Status: RECOVERED</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">Method: All</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="netbanking">Netbanking</option>
            <option value="wallet">Wallet</option>
          </select>

          {/* Failure Reason Filter */}
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">Reason: All</option>
            <option value="insufficient_funds">Insufficient Funds</option>
            <option value="network_timeout">Network Timeout</option>
            <option value="bank_declined">Bank Declined</option>
            <option value="authentication_failed">Auth Failed</option>
            <option value="card_expired">Card Expired</option>
          </select>

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-extrabold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-600/30"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950 text-slate-300 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Payment ID</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Method</th>
                <th className="px-5 py-4">Failure Reason</th>
                <th className="px-5 py-4">Recovery Prob.</th>
                <th className="px-5 py-4">Expected Yield</th>
                <th className="px-5 py-4">AI Recommended Action</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    <span>Loading payment dataset...</span>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                    No payment records match the current filters.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const prediction = p.predictions?.[0];
                  const probPercent = Math.round((prediction?.recoveryProbability || 0.5) * 100);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/payments/${p.id}`)}
                      className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4 font-bold text-white">
                        <div>{p.customer?.name || 'Anonymous Customer'}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{p.customer?.email}</div>
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold text-slate-300">{p.externalPaymentId}</td>
                      <td className="px-5 py-4 font-black text-white text-sm">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 uppercase font-bold text-slate-300">{p.paymentMethod}</td>
                      <td className="px-5 py-4 text-slate-300 capitalize font-medium">{p.failureReason?.replace(/_/g, ' ')}</td>
                      <td className="px-5 py-4">
                        <span className={`font-extrabold text-xs px-2 py-0.5 rounded-md ${probPercent > 75 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : probPercent > 45 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
                          {probPercent}%
                        </span>
                      </td>
                      <td className="px-5 py-4 font-extrabold text-blue-400">
                        ₹{Math.round(prediction?.expectedRecovery || p.amount * 0.5).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center space-x-1 rounded-lg bg-blue-500/15 px-2.5 py-1 text-[11px] font-bold text-blue-300 border border-blue-500/30">
                          <Sparkles className="h-3 w-3 mr-1 text-blue-400" />
                          {prediction?.recommendedAction || 'RETRY_LATER'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${
                            p.status === 'RECOVERED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : p.status === 'FAILED'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/payments/${p.id}`);
                          }}
                          className="rounded-lg p-2 text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-5 py-3.5 text-xs text-slate-300 font-medium">
          <div>
            Showing <span className="font-bold text-white">{payments.length}</span> of{' '}
            <span className="font-bold text-white">{pagination.total}</span> payments
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchPayments(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-bold hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-white">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchPayments(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-bold hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
