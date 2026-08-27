import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Bot,
  BarChart3,
  Sliders,
  Webhook,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/payments', label: 'Failed Payments', icon: AlertTriangle },
    { to: '/command-center', label: 'AI Command Center', icon: Bot },
    { to: '/analytics', label: 'Recovery Analytics', icon: BarChart3 },
    { to: '/simulator', label: 'What-If Simulator', icon: Sliders },
    { to: '/webhooks', label: 'Webhook Sandbox', icon: Webhook },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800/80 bg-slate-950/95 p-4 hidden md:flex md:flex-col justify-between">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
          <span>Merchant Navigation</span>
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `group relative flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-lg shadow-blue-500/15'
                    : 'text-slate-300 hover:bg-slate-900/90 hover:text-white hover:border-slate-800 border border-transparent hover:translate-x-1'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full shadow-sm shadow-blue-500"></span>
                  )}
                  <Icon className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-blue-400 animate-pulse' : 'text-slate-400 group-hover:text-blue-400'}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* AI Agent Active Status Box with Live Pulsing Ambient Glow */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-4 space-y-3 backdrop-blur-md glow-emerald hover:border-emerald-500/30 transition-all duration-300">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl animate-pulse"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Agent Active</span>
          </div>
          <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-400 shimmer-badge">
            v1.0 MVP
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          RecoverAI is monitoring failed payment webhooks and executing autonomous recovery actions in real time.
        </p>
      </div>
    </aside>
  );
};
