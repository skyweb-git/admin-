import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Phone, 
  Mail, 
  MessageSquare, 
  PhoneCall, 
  Send, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { updateLead } from '../../services/leadStorage';
import { STATUS_CONFIG } from '../LeadsTable';

export default function EmployeeLeadsQueue({ 
  leads, 
  currentUser, 
  onLogCall, 
  onSendEmail, 
  onSelectLead, 
  onRefresh 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('mine'); // 'mine' | 'all'
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        (lead.fullName && lead.fullName.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.toLowerCase().includes(q)) ||
        (lead.message && lead.message.toLowerCase().includes(q));

      const assignedId = lead.assignedToId || lead.assignedTo || '';
      const matchScope = scopeFilter === 'all' || assignedId === currentUser.id;
      const matchStatus = statusFilter === 'ALL' || lead.status === statusFilter;

      return matchQuery && matchScope && matchStatus;
    });
  }, [leads, searchQuery, scopeFilter, statusFilter, currentUser]);

  const handleStatusChange = async (e, leadId) => {
    e.stopPropagation();
    await updateLead(leadId, { status: e.target.value });
    if (onRefresh) onRefresh();
  };

  const getCleanPhone = (phoneStr) => {
    if (!phoneStr) return '';
    const clean = phoneStr.replace(/[^0-9]/g, '');
    return clean.length === 10 ? '91' + clean : clean;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Scope and Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search prospects in your calling desk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-group">
          {/* Scope Selector */}
          <div className="nav-tabs">
            <button
              type="button"
              className={`nav-tab-btn ${scopeFilter === 'mine' ? 'active' : ''}`}
              onClick={() => setScopeFilter('mine')}
            >
              <span>My Assigned Leads</span>
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${scopeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setScopeFilter('all')}
            >
              <span>All Leads Pool</span>
            </button>
          </div>

          {/* Status Filter */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-filter"
          >
            <option value="ALL">All Statuses</option>
            <option value="New">New Enquiries</option>
            <option value="Contacted">Contacted</option>
            <option value="Site Visit Scheduled">Site Visit Scheduled</option>
            <option value="Negotiation">In Negotiation</option>
            <option value="Converted">Converted</option>
          </select>
        </div>
      </div>

      {/* Queue Card */}
      <div className="table-card">
        <div className="table-header-meta">
          <div className="table-title">
            <PhoneCall size={18} className="text-cyan-400" />
            <span>Lead Calling &amp; Outreach Desk</span>
            <span className="table-badge-count">{filteredLeads.length} Prospects</span>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <UserCheck size={32} />
            </div>
            <h3 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>No leads in this queue</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Switch to "All Leads Pool" or adjust filters to pick new prospects.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Client Name &amp; Time</th>
                  <th>Contact Info</th>
                  <th>Villa Interest</th>
                  <th>Status</th>
                  <th>Calling &amp; Email Actions</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => {
                  const statusInfo = STATUS_CONFIG[lead.status] || { label: lead.status, className: 'status-new' };
                  const cleanPhone = getCleanPhone(lead.phone);
                  const whatsappMsg = encodeURIComponent(
                    `Hello ${lead.fullName || 'Sir/Madam'}, I am ${currentUser.name} from Maytri Ambhuja Luxury Villa Township. I'm reaching out regarding your villa enquiry.`
                  );

                  return (
                    <tr key={lead.id} onClick={() => onSelectLead(lead)}>
                      <td>
                        <div className="lead-client-info">
                          <span className="lead-client-name" style={{ color: '#0f172a', fontWeight: 700 }}>{lead.fullName}</span>
                          <span className="lead-client-date">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span style={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: 600 }}>{lead.phone}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{lead.email || 'No email'}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#0f766e', fontWeight: 600 }}>
                          {lead.unitInterest || 'Villa Township'}
                        </div>
                      </td>

                      <td>
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(e, lead.id)}
                            className={`select-filter ${statusInfo.className}`}
                            style={{ padding: '0.3rem 1.6rem 0.3rem 0.65rem', fontSize: '0.78rem', fontWeight: 600, borderRadius: '9999px' }}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Site Visit Scheduled">Site Visit</option>
                            <option value="Negotiation">Negotiation</option>
                            <option value="Converted">Converted</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </div>
                      </td>

                      <td>
                        <div className="quick-action-group" onClick={(e) => e.stopPropagation()}>
                          {/* Log Call Button */}
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            style={{ background: '#059669', borderColor: '#10b981', padding: '0.35rem 0.65rem' }}
                            onClick={() => onLogCall(lead)}
                            title="Log Call discussion & outcome"
                          >
                            <PhoneCall size={13} />
                            <span>Log Call</span>
                          </button>

                          {/* Send Email Button */}
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '0.35rem 0.65rem' }}
                            onClick={() => onSendEmail(lead)}
                            title="Send Marketing Brochure/Email"
                          >
                            <Mail size={13} className="text-amber-400" />
                            <span>Send Mail</span>
                          </button>

                          {/* WhatsApp */}
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${whatsappMsg}`}
                              target="_blank"
                              rel="noreferrer"
                              className="quick-action-btn whatsapp"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare size={14} />
                            </a>
                          )}
                        </div>
                      </td>

                      <td>
                        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
