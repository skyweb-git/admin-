import React, { useState } from 'react';
import { X, Plus, UserPlus, Phone, Mail, Building } from 'lucide-react';
import { saveLead } from '../services/leadStorage';

export default function AddLeadModal({ isOpen, onClose, onLeadAdded }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    preferredMethod: 'Phone',
    source: 'Walk-in / Direct Call',
    status: 'New',
    unitInterest: '300 SQ YD Villa',
    budget: '₹4.5 Cr - ₹5.5 Cr',
    message: '',
    notes: '',
    followUpDate: new Date().toISOString().split('T')[0]
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setError('Full Name and Phone Number are required.');
      return;
    }

    const newLead = saveLead(formData);
    if (onLeadAdded) onLeadAdded(newLead);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} className="text-cyan-400" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Add New Prospect</h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderRadius: '6px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Prospect Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Sridhar Varma"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="client@gmail.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Contact Method</label>
                <select
                  name="preferredMethod"
                  value={formData.preferredMethod}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Phone">Phone Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Enquiry Source</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Walk-in / Direct Call">Walk-in / Direct Call</option>
                  <option value="Website Enquiry">Website Enquiry</option>
                  <option value="Landing Page CTA Enquiry">Landing Page CTA</option>
                  <option value="Brochure Download">Brochure Download</option>
                  <option value="Direct WhatsApp CTA">Direct WhatsApp</option>
                  <option value="Referral">Client Referral</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="New">New Enquiry</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                  <option value="Negotiation">In Negotiation</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Villa Configuration</label>
                <select
                  name="unitInterest"
                  value={formData.unitInterest}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="300 SQ YD Villa (East Facing)">300 SQ YD Villa (East Facing)</option>
                  <option value="300 SQ YD Villa (West Facing)">300 SQ YD Villa (West Facing)</option>
                  <option value="222 SQ YD Villa (East Facing)">222 SQ YD Villa (East Facing)</option>
                  <option value="222 SQ YD Villa (West Facing)">222 SQ YD Villa (West Facing)</option>
                  <option value="Clubhouse & Community Info">Clubhouse & Community Info</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up Date</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Discussion Notes</label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Key requirements, customer background, preferred visit slot..."
                className="form-textarea"
              />
            </div>
          </div>

          <div className="modal-header" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: 'none', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              <span>Save Prospect</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
