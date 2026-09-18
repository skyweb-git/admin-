import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LoginView from './components/LoginView';
import DashboardView from './components/admin/DashboardView';
import LeadsHubView from './components/admin/LeadsHubView';
import EmployeeManagement from './components/admin/EmployeeManagement';
import WebsiteCmsView from './components/admin/WebsiteCmsView';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import LeadDetailDrawer from './components/LeadDetailDrawer';
import AddLeadModal from './components/AddLeadModal';

import { getCurrentSession, logoutUser } from './services/authService';
import { getEmployees, fetchEmployeesFromAPI } from './services/employeeService';
import { getCallLogs, getEmailLogs, fetchCallLogsFromAPI, fetchEmailLogsFromAPI } from './services/activityLogService';
import { getLeads, fetchLeadsFromAPI, subscribeToLeads } from './services/leadStorage';
import { startEmployeeSession, stopEmployeeSession } from './services/sessionTrackerService';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentSession());
  const [employees, setEmployees] = useState(() => getEmployees());
  const [callLogs, setCallLogs] = useState(() => getCallLogs());
  const [emailLogs, setEmailLogs] = useState(() => getEmailLogs());
  const [leads, setLeads] = useState(() => getLeads());

  const [activeTab, setActiveTab] = useState('dashboard'); // admin: 'dashboard' | 'leads' | 'employees' | 'monitoring' | 'cms'
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Initialize session tracking whenever currentUser is logged in
  useEffect(() => {
    if (currentUser) {
      startEmployeeSession(currentUser);
    }
  }, [currentUser]);

  const loadAllData = useCallback(async () => {
    // Initial quick read from local storage
    setLeads(getLeads());
    setEmployees(getEmployees());
    setCallLogs(getCallLogs());
    setEmailLogs(getEmailLogs());

    // Async sync with MongoDB Cloud API
    try {
      const [apiLeads, apiEmps, apiCalls, apiEmails] = await Promise.all([
        fetchLeadsFromAPI(),
        fetchEmployeesFromAPI(),
        fetchCallLogsFromAPI(),
        fetchEmailLogsFromAPI()
      ]);
      if (apiLeads) setLeads(apiLeads);
      if (apiEmps) setEmployees(apiEmps);
      if (apiCalls) setCallLogs(apiCalls);
      if (apiEmails) setEmailLogs(apiEmails);
    } catch (err) {
      console.warn('Real-time sync error:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    const unsubscribeLeads = subscribeToLeads(() => {
      loadAllData();
    });

    // Auto-polling every 3.5 seconds to sync incoming website & mobile form leads from MongoDB
    const pollTimer = setInterval(() => {
      loadAllData();
    }, 3500);

    return () => {
      unsubscribeLeads();
      clearInterval(pollTimer);
    };
  }, [loadAllData]);

  // Handle Login & Logout
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    startEmployeeSession(user);
    setActiveTab(user.role === 'admin' ? 'dashboard' : 'desk');
    loadAllData();
  };

  const handleLogout = () => {
    if (currentUser?.email) {
      stopEmployeeSession(currentUser.email);
    }
    logoutUser();
    setCurrentUser(null);
  };

  // If not authenticated, render Login Screen
  if (!currentUser) {
    return (
      <LoginView
        employees={employees}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="admin-layout">
      {/* Top Navbar */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        leads={leads}
      />

      {/* Main Content Area */}
      <main className="admin-main">
        {isAdmin ? (
          <>
            {/* 1. Merged Executive Dashboard (Overview + Analytics) */}
            {(activeTab === 'dashboard' || activeTab === 'overview' || activeTab === 'analytics') && (
              <DashboardView
                leads={leads}
                employees={employees}
                callLogs={callLogs}
                emailLogs={emailLogs}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* 2. Merged Leads & Activities Hub (All Leads + Calls Done + Emails Sent) */}
            {(activeTab === 'leads' || activeTab === 'calls' || activeTab === 'emails') && (
              <LeadsHubView
                leads={leads}
                employees={employees}
                callLogs={callLogs}
                emailLogs={emailLogs}
                onSelectLead={(lead) => setSelectedLead(lead)}
                onRefresh={loadAllData}
                initialSubTab={activeTab === 'calls' ? 'calls' : activeTab === 'emails' ? 'emails' : 'leads'}
              />
            )}

            {/* 3. Staff Credentials & Time Activity Monitoring */}
            {(activeTab === 'employees' || activeTab === 'monitoring') && (
              <EmployeeManagement
                employees={employees}
                callLogs={callLogs}
                emailLogs={emailLogs}
                leads={leads}
                onRefresh={loadAllData}
                initialSubTab={activeTab === 'monitoring' ? 'monitoring' : 'roster'}
              />
            )}

            {/* 4. Website CMS */}
            {activeTab === 'cms' && (
              <WebsiteCmsView />
            )}
          </>
        ) : (
          /* White-Collar / Marketing & Telecaller Desk */
          <EmployeeDashboard
            currentUser={currentUser}
            leads={leads}
            callLogs={callLogs}
            emailLogs={emailLogs}
            onRefresh={loadAllData}
          />
        )}
      </main>

      {/* Slide-over Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        employees={employees}
        onClose={() => setSelectedLead(null)}
        onRefresh={loadAllData}
      />

      {/* Add New Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onLeadAdded={() => {
          loadAllData();
        }}
      />
    </div>
  );
}
