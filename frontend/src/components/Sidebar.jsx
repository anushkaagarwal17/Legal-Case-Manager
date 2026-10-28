import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Moon,
  CreditCard,
  User,
  ArrowLeftRight,
  ShieldCheck,
  UserCheck,
  Gavel,
  Landmark,
  Bell,
  Volume2
} from 'lucide-react';

export default function Sidebar({ 
  darkMode, 
  setDarkMode, 
  currentUser, 
  onSwitchRole, 
  onOpenAlarm, 
  todayHearingsCount = 0 
}) {
  const location = useLocation();
  const isLawyer = currentUser?.role === 'lawyer';

  const lawyerLinks = [
    { 
      name: 'Chamber Command', 
      path: '/', 
      icon: LayoutDashboard,
      isActive: location.pathname === '/'
    },
    { 
      name: 'Master Docket Registry', 
      path: '/cases', 
      icon: Briefcase,
      isActive: location.pathname === '/cases' || location.pathname.startsWith('/case/') || location.pathname === '/add-case'
    },
    { 
      name: 'Bench Cause List', 
      path: '/hearings', 
      icon: Calendar,
      isActive: location.pathname === '/hearings' || location.pathname === '/cause-list'
    },
    { 
      name: 'Chamber Fee Ledger', 
      path: '/payments', 
      icon: CreditCard,
      isActive: location.pathname === '/payments'
    },
  ];

  const clientLinks = [
    { 
      name: 'My Case Portal', 
      path: '/', 
      icon: LayoutDashboard,
      isActive: location.pathname === '/'
    },
    { 
      name: 'My Legal Matters', 
      path: '/cases', 
      icon: Briefcase,
      isActive: location.pathname === '/cases' || location.pathname.startsWith('/case/') || location.pathname === '/add-case'
    },
    { 
      name: 'Upcoming Court Dates', 
      path: '/hearings', 
      icon: Calendar,
      isActive: location.pathname === '/hearings' || location.pathname === '/cause-list'
    },
    { 
      name: 'Fee Receipts & Balances', 
      path: '/payments', 
      icon: CreditCard,
      isActive: location.pathname === '/payments'
    },
  ];

  const links = isLawyer ? lawyerLinks : clientLinks;

  return (
    <aside className="w-64 h-screen flex flex-col bg-[#101216] border-r border-slate-800/80 select-none flex-shrink-0 z-20">
      {/* Top Brand Logo */}
      <div className="px-6 pt-7 pb-4">
        <h1 className="text-[13px] font-extrabold tracking-widest text-white uppercase font-sans">
          LEGAL CASE TRACKER
        </h1>
        <div className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase mt-0.5">
          {isLawyer ? 'Advocate Practice Management' : 'Litigant Client Briefing Room'}
        </div>
      </div>

      {/* Role Switcher Pill Bar */}
      <div className="mx-4 mb-5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isLawyer ? 'bg-teal-950 text-teal-300 border border-teal-500/40' : 'bg-blue-950 text-blue-300 border border-blue-500/40'
          }`}>
            {isLawyer ? '⚖️ Lawyer (Admin)' : '👤 Client (User)'}
          </span>
          <button
            onClick={onSwitchRole}
            title="Toggle between Lawyer Admin and Client User"
            className="text-[10px] text-teal-400 hover:text-teal-200 flex items-center gap-1 font-semibold cursor-pointer underline"
          >
            <ArrowLeftRight size={10} /> Switch
          </button>
        </div>
        <div className="text-xs font-bold text-white truncate">
          {currentUser?.name}
        </div>
        <div className="text-[10px] text-slate-400 truncate mt-0.5">
          {isLawyer ? 'Chamber Managing Counsel' : 'Litigant Client'}
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const active = link.isActive;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                active 
                  ? 'bg-gradient-to-r from-[#0d2a29] to-[#0a2323] border border-teal-500/40 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.18)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <Icon size={17} className={active ? 'text-teal-400' : 'text-slate-400'} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Hearing Reminders & Audio Alarm Quick Button */}
      <div className="px-4 pb-3">
        <button
          type="button"
          onClick={onOpenAlarm}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#12151d] hover:from-slate-800 hover:to-[#171b26] border border-slate-800/90 hover:border-teal-500/40 text-left transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
              todayHearingsCount > 0 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
            }`}>
              <Bell size={13} className={todayHearingsCount > 0 ? "animate-bounce" : "group-hover:scale-110 transition-transform"} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-200 group-hover:text-white truncate">
                Hearing Alarms
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {todayHearingsCount > 0 ? `${todayHearingsCount} Today • Ring Active` : 'Chimes & Reminders'}
              </div>
            </div>
          </div>

          {todayHearingsCount > 0 ? (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500 text-white animate-pulse">
              TODAY
            </span>
          ) : (
            <Volume2 size={13} className="text-slate-500 group-hover:text-teal-400 flex-shrink-0" />
          )}
        </button>
      </div>

      {/* Bottom Switch Panel */}
      <div className="pt-4 pb-6 px-6 border-t border-slate-800/70">
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-3 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer group"
        >
          <div 
            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
              darkMode ? 'bg-teal-500 justify-end' : 'bg-slate-600 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
          </div>
          <Moon size={14} className={darkMode ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'} />
          <span className="font-sans">Dark Mode</span>
        </button>
      </div>
    </aside>
  );
}
