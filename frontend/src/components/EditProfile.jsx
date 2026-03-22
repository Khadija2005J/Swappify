import { useState, useEffect, useRef, useCallback } from "react";
import API from "../api";
import "../styles/Profile.css"; 

export default function EditProfile({ onClose, onSaved }) {
  const [formData, setFormData] = useState({ phone: "", education: "", bio: "" });
  const [skills, setSkills] = useState([]); 
  const [newSkill, setNewSkill] = useState({ name: "", level: 50, type: "knows" });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [removePhotoFlag, setRemovePhotoFlag] = useState(false); // Flag to track if photo is being removed

  // Autocomplete states
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    API.get("/me").then(res => {
        console.log("Loaded user data:", res.data);
        console.log("Skills from API:", res.data.skills);
        
        setFormData({
          phone: res.data.phone || "",
          education: res.data.education || "",
          bio: res.data.bio || "",
        });
        
        // Standardize skills structure
        const normalizedSkills = (res.data.skills || []).map(skill => ({
          id: skill.id,
          skill_name: skill.skill_name || skill.name,
          name: skill.skill_name || skill.name,
          level: skill.level,
          type: skill.type,
        }));
        console.log("Normalized skills:", normalizedSkills);
        setSkills(normalizedSkills);
        
        setImagePreview(res.data.profile_photo_url || res.data.photo_url);
        setLoading(false);
      }).catch(err => { 
        console.error("Error loading profile:", err); 
        setLoading(false); 
      });
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const searchSkills = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setSkillSuggestions([]);
      return;
    }
    try {
      const res = await API.get('/skills/search', { params: { q: query } });
      setSkillSuggestions(res.data);
      setShowSuggestions(true);
    } catch (err) { console.error(err); }
  }, []);

  const handleSkillNameChange = (value) => {
    setNewSkill({...newSkill, name: value});
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      searchSkills(value);
    }, 300);
  };

  const selectSkill = (skill) => {
    setNewSkill({...newSkill, name: skill.name});
    setShowSuggestions(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (newSkill.name.trim()) {
      const skillToAdd = {
        id: Date.now(),
        skill_name: newSkill.name,
        name: newSkill.name,
        level: Number(newSkill.level),
        type: newSkill.type,
      };
      console.log("Adding skill to list:", skillToAdd);
      setSkills((prev) => {
        const updated = [...prev, skillToAdd];
        console.log("Updated skills array:", updated);
        return updated;
      });
      setNewSkill({ name: "", level: 50, type: "knows" });
    }
  };

  const removeSkill = (id) => setSkills(skills.filter(s => s.id !== id));

  const removeProfileImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    setRemovePhotoFlag(true); // Set the flag to true when removing the photo
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      data.append("phone", formData.phone);
      data.append("education", formData.education);
      data.append("bio", formData.bio);
      
      // Debug log
      console.log("=== BEFORE SUBMIT ===");
      console.log("All skills in state:", skills);
      console.log("Number of skills:", skills.length);
      
      // Append skills as proper array for Laravel validation
      skills.forEach((skill, index) => {
        const skillName = skill.skill_name || skill.name;
        const skillLevel = skill.level;
        const skillType = skill.type;
        
        console.log(`Appending skill ${index}:`, { skillName, skillLevel, skillType });
        
        data.append(`skills[${index}][name]`, skillName);
        data.append(`skills[${index}][level]`, skillLevel);
        data.append(`skills[${index}][type]`, skillType);
      });

      if (profileImage) data.append("profile_photo", profileImage);

      console.log("=== FORM DATA CONTENTS ===");
      for (let [key, value] of data.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await API.post("/profile?_method=PUT", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Response:", response);

      setSuccess("Changes saved!");
      window.dispatchEvent(new CustomEvent("profile-updated"));

      setTimeout(() => {
        if (onSaved) onSaved();
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error details:", err.response?.data);
      setError(err.response?.data?.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const saveChanges = async () => {
    try {
      const formattedSkills = skills.map((skill) => ({
        name: skill.skill_name,
        level: skill.level,
        type: skill.type,
      }));

      const payload = {
        phone,
        education,
        bio,
        skills: formattedSkills,
        remove_profile_photo: removePhotoFlag, // Include the remove photo flag
      };

      const response = await API.updateProfile(payload);
      if (response.status === 200) {
        // Update the skills state with the response data
        setSkills(response.data.skills);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("An error occurred while saving changes.");
    }
  };

  if (loading) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-glass masterpiece-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="modal-body-scroll">
            <div className="photo-upload-container">
              <div className="avatar-preview-wrapper">
                <img src={imagePreview || "/default-avatar.png"} alt="Preview" className="avatar-preview-img" />
                <label htmlFor="photo-input" className="photo-label">
                  <i className="fa-solid fa-camera"></i>
                </label>
                {imagePreview && (
                  <button className="remove-photo-btn decorative-btn" onClick={removeProfileImage}>
                    ✖ Remove Photo
                  </button>
                )}
              </div>
              <input id="photo-input" type="file" hidden onChange={handleImageChange} accept="image/*" />
            </div>

            <div className="form-grid">
                <div className="form-group">
                  <label>Phone</label>
                  <input className="custom-input" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Education</label>
                  <input className="custom-input" name="education" value={formData.education} onChange={handleChange} />
                </div>
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea className="custom-input textarea-box" name="bio" value={formData.bio} onChange={handleChange} />
            </div>

            <hr className="divider" />

            <div className="skills-manager">
              <h3>Skills & Mastery</h3>
              <div className="add-skill-bar">
                 <div className="search-group" style={{flex: 1, position: 'relative'}}>
                   <input type="text" placeholder="Search skill..." value={newSkill.name} 
                    onChange={(e) => handleSkillNameChange(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                    onFocus={() => newSkill.name && setShowSuggestions(true)}
                    className="custom-input" />
                   {showSuggestions && skillSuggestions.length > 0 && (
                     <div className="suggestions-box">
                       {skillSuggestions.map(s => (
                         <div key={s.id} className="suggestion-item" onMouseDown={() => selectSkill(s)}>
                           {s.name}
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
                 <select value={newSkill.type} onChange={(e) => setNewSkill({...newSkill, type: e.target.value})} className="custom-input">
                    <option value="knows">I can teach</option>
                    <option value="wants_to_learn">I want to learn</option>
                 </select>
                 <button type="button" onClick={addSkill} className="btn-add-skill">+</button>
              </div>
              
              <div className="skill-level-control">
                  <label>Mastery Level: {newSkill.level}%</label>
                  <input type="range" min="0" max="100" value={newSkill.level} 
                      onChange={(e) => setNewSkill({...newSkill, level: e.target.value})} className="skill-slider" />
              </div>

              <div className="active-skills-list">
                  {skills.map(s => (
                    <div key={s.id} className="skill-row-edit">
                      <div className="skill-box">
                        <span className={`tag ${s.type}`}>{s.skill_name || s.name}</span>
                        <div className="progress-bg">
                            <div className="progress-fill" style={{width: `${s.level}%`}}></div>
                        </div>
                        <span className="percentage">{s.level}%</span>
                      </div>
                      <button type="button" onClick={() => removeSkill(s.id)} className="remove-btn">✕</button>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {error && <div className="msg error">{error}</div>}
          {success && <div className="msg success">{success}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}