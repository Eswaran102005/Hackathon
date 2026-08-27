import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Bot,
  BarChart3,
  Sliders,
  Webhook,
  Zap
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
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Merchant Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/10'
                    : 'text-slate-300 hover:bg-slate-900/80 hover:text-white hover:border-slate-800 border border-transparent'
                }`
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* AI Agent Active Status Box */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Agent Active</span>
          </div>
          <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[10px] font-mono text-blue-400">
            v1.0 MVP
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          RecoverAI is monitoring failed payment webhooks and executing autonomous recovery actions.
        </p>
      </div>
    </aside>
  );
};
