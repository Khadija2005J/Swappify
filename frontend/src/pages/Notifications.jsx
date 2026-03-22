import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import "./Notifications.css";

export default function Notifications() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // all, requests, messages, ratings
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadNotifications = async () => {
    const [incomingRes, unreadRes] = await Promise.all([
      API.get('/swap-requests/incoming'),
      API.get('/notifications/messages-unread'),
    ]);

    const incomingData = Array.isArray(incomingRes.data) ? incomingRes.data : [];
    const incomingNotifs = incomingData
      .filter((req) => req.status === "pending")
      .map((req) => ({
        id: `request-${req.id}`,
        type: "swap_request",
        title: "Swap Request",
        message: `${req.sender?.name || "Someone"} requested to swap skills`,
        data: req,
        timestamp: req.created_at,
        read: false,
      }));

    const messageNotifs = Array.isArray(unreadRes.data?.notifications)
      ? unreadRes.data.notifications
      : [];

    setNotifications([...messageNotifs, ...incomingNotifs]);
  };

  // Load user and notifications
  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await API.get("/me");
        setUser(userRes.data);
        await loadNotifications();
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
    const interval = setInterval(() => {
      loadNotifications().catch((err) => console.warn('Could not refresh notifications', err));
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

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

  const handleDismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAccept = async (notif) => {
    if (!notif?.data?.id) return;
    setActionLoadingId(notif.id);
    try {
      await API.post(`/swap-request/${notif.data.id}/accept`);
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    } catch (err) {
      console.error("Accept failed", err);
      alert(err.response?.data?.message || "Failed to accept request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (notif) => {
    if (!notif?.data?.id) return;
    setActionLoadingId(notif.id);
    try {
      await API.post(`/swap-request/${notif.data.id}/reject`);
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    } catch (err) {
      console.error("Decline failed", err);
      alert(err.response?.data?.message || "Failed to decline request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true;
    if (filter === "requests") return notif.type === "swap_request";
    if (filter === "messages") return notif.type === "message";
    if (filter === "ratings") return notif.type === "rating";
    return true;
  });

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner-wrapper">
        <div className="spinner"></div>
        <p className="loading-text">Loading notifications...</p>
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
            <i className="fa-solid fa-circle-nodes" style={{ color: "#4fd1c5" }}></i> Swappify
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
          <div
            className={`nav-item ${location.pathname === "/my-swaps" ? "active" : ""}`}
            onClick={() => { navigate("/my-swaps"); setSidebarOpen(false); }}
          >
            <i className="fa-solid fa-magnifying-glass"></i> My Swaps
          </div>
          <div
            className={`nav-item ${location.pathname.startsWith("/profile") ? "active" : ""}`}
            onClick={() => { navigate(`/profile/${user.id}`); setSidebarOpen(false); }}
          >
            <i className="fa-solid fa-user"></i> Profile
          </div>
          <div
            className={`nav-item ${location.pathname === "/settings" ? "active" : ""}`}
            onClick={() => { navigate("/settings"); setSidebarOpen(false); }}
          >
            <i className="fa-solid fa-gear"></i> Settings
          </div>
          <div
            className="nav-item logout-item"
            onClick={() => { handleLogout(); setSidebarOpen(false); }}
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              marginTop: "auto",
              paddingTop: "10px",
            }}
          >
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
            <i className="fa-regular fa-bell notification-icon"></i>
            <div
              className="user-pill"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <span>{user.name}</span>
              {user.profile_photo_url || user.photo_url ? (
                <img
                  src={user.profile_photo_url || user.photo_url}
                  alt={user.name}
                  className="avatar-small-img"
                />
              ) : (
                <div className="avatar-small">{user.name.charAt(0).toUpperCase()}</div>
              )}
            </div>
          </div>
        </div>

        <div className="notifications-container">
          <div className="notifications-header">
            <h1>
              <i className="fa-solid fa-bell"></i> Notifications
            </h1>
            <p className="notification-count">
              {notifications.length} {notifications.length === 1 ? "notification" : "notifications"}
            </p>
          </div>

          {/* FILTER TABS */}
          <div className="filter-tabs">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </button>
            <button
              className={`filter-btn ${filter === "requests" ? "active" : ""}`}
              onClick={() => setFilter("requests")}
            >
              Requests ({notifications.filter((n) => n.type === "swap_request").length})
            </button>
            <button
              className={`filter-btn ${filter === "messages" ? "active" : ""}`}
              onClick={() => setFilter("messages")}
            >
              Messages ({notifications.filter((n) => n.type === "message").length})
            </button>
            <button
              className={`filter-btn ${filter === "ratings" ? "active" : ""}`}
              onClick={() => setFilter("ratings")}
            >
              Ratings ({notifications.filter((n) => n.type === "rating").length})
            </button>
          </div>

          {/* NOTIFICATIONS LIST */}
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-inbox"></i>
              <h3>No notifications</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-card ${notif.type} ${notif.read ? "read" : "unread"}`}
                >
                  <div className="notification-icon">
                    {notif.type === "swap_request" && (
                      <i className="fa-solid fa-right-left"></i>
                    )}
                    {notif.type === "message" && (
                      <i className="fa-solid fa-message"></i>
                    )}
                    {notif.type === "rating" && (
                      <i className="fa-solid fa-star"></i>
                    )}
                  </div>

                  <div className="notification-content">
                    <div className="notification-title">{notif.title}</div>
                    <div className="notification-message">{notif.message}</div>
                    {notif.type === "swap_request" && notif.data && (
                      <div className="notification-actions">
                        <button
                          className="btn-accept"
                          onClick={() => handleAccept(notif)}
                          disabled={actionLoadingId === notif.id}
                        >
                          <i className="fa-solid fa-check"></i> {actionLoadingId === notif.id ? "Accepting..." : "Accept"}
                        </button>
                        <button
                          className="btn-decline"
                          onClick={() => handleDecline(notif)}
                          disabled={actionLoadingId === notif.id}
                        >
                          <i className="fa-solid fa-times"></i> {actionLoadingId === notif.id ? "Declining..." : "Decline"}
                        </button>
                      </div>
                    )}
                    {notif.type === "message" && (
                      <div className="notification-actions">
                        <button
                          className="btn-accept"
                          onClick={() => {
                            navigate('/dashboard', {
                              state: {
                                openChatWithUserId: notif.other_user_id,
                                openChatWithUserName: notif.other_user_name,
                              },
                            });
                          }}
                        >
                          <i className="fa-solid fa-comment"></i> Open Chat
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="notification-meta">
                    <span className="notification-time">{notif.timestamp}</span>
                    <button
                      className="dismiss-btn"
                      onClick={() => handleDismiss(notif.id)}
                      title="Dismiss"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
