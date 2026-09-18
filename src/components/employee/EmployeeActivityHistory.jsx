import React, { useState } from 'react';
import { PhoneCall, Mail, Clock, CheckCircle2, FileText, Calendar } from 'lucide-react';

export default function EmployeeActivityHistory({ 
  currentUser, 
  callLogs, 
  emailLogs 
}) {
  const [activeSubTab, setActiveSubTab] = useState('calls'); // 'calls' | 'emails'

  const myCalls = callLogs.filter(c => c.employeeId === currentUser.id);
  const myEmails = emailLogs.filter(m => m.employeeId === currentUser.id);

  return (
    <div className="flex flex-col gap-6">
      {/* Sub tabs */}
      <div className="filter-bar">
        <div className="nav-tabs">
          <button
            type="button"
            className={`nav-tab-btn ${activeSubTab === 'calls' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('calls')}
          >
            <PhoneCall size={15} />
            <span>My Calls History ({myCalls.length})</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeSubTab === 'emails' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('emails')}
          >
            <Mail size={15} />
            <span>My Sent Emails ({myEmails.length})</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeSubTab === 'calls' ? (
        <div className="table-card">
          <div className="table-header-meta">
            <div className="table-title">
              <span>Your Calls Logged</span>
              <span className="table-badge-count">{myCalls.length} Calls</span>
            </div>
          </div>

          {myCalls.length === 0 ? (
            <div className="empty-state">
              <PhoneCall size={32} style={{ color: 'var(--text-muted)' }} />
              <h4 style={{ color: '#0f172a', marginTop: '0.5rem', fontWeight: 700 }}>No calls recorded yet today</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Use the "Log Call" button in your lead queue after connecting with clients.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Prospect</th>
                    <th>Outcome</th>
                    <th>Duration</th>
                    <th>Discussion Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {myCalls.map(c => (
                    <tr key={c.id}>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600 }}>
                          {new Date(c.timestamp).toLocaleTimeString()}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f766e', fontSize: '0.85rem' }}>
                          {c.leadName}
                        </div>
                      </td>
                      <td>
                        <span className="status-badge status-converted" style={{ fontSize: '0.75rem' }}>
                          {c.outcome}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: 700 }}>{c.duration}</span>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                          "{c.notes}"
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="table-card">
          <div className="table-header-meta">
            <div className="table-title">
              <span>Your Dispatched Marketing Emails</span>
              <span className="table-badge-count">{myEmails.length} Emails</span>
            </div>
          </div>

          {myEmails.length === 0 ? (
            <div className="empty-state">
              <Mail size={32} style={{ color: 'var(--text-muted)' }} />
              <h4 style={{ color: '#0f172a', marginTop: '0.5rem', fontWeight: 700 }}>No emails sent yet</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Use the "Send Mail" action in your leads queue to dispatch brochures and payment schedules.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Sent Time</th>
                    <th>Prospect / Recipient</th>
                    <th>Template Dispatched</th>
                    <th>Subject</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myEmails.map(m => (
                    <tr key={m.id}>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600 }}>
                          {new Date(m.sentAt).toLocaleTimeString()}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f766e', fontSize: '0.85rem' }}>
                          {m.leadName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {m.leadEmail}
                        </div>
                      </td>
                      <td>
                        <span className="brand-badge emp-badge" style={{ fontSize: '0.75rem' }}>
                          {m.templateType}
                        </span>
                      </td>
                      <td style={{ maxWidth: '280px', color: '#0f172a', fontSize: '0.85rem', fontWeight: 600 }}>
                        {m.subject}
                      </td>
                      <td>
                        <span className="status-badge status-converted" style={{ fontSize: '0.75rem' }}>
                          <CheckCircle2 size={12} />
                          <span>{m.status || 'Delivered'}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
