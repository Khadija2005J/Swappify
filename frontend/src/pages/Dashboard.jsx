import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import API from "../api";
import ChatPanel from "../components/ChatPanel";
import ErrorBoundary from "../components/ErrorBoundary";
import RatingModal from "../components/RatingModal";
import "./Dashboard.css"; 

export default function Dashboard() {
  const [teach, setTeach] = useState("");
  const [learn, setLearn] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [findMessage, setFindMessage] = useState("");
  const [findLoading, setFindLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [_matches, _setMatches] = useState([]); 
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState("");
  const [newSkillType, setNewSkillType] = useState("knows");
  const [requestLoadingId, setRequestLoadingId] = useState(null);
  const [addSkillLoading, setAddSkillLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Suggestion States
  const [learnSuggestions, setLearnSuggestions] = useState([]);
  const [teachSuggestions, setTeachSuggestions] = useState([]);
  const [showLearnSuggestions, setShowLearnSuggestions] = useState(false);
  const [showTeachSuggestions, setShowTeachSuggestions] = useState(false);

  // Debounce timers
  const learnDebounceTimer = useRef(null);
  const teachDebounceTimer = useRef(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatOpenWithUserId, setChatOpenWithUserId] = useState(null);
  const [chatOpenWithUserName, setChatOpenWithUserName] = useState(null);

  // Rating State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingSwapRequestId, setRatingSwapRequestId] = useState(null);
  const [ratingUserId, setRatingUserId] = useState(null);
  const [ratingUserName, setRatingUserName] = useState(null);

  // Notification State
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unreadMessageCountRef = useRef(0);
  const notificationInitRef = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();

  const playNotificationSound = useCallback(() => {
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
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const [incomingRes, unreadRes] = await Promise.all([
        API.get('/swap-requests/incoming'),
        API.get('/notifications/messages-unread'),
      ]);

      const incomingData = Array.isArray(incomingRes.data) ? incomingRes.data : [];
      setIncoming(incomingData);

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

      const currentUnreadMessages = Number(unreadRes.data?.total_unread || 0);
      if (notificationInitRef.current && currentUnreadMessages > unreadMessageCountRef.current) {
        playNotificationSound();
      }
      unreadMessageCountRef.current = currentUnreadMessages;
      notificationInitRef.current = true;
    } catch (error) {
      console.warn('Could not refresh notifications', error);
    }
  }, [playNotificationSound]);

  // --- LOGOUT FUNCTION ---
  const handleLogout = async () => {
    try {
      await API.post("/logout");
      window.showSuccess('Logged out successfully');
    } catch (err) {
      console.error("Logout error:", err);
      window.showError('Logout failed');
    } finally {
      localStorage.removeItem("token");
      setTimeout(() => navigate("/"), 500);
    }
  };

  // --- 1. CALCULATE PROGRESS ---
  const progressPercentage = Math.min(_matches.length * 25, 100);

  // --- 2. API FUNCTIONS ---
  const findSwap = async () =>{
    setFindMessage("");
    setSearched(true);
    if (!teach || !learn) {
      setFindMessage('Please fill both fields to search.');
      window.showWarning('Please fill both fields to search.');
      setResults([]);
      return;
    }
    setFindLoading(true);
    try {
      const res = await API.post("/find-swap", { teach, learn });
      const data = Array.isArray(res.data) ? res.data : [];
      setResults(data);
      if (data.length === 0) {
        setFindMessage('No matches found for these skills');
        window.showInfo('No matches found. Try different skills!');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Error searching for matches';
      setFindMessage(errMsg);
      window.showError(errMsg);
      setResults([]);
    } finally {
      setFindLoading(false);
    }
  };

  const searchSkills = useCallback(async (query, type) => {
    if (!query || query.length < 1) {
      if (type === 'learn') setLearnSuggestions([]);
      if (type === 'teach') setTeachSuggestions([]);
      return;
    }
    try {
      const res = await API.get('/skills/search', { params: { q: query } });
      if (type === 'learn') { 
        setLearnSuggestions(res.data); 
        setShowLearnSuggestions(true); 
      } else { 
        setTeachSuggestions(res.data); 
        setShowTeachSuggestions(true); 
      }
    } catch (err) { console.error(err); }
  }, []);

  const handleLearnChange = (value) => {
    setLearn(value);
    if (learnDebounceTimer.current) clearTimeout(learnDebounceTimer.current);
    learnDebounceTimer.current = setTimeout(() => {
      searchSkills(value, 'learn');
    }, 300);
  };

  const handleTeachChange = (value) => {
    setTeach(value);
    if (teachDebounceTimer.current) clearTimeout(teachDebounceTimer.current);
    teachDebounceTimer.current = setTimeout(() => {
      searchSkills(value, 'teach');
    }, 300);
  };

  const selectSkill = (skill, type) => {
    if (type === 'learn') { 
      setLearn(skill.name); 
      setShowLearnSuggestions(false); 
    } else { 
      setTeach(skill.name); 
      setShowTeachSuggestions(false); 
    }
  };

  // --- FIX: ADD SKILL FUNCTION ---
  const addSkill = async () => {
    if (!newSkill || newSkill.trim() === "") {
        window.showWarning("Please type a skill name first!");
        return;
    }
    setAddSkillLoading(true);
    try {
      const res = await API.post("/skills", { skill_name: newSkill, type: newSkillType });
      setSkills([...skills, res.data]);
      setNewSkill("");
      window.showSuccess(`"${newSkill}" added to your skills!`);
    } catch (err) { 
      console.error(err);
      window.showError(err.response?.data?.message || 'Failed to add skill');
    } finally {
      setAddSkillLoading(false);
    }
  };

  const sendRequest = async (receiverId) => {
    setRequestLoadingId(receiverId);
    try {
      await API.post("/swap-request", { 
        receiver_id: receiverId, 
        teach_skill: teach, 
        learn_skill: learn 
      });
      window.showSuccess('Swap request sent! ✨');
    } catch (err) { 
      console.error(err);
      window.showError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequestLoadingId(null);
    }
  };

  const acceptRequest = async (id) => {
    setRequestLoadingId(id);
    try {
      const res = await API.post(`/swap-request/${id}/accept`);
      setIncoming(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted', sender: res.data.sender } : r));
      setNotifications(prev => prev.filter(n => n.data?.id !== id));
      API.get("/matches").then(res => _setMatches(Array.isArray(res.data) ? res.data : [])).catch(e => console.log(e));
      API.get("/swap-requests/partners").then(res => setPartners(Array.isArray(res.data) ? res.data : [])).catch(e => console.log(e));
      refreshNotifications();
      window.showSuccess('Swap request accepted! 🎉');
    } catch (err) { 
      console.error(err);
      window.showError(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setRequestLoadingId(null);
    }
  };

  const rejectRequest = async (id) => {
    if (!window.confirm('Are you sure you want to decline this request? This action cannot be undone.')) {
      return;
    }
    setRequestLoadingId(id);
    try {
        await API.post(`/swap-request/${id}/reject`);
        setIncoming(incoming.filter(r => r.id !== id));
      setNotifications(prev => prev.filter(n => n.data?.id !== id));
        refreshNotifications();
        window.showSuccess('Request declined');
    } catch (err) { 
      console.error(err);
      window.showError(err.response?.data?.message || 'Failed to decline request');
    } finally {
      setRequestLoadingId(null);
    }
  };

  const startChatWith = async (userId, userName) => {
    // open the chat drawer and instruct ChatPanel to open/create the conversation
    try {
      setChatOpenWithUserId(userId);
      setChatOpenWithUserName(userName || null);
      setIsChatOpen(true);
    } catch (err) { console.error(err); }
  };

  const openRatingModal = (swapRequestId, userId, userName) => {
    setRatingSwapRequestId(swapRequestId);
    setRatingUserId(userId);
    setRatingUserName(userName);
    setIsRatingModalOpen(true);
  };

  const handleRatingSubmitted = (rating) => {
    // Optionally refresh the incoming requests to update status
    API.get("/swap-requests/incoming")
      .then(res => setIncoming(res.data))
      .catch(e => console.log(e));
  };

  const deleteSkill = async (id) => {
    if (!window.confirm('Remove this skill? This cannot be undone.')) {
      return;
    }
    setRequestLoadingId(id);
    try {
      await API.delete(`/skills/${id}`);
      const deleted = skills.find(s => s.id === id);
      setSkills(skills.filter(s => s.id !== id));
      window.showSuccess(`"${deleted.skill_name}" removed from your skills`);
    } catch (err) { 
      console.error(err);
      window.showError(err.response?.data?.message || 'Failed to delete skill');
    } finally {
      setRequestLoadingId(null);
    }
  };

  const deleteOutgoingRequest = async (id) => {
    if (!window.confirm('Cancel this swap request? This action cannot be undone.')) {
      return;
    }
    setRequestLoadingId(id);
    try {
      await API.delete(`/swap-request/${id}`);
      setOutgoing(outgoing.filter(r => r.id !== id));
      window.showSuccess('Swap request cancelled');
    } catch (err) { 
      console.error(err);
      window.showError(err.response?.data?.message || 'Failed to delete request');
    } finally {
      setRequestLoadingId(null);
    }
  };

  // --- 3. LOAD DATA ---
  useEffect(() => {
    API.get("/me")
      .then(res => setUser(res.data))
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Listen for profile updates (so avatar updates live across pages)
  useEffect(() => {
    const handler = () => {
      API.get('/me').then(res => setUser(res.data)).catch(e => console.error(e));
    };
    window.addEventListener('profile-updated', handler);
    return () => window.removeEventListener('profile-updated', handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    API.get("/skills").then(res => setSkills(res.data)).catch(e => console.log(e));
    API.get("/matches").then(res => _setMatches(Array.isArray(res.data) ? res.data : [])).catch(e => console.log(e));
    refreshNotifications();
    API.get("/swap-requests/sent").then(res => setOutgoing(res.data)).catch(e => console.log(e));
    API.get("/swap-requests/partners").then(res => setPartners(Array.isArray(res.data) ? res.data : [])).catch(e => console.log(e));
    const interval = setInterval(refreshNotifications, 5000);
    return () => clearInterval(interval);
  }, [user, refreshNotifications]);

  useEffect(() => {
    const targetUserId = location.state?.openChatWithUserId;
    if (!user || !targetUserId) return;

    startChatWith(targetUserId, location.state?.openChatWithUserName || null);

    navigate(location.pathname, { replace: true, state: null });
  }, [user, location.state, location.pathname, navigate]);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner-wrapper">
        <div className="spinner"></div>
        <p className="loading-text">Preparing your learning hub...</p>
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
            <i className="fa-solid fa-circle-nodes" style={{color: '#4fd1c5'}}></i> Swappify
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
          
          {/* 2. PROFILE (NOW CLICKABLE!) */}
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

      {/* MAIN CONTENT AREA */}
      <div className="main-content">
        
        {/* Header */}
        <div className="header">
            <button 
              className="hamburger-menu" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer'}}
            >
              <i className="fa-solid fa-bars"></i>
            </button>
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
            <div className="user-pill" style={{cursor: 'pointer'}} onClick={() => navigate(`/profile/${user.id}`)}>
                <span>{user.name}</span>
                { (user.profile_photo_url || user.photo_url) ? (
                  <img src={user.profile_photo_url || user.photo_url} alt={user.name} className="avatar-small-img" />
                ) : (
                  <div className="avatar-small">{user.name.charAt(0).toUpperCase()}</div>
                ) }
            </div>
          </div>
        </div>

        {/* CENTERED GRID */}
        <div className="dashboard-grid">
          
          {/* LEFT COLUMN */}
          <div className="col-main">
            
            {/* WIDGET: SKILL MATCHMAKER */}
            <div className="glass-card hero-card">
              <h3 className="card-title">Skill Matchmaker</h3>
              <div className="matchmaker-inputs">
                
                {/* Search Learn */}
                <div className="search-group">
                  <label className="input-label">I want to learn</label>
                  <input className="custom-input" placeholder="Search a skill..." value={learn}
                    onChange={e => handleLearnChange(e.target.value)}
                    onBlur={() => setTimeout(() => setShowLearnSuggestions(false), 300)}
                    onFocus={() => learn && setShowLearnSuggestions(true)}
                  />
                  <i className="fa-solid fa-magnifying-glass search-icon"></i>
                  {showLearnSuggestions && learnSuggestions.length > 0 && (
                    <div className="suggestions-box">
                      {learnSuggestions.map(s => (
                        <div key={s.id} className="suggestion-item" onMouseDown={() => selectSkill(s, 'learn')}>
                          {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Teach */}
                <div className="search-group">
                  <label className="input-label">I can teach</label>
                  <input className="custom-input" placeholder="Search a skill..." value={teach}
                    onChange={e => handleTeachChange(e.target.value)}
                    onBlur={() => setTimeout(() => setShowTeachSuggestions(false), 300)}
                    onFocus={() => teach && setShowTeachSuggestions(true)}
                  />
                  <i className="fa-solid fa-magnifying-glass search-icon"></i>
                   {showTeachSuggestions && teachSuggestions.length > 0 && (
                    <div className="suggestions-box">
                      {teachSuggestions.map(s => (
                        <div key={s.id} className="suggestion-item" onMouseDown={() => selectSkill(s, 'teach')}>
                          {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button className="find-btn" onClick={findSwap} disabled={findLoading}>
                  {findLoading ? <><i className="fa-solid fa-spinner" style={{animation: 'spin 1s linear infinite', marginRight: '8px'}}></i>Finding perfect matches...</> : 'FIND MY SWAP'}
                </button>
              </div>
            </div>

            {/* WIDGET: MATCH RESULTS */}
            {searched && (
              <div className="glass-card">
                <h3 className="card-title">Match Results</h3>
                {findMessage && (
                  <div className="empty-state-message">
                    <i className="fa-solid fa-inbox"></i>
                    <p>{findMessage}</p>
                  </div>
                )}
                {results.length > 0 && results.map(u => (
                  <div key={u.id} className="match-item">
                    <div>
                      <strong>{u.name}</strong>
                      <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px'}}>Can help you with: {learn}</p>
                    </div>
                    <div className="button-group">
                        <Link to={`/profile/${u.id}`}><button className="action-btn secondary-btn">View Profile</button></Link>
                        <button className="action-btn primary-btn" onClick={() => sendRequest(u.id)} disabled={requestLoadingId === u.id}>
                          {requestLoadingId === u.id ? <><i className="fa-solid fa-spinner" style={{animation: 'spin 1s linear infinite', marginRight: '6px'}}></i></> : 'Send Request'}
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* WIDGET: OUTGOING REQUESTS */}
            <div className="glass-card">
              <h3 className="card-title">Outgoing Requests</h3>
              {outgoing.length === 0 ? (
                <div className="empty-state-message">
                  <i className="fa-solid fa-paper-plane"></i>
                  <p>No outgoing requests yet</p>
                  <small>Find matches above and send requests</small>
                </div>
              ) : (
                outgoing.map(r => (
                  <div key={r.id} className="outgoing-request-item">
                    <div className="request-info">
                        <strong>{r.receiver.name}</strong>
                        <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px'}}>You can help with: <span style={{color: '#4fd1c5', fontWeight: 600}}>{r.teach_skill}</span></p>
                    </div>
                    <div className="request-actions">
                      {/* Pending: profile and delete only - no messaging until accepted */}
                      {r.status === "pending" && (
                        <>
                          <span className="pending-badge">⏳ Pending</span>
                          <Link to={`/profile/${r.receiver.id}`}><button className="action-btn secondary-btn">Profile</button></Link>
                          <button className="action-btn delete-request-btn" onClick={() => deleteOutgoingRequest(r.id)} disabled={requestLoadingId === r.id}>
                            {requestLoadingId === r.id ? <i className="fa-solid fa-spinner" style={{animation: 'spin 1s linear infinite'}}></i> : <i className="fa-solid fa-trash"></i>}
                          </button>
                        </>
                      )}
                      {/* Accepted: now they can message */}
                      {r.status === "accepted" && (
                        <>
                          <span className="accepted-badge">✓ Accepted</span>
                          <button className="action-btn primary-btn" onClick={() => openRatingModal(r.id, r.receiver.id, r.receiver.name)}>Rate</button>
                          <button className="action-btn secondary-btn" onClick={() => startChatWith(r.receiver.id, r.receiver.name)}>Message</button>
                          <Link to={`/profile/${r.receiver.id}`}><button className="action-btn secondary-btn">Profile</button></Link>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* WIDGET: INCOMING REQUESTS */}
            <div className="glass-card">
              <h3 className="card-title">Incoming Requests</h3>
              {incoming.length === 0 ? (
                <div className="empty-state-message">
                  <i className="fa-solid fa-inbox"></i>
                  <p>No incoming requests yet</p>
                  <small>When someone requests a swap, it will appear here</small>
                </div>
              ) : (
                incoming.map(r => (
                  <div key={r.id} className="incoming-request-item">
                    <div className="request-info">
                        <strong>{r.sender.name}</strong>
                        <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px'}}>Wants to learn: <span style={{color: '#4fd1c5', fontWeight: 600}}>{r.learn_skill}</span></p>
                    </div>
                    <div className="request-actions">
                      {/* Pending: show accept/reject */}
                      {r.status === "pending" && (
                        <>
                          <button className="action-btn accept-btn" onClick={() => acceptRequest(r.id)} disabled={requestLoadingId === r.id}>
                            {requestLoadingId === r.id ? <><i className="fa-solid fa-spinner" style={{animation: 'spin 1s linear infinite', marginRight: '6px'}}></i></> : 'Accept'}
                          </button>
                          <button className="action-btn reject-btn" onClick={() => rejectRequest(r.id)} disabled={requestLoadingId === r.id}>
                            {requestLoadingId === r.id ? <><i className="fa-solid fa-spinner" style={{animation: 'spin 1s linear infinite', marginRight: '6px'}}></i></> : 'Decline'}
                          </button>
                          <button className="action-btn secondary-btn" onClick={() => startChatWith(r.sender.id, r.sender.name)}>Message</button>
                        </>
                      )}

                      {/* Accepted: show label and Rate button */}
                      {r.status === "accepted" && (
                        <>
                          <span className="accepted-badge">✓ Accepted</span>
                          <button className="action-btn primary-btn" onClick={() => openRatingModal(r.id, r.sender.id, r.sender.name)}>Rate</button>
                          <button className="action-btn secondary-btn" onClick={() => startChatWith(r.sender.id, r.sender.name)}>Message</button>
                        </>
                      )}
                      <Link to={`/profile/${r.sender.id}`}><button className="action-btn secondary-btn">Profile</button></Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* WIDGET: PARTNERS */}
            <div className="glass-card">
              <h3 className="card-title">Partners</h3>
              {partners.length === 0 ? (
                <div className="empty-state-message">
                  <i className="fa-solid fa-user-group"></i>
                  <p>No partners yet</p>
                  <small>Accepted swaps will appear here</small>
                </div>
              ) : (
                <div className="partners-list">
                  {partners.map(partner => (
                    <div key={partner.id} className="partner-item">
                      <div className="partner-main">
                        <div className="partner-avatar">
                          {partner.profile_photo_url || partner.photo_url ? (
                            <img src={partner.profile_photo_url || partner.photo_url} alt={partner.name} className="partner-avatar-img" />
                          ) : (
                            <span>{partner.name?.charAt(0)?.toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <strong>{partner.name}</strong>
                          <p className="partner-swap-meta">
                            Teach: <span>{partner.teach_skill}</span> • Learn: <span>{partner.learn_skill}</span>
                          </p>
                        </div>
                      </div>
                      <div className="request-actions">
                        <button className="action-btn primary-btn" onClick={() => openRatingModal(partner.swap_request_id, partner.id, partner.name)}>Rate</button>
                        <button className="action-btn secondary-btn" onClick={() => startChatWith(partner.id, partner.name)}>Message</button>
                        <Link to={`/profile/${partner.id}`}><button className="action-btn secondary-btn">Profile</button></Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-side">
            
            {/* WIDGET: PROGRESS TRACKER */}
            <div className="glass-card">
                <h3 className="card-title">Progress</h3>
                <p style={{fontSize:'12px', color:'#a0aec0', marginBottom:'15px'}}>Tracking your learning & teaching</p>
                <div className="progress-container">
                    <div className="circle-wrap" style={{background: `conic-gradient(#4fd1c5 ${progressPercentage}%, rgba(255,255,255,0.1) 0)`}}>
                        <div className="circle-inner">{progressPercentage}%</div>
                    </div>
                    <p style={{fontSize:'13px'}}>{_matches.length} Active Swaps</p>
                </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- FLOATING CHAT WIDGET --- */}
      <div className="chat-wrapper">
        <div className={`chat-popup ${isChatOpen ? 'open' : ''}`}>
             <div className="chat-header">
                <h3>Chat</h3>
                <i className="fa-solid fa-xmark" onClick={() => setIsChatOpen(false)} style={{cursor:'pointer'}}></i>
             </div>
             <div className="chat-body">
                 <ErrorBoundary>
                   <ChatPanel user={user} openWithUserId={chatOpenWithUserId} openWithUserName={chatOpenWithUserName} />
                 </ErrorBoundary>
             </div>
        </div>
        <button className="chat-fab" onClick={() => setIsChatOpen(!isChatOpen)}>
            {isChatOpen ? <i className="fa-solid fa-chevron-down"></i> : <i className="fa-regular fa-comment-dots"></i>}
        </button>
      </div>

      {/* --- RATING MODAL --- */}
      <RatingModal 
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        swapRequestId={ratingSwapRequestId}
        ratedUserId={ratingUserId}
        ratedUserName={ratingUserName}
        onRatingSubmitted={handleRatingSubmitted}
      />

    </div>
  );
}