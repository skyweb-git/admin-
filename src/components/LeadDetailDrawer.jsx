import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Check, 
  Save,
  Building2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { updateLead, deleteLead } from '../services/leadStorage';
import { STATUS_CONFIG } from './LeadsTable';

export default function LeadDetailDrawer({ 
  lead, 
  employees = [],
  onClose, 
  onRefresh 
}) {
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    followUpDate: '',
    unitInterest: '',
    budget: '',
    assignedToId: '',
    assignedToName: ''
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        status: lead.status || 'New',
        notes: lead.notes || '',
        followUpDate: lead.followUpDate || '',
        unitInterest: lead.unitInterest || '300 SQ YD Villa',
        budget: lead.budget || '₹3.8 Cr - ₹5.5 Cr',
        assignedToId: lead.assignedToId || lead.assignedTo || '',
        assignedToName: lead.assignedToName || lead.assignedEmployeeName || ''
      });
      setIsSaved(false);
    }
  }, [lead]);

  if (!lead) return null;

  const handleSave = () => {
    updateLead(lead.id, formData);
    setIsSaved(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    const emp = employees.find(x => x.id === empId);
    setFormData(prev => ({
      ...prev,
      assignedToId: empId,
      assignedToName: emp ? emp.name : 'Unassigned'
    }));
  };

  const handleDelete = () => {
    if (window.confirm(`Delete lead "${lead.fullName}"?`)) {
      deleteLead(lead.id);
      if (onRefresh) onRefresh();
      onClose();
    }
  };

  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
  const whatsappMsg = encodeURIComponent(
    `Hello ${lead.fullName || 'Sir/Madam'}, greeting from Sanghi City Luxury Villa Township, Hyderabad. We would love to assist you with the villa floor plans and site visit details.`
  );

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} className="text-cyan-400" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                {lead.fullName || 'Prospect Profile'}
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Lead ID: {lead.id} • Added {new Date(lead.createdAt).toLocaleString()}
            </p>
          </div>

          <button 
            className="btn btn-secondary btn-icon"
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="drawer-body">
          {/* Quick Communication Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {formattedPhone ? (
              <a
                href={`https://wa.me/${formattedPhone}?text=${whatsappMsg}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ background: '#16a34a', borderColor: '#22c55e' }}
              >
                <MessageSquare size={16} />
                <span>WhatsApp Chat</span>
              </a>
            ) : null}

            {lead.phone ? (
              <a
                href={`tel:${lead.phone}`}
                className="btn btn-secondary"
              >
                <Phone size={16} className="text-cyan-400" />
                <span>Direct Call</span>
              </a>
            ) : null}
          </div>

          {/* Pipeline & Status Section */}
          <div className="drawer-section">
            <span className="drawer-section-title">Lead Stage &amp; Pipeline</span>

            <div className="form-group">
              <label className="form-label">Current Pipeline Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="form-select"
              >
                <option value="New">New Enquiry</option>
                <option value="Contacted">Contacted</option>
                <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                <option value="Negotiation">In Negotiation</option>
                <option value="Converted">Converted / Won</option>
                <option value="Lost">Lost / Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Sales Specialist</label>
              <select
                value={formData.assignedToId}
                onChange={handleEmployeeChange}
                className="form-select"
              >
                <option value="">Unassigned</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Next Follow-up Date</label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          {/* Contact & Enquiry Details */}
          <div className="drawer-section">
            <span className="drawer-section-title">Contact &amp; Interest Details</span>

            <div className="drawer-field-row">
              <span className="drawer-field-label">Phone:</span>
              <span className="drawer-field-val">{lead.phone || 'N/A'}</span>
            </div>

            <div className="drawer-field-row">
              <span className="drawer-field-label">Email:</span>
              <span className="drawer-field-val">{lead.email || 'N/A'}</span>
            </div>

            <div className="drawer-field-row">
              <span className="drawer-field-label">Preferred Channel:</span>
              <span className="drawer-field-val">{lead.preferredMethod || 'Phone'}</span>
            </div>

            <div className="drawer-field-row">
              <span className="drawer-field-label">Acquisition Source:</span>
              <span className="drawer-field-val">{lead.source || 'Website'}</span>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">Villa Configuration Preference</label>
              <input
                type="text"
                value={formData.unitInterest}
                onChange={(e) => setFormData(prev => ({ ...prev, unitInterest: e.target.value }))}
                placeholder="e.g. 300 SQ YD East Facing 4BHK"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Budget Range</label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="e.g. ₹4.5 Cr - ₹5.5 Cr"
                className="form-input"
              />
            </div>
          </div>

          {/* Client Query Message */}
          {lead.message && (
            <div className="drawer-section">
              <span className="drawer-section-title">Client Message / Query</span>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                "{lead.message}"
              </p>
            </div>
          )}

          {/* Internal Sales Notes */}
          <div className="drawer-section">
            <span className="drawer-section-title">Internal CRM Notes &amp; Activity Log</span>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Record call discussion notes, site visit timing, customer feedback..."
              className="drawer-textarea"
            />
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleSave}
            >
              {isSaved ? <Check size={16} /> : <Save size={16} />}
              <span>{isSaved ? 'Changes Saved!' : 'Save Lead Updates'}</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleDelete}
              style={{ color: '#f87171' }}
              title="Delete lead permanently"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
