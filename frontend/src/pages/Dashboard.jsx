import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Scale, 
  CheckCircle2, 
  Gavel, 
  Shield, 
  Coins, 
  ExternalLink,
  Plus,
  CreditCard,
  User,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Calendar,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Receipt,
  Check,
  ChevronRight,
  Landmark,
  BadgeAlert
} from 'lucide-react';
import { getCases, getStats, getLawyers, getUpcoming } from '../api';

const PORTAL_LINKS = [
  { 
    name: "eCourts Services", 
    url: "https://ecourts.gov.in", 
    desc: "Check CNR numbers & daily order sheets",
    gradient: "from-[#2ba196] to-[#1c7873]"
  },
  { 
    name: "IndianKanoon", 
    url: "https://indiankanoon.org", 
    desc: "Research supreme court & high court precedents",
    gradient: "from-[#132338] to-[#1c324c]"
  },
  { 
    name: "Vakil Search", 
    url: "https://vakilsearch.com", 
    desc: "Verify corporate compliance & trademarks",
    gradient: "from-[#d92c48] to-[#f2632b]"
  },
  { 
    name: "UP Revenue Portal", 
    url: "http://vaad.up.nic.in", 
    desc: "Track land disputes & revenue court dockets",
    gradient: "from-[#6b22a8] to-[#452373]"
  }
];

export default function Dashboard({ darkMode, currentUser }) {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [upcomingHearings, setUpcomingHearings] = useState([]);
  const [stats, setStats] = useState({ 
    total: 0, active: 0, disposed: 0, 
    civil: 0, criminal: 0, revenue: 0,
    total_billed: 0, total_paid: 0, total_due: 0 
  });
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isClient = currentUser?.role === 'client';

  useEffect(() => {
    const params = isClient ? { role: 'client', user_id: currentUser?.id } : {};

    Promise.all([
      getCases(params),
      getStats(params),
      getLawyers(),
      getUpcoming()
    ])
      .then(([casesRes, statsRes, lawyersRes, hearingsRes]) => {
        setCases(casesRes.data || []);
        if (statsRes.data) setStats(statsRes.data);
        setLawyers(lawyersRes.data || []);
        setUpcomingHearings(hearingsRes.data || []);
      })
      .catch(err => console.error('[API ERROR] Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const assignedLawyer = lawyers.length > 0 ? lawyers[0] : null;

  // Next scheduled hearing for client
  const nextHearing = upcomingHearings.length > 0 ? upcomingHearings[0] : null;

  // ───────────────────────────────────────────────────────────────────────────
  // LAWYER (ADMIN) DASHBOARD VIEW
  // ───────────────────────────────────────────────────────────────────────────
  if (!isClient) {
    const lawyerStatCards = [
      { 
        label: "TOTAL CASES", 
        val: stats.total, 
        icon: Briefcase,
        cardBg: "bg-[#f0f7fa] border-[#cde2ec] dark:bg-[#111e28]/70 dark:border-cyan-900/40",
        badgeBg: "bg-[#dcebf2] text-[#486b7f] dark:bg-cyan-950/80 dark:text-cyan-300"
      },
      { 
        label: "ACTIVE", 
        val: stats.active, 
        icon: Scale,
        cardBg: "bg-[#eef9f2] border-[#c2ebd0] dark:bg-[#0d2217]/70 dark:border-emerald-900/40",
        badgeBg: "bg-[#d4f2e0] text-[#2e9e62] dark:bg-emerald-950/80 dark:text-emerald-300"
      },
      { 
        label: "DISPOSED", 
        val: stats.disposed, 
        icon: CheckCircle2,
        cardBg: "bg-[#eff6ff] border-[#bfdbfe] dark:bg-[#101e38]/70 dark:border-blue-900/40",
        badgeBg: "bg-[#dbeafe] text-[#2563eb] dark:bg-blue-950/80 dark:text-blue-300"
      },
      { 
        label: "CIVIL", 
        val: stats.civil, 
        icon: Gavel,
        cardBg: "bg-[#fffbeb] border-[#fde68a] dark:bg-[#271d0e]/70 dark:border-amber-900/40",
        badgeBg: "bg-[#fef3c7] text-[#d97706] dark:bg-amber-950/80 dark:text-amber-300"
      },
      { 
        label: "CRIMINAL", 
        val: stats.criminal, 
        icon: Shield,
        cardBg: "bg-[#fff1f2] border-[#fecdd3] dark:bg-[#291116]/70 dark:border-rose-900/40",
        badgeBg: "bg-[#ffe4e6] text-[#e11d48] dark:bg-rose-950/80 dark:text-rose-300"
      },
      { 
        label: "REVENUE", 
        val: stats.revenue, 
        icon: Coins,
        cardBg: "bg-[#faf5ff] border-[#e9d5ff] dark:bg-[#201230]/70 dark:border-purple-900/40",
        badgeBg: "bg-[#f3e8ff] text-[#9333ea] dark:bg-purple-950/80 dark:text-purple-300"
      }
    ];

    // Filter cases that have client notes (demands / what client wants)
    const clientDemands = cases.filter(c => c.client_notes && c.client_notes.trim().length > 0);

    return (
      <div className="space-y-7">
        {/* Lawyer Heading Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold uppercase tracking-widest mb-1.5 border border-teal-200/60 dark:border-teal-800/60">
              <ShieldCheck size={12} />
              <span>CHAMBER COMMAND CENTER • MAIN ADMIN CONSOLE</span>
            </div>
            <h1 className="text-2xl lg:text-[28px] font-extrabold tracking-tight text-slate-900 dark:text-white">
              Litigation Practice & Operations Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Managing Counsel: <strong>{currentUser?.name || 'Adv. Praveen Kumar Gupta'}</strong> • Active Litigation Docket & Financial Accounting
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => navigate('/payments')}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131720] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <CreditCard size={14} className="text-teal-600 dark:text-teal-400" />
              <span>Chamber Accounts</span>
            </button>
            <button
              onClick={() => navigate('/add-case')}
              className="inline-flex items-center gap-2 bg-[#101216] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus size={15} /> File Case Docket
            </button>
          </div>
        </div>

        {/* 6 Key Operational Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {lawyerStatCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div 
                key={i} 
                className={`border rounded-2xl p-4 flex items-center justify-between transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-sm ${card.cardBg}`}
              >
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {card.label}
                  </p>
                  <p className="text-2xl lg:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
                    {card.val}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.badgeBg}`}>
                  <Icon size={19} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Chamber Financial Health Panel (Lawyer Specific) */}
        <div className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-teal-600 dark:text-teal-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Chamber Retainer Billing & Recovery Health
              </h2>
            </div>
            <button
              onClick={() => navigate('/payments')}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Financial Ledger</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0f1117] border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TOTAL RETAINERS BILLED</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                ₹{(stats.total_billed || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Agreed across all active & disposed client files</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">FEES COLLECTED IN CHAMBER</span>
              <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                ₹{(stats.total_paid || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                Collection rate: {stats.total_billed > 0 ? Math.round((stats.total_paid / stats.total_billed) * 100) : 100}%
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">PENDING CLIENT RECOVERIES</span>
              <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">
                ₹{(stats.total_due || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">Outstanding fee balances due for collection</p>
            </div>
          </div>
        </div>

        {/* Incoming Client Intake & Action Demands ("What the Client Wants") */}
        {clientDemands.length > 0 && (
          <div className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <BadgeAlert size={16} className="text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Incoming Client Relief Demands ("What Clients Want")
              </h3>
            </div>
            
            <div className="space-y-3">
              {clientDemands.slice(0, 3).map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/case/${item.id}`)}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0f1117] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-500/40 transition-colors cursor-pointer group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-teal-600 dark:text-teal-400">{item.case_number}</span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">{item.title}</span>
                      <span className="text-[10px] text-slate-400">({item.client_name})</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{item.client_notes}"
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      Balance: ₹{(item.remaining_balance || 0).toLocaleString('en-IN')}
                    </span>
                    <button className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Review Brief</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Research Portals */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            LEGAL RESEARCH & COURT PRECEDENT PORTALS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PORTAL_LINKS.map((portal, i) => (
              <a
                key={i}
                href={portal.url}
                target="_blank"
                rel="noreferrer"
                className={`p-4 rounded-2xl text-white block group transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-r ${portal.gradient}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold tracking-tight text-white">{portal.name}</span>
                  <ExternalLink size={14} className="text-white/80 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p className="text-[11px] text-white/80 leading-relaxed font-normal">{portal.desc}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Master Active Docket Spotlight Table */}
        <div className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Active Docket Spotlight</span>
                <span className="text-xs font-normal text-slate-400">({cases.length} records)</span>
              </h3>
              <p className="text-xs text-slate-400">Live operational matters under current chamber representation</p>
            </div>
            <button
              onClick={() => navigate('/cases')}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Registry</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <th className="py-3 px-4">CASE NUMBER</th>
                  <th className="py-3 px-4">TITLE / MATTER</th>
                  <th className="py-3 px-4">CLIENT NAME</th>
                  <th className="py-3 px-4">COURT VENUE</th>
                  <th className="py-3 px-4">FEE STATUS</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {cases.slice(0, 5).map((item, idx) => (
                  <tr 
                    key={item.id}
                    onClick={() => navigate(`/case/${item.id}`)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600 dark:text-slate-400">
                      {item.case_number}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      <div>{item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.case_type} Classification</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      {item.client_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {item.court || 'District Court, Agra'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300 text-xs">
                      Paid: ₹{(item.paid_amount || 0).toLocaleString('en-IN')} / ₹{(item.total_fee || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide capitalize shadow-2xs ${
                        item.status === 'Active' ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#e0e7ff] text-[#3730a3]'
                      }`}>
                        {item.status}
                      </span>
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

  // ───────────────────────────────────────────────────────────────────────────
  // CLIENT (USER) DASHBOARD VIEW
  // ───────────────────────────────────────────────────────────────────────────
  const clientStatCards = [
    {
      label: "MY ACTIVE MATTERS",
      val: cases.filter(c => c.status === 'Active').length,
      icon: Briefcase,
      desc: "Litigation briefs in court",
      cardBg: "bg-[#f0f7fa] border-[#cde2ec] dark:bg-[#111e28]/70 dark:border-cyan-900/40",
      badgeBg: "bg-[#dcebf2] text-[#486b7f] dark:bg-cyan-950/80 dark:text-cyan-300"
    },
    {
      label: "NEXT COURT DATE",
      val: nextHearing ? new Date(nextHearing.hearing_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : "Pending Board",
      icon: Calendar,
      desc: nextHearing ? `${nextHearing.court || 'Courtroom 2'}` : "Awaiting next listing",
      cardBg: "bg-[#fffbeb] border-[#fde68a] dark:bg-[#271d0e]/70 dark:border-amber-900/40",
      badgeBg: "bg-[#fef3c7] text-[#d97706] dark:bg-amber-950/80 dark:text-amber-300"
    },
    {
      label: "PAID TO COUNSEL",
      val: `₹${(stats.total_paid || 0).toLocaleString('en-IN')}`,
      icon: CheckCircle2,
      desc: "Cleared retainer payments",
      cardBg: "bg-[#eef9f2] border-[#c2ebd0] dark:bg-[#0d2217]/70 dark:border-emerald-900/40",
      badgeBg: "bg-[#d4f2e0] text-[#2e9e62] dark:bg-emerald-950/80 dark:text-emerald-300"
    },
    {
      label: "PENDING FEE BALANCE",
      val: `₹${(stats.total_due || 0).toLocaleString('en-IN')}`,
      icon: Clock,
      desc: stats.total_due > 0 ? "Remaining balance due" : "All legal dues cleared",
      cardBg: "bg-[#fff1f2] border-[#fecdd3] dark:bg-[#291116]/70 dark:border-rose-900/40",
      badgeBg: "bg-[#ffe4e6] text-[#e11d48] dark:bg-rose-950/80 dark:text-rose-300"
    }
  ];

  return (
    <div className="space-y-7">
      {/* Client Heading Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-widest mb-1.5 border border-blue-200/60 dark:border-blue-800/60">
            <User size={12} />
            <span>CLIENT BRIEFING ROOM • CASE TRACKING PORTAL</span>
          </div>
          <h1 className="text-2xl lg:text-[28px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            Client Matter Hub & Hearing Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Client: <strong>{currentUser?.name || 'Rajesh Sharma'}</strong> • Track your court appearance dates, relief status, and payments.
          </p>
        </div>

        <button
          onClick={() => navigate('/add-case')}
          className="inline-flex items-center gap-2 bg-[#101216] dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} /> Submit New Matter to Lawyer
        </button>
      </div>

      {/* Appointed Legal Counsel Contact Card */}
      {assignedLawyer && (
        <div className="bg-gradient-to-r from-slate-900 to-[#16202c] text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-extrabold text-xl">
              PK
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-teal-400">
                YOUR APPOINTED LEGAL ADVOCATE
              </div>
              <div className="text-lg font-bold">{assignedLawyer.name}</div>
              <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1"><Landmark size={12} className="text-teal-400" /> {assignedLawyer.specialization || 'Senior Advocate • District Court'}</span>
                {assignedLawyer.phone && <span className="flex items-center gap-1"><Phone size={12} className="text-teal-400" /> {assignedLawyer.phone}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => navigate('/payments')}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            >
              Fee Receipts
            </button>
            <button
              onClick={() => navigate('/add-case')}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-sm transition-all cursor-pointer"
            >
              + File Direct Brief
            </button>
          </div>
        </div>
      )}

      {/* 4 Client-Centric Personal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {clientStatCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`border rounded-2xl p-5 flex items-center justify-between shadow-xs transition-all ${card.cardBg}`}>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">
                  {card.val}
                </p>
                <p className="text-[11px] text-slate-400 pt-0.5 font-medium">{card.desc}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.badgeBg}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Litigation Stage Stepper for Client Peace of Mind */}
      <div className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Typical Litigation Progression Stages (How Your Case Moves Forward)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { step: "1", title: "Intake & Briefing", desc: "Matter filed with lawyer", active: true },
            { step: "2", title: "Court Filing & Number", desc: "Case citation assigned", active: true },
            { step: "3", title: "Notice & Service", desc: "Opposite party summoned", active: true },
            { step: "4", title: "Evidence & Arguments", desc: "Hearings before bench", active: true },
            { step: "5", title: "Judgment & Decree", desc: "Final order executed", active: false }
          ].map((s, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl border text-xs space-y-1 ${
              s.active 
                ? 'border-teal-500/40 bg-teal-50/40 dark:bg-teal-950/20 text-teal-950 dark:text-teal-200' 
                : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f1117] text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  s.active ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {s.step}
                </span>
                <span className="font-bold text-xs">{s.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Client's Active Matters & What They Want Accomplished */}
      <div className="bg-white dark:bg-[#131720] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>My Active Cases & Requested Relief</span>
              <span className="text-xs font-normal text-slate-400">({cases.length} matters)</span>
            </h3>
            <p className="text-xs text-slate-400">Review your ongoing court matters, relief requested, and fee payment schedule</p>
          </div>
          <button
            onClick={() => navigate('/payments')}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Payment Breakdown</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {cases.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">You have no registered cases yet</p>
            <p className="text-xs text-slate-400">Submit your dispute background directly to your assigned counsel.</p>
            <button
              onClick={() => navigate('/add-case')}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 text-white cursor-pointer"
            >
              + Submit First Legal Case
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <th className="py-3 px-4">CASE CITATION</th>
                  <th className="py-3 px-4">YOUR REQUESTED RELIEF / MATTER</th>
                  <th className="py-3 px-4">ASSIGNED COUNSEL</th>
                  <th className="py-3 px-4">REMAINING DUE</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {cases.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600 dark:text-slate-400">
                      {item.case_number}
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                      {item.client_notes && (
                        <div className="text-[11px] text-teal-700 dark:text-teal-400 italic">
                          "Relief sought: {item.client_notes}"
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      {item.lawyer_name || assignedLawyer?.name || 'Adv. Praveen Kumar Gupta'}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={item.remaining_balance > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-semibold'}>
                        ₹{(item.remaining_balance || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                        item.status === 'Active' ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#fef3c7] text-[#92400e]'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => navigate(`/case/${item.id}`)}
                        className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                      >
                        View Timeline →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Government eCourts Verification Link */}
      <div className="p-5 rounded-2xl bg-[#f0f7fa] dark:bg-[#111e28]/70 border border-[#cde2ec] dark:border-cyan-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ExternalLink size={14} className="text-teal-600 dark:text-teal-400" />
            <span>Official Government Judicial Verification (eCourts CNR Search)</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify your CNR number, case listing status, and download certified daily order sheets directly from the District Court.
          </p>
        </div>
        <a
          href="https://services.ecourts.gov.in"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#131720] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto inline-flex items-center gap-1.5"
        >
          <span>Open eCourts Portal</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
