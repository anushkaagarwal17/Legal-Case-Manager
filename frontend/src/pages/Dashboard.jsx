import React from 'react';
import { Briefcase, Scale, CheckCircle2, AlertTriangle, ShieldAlert, FileText, ExternalLink, Link2 } from 'lucide-react';

const SAMPLE_CASES = [
  { id: 1, case_no: "CS/2401/2025", title: "Commercial Contract Breach Settlement", client: "Acme Corp Ltd", type: "Civil", status: "Active" },
  { id: 2, case_no: "CRM/412/2026", title: "Intellectual Property Trespass Claims", client: "Varsha Sapra", type: "Criminal", status: "Active" },
  { id: 3, case_no: "REV/902/2024", title: "Agricultural Land Assessment Appeal", client: "Jyoshita Sapra", type: "Revenue", status: "Disposed" },
  { id: 4, case_no: "CS/1150/2026", title: "Tenant Eviction & Non-Payment Suit", client: "Rajesh Kumar", type: "Civil", status: "Active" }
];

const PORTAL_LINKS = [
  { name: "eCourts Services", url: "https://ecourts.gov.in", desc: "Check CNR numbers & daily order sheets" },
  { name: "IndianKanoon", url: "https://indiankanoon.org", desc: "Research supreme court & high court precedents" },
  { name: "Vakil Search", url: "https://vakilsearch.com", desc: "Verify corporate compliance & trademarks" },
  { name: "UP Revenue Portal", url: "http://vaad.up.nic.in", desc: "Track land disputes & revenue court dockets" }
];

export default function Dashboard({ darkMode }) {
  const stats = { total: 4, active: 3, disposed: 1, civil: 2, criminal: 1, revenue: 1 };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
          Practice Overview
        </h1>
        <p className={`text-sm mt-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Operational summary of your current litigation docket.
        </p>
      </div>

      {/* Grid Layout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Cases", val: stats.total, icon: Briefcase },
          { label: "Active", val: stats.active, icon: Scale },
          { label: "Disposed", val: stats.disposed, icon: CheckCircle2 },
          { label: "Civil", val: stats.civil, icon: AlertTriangle },
          { label: "Criminal", val: stats.criminal, icon: ShieldAlert },
          { label: "Revenue", val: stats.revenue, icon: FileText }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`border rounded-xl p-4 flex items-center justify-between transition-all ${
              darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
            }`}>
              <div className="space-y-0.5">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{card.label}</p>
                <p className="text-xl font-bold">{card.val}</p>
              </div>
              <div className={`${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}><Icon size={18} /></div>
            </div>
          );
        })}
      </div>

      {/* NEW: Quick Portal Links Panel */}
      <div className="space-y-3">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Legal Research Portals
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PORTAL_LINKS.map((portal, i) => (
            <a
              key={i}
              href={portal.url}
              target="_blank"
              rel="noreferrer"
              className={`p-4 border rounded-xl block group transition-all ${
                darkMode ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 shadow-sm hover:border-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-semibold ${darkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>{portal.name}</span>
                <ExternalLink size={13} className="text-zinc-400 group-hover:text-zinc-600 transition-colors" />
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">{portal.desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Corporate Table Interface */}
      <div className={`border rounded-xl overflow-hidden transition-all ${
        darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <h2 className="text-sm font-bold">Active Docket Spotlight</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-semibold uppercase tracking-wider ${
                darkMode ? 'bg-zinc-900 text-zinc-400 border-zinc-800' : 'bg-zinc-50 text-zinc-500 border-zinc-200'
              }`}>
                <th className="px-6 py-3">Case Number</th>
                <th className="px-6 py-3">Title / Matter</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-zinc-800 text-zinc-300' : 'divide-zinc-200 text-zinc-700'}`}>
              {SAMPLE_CASES.map((item) => (
                <tr key={item.id} className={`transition-colors ${darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-50/80'}`}>
                  <td className="px-6 py-3.5 font-mono font-medium text-zinc-500">{item.case_no}</td>
                  <td className={`px-6 py-3.5 font-medium ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{item.title}</td>
                  <td className="px-6 py-3.5">{item.client}</td>
                  <td className="px-6 py-3.5">{item.type}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                      item.status === 'Active' ? 'bg-zinc-900 text-zinc-100 border border-zinc-700' : 'bg-zinc-200 text-zinc-600'
                    }`}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}