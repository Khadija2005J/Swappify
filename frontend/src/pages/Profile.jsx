import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import EditProfile from "../components/EditProfile"; 
import "../styles/Profile.css";

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [deletingRatingId, setDeletingRatingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [editingLevel, setEditingLevel] = useState(50);
  const [savingSkill, setSavingSkill] = useState(false);

  // --- LOGOUT FUNCTION ---
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

    useEffect(() => {
        API.get("/me").then(res => setCurrentUser(res.data)).catch(err => console.error(err));
    }, []);

    const fetchProfile = () => {
        setLoading(true);
        API.get(`/user/${userId}`)
            .then(res => {
                console.log("Profile API Response:", res.data);
                console.log("Profile skills from API:", res.data.skills);
                setProfile(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => { fetchProfile(); }, [userId]);

    useEffect(() => {
        const handleProfileUpdated = () => {
            fetchProfile();
        };

        window.addEventListener("profile-updated", handleProfileUpdated);

        return () => {
            window.removeEventListener("profile-updated", handleProfileUpdated);
        };
    }, []);

  const startChat = async () => {
    try {
      await API.post(`/conversations/start/${userId}`);
            navigate('/dashboard', {
                state: {
                    openChatWithUserId: Number(userId),
                    openChatWithUserName: profile?.name || null,
                },
            });
    } catch (err) { console.error(err); }
  };

  const deleteRating = async (ratingId) => {
    if (!window.confirm('Delete this rating? This cannot be undone.')) {
      return;
    }
    
    setDeletingRatingId(ratingId);
    try {
      await API.delete(`/ratings/${ratingId}`);
      if (window.showSuccess) {
        window.showSuccess('Rating deleted successfully');
      }
      fetchProfile(); // Refresh to show updated ratings
    } catch (err) {
      console.error(err);
      if (window.showError) {
        window.showError(err.response?.data?.message || 'Failed to delete rating');
      }
    } finally {
      setDeletingRatingId(null);
    }
  };

  const startEditingSkill = (skillId, currentLevel) => {
    setEditingSkillId(skillId);
    setEditingLevel(currentLevel || 50);
  };

  const saveSkillLevel = async (skillId) => {
    setSavingSkill(true);
    try {
      // Update the skill in the current profile state
      const updatedSkills = profile.skills.map(s => 
        s.id === skillId ? {...s, level: editingLevel} : s
      );
      
      // Send all skills to the backend
      const data = new FormData();
      data.append("phone", profile.phone || "");
      data.append("education", profile.education || "");
      data.append("bio", profile.bio || "");
      
      updatedSkills.forEach((skill, index) => {
        data.append(`skills[${index}][name]`, skill.skill_name);
        data.append(`skills[${index}][level]`, skill.level);
        data.append(`skills[${index}][type]`, skill.type);
      });

      const response = await API.post("/profile?_method=PUT", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Skill updated:", response.data);
      
      // Update local profile with new skills
      setProfile(prev => ({...prev, skills: updatedSkills}));
      setEditingSkillId(null);
      
      if (window.showSuccess) {
        window.showSuccess('Skill level updated');
      }
    } catch (err) {
      console.error(err);
      if (window.showError) {
        window.showError(err.response?.data?.message || 'Failed to update skill');
      }
    } finally {
      setSavingSkill(false);
    }
  };

  const cancelEditingSkill = () => {
    setEditingSkillId(null);
    setEditingLevel(50);
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner-wrapper">
        <div className="spinner"></div>
        <p className="loading-text">Loading profile...</p>
      </div>
    </div>
  );
  if (!profile) return (
    <div className="error-screen">
      <div className="error-wrapper">
        <i className="fa-solid fa-circle-exclamation" style={{fontSize: '48px', marginBottom: '16px'}}></i>
        <p>Profile not found</p>
      </div>
    </div>
  );

  const isMyProfile = currentUser && currentUser.id === profile.id;
  
  // LOGIC: Pro Member if they have more than 5 ratings and an average > 4.0
  const ratingCount = profile.ratings?.length || profile.rating_count || 0;
  const ratingAvg = profile.rating_avg || 0;
  const isPro = ratingCount >= 5 && ratingAvg >= 4.0;

  return (
    <div className="dashboard-container page-wrapper">
      <div className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <div className="brand"><i className="fa-solid fa-circle-nodes" style={{color: '#4fd1c5'}}></i> Swappify</div>
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
          <div className={`nav-item ${location.pathname.startsWith('/profile') ? 'active' : ''}`} onClick={() => { navigate(`/profile/${currentUser?.id || userId}`); setSidebarOpen(false); }}>
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

      <div className="main-content">
        <button 
          className="hamburger-menu" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', marginBottom: '15px'}}
        >
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className="glass-card profile-header-card">
            <div className="profile-identity">
                <div className="profile-avatar-large">
                    {profile.profile_photo_url ? (
                        <img src={profile.profile_photo_url} alt="Profile" className="avatar-img" />
                    ) : (
                        profile.name.charAt(0).toUpperCase()
                    )}
                </div>
                <div className="profile-text">
                    <h1>{profile.name}</h1>
                    <div className="badges">
                        {isPro && <span className="badge-pro">Pro Member</span>}
                        <div className="rating-pill">
                            ★ {ratingAvg ? ratingAvg.toFixed(1) : "New"} 
                            <span style={{opacity:0.7, fontSize:'12px', marginLeft:'5px'}}>({ratingCount} reviews)</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="profile-actions">
                {isMyProfile ? (
                    <button className="edit-btn" onClick={() => setShowEdit(true)}>
                        <i className="fa-solid fa-pen"></i> Edit Profile
                    </button>
                ) : (
                    <button className="message-btn" onClick={startChat}>
                        <i className="fa-solid fa-comment"></i> Message
                    </button>
                )}
            </div>
        </div>

        <div className="profile-grid">
            {/* DYNAMIC SKILLS WITH BARS */}
            <div className="glass-card">
                <h3 className="card-title">Skills Mastery</h3>
                
                <h4 className="skill-section-title">Can Teach:</h4>
                <div className="skills-display-list">
                    {profile.skills?.filter(s => s.type === 'knows').length === 0 && <span className="empty-text">No skills listed.</span>}
                    {profile.skills?.filter(s => s.type === 'knows').map(s => (
                        <div key={s.id} className="skill-mastery-row">
                            <div className="skill-info">
                                <span>{s.skill_name}</span>
                                {editingSkillId === s.id ? (
                                    <div className="skill-edit-controls">
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="100" 
                                            value={editingLevel}
                                            onChange={(e) => setEditingLevel(Number(e.target.value))}
                                            className="skill-level-input"
                                        />
                                        <button 
                                            onClick={() => saveSkillLevel(s.id)}
                                            className="skill-save-btn"
                                            disabled={savingSkill}
                                        >
                                            {savingSkill ? '...' : '✓'}
                                        </button>
                                        <button 
                                            onClick={cancelEditingSkill}
                                            className="skill-cancel-btn"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <span 
                                        onClick={() => isMyProfile && startEditingSkill(s.id, s.level || 50)}
                                        style={{cursor: isMyProfile ? 'pointer' : 'default'}}
                                        className={isMyProfile ? 'editable-percent' : ''}
                                    >
                                        {s.level || 50}%
                                    </span>
                                )}
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill teach" style={{width: `${editingSkillId === s.id ? editingLevel : (s.level || 50)}%`}}></div>
                            </div>
                        </div>
                    ))}
                </div>

                <h4 className="skill-section-title" style={{marginTop:'25px'}}>Wants to Learn:</h4>
                <div className="skills-display-list">
                     {profile.skills?.filter(s => s.type === 'wants_to_learn').length === 0 && <span className="empty-text">No goals listed.</span>}
                    {profile.skills?.filter(s => s.type === 'wants_to_learn').map(s => (
                        <div key={s.id} className="skill-mastery-row">
                            <div className="skill-info">
                                <span>{s.skill_name}</span>
                                {editingSkillId === s.id ? (
                                    <div className="skill-edit-controls">
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="100" 
                                            value={editingLevel}
                                            onChange={(e) => setEditingLevel(Number(e.target.value))}
                                            className="skill-level-input"
                                        />
                                        <button 
                                            onClick={() => saveSkillLevel(s.id)}
                                            className="skill-save-btn"
                                            disabled={savingSkill}
                                        >
                                            {savingSkill ? '...' : '✓'}
                                        </button>
                                        <button 
                                            onClick={cancelEditingSkill}
                                            className="skill-cancel-btn"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <span 
                                        onClick={() => isMyProfile && startEditingSkill(s.id, s.level || 50)}
                                        style={{cursor: isMyProfile ? 'pointer' : 'default'}}
                                        className={isMyProfile ? 'editable-percent' : ''}
                                    >
                                        {s.level || 50}%
                                    </span>
                                )}
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill learn" style={{width: `${editingSkillId === s.id ? editingLevel : (s.level || 50)}%`}}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card">
                <h3 className="card-title">About</h3>
                <p className="bio-text">{profile.bio || "This user hasn't written a bio yet."}</p>
                <div className="details-list">
                    {profile.education && <div className="detail-row"><i className="fa-solid fa-school"></i><span>{profile.education}</span></div>}
                    {profile.email && <div className="detail-row"><i className="fa-solid fa-envelope"></i><span>{profile.email}</span></div>}
                    {profile.phone && <div className="detail-row"><i className="fa-solid fa-phone"></i><span>{profile.phone}</span></div>}
                </div>
            </div>
        </div>

        <div className="glass-card">
             <h3 className="card-title">Ratings & Reviews</h3>
             {profile.ratings && profile.ratings.length > 0 ? (
                 <div className="reviews-grid">
                     {profile.ratings.map(rating => (
                         <div key={rating.id} className="review-item">
                             <div className="review-top">
                                 <strong>{rating.rater.name}</strong>
                                 <span className="stars">{"★".repeat(rating.score)}</span>
                                 {currentUser && rating.rater.id === currentUser.id && (
                                     <button 
                                         className="delete-rating-btn" 
                                         onClick={() => deleteRating(rating.id)}
                                         disabled={deletingRatingId === rating.id}
                                         style={{marginLeft: 'auto'}}
                                     >
                                         {deletingRatingId === rating.id ? (
                                             <i className="fa-solid fa-spinner fa-spin"></i>
                                         ) : (
                                             <i className="fa-solid fa-trash"></i>
                                         )}
                                     </button>
                                 )}
                             </div>
                             <p>{rating.comment}</p>
                             <small>{new Date(rating.created_at).toLocaleDateString()}</small>
                         </div>
                     ))}
                 </div>
             ) : ( <p className="empty-text">No reviews yet.</p> )}
        </div>
      </div>
            {showEdit && <EditProfile onClose={() => setShowEdit(false)} onSaved={() => { fetchProfile(); setShowEdit(false); }} />}
    </div>
  );
}