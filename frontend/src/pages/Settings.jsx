import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import "./Settings.css";

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [lastUnreadMessageCount, setLastUnreadMessageCount] = useState(0);
  const [notificationsInitialized, setNotificationsInitialized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    notify_new_requests: true,
    notify_messages: true,
    profile_public: true,
    show_in_search: true,
  });

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Logout handler
  const handleLogout = async () => {
    try {
      await API.post("/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioContext = new AudioCtx();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.07, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.18);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Notification sound unavailable', error);
    }
  };

  const refreshNotifications = async () => {
    try {
      const [incomingRes, unreadRes] = await Promise.all([
        API.get('/swap-requests/incoming'),
        API.get('/notifications/messages-unread'),
      ]);

      const incomingData = Array.isArray(incomingRes.data) ? incomingRes.data : [];
      const swapNotifications = incomingData
        .filter(req => req.status === 'pending')
        .map(req => ({
          id: `request-${req.id}`,
          type: 'swap_request',
          title: 'New Swap Request',
          message: `${req.sender?.name || 'Someone'} wants to learn ${req.learn_skill}`,
          timestamp: req.created_at,
          data: req,
          read: false,
        }));

      const messageNotifications = Array.isArray(unreadRes.data?.notifications)
        ? unreadRes.data.notifications
        : [];

      setNotifications([...messageNotifications, ...swapNotifications]);

      const currentUnread = Number(unreadRes.data?.total_unread || 0);
      if (notificationsInitialized && currentUnread > lastUnreadMessageCount) {
        playNotificationSound();
      }
      setLastUnreadMessageCount(currentUnread);
      setNotificationsInitialized(true);
    } catch (notifErr) {
      console.warn('Could not load notifications', notifErr);
    }
  };

  // Load user and settings
  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await API.get("/me");
        setUser(userRes.data);
        
        try {
          const settingsRes = await API.get("/settings");
          if (settingsRes.data) {
            setSettings(prev => ({ ...prev, ...settingsRes.data }));
          }
        } catch (settingsErr) {
          console.warn("Settings endpoint not available, using defaults", settingsErr);
        }

        await refreshNotifications();
      } catch (err) {
        console.error("Auth error:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refreshNotifications, 5000);
    return () => clearInterval(interval);
  }, [user, lastUnreadMessageCount, notificationsInitialized]);

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordError("");

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      const res = await API.post("/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation,
      });
      setPasswordMsg("Password changed successfully!");
      setPasswordForm({ current_password: "", new_password: "", new_password_confirmation: "" });
      setTimeout(() => setPasswordMsg(""), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Error changing password");
    }
  };

  // Handle settings toggle
  const handleSettingToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Save settings
  const handleSaveSettings = async () => {
    try {
      await API.put("/settings", settings);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving settings");
    }
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner-wrapper">
        <div className="spinner"></div>
        <p className="loading-text">Loading settings...</p>
      </div>
    </div>
  );
  if (!user) return null;

  return (
    <div className="dashboard-container page-wrapper">
      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <div className="brand">
            <i className="fa-solid fa-circle-nodes" style={{ color: '#4fd1c5' }}></i> Swappify
          </div>
          <button 
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            style={{background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', display: 'none'}}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="nav-links">
          <div className={`nav-item ${location.pathname === '/my-swaps' ? 'active' : ''}`} onClick={() => { navigate('/my-swaps'); setSidebarOpen(false); }}>
            <i className="fa-solid fa-magnifying-glass"></i> My Swaps
          </div>
          <div className={`nav-item ${location.pathname.startsWith('/profile') ? 'active' : ''}`} onClick={() => { navigate(`/profile/${user.id}`); setSidebarOpen(false); }}>
            <i className="fa-solid fa-user"></i> Profile
          </div>
          <div className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`} onClick={() => { navigate('/settings'); setSidebarOpen(false); }}>
            <i className="fa-solid fa-gear"></i> Settings
          </div>
          <div className="nav-item logout-item" onClick={() => { handleLogout(); setSidebarOpen(false); }} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto', paddingTop: '10px' }}>
            <i className="fa-solid fa-sign-out-alt"></i> Logout
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <button 
          className="hamburger-menu" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', marginBottom: '15px'}}
        >
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className="header">
          <div className="header-actions">
            <div className="notification-wrapper">
              <i 
                className="fa-solid fa-bell notification-icon" 
                onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                style={{cursor: 'pointer', color: '#fff'}}
              ></i>
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
              
              {isNotificationDropdownOpen && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-header">
                    <h4>Notifications</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="view-all-btn"
                        style={{ width: 'auto', padding: '6px 10px', margin: 0 }}
                        onClick={playNotificationSound}
                      >
                        Test Sound
                      </button>
                      <button
                        className="close-btn"
                        onClick={() => setIsNotificationDropdownOpen(false)}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="notification-empty">
                      <i className="fa-solid fa-inbox"></i>
                      <p>No notifications</p>
                    </div>
                  ) : (
                    <div className="notification-list">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="notification-item">
                          <div className="notification-item-icon">
                            {notif.type === 'swap_request' && (
                              <i className="fa-solid fa-right-left"></i>
                            )}
                            {notif.type === 'message' && (
                              <i className="fa-solid fa-message"></i>
                            )}
                          </div>
                          <div className="notification-item-content">
                            <div className="notification-item-title">{notif.title}</div>
                            <div className="notification-item-message">{notif.message}</div>
                            {notif.type === 'message' && notif.preview && (
                              <div className="notification-item-message" style={{ opacity: 0.7 }}>
                                “{notif.preview.length > 60 ? `${notif.preview.slice(0, 60)}...` : notif.preview}”
                              </div>
                            )}
                            {notif.type === 'message' && (
                              <button
                                className="view-all-btn"
                                style={{ marginTop: '8px', width: 'auto' }}
                                onClick={() => {
                                  navigate('/dashboard', {
                                    state: {
                                      openChatWithUserId: notif.other_user_id,
                                      openChatWithUserName: notif.other_user_name,
                                    },
                                  });
                                  setIsNotificationDropdownOpen(false);
                                }}
                              >
                                Open Chat
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="notification-dropdown-footer">
                    <button 
                      className="view-all-btn"
                      onClick={() => {
                        navigate('/notifications');
                        setIsNotificationDropdownOpen(false);
                      }}
                    >
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="user-pill" style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${user.id}`)}>
              <span>{user.name}</span>
              {(user.profile_photo_url || user.photo_url) ? (
                <img src={user.profile_photo_url || user.photo_url} alt={user.name} className="avatar-small-img" />
              ) : (
                <div className="avatar-small">{user.name.charAt(0).toUpperCase()}</div>
              )}
            </div>
          </div>
        </div>

        <div className="settings-container">
          {/* CHANGE PASSWORD */}
          <div className="glass-card settings-card">
            <h3 className="card-title">
              <i className="fa-solid fa-lock"></i> Change Password
            </h3>
            <form onSubmit={handlePasswordChange}>
              {passwordMsg && <div className="success-msg">{passwordMsg}</div>}
              {passwordError && <div className="error-msg">{passwordError}</div>}
              
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="settings-input"
                  placeholder="Enter current password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="settings-input"
                  placeholder="Enter new password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="settings-input"
                  placeholder="Confirm new password"
                  value={passwordForm.new_password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="save-btn">Update Password</button>
            </form>
          </div>

          {/* NOTIFICATION PREFERENCES */}
          <div className="glass-card settings-card">
            <h3 className="card-title">
              <i className="fa-solid fa-bell"></i> Notification Preferences
            </h3>
            
            <div className="settings-toggle">
              <div className="toggle-label">
                <span>New Swap Requests</span>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>Get notified when someone sends you a swap request</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.notify_new_requests}
                  onChange={() => handleSettingToggle('notify_new_requests')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="settings-toggle">
              <div className="toggle-label">
                <span>Message Notifications</span>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>Get notified when you receive new messages</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.notify_messages}
                  onChange={() => handleSettingToggle('notify_messages')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* PRIVACY SETTINGS */}
          <div className="glass-card settings-card">
            <h3 className="card-title">
              <i className="fa-solid fa-shield"></i> Privacy Settings
            </h3>
            
            <div className="settings-toggle">
              <div className="toggle-label">
                <span>Public Profile</span>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>Allow others to view your profile</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.profile_public}
                  onChange={() => handleSettingToggle('profile_public')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="settings-toggle">
              <div className="toggle-label">
                <span>Show in Search</span>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>Appear in skill matching and search results</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.show_in_search}
                  onChange={() => handleSettingToggle('show_in_search')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <button onClick={handleSaveSettings} className="save-btn">Save Privacy Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}
