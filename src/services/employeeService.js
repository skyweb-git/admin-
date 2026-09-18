// Employee Management Service (White-Collar & Marketing Staff)

const EMPLOYEES_STORAGE_KEY = 'maytri_employees_db_v1';
const CHANNEL_NAME = 'maytri_leads_sync_channel';

const getApiBaseUrl = () => {
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

const API_BASE_URL = getApiBaseUrl();

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel error', e);
}

export function getEmployees() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load employees', e);
    return [];
  }
}

export async function fetchEmployeesFromAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/employees`);
    if (!res.ok) throw new Error('Failed to fetch employees from API');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(json.data));
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'EMPLOYEES_UPDATED', employees: json.data });
      }
      return json.data;
    }
  } catch (err) {
    console.warn('Employee API fetch failed, using local storage:', err.message);
  }
  return getEmployees();
}

export async function createEmployee(empData) {
  const current = getEmployees();
  const newEmp = {
    id: empData.id || ('emp-' + Date.now().toString(36)),
    name: empData.name || 'New Employee',
    email: (empData.email || '').trim().toLowerCase(),
    password: empData.password || 'welcome123',
    role: empData.role || 'employee',
    department: empData.department || 'Marketing & Sales',
    designation: empData.designation || 'Sales & Marketing Executive',
    phone: empData.phone || '',
    status: empData.status || 'Active',
    avatar: empData.avatar || (empData.role === 'admin' ? '👑' : '💼'),
    dailyCallTarget: Number(empData.dailyCallTarget) || 30,
    dailyEmailTarget: Number(empData.dailyEmailTarget) || 20,
    createdAt: new Date().toISOString()
  };

  const updated = [newEmp, ...current.filter(e => e.email !== newEmp.email)];
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(updated));

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'EMPLOYEES_UPDATED', employees: updated });
  }

  // Sync with MongoDB API
  try {
    await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmp)
    });
  } catch (err) {
    console.warn('Employee API save failed:', err.message);
  }

  return newEmp;
}

export async function updateEmployee(id, updates) {
  const current = getEmployees();
  const updated = current.map(emp => {
    if (emp.id === id || emp._id === id) {
      return { ...emp, ...updates, updatedAt: new Date().toISOString() };
    }
    return emp;
  });

  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(updated));
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'EMPLOYEES_UPDATED', employees: updated });
  }

  // Sync update with MongoDB API
  try {
    await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (err) {
    console.warn('Employee API update failed:', err.message);
  }

  return updated;
}

export async function deleteEmployee(id) {
  const current = getEmployees();
  const updated = current.filter(emp => emp.id !== id && emp._id !== id);
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(updated));
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'EMPLOYEES_UPDATED', employees: updated });
  }

  // Sync delete with MongoDB API
  try {
    await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Employee API delete failed:', err.message);
  }

  return updated;
}

export function subscribeToEmployees(callback) {
  if (!broadcastChannel) return () => {};

  const handler = (event) => {
    if (event.data && event.data.type === 'EMPLOYEES_UPDATED') {
      callback(event.data.employees);
    }
  };

  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel.removeEventListener('message', handler);
  };
}
