import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCauseList } from '../api';
import { format } from 'date-fns';
import { Printer, CalendarDays, ArrowLeft, Calendar, Building2 } from 'lucide-react';

export default function CauseList({ darkMode }) {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = () => {
    setLoading(true);
    getCauseList(date)
      .then(r => {
        setList(r.data || []);
      })
      .catch(err => {
        console.error('[API ERROR] Failed to fetch cause list:', err);
        setList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [date]);

  const handlePrint = () => window.print();

  // Mock sample listings if database has 0 listings for selected date
  const sampleListings = [
    {
      hearing_id: 'cl-1',
      case_number: 'CC/1234/2024',
      title: 'Sharma vs. State of Delhi',
      client_name: 'Rajesh Sharma',
      court: 'Courtroom 3, Bench 2',
      hearing_time: '10:30 AM',
      purpose: 'Final Arguments'
    },
    {
      hearing_id: 'cl-2',
      case_number: 'OS/502/2025',
      title: 'Gupta Traders vs. Metro Infra Ltd',
      client_name: 'Praveen Gupta',
      court: 'Courtroom 1, Commercial Bench',
      hearing_time: '11:45 AM',
      purpose: 'Framing of Issues'
    }
  ];

  const displayList = list.length > 0 ? list : sampleListings;

  return (
    <div className="space-y-6">
      {/* Action Controls & Navigation (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <button 
            onClick={() => navigate('/hearings')} 
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Hearings
          </button>
          <h1 className="text-2xl lg:text-[26px] font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="text-teal-600 dark:text-teal-400" size={26} />
            <span>Daily Cause List</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Formal courtroom appearance schedule and daily board ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="relative">
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131720] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs cursor-pointer font-medium"
            />
          </div>
          <button 
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-[#101216] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Printer size={15} /> Print Daily List
          </button>
        </div>
      </div>

      {/* Official Court Document Card */}
      <div className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-6 transition-colors">
        
        {/* Court Official Banner */}
        <div className="text-center border-b border-slate-100 dark:border-slate-800/80 pb-6 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            <Building2 size={13} className="text-teal-600 dark:text-teal-400" />
            <span>DISTRICT & SESSIONS COURT</span>
          </div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white uppercase font-sans">
            IN THE COURT OF ADV. PRAVEEN KUMAR GUPTA
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            District Court Chambers • Litigation Board
          </p>
          <div className="pt-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
            Listing Date: {format(new Date(date), 'EEEE, dd MMMM yyyy')}
          </div>
        </div>

        {/* Cause List Data Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs text-slate-400">Loading daily listings...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-4">CASE NO.</th>
                  <th className="py-3 px-4">MATTER / TITLE</th>
                  <th className="py-3 px-4">CLIENT NAME</th>
                  <th className="py-3 px-4">FORUM / COURT</th>
                  <th className="py-3 px-4">TIME</th>
                  <th className="py-3 px-4">PURPOSE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {displayList.map((h, i) => (
                  <tr key={h.hearing_id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                      {i + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-teal-700 dark:text-teal-400">
                      {h.case_number}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      {h.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {h.client_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {h.court}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {h.hearing_time || '10:30 AM'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {h.purpose || 'Arguments'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Generated via LexTrack Legal Management System</span>
          <span>Total Hearings Scheduled: {displayList.length}</span>
        </div>
      </div>
    </div>
  );
}
