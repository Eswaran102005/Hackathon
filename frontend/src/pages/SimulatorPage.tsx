import React, { useEffect, useState } from 'react';
import { Sliders, Sparkles, TrendingUp, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const SimulatorPage: React.FC = () => {
  const [failedCount, setFailedCount] = useState<number>(100);
  const [totalFailedValue, setTotalFailedValue] = useState<number>(500000);
  const [retryDelayHours, setRetryDelayHours] = useState<number>(6);
  const [channel, setChannel] = useState<'WHATSAPP' | 'EMAIL' | 'PAYMENT_LINK'>('WHATSAPP');

  const [simResult, setSimResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.runSimulator({
        failedCount,
        totalFailedValue,
        retryDelayHours,
        channel,
      });
      setSimResult(res);
    } catch (err) {
      console.error('Failed to run simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [failedCount, totalFailedValue, retryDelayHours, channel]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">What-If Revenue Recovery Simulator</h1>
        <p className="text-sm font-medium text-slate-300 mt-1">
          Simulate recovery strategies, tune parameters, and calculate potential revenue uplift for your merchant portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Input Controls */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-xl">
          <div className="flex items-center space-x-2 text-sm font-bold text-white border-b border-slate-800 pb-3 tracking-wide">
            <Sliders className="h-4 w-4 text-blue-400" />
            <span>Simulator Input Parameters</span>
          </div>

          {/* Input 1: Failed Payments Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-200 font-bold">Failed Transactions Volume:</label>
              <span className="font-black text-blue-400 text-sm">{failedCount} payments</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={failedCount}
              onChange={(e) => setFailedCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Input 2: Total Failed Exposure Value */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-200 font-bold">Total Failed Revenue Exposure:</label>
              <span className="font-black text-emerald-400 text-sm">₹{totalFailedValue.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="2000000"
              step="10000"
              value={totalFailedValue}
              onChange={(e) => setTotalFailedValue(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Input 3: Retry Delay Hours */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-200 font-bold">Retry Delay Hours:</label>
              <span className="font-black text-purple-400 text-sm">{retryDelayHours} Hours</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="1"
              value={retryDelayHours}
              onChange={(e) => setRetryDelayHours(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Input 4: Channel Selector */}
          <div className="space-y-2">
            <label className="text-xs text-slate-200 font-bold">Nudge Channel:</label>
            <div className="grid grid-cols-3 gap-2">
              {(['WHATSAPP', 'EMAIL', 'PAYMENT_LINK'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={`rounded-xl py-2.5 text-[11px] font-extrabold transition-all border ${
                    channel === ch
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Simulation Output Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Potential Uplift Card */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Recommended Strategy</div>
              <div className="text-lg font-black text-white">{simResult?.recommendedStrategy || 'RecoverAI Multi-Stage'}</div>
              <p className="text-xs font-medium text-slate-200">
                Optimized timing window ({retryDelayHours}h) combined with {channel} nudge delivers maximum yield.
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-500/20 border border-emerald-500/30 px-6 py-4 text-center">
              <div className="text-xs font-bold text-emerald-300">Potential Revenue Uplift</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                +₹{Math.round(simResult?.potentialUplift || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] font-extrabold text-emerald-300 mt-0.5">+{simResult?.upliftPercentage || 0}% over baseline</div>
            </div>
          </div>

          {/* Strategy Comparison Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-white tracking-wide">Strategy Yield Comparison</h3>

            {simResult?.strategies?.map((st: any, idx: number) => (
              <div
                key={idx}
                className={`rounded-2xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-md ${
                  idx === 2
                    ? 'border-blue-500/40 bg-blue-500/10 glow-blue'
                    : 'border-slate-800 bg-slate-900/80'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-white">{st.name}</span>
                    {idx === 2 && (
                      <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-black text-blue-300 border border-blue-500/40">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-medium text-slate-300">
                    <span>Delay: <strong className="text-white font-bold">{st.delay}</strong></span>
                    <span>Channel: <strong className="text-white font-bold">{st.channel}</strong></span>
                    <span>Yield Rate: <strong className="text-emerald-400 font-black">{st.recoveryRate}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end space-x-6">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-400">Expected Recovery Yield</div>
                    <div className="text-xl font-black text-white">
                      ₹{st.expectedRecovery?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
