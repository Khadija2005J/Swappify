import React, { useState, useEffect, useRef } from 'react';
import '../styles/SwapRoom.css';

const SwapRoom = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [message, setMessage] = useState("");
  const localVideoRef = useRef(null);

  // Activation de la caméra réelle de l'utilisateur (npm)
  useEffect(() => {
    async function enableStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Accès caméra refusé ou non supporté :", err);
      }
    }
    enableStream();
  }, []);

  const activateCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        alert("Camera activated successfully!");
      })
      .catch((err) => {
        console.error("Error activating camera:", err);
        alert("Failed to activate camera. Please check permissions.");
      });
  };

  return (
    <div className="swap-room-container">
      {/* HEADER DE SESSION */}
      <div className="session-header">
        <div className="user-info">
          <img src={localUser.avatar} alt="Me" className="mini-avatar" />
          <span>{localUser.name} <small>(Teaching: {localUser.teaching})</small></span>
        </div>
        <div className="session-timer">Session Time: 24:45</div>
        <div className="user-info">
          <span>{remoteUser.name} <small>(Teaching: {remoteUser.teaching})</small></span>
          <img src={remoteUser.avatar} alt="Partner" className="mini-avatar" />
        </div>
      </div>

      <div className="main-swap-area">
        {/* VIDEO DISTANTE (L'autre personne) */}
        <div className="remote-video-container">
          <div className="video-placeholder">
            {/* Placeholder for remote video */}
            <img src={remoteUser.avatar} className="large-avatar" alt="Remote" />
            <div className="status-label">Teaching you {remoteUser.teaching}...</div>
          </div>
          
          {/* TA MINI VIDÉO (npm) */}
          <div className="local-video-preview">
            <div className="mini-video-box">
              <span>{localUser.name} (You)</span>
            </div>
          </div>
        </div>

        {/* PANNEAU LATÉRAL : CHAT & NOTES */}
        <div className="collab-panel">
          <div className="panel-tabs">
            <button className="active">Live Chat</button>
            <button>Shared Notes</button>
          </div>
          <div className="chat-box">
            {messages.map((msg, index) => (
              <div key={index} className={`msg ${msg.sender === localUser.name ? 'me' : 'partner'}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button className="btn-send" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>

      {/* BARRE DE CONTRÔLE NÉON */}
      <div className="control-bar">
        <button className="ctrl-btn" onClick={activateCamera} title="Activate Camera">
          <i className="fa-solid fa-video"></i>
        </button>
        <button className="ctrl-btn" title="Mute/Unmute">
          <i className="fa-solid fa-microphone"></i>
        </button>
        <button className="ctrl-btn" title="Share Screen">
          <i className="fa-solid fa-desktop"></i>
        </button>
        <button className="btn-end-call" title="End Swap">End Swap</button>
      </div>
    </div>
  );
};

export default SwapRoom;