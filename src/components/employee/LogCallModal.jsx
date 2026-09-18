import React, { useState } from 'react';
import { PhoneCall, X, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { logCall } from '../../services/activityLogService';
import { updateLead } from '../../services/leadStorage';

export default function LogCallModal({ 
  lead, 
  currentUser, 
  onClose, 
  onSuccess 
}) {
  const [outcome, setOutcome] = useState('Connected - Interested');
  const [durationMin, setDurationMin] = useState('3');
  const [durationSec, setDurationSec] = useState('45');
  const [notes, setNotes] = useState('');
  const [updateLeadStatus, setUpdateLeadStatus] = useState(true);
  const [newStatus, setNewStatus] = useState('Contacted');

  if (!lead) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedDuration = `${durationMin} mins ${durationSec} secs`;
    const totalSec = Number(durationMin) * 60 + Number(durationSec);

    // 1. Log the call activity
    logCall({
      leadId: lead.id,
      leadName: lead.fullName,
      leadPhone: lead.phone,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeDept: currentUser.department,
      outcome,
      duration: formattedDuration,
      durationSec: totalSec,
      notes: notes.trim()
    });

    // 2. Optionally update lead pipeline status and internal notes
    if (updateLeadStatus) {
      updateLead(lead.id, {
        status: newStatus,
        notes: `Call Log (${currentUser.name}): ${notes.trim() || outcome}`,
        assignedToId: currentUser.id,
        assignedToName: currentUser.name
      });
    }

    if (onSuccess) onSuccess();
    onClose();
  };

  const handleOutcomeChange = (val) => {
    setOutcome(val);
    if (val === 'Site Visit Confirmed') setNewStatus('Site Visit Scheduled');
    else if (val === 'Connected - Interested') setNewStatus('Contacted');
    else if (val === 'Not Interested') setNewStatus('Lost');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PhoneCall size={20} className="text-emerald-400" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              Log Call: {lead.fullName}
            </h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Prospect Meta Box */}
            <div className="drawer-section" style={{ padding: '0.85rem' }}>
              <div className="drawer-field-row">
                <span className="drawer-field-label">Prospect:</span>
                <span className="drawer-field-val" style={{ color: 'var(--text-cyan)' }}>{lead.fullName}</span>
              </div>
              <div className="drawer-field-row">
                <span className="drawer-field-label">Phone:</span>
                <span className="drawer-field-val">{lead.phone}</span>
              </div>
              <div className="drawer-field-row">
                <span className="drawer-field-label">Telecaller:</span>
                <span className="drawer-field-val">{currentUser.name}</span>
              </div>
            </div>

            {/* Call Outcome */}
            <div className="form-group">
              <label className="form-label">Call Outcome / Result *</label>
              <select
                value={outcome}
                onChange={(e) => handleOutcomeChange(e.target.value)}
                className="form-select"
                required
              >
                <option value="Connected - Interested">Connected — Interested &amp; Qualified</option>
                <option value="Site Visit Confirmed">Connected — VIP Site Visit Scheduled</option>
                <option value="Callback Requested">Connected — Requested Callback Later</option>
                <option value="Ringing / No Answer">Ringing / No Answer / Switched Off</option>
                <option value="Not Interested">Not Interested / Budget Mismatch</option>
              </select>
            </div>

            {/* Call Duration */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Duration (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Duration (Seconds)</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationSec}
                  onChange={(e) => setDurationSec(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Update Lead Status */}
            <div className="form-group">
              <label className="form-label">Update Pipeline Status to:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="form-select"
              >
                <option value="New">New Enquiry</option>
                <option value="Contacted">Contacted</option>
                <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                <option value="Negotiation">In Negotiation</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Call Discussion Notes */}
            <div className="form-group">
              <label className="form-label">Conversation Discussion Notes *</label>
              <textarea
                required
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter key highlights from discussion, buyer preferences, scheduled visit timing..."
                className="form-textarea"
              />
            </div>
          </div>

          <div className="modal-header" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: 'none', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ background: '#16a34a', borderColor: '#22c55e' }}>
              <CheckCircle2 size={16} />
              <span>Record Call Completed</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
