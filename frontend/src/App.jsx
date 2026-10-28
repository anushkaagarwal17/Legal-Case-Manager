import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { User, X, ShieldCheck, Mail, Building, ArrowLeftRight, Key, Phone } from 'lucide-react';

// Import Layout Components
import Sidebar from './components/Sidebar';

// Import Page Views
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import AddCase from './pages/AddCase';
import CaseDetail from './pages/CaseDetail';
import CauseList from './pages/CauseList';
import Upcoming from './pages/Upcoming';
import Payments from './pages/Payments';

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

  useEffect(() => {
    localStorage.setItem('lextrack_dark_mode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('lextrack_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const handleToggleRole = () => {
    if (currentUser.role === 'lawyer') {
      setCurrentUser(DEFAULT_CLIENT);
    } else {
      setCurrentUser(DEFAULT_LAWYER);
    }
  };

  return (
    <Router>
      <div className={`flex min-h-screen font-sans transition-colors duration-200 ${
        darkMode ? 'dark bg-[#0b0e14] text-slate-100' : 'bg-[#f4f7fb] text-slate-900'
      }`}>
        {/* Navigation Sidebar with Role Switcher */}
        <Sidebar 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          currentUser={currentUser}
          onSwitchRole={handleToggleRole}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 h-screen overflow-y-auto flex flex-col justify-between">
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

          {/* Sticky/Bottom Footer Matching Reference Design */}
          <footer className="p-6 md:px-10 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-[#0e1118]/50 backdrop-blur-xs flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 no-print">
            <div className="font-medium text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Legal Case Tracker • {currentUser.role === 'lawyer' ? 'Lawyer Chamber Admin' : 'Client Access Portal'}
            </div>
            
            <button
              onClick={() => setShowUserModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <User size={12} />
              </div>
              <span className="font-semibold text-xs">{currentUser.name} ({currentUser.role === 'lawyer' ? 'Admin' : 'Client'})</span>
            </button>
          </footer>
        </main>

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
