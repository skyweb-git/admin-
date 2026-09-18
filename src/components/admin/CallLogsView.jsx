import React, { useState } from 'react';
import { 
  PhoneCall, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';

export default function CallLogsView({ callLogs, employees }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');

  const filteredCalls = callLogs.filter(call => {
    const q = searchQuery.toLowerCase();
    const matchQuery = (call.leadName && call.leadName.toLowerCase().includes(q)) ||
                       (call.employeeName && call.employeeName.toLowerCase().includes(q)) ||
                       (call.notes && call.notes.toLowerCase().includes(q)) ||
                       (call.leadPhone && call.leadPhone.includes(q));

    const matchEmployee = employeeFilter === 'ALL' || call.employeeId === employeeFilter;
    const matchOutcome = outcomeFilter === 'ALL' || call.outcome === outcomeFilter;

    return matchQuery && matchEmployee && matchOutcome;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by prospect name, telecaller, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-group">
          {/* Employee Filter */}
          <select 
            value={employeeFilter} 
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="select-filter"
          >
            <option value="ALL">All Staff Members</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>

          {/* Outcome Filter */}
          <select 
            value={outcomeFilter} 
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="select-filter"
          >
            <option value="ALL">All Call Outcomes</option>
            <option value="Connected - Interested">Connected - Interested</option>
            <option value="Site Visit Confirmed">Site Visit Confirmed</option>
            <option value="Callback Requested">Callback Requested</option>
            <option value="Ringing / No Answer">Ringing / No Answer</option>
            <option value="Not Interested">Not Interested</option>
          </select>
        </div>
      </div>

      {/* Calls Table Card */}
      <div className="table-card">
        <div className="table-header-meta">
          <div className="table-title">
            <PhoneCall size={18} className="text-emerald-600" />
            <span>Staff Call Records &amp; Discussion Logs</span>
            <span className="table-badge-count">{filteredCalls.length} Calls Completed</span>
          </div>
        </div>

        {filteredCalls.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <PhoneCall size={32} />
            </div>
            <h3 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>No call logs match your filter</h3>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Telecaller / Executive</th>
                  <th>Prospect Info</th>
                  <th>Call Outcome</th>
                  <th>Duration</th>
                  <th>Conversation Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalls.map(call => (
                  <tr key={call.id}>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600 }}>
                        {new Date(call.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>💼</span>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                            {call.employeeName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {call.employeeDept}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f766e', fontSize: '0.85rem' }}>
                          {call.leadName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {call.leadPhone}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`status-badge ${
                        call.outcome.includes('Site Visit') ? 'status-site-visit' :
                        call.outcome.includes('Interested') ? 'status-converted' :
                        call.outcome.includes('Callback') ? 'status-contacted' : 'status-lost'
                      }`}>
                        {call.outcome}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: 700 }}>
                        {call.duration}
                      </span>
                    </td>

                    <td style={{ maxWidth: '300px' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        "{call.notes || 'No call notes entered.'}"
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
