import React, { useState } from 'react';
import { 
  Mail, 
  Search, 
  Filter, 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Eye
} from 'lucide-react';

export default function EmailLogsView({ emailLogs, employees }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('ALL');
  const [selectedMail, setSelectedMail] = useState(null);

  const filteredMails = emailLogs.filter(mail => {
    const q = searchQuery.toLowerCase();
    const matchQuery = (mail.leadName && mail.leadName.toLowerCase().includes(q)) ||
                       (mail.leadEmail && mail.leadEmail.toLowerCase().includes(q)) ||
                       (mail.employeeName && mail.employeeName.toLowerCase().includes(q)) ||
                       (mail.subject && mail.subject.toLowerCase().includes(q)) ||
                       (mail.templateType && mail.templateType.toLowerCase().includes(q));

    const matchEmployee = employeeFilter === 'ALL' || mail.employeeId === employeeFilter;
    return matchQuery && matchEmployee;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search emails by recipient, sender, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-group">
          <select 
            value={employeeFilter} 
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="select-filter"
          >
            <option value="ALL">All Marketing Executives</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Email Dispatches Table Card */}
      <div className="table-card">
        <div className="table-header-meta">
          <div className="table-title">
            <Mail size={18} className="text-amber-500" />
            <span>Marketing Email Dispatches &amp; Client Kits</span>
            <span className="table-badge-count">{filteredMails.length} Dispatched</span>
          </div>
        </div>

        {filteredMails.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Mail size={32} />
            </div>
            <h3 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>No email dispatches found</h3>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Dispatch Time</th>
                  <th>Sent By</th>
                  <th>Recipient / Prospect</th>
                  <th>Template Category</th>
                  <th>Email Subject</th>
                  <th>Delivery Status</th>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
                {filteredMails.map(mail => (
                  <tr key={mail.id} onClick={() => setSelectedMail(mail)}>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600 }}>
                        {new Date(mail.sentAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                        {mail.employeeName}
                      </div>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f766e', fontSize: '0.85rem' }}>
                          {mail.leadName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {mail.leadEmail}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="brand-badge emp-badge" style={{ fontSize: '0.72rem' }}>
                        {mail.templateType}
                      </span>
                    </td>

                    <td style={{ maxWidth: '280px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {mail.subject}
                      </div>
                    </td>

                    <td>
                      <span className="status-badge status-converted" style={{ fontSize: '0.75rem' }}>
                        <CheckCircle2 size={12} />
                        <span>{mail.status || 'Delivered'}</span>
                      </span>
                    </td>

                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMail(mail);
                        }}
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email Preview Modal */}
      {selectedMail && (
        <div className="modal-overlay" onClick={() => setSelectedMail(null)}>
          <div className="modal-dialog" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={18} className="text-amber-500" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Email Dispatch Details</h3>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setSelectedMail(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="drawer-section">
                <div className="drawer-field-row">
                  <span className="drawer-field-label">Recipient:</span>
                  <span className="drawer-field-val">{selectedMail.leadName} &lt;{selectedMail.leadEmail}&gt;</span>
                </div>
                <div className="drawer-field-row">
                  <span className="drawer-field-label">Dispatched By:</span>
                  <span className="drawer-field-val">{selectedMail.employeeName}</span>
                </div>
                <div className="drawer-field-row">
                  <span className="drawer-field-label">Template Type:</span>
                  <span className="drawer-field-val">{selectedMail.templateType}</span>
                </div>
                <div className="drawer-field-row">
                  <span className="drawer-field-label">Sent At:</span>
                  <span className="drawer-field-val">{new Date(selectedMail.sentAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="drawer-section">
                <span className="drawer-section-title">Subject Line</span>
                <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem' }}>
                  {selectedMail.subject}
                </p>
              </div>

              <div className="drawer-section">
                <span className="drawer-section-title">Email Body Content</span>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#334155', fontSize: '0.85rem', lineHeight: '1.6', background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '6px' }}>
                  {selectedMail.body || selectedMail.preview}
                </pre>
              </div>
            </div>

            <div className="modal-header" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: 'none', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedMail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
