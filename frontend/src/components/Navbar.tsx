import React from 'react';
import { Play, RotateCcw, ShieldCheck, Sparkles, Activity } from 'lucide-react';

interface NavbarProps {
  onSimulatePitch: () => void;
  onResetDemo: () => void;
  isSimulating: boolean;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSimulatePitch,
  onResetDemo,
  isSimulating,
  isResetting,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with Pulsing Ambient Glow */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 shadow-lg shadow-blue-500/30 animate-glow-pulse">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">
                Recover<span className="gradient-text font-extrabold">AI</span>
              </span>
              <span className="relative flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/30 shimmer-badge">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                MVP Demo
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Autonomous AI Revenue Recovery Agent for Failed Payments</p>
          </div>
        </div>

        {/* Demo Pitch Controls */}
        <div className="flex items-center space-x-3">
          {/* Main Pitch Flow CTA with Shimmer Animation */}
          <button
            onClick={onSimulatePitch}
            disabled={isSimulating}
            className="group relative flex items-center space-x-2 rounded-xl shimmer-btn px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/40 hover:shadow-blue-500/60 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <Activity className="h-4 w-4 animate-spin text-white" />
                <span>Simulating AI Agent...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current group-hover:scale-110 transition-transform duration-200" />
                <span>Simulate Payment Failure</span>
              </>
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset dataset to default synthetic state"
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all duration-200 disabled:opacity-50"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Reset Demo Data</span>
          </button>

          {/* Environment Status Badge with Live Pulse */}
          <div className="hidden lg:flex items-center space-x-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Sandbox Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
