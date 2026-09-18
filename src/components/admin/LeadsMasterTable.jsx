import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Phone, 
  MessageSquare, 
  Mail, 
  Trash2, 
  UserCheck, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { updateLead, assignLeadToEmployee, deleteLead } from '../../services/leadStorage';
import { STATUS_CONFIG } from '../LeadsTable';

export default function LeadsMasterTable({ 
  leads, 
  employees, 
  onSelectLead, 
  onRefresh 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [assignedFilter, setAssignedFilter] = useState('ALL');

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        (lead.fullName && lead.fullName.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.message && lead.message.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'ALL' || lead.status === statusFilter;
      const assignedId = lead.assignedToId || lead.assignedTo || '';
      const matchAssigned = assignedFilter === 'ALL' || assignedId === assignedFilter;

      return matchQuery && matchStatus && matchAssigned;
    });
  }, [leads, searchQuery, statusFilter, assignedFilter]);

  const handleAssignChange = async (e, leadId) => {
    e.stopPropagation();
    const empId = e.target.value;
    const emp = employees.find(x => x.id === empId);
    if (emp) {
      await assignLeadToEmployee(leadId, emp.id, emp.name);
    } else {
      await updateLead(leadId, { 
        assignedToId: '', 
        assignedToName: 'Unassigned',
        assignedTo: '',
        assignedEmployeeName: 'Unassigned'
      });
    }
    if (onRefresh) onRefresh();
  };

  const handleStatusChange = async (e, leadId) => {
    e.stopPropagation();
    await updateLead(leadId, { status: e.target.value });
    if (onRefresh) onRefresh();
  };

  const handleDelete = async (e, leadId, name) => {
    e.stopPropagation();
    if (window.confirm(`Delete lead "${name || 'Prospect'}" permanently?`)) {
      await deleteLead(leadId);
      if (onRefresh) onRefresh();
    }
  };

  const getCleanPhone = (phoneStr) => {
    if (!phoneStr) return '';
    const clean = phoneStr.replace(/[^0-9]/g, '');
    return clean.length === 10 ? '91' + clean : clean;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Filters */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search prospects by name, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-group">
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
            <option value="Converted">Converted / Won</option>
            <option value="Lost">Lost</option>
          </select>

          {/* Assigned Staff Filter */}
          <select 
            value={assignedFilter} 
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="select-filter"
          >
            <option value="ALL">All Assigned Staff</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        <div className="table-header-meta">
          <div className="table-title">
            <span>Master Leads Database</span>
            <span className="table-badge-count">{filteredLeads.length} Records</span>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <AlertCircle size={32} />
            </div>
            <h3 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>No leads match your criteria</h3>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Client / Date</th>
                  <th>Contact Info</th>
                  <th>Assigned Specialist</th>
                  <th>Pipeline Status</th>
                  <th>Follow Up</th>
                  <th>Direct Actions</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => {
                  const statusInfo = STATUS_CONFIG[lead.status] || { label: lead.status, className: 'status-new' };
                  const cleanPhone = getCleanPhone(lead.phone);
                  const whatsappMessage = encodeURIComponent(
                    `Hello ${lead.fullName || 'Sir/Madam'}, greeting from Sanghi City Executive Desk. We received your villa enquiry.`
                  );

                  return (
                    <tr 
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                    >
                      <td>
                        <div className="lead-client-info">
                          <span className="lead-client-name">{lead.fullName || 'Anonymous Prospect'}</span>
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
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.assignedToId || lead.assignedTo || ''}
                            onChange={(e) => handleAssignChange(e, lead.id)}
                            className="select-filter"
                            style={{ padding: '0.35rem 1.6rem 0.35rem 0.65rem', fontSize: '0.8rem' }}
                          >
                            <option value="">Unassigned</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                          </select>
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
                            <option value="New">New Enquiry</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                            <option value="Negotiation">In Negotiation</option>
                            <option value="Converted">Converted</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.8rem', color: lead.followUpDate ? '#fbbf24' : 'var(--text-muted)' }}>
                          {lead.followUpDate || 'Not set'}
                        </span>
                      </td>

                      <td>
                        <div className="quick-action-group" onClick={(e) => e.stopPropagation()}>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
                              target="_blank"
                              rel="noreferrer"
                              className="quick-action-btn whatsapp"
                              title="WhatsApp Chat"
                            >
                              <MessageSquare size={14} />
                            </a>
                          )}

                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="quick-action-btn call"
                              title="Call"
                            >
                              <Phone size={14} />
                            </a>
                          )}

                          <button
                            className="quick-action-btn delete"
                            onClick={(e) => handleDelete(e, lead.id, lead.fullName)}
                            title="Delete Lead"
                          >
                            <Trash2 size={14} />
                          </button>
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
