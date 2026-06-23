import { useEffect, useState } from 'react'
import { getCauseList } from '../api'
import { format } from 'date-fns'
import { Printer, CalendarDays } from 'lucide-react'

export default function CauseList() {
  const [date,    setDate]    = useState(new Date().toISOString().split('T')[0])
  const [list,    setList]    = useState([])
  const [loading, setLoading] = useState(false)

  const fetch = () => {
    setLoading(true)
    getCauseList(date).then(r => setList(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [date])

  const handlePrint = () => window.print()

  return (
    <div className="page">
      <div className="page-header">
        <div className="header-left">
          <CalendarDays size={22} />
          <h1>Cause List</h1>
        </div>
        <div className="header-right">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          <button className="btn-secondary" onClick={handlePrint}><Printer size={16} /> Print</button>
        </div>
      </div>

      <div className="cause-list-header">
        <h2>IN THE DISTRICT COURT, AGRA</h2>
        <p>Before: Adv. Praveen Kumar Gupta</p>
        <p>Date: {format(new Date(date), 'dd MMMM yyyy')}</p>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : list.length === 0 ? (
        <div className="empty-state">No hearings on {format(new Date(date), 'dd MMM yyyy')}.</div>
      ) : (
        <table className="cases-table cause-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Case No.</th>
              <th>Title</th>
              <th>Client</th>
              <th>Court</th>
              <th>Time</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            {list.map((h, i) => (
              <tr key={h.hearing_id}>
                <td>{i + 1}</td>
                <td><code>{h.case_number}</code></td>
                <td>{h.title}</td>
                <td>{h.client_name}</td>
                <td>{h.court}</td>
                <td>{h.hearing_time}</td>
                <td>{h.purpose || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}