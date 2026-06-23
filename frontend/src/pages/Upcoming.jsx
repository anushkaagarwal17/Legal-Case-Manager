import React, { useState } from 'react';
import { Calendar, Plus, X, Gavel, User, Clock, AlertCircle } from 'lucide-react';

const INITIAL_HEARINGS = [
  { id: 1, case_no: "CS/2401/2025", title: "Commercial Contract Breach Settlement", client: "Acme Corp Ltd", date: "2026-06-26", time: "10:30", courtroom: "Courtroom 4, High Court" },
  { id: 2, case_no: "CRM/412/2026", title: "Intellectual Property Trespass Claims", client: "Varsha Sapra", date: "2026-06-29", time: "14:00", courtroom: "Courtroom 11, District Sessions" }
];

export default function Upcoming({ darkMode }) {
  const [hearings, setHearings] = useState(INITIAL_HEARINGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHearing, setNewHearing] = useState({
    case_no: '',
    title: '',
    client: '',
    date: '',
    time: '',
    courtroom: ''
  });

  const handleCreateHearing = (e) => {
    e.preventDefault();
    const hearingEntry = {
      id: Date.now(),
      ...newHearing
    };
    setHearings([...hearings, hearingEntry]);
    setIsModalOpen(false);
    setNewHearing({ case_no: '', title: '', client: '', date: '', time: '', courtroom: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
            <Calendar size={24} className="text-zinc-400" /> Upcoming Hearings
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Track upcoming daily cause list listings and board schedules.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all ${
            darkMode ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
          }`}
        >
          <Plus size={14} /> Schedule Hearing
        </button>
      </div>

      {/* Main Content Area */}
      {hearings.length === 0 ? (
        <div className={`text-center py-20 border border-dashed rounded-xl ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <p className="text-sm text-zinc-400">No active hearings scheduled in your docket tracking logs.</p>
        </div>
      ) : (
        <div className={`border rounded-xl overflow-hidden transition-all ${
          darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-semibold uppercase tracking-wider ${
                  darkMode ? 'bg-zinc-900 text-zinc-400 border-zinc-800' : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                }`}>
                  <th className="px-6 py-3">Date & Time</th>
                  <th className="px-6 py-3">Case Context</th>
                  <th className="px-6 py-3">Client Reference</th>
                  <th className="px-6 py-3">Courtroom Forum</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-zinc-800 text-zinc-300' : 'divide-zinc-200 text-zinc-700'}`}>
                {hearings.sort((a,b) => new Date(a.date) - new Date(b.date)).map((item) => (
                  <tr key={item.id} className={`transition-colors ${darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-50/80'}`}>
                    <td className="px-6 py-4 space-y-1">
                      <div className={`font-semibold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                        {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-zinc-400 flex items-center gap-1"><Clock size={11} /> {item.time} hrs</div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="font-mono font-medium text-zinc-400">{item.case_no}</div>
                      <div className={`font-medium max-w-sm truncate ${darkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{item.title}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{item.client}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded flex items-center gap-1.5 w-fit ${darkMode ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-100 text-zinc-800'}`}>
                        <Gavel size={11} className="text-zinc-400" /> {item.courtroom}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Modal Sheet overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`w-full max-w-md border rounded-xl p-6 space-y-4 shadow-xl transition-all ${
            darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider">Schedule Hearing Listing</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateHearing} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-400">Case Number</label>
                <input type="text" required placeholder="e.g., CS/1150/2026" value={newHearing.case_no}
                  onChange={e => setNewHearing({...newHearing, case_no: e.target.value})}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200'}`} />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-400">Title / Subject Matter</label>
                <input type="text" required placeholder="e.g., Eviction Suit Assessment" value={newHearing.title}
                  onChange={e => setNewHearing({...newHearing, title: e.target.value})}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200'}`} />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-400">Client Reference</label>
                <input type="text" required placeholder="e.g., Jyoshita Sapra" value={newHearing.client}
                  onChange={e => setNewHearing({...newHearing, client: e.target.value})}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200'}`} />
            </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-400">Listing Date</label>
                  <input type="date" required value={newHearing.date}
                    onChange={e => setNewHearing({...newHearing, date: e.target.value})}
                    className={`w-full p-2.5 rounded-lg border focus:outline-none ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200'}`} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-400">Time Board</label>
                  <input type="time" required value={newHearing.time}
                    onChange={e => setNewHearing({...newHearing, time: e.target.value})}
                    className={`w-full p-2.5 rounded-lg border focus:outline-none ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200'}`} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-400">Courtroom Venue Location</label>
                <input type="text" required placeholder="e.g., Courtroom 2, Revenue Bench" value={newHearing.courtroom}
                  onChange={e => setNewHearing({...newHearing, courtroom: e.target.value})}
                  className={`w-full p-2.5 rounded-lg border focus:outline-none ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200'}`} />
              </div>

              <button type="submit" className={`w-full py-2.5 font-semibold rounded-lg text-white mt-2 ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-900 hover:bg-zinc-800'}`}>
                Commit to Calendar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}