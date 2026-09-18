import React, { useState, useEffect } from 'react';
import { Mail, Send, X, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { EMAIL_TEMPLATES, logEmail } from '../../services/activityLogService';
import { updateLead } from '../../services/leadStorage';

export default function SendEmailModal({ 
  lead, 
  currentUser, 
  onClose, 
  onSuccess 
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('tpl-brochure');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (lead) {
      const tpl = EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId) || EMAIL_TEMPLATES[0];
      setSubject(tpl.subject(lead.fullName));
      setBody(tpl.body(lead.fullName, lead.unitInterest));
    }
  }, [lead, selectedTemplateId]);

  if (!lead) return null;

  const handleTemplateChange = (tplId) => {
    setSelectedTemplateId(tplId);
    const tpl = EMAIL_TEMPLATES.find(t => t.id === tplId);
    if (tpl) {
      setSubject(tpl.subject(lead.fullName));
      setBody(tpl.body(lead.fullName, lead.unitInterest));
    }
  };

  const handleSend = (e) => {
    e.preventDefault();

    const tpl = EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId);
    const templateTitle = tpl ? tpl.title : 'Custom Message';

    // 1. Log the email activity
    logEmail({
      leadId: lead.id,
      leadName: lead.fullName,
      leadEmail: lead.email || `${lead.fullName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      templateType: templateTitle,
      subject,
      body,
      preview: body.substring(0, 100) + '...'
    });

    // 2. Add note to lead
    updateLead(lead.id, {
      notes: `Email Sent (${currentUser.name}): ${templateTitle}`,
      assignedToId: currentUser.id,
      assignedToName: currentUser.name
    });

    setIsSent(true);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={20} className="text-amber-400" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              Send Marketing Email / Kit
            </h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSend}>
          <div className="modal-body">
            {/* Recipient meta */}
            <div className="drawer-section" style={{ padding: '0.85rem' }}>
              <div className="drawer-field-row">
                <span className="drawer-field-label">To:</span>
                <span className="drawer-field-val" style={{ color: 'var(--text-cyan)' }}>
                  {lead.fullName} ({lead.email || 'Email will be dispatched to client'})
                </span>
              </div>
              <div className="drawer-field-row">
                <span className="drawer-field-label">From Specialist:</span>
                <span className="drawer-field-val">{currentUser.name} ({currentUser.email})</span>
              </div>
            </div>

            {/* Template Selector */}
            <div className="form-group">
              <label className="form-label">Select Marketing Email Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="form-select"
              >
                {EMAIL_TEMPLATES.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>{tpl.title}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="form-group">
              <label className="form-label">Email Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Body */}
            <div className="form-group">
              <label className="form-label">Email Content (Customizable)</label>
              <textarea
                required
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="form-textarea"
                style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
              />
            </div>
          </div>

          <div className="modal-header" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: 'none', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ background: '#d97706', borderColor: '#f59e0b' }} disabled={isSent}>
              {isSent ? <CheckCircle2 size={16} /> : <Send size={16} />}
              <span>{isSent ? 'Email Dispatched!' : 'Dispatch Email'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
