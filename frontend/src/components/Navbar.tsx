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
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">Recover<span className="text-blue-500">AI</span></span>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
                MVP Demo
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">AI Revenue Recovery Agent for Failed Payments</p>
          </div>
        </div>

        {/* Demo Pitch Controls */}
        <div className="flex items-center space-x-3">
          {/* Main Pitch Flow CTA */}
          <button
            onClick={onSimulatePitch}
            disabled={isSimulating}
            className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <Activity className="h-4 w-4 animate-spin text-white" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Simulate Payment Failure</span>
              </>
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset dataset to default synthetic state"
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Reset Demo Data</span>
          </button>

          {/* Environment Status Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Sandbox Mode</span>
          </div>
        </div>
      </div>
    </header>
  );
};
