import { getApiBaseUrl } from './authService';

const API_BASE_URL = getApiBaseUrl();
const CURRENT_SESSION_ID_KEY = 'maytri_current_session_id_v1';

let heartbeatTimer = null;
let lastInteractionTime = Date.now();
let isUserActive = true;

// Helper to track activity interactions
function setupActivityListeners() {
  if (typeof window === 'undefined') return;

  const markActive = () => {
    lastInteractionTime = Date.now();
    isUserActive = true;
  };

  window.addEventListener('mousemove', markActive, { passive: true });
  window.addEventListener('keydown', markActive, { passive: true });
  window.addEventListener('click', markActive, { passive: true });
  window.addEventListener('scroll', markActive, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isUserActive = false;
    } else {
      markActive();
    }
  });
}

/**
 * Start Employee Session on Login
 */
export async function startEmployeeSession(user) {
  if (!user || !user.email) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/sessions/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: user.id || user._id,
        employeeEmail: user.email,
        employeeName: user.name,
        role: user.role
      })
    });

    const json = await res.json();
    if (json.success && json.data?.sessionId) {
      const sessionId = json.data.sessionId;
      localStorage.setItem(CURRENT_SESSION_ID_KEY, sessionId);

      setupActivityListeners();
      startHeartbeat(sessionId);
      return sessionId;
    }
  } catch (err) {
    console.warn('Session start error:', err.message);
  }
  return null;
}

/**
 * Periodically send screen activity heartbeat (every 30 seconds)
 */
function startHeartbeat(sessionId) {
  if (heartbeatTimer) clearInterval(heartbeatTimer);

  heartbeatTimer = setInterval(async () => {
    // If no mouse/keyboard interaction for > 3 minutes, mark as idle
    const timeSinceInteraction = Date.now() - lastInteractionTime;
    const active = isUserActive && timeSinceInteraction < 3 * 60 * 1000 && !document.hidden;

    try {
      await fetch(`${API_BASE_URL}/sessions/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          isActive: active,
          activeDeltaSeconds: 30
        })
      });
    } catch (err) {
      console.warn('Heartbeat error:', err.message);
    }
  }, 30000);
}

/**
 * Stop session on Logout
 */
export async function stopEmployeeSession(userEmail) {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  const sessionId = localStorage.getItem(CURRENT_SESSION_ID_KEY);

  try {
    await fetch(`${API_BASE_URL}/sessions/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        employeeEmail: userEmail
      })
    });
  } catch (err) {
    console.warn('Session stop error:', err.message);
  } finally {
    localStorage.removeItem(CURRENT_SESSION_ID_KEY);
  }
}

/**
 * Fetch Centralized Time & Activity Monitoring Data for Managers
 */
export async function fetchCentralizedMonitoringData(dateStr = '') {
  try {
    const url = dateStr 
      ? `${API_BASE_URL}/sessions/monitoring?date=${dateStr}` 
      : `${API_BASE_URL}/sessions/monitoring`;
      
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch monitoring data');
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn('Centralized monitoring fetch failed:', err.message);
    return null;
  }
}

/**
 * Fetch Session History Audit Log for a Specific Employee
 */
export async function fetchEmployeeSessionAudit(employeeId) {
  try {
    const res = await fetch(`${API_BASE_URL}/sessions/employee/${employeeId}`);
    if (!res.ok) throw new Error('Failed to fetch employee sessions');
    return await res.json();
  } catch (err) {
    console.warn('Employee session audit fetch failed:', err.message);
    return { success: false, data: [] };
  }
}
