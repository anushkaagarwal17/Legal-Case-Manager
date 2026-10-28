import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { User, X, ShieldCheck, Mail, Building, ArrowLeftRight, Key, Phone, Bell, Volume2 } from 'lucide-react';

// Import Layout Components
import Sidebar from './components/Sidebar';
import HearingAlarmCenter from './components/HearingAlarmCenter';

// Import Page Views
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import AddCase from './pages/AddCase';
import CaseDetail from './pages/CaseDetail';
import CauseList from './pages/CauseList';
import Upcoming from './pages/Upcoming';
import Payments from './pages/Payments';

// Import API & Audio Alarm Helpers
import { getUpcoming } from './api';
import { playHearingChime, triggerDesktopAlert } from './utils/audioAlarm';

const DEFAULT_LAWYER = {
  id: 1,
  name: 'Adv. Praveen Kumar Gupta',
  email: 'praveen.gupta@court.in',
  role: 'lawyer',
  phone: '+91 98765 43210',
  specialization: 'Senior Advocate • Main Chamber Admin'
};

const DEFAULT_CLIENT = {
  id: 2,
  name: 'Rajesh Sharma',
  email: 'client.sharma@example.com',
  role: 'client',
  phone: '+91 91234 56789',
  specialization: 'Client'
};

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('lextrack_dark_mode') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('lextrack_user');
    return saved ? JSON.parse(saved) : DEFAULT_LAWYER;
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('lextrack_sound_enabled') !== 'false';
  });

  const [hearings, setHearings] = useState([]);
  const hasChimedRef = useRef(false);

  // Sync dark mode
  useEffect(() => {
    localStorage.setItem('lextrack_dark_mode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sync user
  useEffect(() => {
    localStorage.setItem('lextrack_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Sync sound preference
  useEffect(() => {
    localStorage.setItem('lextrack_sound_enabled', soundEnabled);
  }, [soundEnabled]);

  // Fetch upcoming hearings and check for today's alarms
  useEffect(() => {
    getUpcoming()
      .then(res => {
        const list = res.data || [];
        setHearings(list);

        const todayStr = new Date().toISOString().split('T')[0];
        const todaysList = list.filter(h => h.hearing_date?.slice(0, 10) === todayStr);

        if (todaysList.length > 0 && soundEnabled && !hasChimedRef.current) {
          hasChimedRef.current = true;
          // Gentle delay so UI renders before ringing chime
          setTimeout(() => {
            playHearingChime();
            triggerDesktopAlert(
              `🔔 Court Hearing Today: ${todaysList[0].case_number}`,
              `${todaysList[0].title} scheduled for ${todaysList[0].hearing_time} in ${todaysList[0].court}`
            );
          }, 800);
        }
      })
      .catch(err => {
        console.warn('[AlarmSync] Failed to fetch hearings:', err.message);
      });
  }, [soundEnabled]);

  const handleToggleRole = () => {
    if (currentUser.role === 'lawyer') {
      setCurrentUser(DEFAULT_CLIENT);
    } else {
      setCurrentUser(DEFAULT_LAWYER);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayHearings = hearings.filter(h => h.hearing_date?.slice(0, 10) === todayStr);

  return (
    <Router>
      <div className={`flex min-h-screen font-sans transition-colors duration-200 ${
        darkMode ? 'dark bg-[#0b0e14] text-slate-100' : 'bg-[#f4f7fb] text-slate-900'
      }`}>
        {/* Navigation Sidebar with Role Switcher & Audio Alarm Bell */}
        <Sidebar 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          currentUser={currentUser}
          onSwitchRole={handleToggleRole}
          onOpenAlarm={() => setShowAlarmModal(true)}
          todayHearingsCount={todayHearings.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 h-screen overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Today's Urgent Hearing Top Banner */}
            {todayHearings.length > 0 && (
              <div className="bg-rose-500/10 dark:bg-rose-950/40 border-b border-rose-500/20 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-rose-800 dark:text-rose-200 no-print animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-extrabold uppercase tracking-wide">
                    TODAY'S COURT HEARING:
                  </span>
                  <span className="font-semibold">
                    {todayHearings[0].case_number} — {todayHearings[0].title}
                  </span>
                  <span className="text-[11px] opacity-80">
                    ({todayHearings[0].hearing_time} • {todayHearings[0].court})
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowAlarmModal(true)}
                    className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-300 hover:underline cursor-pointer"
                  >
                    <Bell size={12} /> View Hearing Alarm & Details
                  </button>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard darkMode={darkMode} currentUser={currentUser} />} />
                <Route path="/cases" element={<Cases darkMode={darkMode} currentUser={currentUser} />} />
                <Route path="/add-case" element={<AddCase darkMode={darkMode} currentUser={currentUser} />} />
                <Route path="/case/:id" element={<CaseDetail darkMode={darkMode} currentUser={currentUser} />} />
                <Route path="/cause-list" element={<CauseList darkMode={darkMode} currentUser={currentUser} />} />
                <Route path="/hearings" element={<Upcoming darkMode={darkMode} currentUser={currentUser} />} />
                <Route path="/payments" element={<Payments darkMode={darkMode} currentUser={currentUser} />} />
              </Routes>
            </div>
          </div>

          {/* Sticky/Bottom Footer Matching Reference Design */}
          <footer className="p-6 md:px-10 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-[#0e1118]/50 backdrop-blur-xs flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 no-print">
            <div className="font-medium text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Legal Case Tracker • {currentUser.role === 'lawyer' ? 'Lawyer Chamber Admin' : 'Client Access Portal'}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Audio Alarm Quick Toggle in Footer */}
              <button
                onClick={() => setShowAlarmModal(true)}
                title="Court Hearing Reminders & Audio Alarms"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Bell size={13} className={todayHearings.length > 0 ? "text-rose-500" : "text-teal-600 dark:text-teal-400"} />
                <span className="font-semibold text-xs">
                  {todayHearings.length > 0 ? `${todayHearings.length} Hearing Today` : 'Reminders'}
                </span>
              </button>

              <button
                onClick={() => setShowUserModal(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <User size={12} />
                </div>
                <span className="font-semibold text-xs">{currentUser.name} ({currentUser.role === 'lawyer' ? 'Admin' : 'Client'})</span>
              </button>
            </div>
          </footer>
        </main>

        {/* Hearing Reminders & Audio Alarm Modal */}
        <HearingAlarmCenter
          isOpen={showAlarmModal}
          onClose={() => setShowAlarmModal(false)}
          hearings={hearings}
          darkMode={darkMode}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />

        {/* User Account & Role Switcher Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-[#131720] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-teal-600 dark:text-teal-400" />
                  <span>Chamber User & Role Management</span>
                </h3>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Current Active User Profile */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0f1117] border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    currentUser.role === 'lawyer' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    Active: {currentUser.role === 'lawyer' ? 'Main Admin Lawyer' : 'Registered Client'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: #{currentUser.id}</span>
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-white">{currentUser.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Mail size={12} className="text-teal-600" /> {currentUser.email}
                </div>
                {currentUser.phone && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Phone size={12} className="text-teal-600" /> {currentUser.phone}
                  </div>
                )}
              </div>

              {/* Instant 1-Click Role Switcher */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Quick Persona Switcher
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      setCurrentUser(DEFAULT_LAWYER);
                      setShowUserModal(false);
                    }}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      currentUser.role === 'lawyer'
                        ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold">Lawyer (Admin)</div>
                    <div className="text-[11px] text-slate-400">Full chamber litigation & fee control</div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentUser(DEFAULT_CLIENT);
                      setShowUserModal(false);
                    }}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      currentUser.role === 'client'
                        ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold">Client (User)</div>
                    <div className="text-[11px] text-slate-400">Direct case filing & payment status</div>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                💡 <strong>Admin Setup:</strong> To customize your own lawyer credentials or client accounts permanently, edit the <code>backend/.env</code> file in your project folder.
              </div>

              <button
                onClick={() => setShowUserModal(false)}
                className="w-full py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}
