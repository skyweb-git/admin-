// Lead Storage Service with localStorage, Employee Assignment and BroadcastChannel Sync

const STORAGE_KEY = 'maytri_realestate_leads_db_v1';
const CHANNEL_NAME = 'maytri_leads_sync_channel';

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  const envUrl = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 
                 (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL);
  if (envUrl) {
    const clean = envUrl.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return 'https://api.sanghicity.in/api';
};

export const API_BASE_URL = getApiBaseUrl();

const INITIAL_SAMPLE_LEADS = [];

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (err) {
  console.warn('BroadcastChannel not supported', err);
}
const MOCK_NAMES = [
  "Rajesh Kumar Verma",
  "Dr. Snigdha Reddy",
  "Venkata Satyanarayana",
  "Ananya & Rohit Sharma",
  "K. S. Rao"
];

function isMockLead(lead) {
  if (!lead) return false;
  if (['lead-1001', 'lead-1002', 'lead-1003', 'lead-1004', 'lead-1005'].includes(lead.id)) return true;
  if (MOCK_NAMES.includes(lead.fullName)) return true;
  if (['+91 98490 12345', '+91 98855 67890', '+91 94401 88990', '+91 97000 45612', '+91 99890 22334'].includes(lead.phone)) return true;
  return false;
}

export function getLeads() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter(l => !isMockLead(l));
      if (filtered.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
      return filtered;
    }
    return [];
  } catch (e) {
    console.error('Failed to load leads from localStorage', e);
    return [];
  }
}

export async function saveLead(leadInput) {
  const currentLeads = getLeads();
  const assignedId = leadInput.assignedToId || leadInput.assignedTo || '';
  const assignedName = leadInput.assignedToName || leadInput.assignedEmployeeName || (assignedId ? 'Assigned' : 'Unassigned');

  const newLead = {
    id: leadInput.id || ('lead-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6)),
    fullName: leadInput.fullName || 'Anonymous Prospect',
    phone: leadInput.phone || '',
    email: leadInput.email || '',
    preferredMethod: leadInput.preferredMethod || 'Phone',
    source: leadInput.source || 'Admin Manual Entry',
    message: leadInput.message || '',
    status: leadInput.status || 'New',
    unitInterest: leadInput.unitInterest || 'Villa Enquiry',
    budget: leadInput.budget || '₹3.8 Cr - ₹5.5 Cr',
    assignedToId: assignedId,
    assignedToName: assignedName,
    assignedTo: assignedId,
    assignedEmployeeName: assignedName,
    createdAt: new Date().toISOString(),
    notes: leadInput.notes || 'Created in CRM.',
    followUpDate: leadInput.followUpDate || new Date().toISOString().split('T')[0],
  };

  const updatedLeads = [newLead, ...currentLeads];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'LEADS_UPDATED', leads: updatedLeads, newLead });
    }
  } catch (e) {
    console.error('Error saving lead to storage', e);
  }

  // Sync with MongoDB API and wait for result
  try {
    await syncLeadToAPI(newLead);
  } catch (err) {
    console.warn('API lead save sync failed:', err);
  }

  return newLead;
}

export async function updateLead(leadId, updates) {
  const currentLeads = getLeads();
  const normalizedUpdates = { ...updates };

  if (normalizedUpdates.assignedToId !== undefined) {
    normalizedUpdates.assignedTo = normalizedUpdates.assignedToId;
  }
  if (normalizedUpdates.assignedToName !== undefined) {
    normalizedUpdates.assignedEmployeeName = normalizedUpdates.assignedToName;
  }
  if (normalizedUpdates.assignedTo !== undefined) {
    normalizedUpdates.assignedToId = normalizedUpdates.assignedTo;
  }
  if (normalizedUpdates.assignedEmployeeName !== undefined) {
    normalizedUpdates.assignedToName = normalizedUpdates.assignedEmployeeName;
  }

  const updatedLeads = currentLeads.map(lead => {
    if (lead.id === leadId) {
      return { ...lead, ...normalizedUpdates, updatedAt: new Date().toISOString() };
    }
    return lead;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'LEADS_UPDATED', leads: updatedLeads });
    }
  } catch (e) {
    console.error('Error updating lead in storage', e);
  }

  // Sync update with MongoDB API and wait for completion to avoid race conditions
  try {
    await updateLeadOnAPI(leadId, normalizedUpdates);
  } catch (err) {
    console.warn('API update failed:', err);
  }

  return updatedLeads;
}

export async function assignLeadToEmployee(leadId, employeeId, employeeName) {
  return await updateLead(leadId, {
    assignedToId: employeeId,
    assignedToName: employeeName,
    assignedTo: employeeId,
    assignedEmployeeName: employeeName,
    notes: `Assigned to ${employeeName} on ${new Date().toLocaleDateString()}`
  });
}

export async function deleteLead(leadId) {
  const currentLeads = getLeads();
  const updatedLeads = currentLeads.filter(lead => lead.id !== leadId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'LEADS_UPDATED', leads: updatedLeads });
    }
  } catch (e) {
    console.error('Error deleting lead', e);
  }

  // Sync delete with MongoDB API
  try {
    await deleteLeadOnAPI(leadId);
  } catch (err) {
    console.warn('API delete failed:', err);
  }

  return updatedLeads;
}

export function resetToDefaults() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_LEADS));
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'LEADS_UPDATED', leads: INITIAL_SAMPLE_LEADS });
  }
  return INITIAL_SAMPLE_LEADS;
}

export function subscribeToLeads(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleBroadcast = (event) => {
    if (event.data && event.data.type === 'LEADS_UPDATED') {
      callback(event.data.leads || getLeads());
    }
  };

  const handleStorageEvent = (event) => {
    if (event.key === STORAGE_KEY) {
      callback(getLeads());
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorageEvent);
  };
}

export function exportLeadsToCSV(leads) {
  if (!leads || !leads.length) return;
  const headers = ['Lead ID', 'Full Name', 'Phone', 'Email', 'Assigned Specialist', 'Preferred Contact', 'Status', 'Unit Interest', 'Source', 'Submission Date', 'Follow Up', 'Message', 'Notes'];
  const rows = leads.map(l => [
    `"${l.id}"`,
    `"${(l.fullName || '').replace(/"/g, '""')}"`,
    `"${(l.phone || '').replace(/"/g, '""')}"`,
    `"${(l.email || '').replace(/"/g, '""')}"`,
    `"${(l.assignedToName || 'Unassigned').replace(/"/g, '""')}"`,
    `"${(l.preferredMethod || '').replace(/"/g, '""')}"`,
    `"${(l.status || '').replace(/"/g, '""')}"`,
    `"${(l.unitInterest || '').replace(/"/g, '""')}"`,
    `"${(l.source || '').replace(/"/g, '""')}"`,
    `"${new Date(l.createdAt).toLocaleString()}"`,
    `"${l.followUpDate || ''}"`,
    `"${(l.message || '').replace(/"/g, '""')}"`,
    `"${(l.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `maytri_leads_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------------- MongoDB Online Cloud API Helpers ----------------
export async function fetchLeadsFromAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/leads`);
    if (!res.ok) throw new Error('API fetch failed');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const normalized = json.data.filter(l => !isMockLead(l)).map(l => {
        const assignedId = l.assignedToId || l.assignedTo || '';
        const assignedName = l.assignedToName || l.assignedEmployeeName || (assignedId ? 'Assigned' : 'Unassigned');
        return {
          ...l,
          assignedToId: assignedId,
          assignedToName: assignedName,
          assignedTo: assignedId,
          assignedEmployeeName: assignedName
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    }
  } catch (err) {
    console.warn('Could not sync leads from MongoDB API, using local storage:', err.message);
  }
  return getLeads();
}

export async function syncLeadToAPI(leadData) {
  try {
    const res = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    return await res.json();
  } catch (err) {
    console.warn('API lead save failed, stored locally:', err.message);
    return null;
  }
}

export async function updateLeadOnAPI(leadId, updates) {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await res.json();
  } catch (err) {
    console.warn('API lead update failed:', err.message);
    return null;
  }
}

export async function deleteLeadOnAPI(leadId) {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (err) {
    console.warn('API lead delete failed:', err.message);
    return null;
  }
}
