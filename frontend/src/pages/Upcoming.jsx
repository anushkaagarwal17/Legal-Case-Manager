import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Plus, 
  X, 
  Gavel, 
  Clock, 
  FileText,
  CalendarDays,
  ChevronRight,
  Printer
} from 'lucide-react';
import { getUpcoming, addHearing } from '../api';

export default function Upcoming({ darkMode }) {
  const navigate = useNavigate();
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHearing, setNewHearing] = useState({
    case_no: '',
    title: '',
    client: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:30',
    courtroom: 'Courtroom 2'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUpcoming()
      .then(res => {
        setHearings(res.data || []);
      })
      .catch(err => console.error('[API ERROR] Failed to fetch upcoming hearings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateHearing = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        hearing_date: newHearing.date,
        hearing_time: newHearing.time,
        purpose: 'Hearing / Arguments'
      };

      const res = await addHearing(1, payload);

      const hearingEntry = {
        id: res.data?.id || Date.now(),
        case_number: newHearing.case_no,
        title: newHearing.title,
        client_name: newHearing.client,
        hearing_date: newHearing.date,
        hearing_time: newHearing.time,
        court: newHearing.courtroom
      };

      setHearings([...hearings, hearingEntry]);
      setIsModalOpen(false);
      setNewHearing({ case_no: '', title: '', client: '', date: '', time: '10:30', courtroom: '' });
    } catch (err) {
      console.error('[API ERROR] Failed to create hearing:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Mock demo hearings for pristine preview if fresh database
  const sampleHearings = [
    {
      id: 'demo-1',
      hearing_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      hearing_time: '10:30',
      case_number: 'CC/1234/2024',
      title: 'Sharma vs. State of Delhi',
      client_name: 'Rajesh Sharma',
      court: 'Courtroom 3, Tis Hazari'
    },
    {
      id: 'demo-2',
      hearing_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      hearing_time: '11:45',
      case_number: 'OS/502/2025',
      title: 'Gupta Traders vs. Metro Infra Ltd',
      client_name: 'Praveen Gupta',
      court: 'Courtroom 1, Commercial Bench'
    }
  ];

  const displayHearings = hearings.length > 0 ? hearings : sampleHearings;

  return (
    <div className="space-y-7">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-[26px] font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="text-teal-600 dark:text-teal-400" size={26} />
            <span>Hearings & Cause List</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor court schedules, bench listings, and upcoming courtroom matters.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => navigate('/cause-list')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131720] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer size={14} /> Printable Daily List
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#101216] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus size={15} /> Schedule Hearing
          </button>
        </div>
      </div>

      {/* Main Hearings Table Card */}
      <div className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays size={16} className="text-teal-600 dark:text-teal-400" />
            <span>Scheduled Court Appearances</span>
            <span className="text-xs font-normal text-slate-400">({displayHearings.length} scheduled)</span>
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs text-slate-400">Loading hearings...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <th className="py-3 px-4">DATE & TIME</th>
                  <th className="py-3 px-4">CASE CONTEXT</th>
                  <th className="py-3 px-4">CLIENT</th>
                  <th className="py-3 px-4">COURT VENUE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {displayHearings.map((item, idx) => (
                  <tr 
                    key={item.id || idx} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-4 space-y-1">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Calendar size={13} className="text-teal-600 dark:text-teal-400" />
                        <span>{new Date(item.hearing_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px] font-mono">
                        <Clock size={11} /> {item.hearing_time || '10:30'} hrs
                      </div>
                    </td>
                    <td className="py-4 px-4 space-y-1">
                      <div className="font-mono font-medium text-slate-500 dark:text-slate-400">
                        {item.case_number}
                      </div>
                      <div className="font-medium text-slate-900 dark:text-white max-w-sm truncate">
                        {item.title}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      {item.client_name}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                        <Gavel size={12} className="text-teal-600 dark:text-teal-400" />
                        <span>{item.court || 'Courtroom 2'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Modal Sheet Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#131720] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar size={15} className="text-teal-600 dark:text-teal-400" />
                <span>Schedule Court Hearing</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateHearing} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Case Number *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., CC/1234/2026" 
                  value={newHearing.case_no}
                  onChange={e => setNewHearing({...newHearing, case_no: e.target.value})}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Title / Matter Description *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Eviction Suit Examination" 
                  value={newHearing.title}
                  onChange={e => setNewHearing({...newHearing, title: e.target.value})}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Client Reference</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Rajesh Sharma" 
                  value={newHearing.client}
                  onChange={e => setNewHearing({...newHearing, client: e.target.value})}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Listing Date *</label>
                  <input 
                    type="date" 
                    required 
                    value={newHearing.date}
                    onChange={e => setNewHearing({...newHearing, date: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Listing Time</label>
                  <input 
                    type="time" 
                    required 
                    value={newHearing.time}
                    onChange={e => setNewHearing({...newHearing, time: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-600 dark:text-slate-400">Courtroom Forum Venue</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Courtroom 3, District Court" 
                  value={newHearing.courtroom}
                  onChange={e => setNewHearing({...newHearing, courtroom: e.target.value})}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1117] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" 
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 font-semibold rounded-xl text-white bg-[#101216] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Commit to Docket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
