import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AdminLiveContext = createContext();

export const AdminLiveProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeInvestments: 0,
    pendingWithdrawals: 0,
    systemHealth: 'Optimal'
  });
  const [loading, setLoading] = useState(true);

  // Fetch initial admin activity log
  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/admin/activity-logs');
      setActivities(data);
      setLoading(false);
    } catch (err) {
      console.error("Live Feed Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // In a production environment, you would initialize 
    // a Socket.io connection here for real-time updates.
  }, []);

  return (
    <AdminLiveContext.Provider value={{ activities, stats, loading, refreshLogs: fetchLogs }}>
      {children}
    </AdminLiveContext.Provider>
  );
};

/**
 * NAMED EXPORT: useAdminLive
 * This specifically resolves the build error in ActivityFeed.jsx
 */
export const useAdminLive = () => {
  const context = useContext(AdminLiveContext);
  if (!context) {
    throw new Error('useAdminLive must be used within an AdminLiveProvider');
  }
  return context;
};
