import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Phone, 
  MessageSquare, 
  Mail, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Eye, 
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { updateLead, deleteLead } from '../services/leadStorage';

export const STATUS_CONFIG = {
  'New': { label: 'New Enquiry', className: 'status-new' },
  'Contacted': { label: 'Contacted', className: 'status-contacted' },
  'Site Visit Scheduled': { label: 'Site Visit', className: 'status-site-visit' },
  'Negotiation': { label: 'In Negotiation', className: 'status-negotiation' },
  'Converted': { label: 'Converted / Won', className: 'status-converted' },
  'Lost': { label: 'Lost / Closed', className: 'status-lost' },
};

export default function LeadsTable({ 
  leads, 
  onSelectLead, 
  onRefresh 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        (lead.fullName && lead.fullName.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.message && lead.message.toLowerCase().includes(q)) ||
        (lead.unitInterest && lead.unitInterest.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'ALL' || lead.status === statusFilter;
      const matchSource = sourceFilter === 'ALL' || lead.source === sourceFilter;
      const matchMethod = methodFilter === 'ALL' || lead.preferredMethod === methodFilter;

      return matchQuery && matchStatus && matchSource && matchMethod;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'name') return (a.fullName || '').localeCompare(b.fullName || '');
      return 0;
    });
  }, [leads, searchQuery, statusFilter, sourceFilter, methodFilter, sortBy]);

  const handleStatusChange = (e, leadId) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    updateLead(leadId, { status: newStatus });
    if (onRefresh) onRefresh();
  };

  const handleDelete = (e, leadId, name) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the enquiry from "${name || 'this prospect'}"?`)) {
      deleteLead(leadId);
      if (onRefresh) onRefresh();
    }
  };

  const getCleanPhone = (phoneStr) => {
    if (!phoneStr) return '';
    const clean = phoneStr.replace(/[^0-9]/g, '');
    if (clean.length === 10) return '91' + clean;
    return clean;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filter Controls */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by prospect name, phone, email, notes..."
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
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>

          {/* Source Filter */}
          <select 
            value={sourceFilter} 
            onChange={(e) => setSourceFilter(e.target.value)}
            className="select-filter"
          >
            <option value="ALL">All Sources</option>
            <option value="Website Enquiry">Website Enquiry</option>
            <option value="Landing Page CTA Enquiry">Landing Page CTA</option>
            <option value="Brochure Download">Brochure Download</option>
            <option value="Direct WhatsApp CTA">Direct WhatsApp</option>
            <option value="Admin Manual Entry">Manual Entry</option>
          </select>

          {/* Contact Method */}
          <select 
            value={methodFilter} 
            onChange={(e) => setMethodFilter(e.target.value)}
            className="select-filter"
          >
            <option value="ALL">All Contact Prefs</option>
            <option value="Phone">Phone</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
          </select>

          {/* Sort By */}
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="select-filter"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="table-card">
        <div className="table-header-meta">
          <div className="table-title">
            <span>Enquiries &amp; Leads</span>
            <span className="table-badge-count">{filteredLeads.length} of {leads.length} Records</span>
          </div>

          {(searchQuery || statusFilter !== 'ALL' || sourceFilter !== 'ALL' || methodFilter !== 'ALL') && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setSourceFilter('ALL');
                setMethodFilter('ALL');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {filteredLeads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <AlertCircle size={32} />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>No enquiries match your search criteria</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Try adjusting your search keywords or reset the filters to see all prospects.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Client / Date</th>
                  <th>Contact Info</th>
                  <th>Interest &amp; Source</th>
                  <th>Status Pipeline</th>
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
                    `Hello ${lead.fullName || 'Sir/Madam'}, greeting from Sanghi City Sales Advisory. We received your villa enquiry. How can we assist you today?`
                  );

                  return (
                    <tr 
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                    >
                      {/* Client Name & Time */}
                      <td>
                        <div className="lead-client-info">
                          <span className="lead-client-name">{lead.fullName || 'Anonymous Prospect'}</span>
                          <span className="lead-client-date">
                            {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {lead.phone && (
                            <a 
                              href={`tel:${lead.phone}`} 
                              className="contact-pill-link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone size={12} className="text-cyan-400" />
                              <span>{lead.phone}</span>
                            </a>
                          )}
                          {lead.email && (
                            <a 
                              href={`mailto:${lead.email}`} 
                              className="contact-pill-link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Mail size={12} className="text-amber-400" />
                              <span>{lead.email}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Interest & Source */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>
                            {lead.unitInterest || 'Villa Township'}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            Source: {lead.source || 'Website'}
                          </span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td>
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(e, lead.id)}
                            className={`select-filter ${statusInfo.className}`}
                            style={{ 
                              padding: '0.3rem 1.6rem 0.3rem 0.65rem',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              borderRadius: '9999px'
                            }}
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

                      {/* Follow Up Date */}
                      <td>
                        <span style={{ fontSize: '0.8rem', color: lead.followUpDate ? '#fbbf24' : 'var(--text-muted)' }}>
                          {lead.followUpDate || 'Not set'}
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td>
                        <div className="quick-action-group" onClick={(e) => e.stopPropagation()}>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
                              target="_blank"
                              rel="noreferrer"
                              className="quick-action-btn whatsapp"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare size={15} />
                            </a>
                          )}

                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="quick-action-btn call"
                              title="Direct Phone Call"
                            >
                              <Phone size={14} />
                            </a>
                          )}

                          <button
                            className="quick-action-btn delete"
                            onClick={(e) => handleDelete(e, lead.id, lead.fullName)}
                            title="Delete Enquiry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                      {/* View Drawer Arrow */}
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
