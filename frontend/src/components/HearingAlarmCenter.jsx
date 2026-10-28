import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  X, 
  Clock, 
  Calendar, 
  Gavel, 
  AlertCircle, 
  CheckCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { playHearingChime, playUrgentAlarm, requestNotificationPermission, triggerDesktopAlert } from '../utils/audioAlarm';

export default function HearingAlarmCenter({ isOpen, onClose, hearings = [], darkMode, soundEnabled, setSoundEnabled }) {
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [testPlaying, setTestPlaying] = useState(false);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayHearings = hearings.filter(h => {
    const d = h.hearing_date?.slice(0, 10);
    return d === todayStr;
  });
  const upcomingHearings = hearings.filter(h => {
    const d = h.hearing_date?.slice(0, 10);
    return d > todayStr;
  });

  const handleTestChime = () => {
    setTestPlaying(true);
    playUrgentAlarm();
    setTimeout(() => setTestPlaying(false), 1600);
  };

  const handleEnablePush = async () => {
    const status = await requestNotificationPermission();
    setPermission(status);
    if (status === 'granted') {
      triggerDesktopAlert('🔔 Legal Case Tracker Alarms Active', 'You will receive reminders for court dates and hearings.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Bell size={20} className={todayHearings.length > 0 ? "animate-bounce" : ""} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Court Hearing Alarm & Reminders
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audible court bells and calendar alerts for active matters
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Audio Ring Sound Settings Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-slate-50 to-emerald-500/10 dark:from-teal-950/40 dark:via-[#161a24] dark:to-emerald-950/30 border border-teal-500/20 dark:border-teal-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 size={18} className="text-teal-600 dark:text-teal-400" />
              ) : (
                <VolumeX size={18} className="text-slate-400" />
              )}
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Audible Hearing Ring Chime
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Plays a resonant court bell when today's hearings are detected
                </span>
              </div>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {soundEnabled ? 'Alarm ON' : 'Alarm OFF'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-teal-500/10 dark:border-teal-500/20">
            <button
              onClick={handleTestChime}
              disabled={testPlaying}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Volume2 size={13} className={testPlaying ? "animate-pulse text-teal-500" : ""} />
              <span>{testPlaying ? 'Ringing Bell...' : 'Test Alarm Ring'}</span>
            </button>

            {permission !== 'granted' && (
              <button
                onClick={handleEnablePush}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Enable Desktop Popups</span>
              </button>
            )}
            {permission === 'granted' && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold px-2">
                <CheckCircle size={12} /> Desktop alerts active
              </span>
            )}
          </div>
        </div>

        {/* Section: Today's Hearings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>Today's Court Hearings ({todayHearings.length})</span>
            </div>
            {todayHearings.length > 0 && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Action Required Today
              </span>
            )}
          </div>

          {todayHearings.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161a24] border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              No hearings scheduled for today. You're clear for court sessions today.
            </div>
          ) : (
            todayHearings.map((h, i) => (
              <div 
                key={h.id || i}
                className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-2 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-900 dark:text-rose-200 font-mono">
                        {h.case_number}
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                        TODAY
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                      {h.title}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 justify-end">
                      <Clock size={12} /> {h.hearing_time || '10:30 AM'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                      {h.court || 'District Court'}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-black/20 p-2 rounded-xl flex items-center justify-between">
                  <span className="truncate pr-2">📌 {h.purpose || 'Arguments / Matter Hearing'}</span>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    👤 {h.client_name || 'Client'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Section: Upcoming Hearings */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Upcoming Hearings (Next 7 Days)
          </div>

          {upcomingHearings.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161a24] border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              No upcoming hearings scheduled for the next 7 days.
            </div>
          ) : (
            upcomingHearings.slice(0, 3).map((h, i) => (
              <div 
                key={h.id || i}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#161a24] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{h.case_number}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{h.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>🏛️ {h.court || 'Court'}</span>
                    <span>•</span>
                    <span>{h.purpose || 'Hearing'}</span>
                  </div>
                </div>

                <div className="text-right whitespace-nowrap">
                  <div className="font-bold text-teal-600 dark:text-teal-400">
                    {h.hearing_date?.slice(0, 10)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {h.hearing_time || '10:30 AM'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-400">
            Automated daily email alerts run at 8:00 AM
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
