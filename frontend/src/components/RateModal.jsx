import { useState } from "react";
import API from "../api";
import "../styles/RateModal.css";

export default function RateModal({ swapRequestId, ratedUserId, onClose, onSuccess }) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await API.post("/rate", {
        swap_request_id: swapRequestId,
        rated_user_id: ratedUserId,
        score: parseInt(score),
        comment: comment || null,
      });

      if (onSuccess) onSuccess(response.data);
      
      // Dispatch event to refresh profile page if it's open
      window.dispatchEvent(new CustomEvent("profile-updated"));
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rate This User</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star ${score >= star ? 'active' : ''}`}
                  onClick={() => setScore(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="rating-text">{score} out of 5 stars</p>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Comment (optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience with this user..."
              maxLength={500}
            />
            <small>{comment.length}/500</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
