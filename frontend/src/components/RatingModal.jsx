import { useState } from 'react';
import API from '../api';
import './RatingModal.css';

export default function RatingModal({ isOpen, onClose, swapRequestId, ratedUserId, ratedUserName, onRatingSubmitted }) {
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (score === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await API.post('/rate', {
        swap_request_id: swapRequestId,
        rated_user_id: ratedUserId,
        score,
        comment: comment || null,
      });
      const data = response.data;

      // Reset form
      setScore(0);
      setComment('');
      
      // Show success toast
      if (window.showSuccess) {
        window.showSuccess('Rating submitted successfully!');
      }
      
      // Trigger global profile update event so Profile page refreshes
      window.dispatchEvent(new CustomEvent("profile-updated"));
      
      // Notify parent
      if (onRatingSubmitted) {
        onRatingSubmitted(data.rating);
      }

      // Close modal
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setScore(0);
    setHoverScore(0);
    setComment('');
    setError('');
    onClose();
  };

  return (
    <div className="rating-modal-overlay" onClick={handleClose}>
      {/* Floating background icons */}
      <span className="floating-icon" style={{ left: '10%', top: '20%', animationDelay: '0s' }}>★</span>
      <span className="floating-icon" style={{ left: '15%', top: '60%', animationDelay: '2s' }}>♥</span>
      <span className="floating-icon" style={{ left: '85%', top: '15%', animationDelay: '1s' }}>✨</span>
      <span className="floating-icon" style={{ left: '80%', top: '70%', animationDelay: '3s' }}>★</span>
      <span className="floating-icon" style={{ left: '50%', top: '10%', animationDelay: '1.5s' }}>♥</span>
      <span className="floating-icon" style={{ left: '5%', top: '80%', animationDelay: '2.5s' }}>✨</span>
      <span className="floating-icon" style={{ left: '90%', top: '50%', animationDelay: '0.5s' }}>★</span>
      <span className="floating-icon" style={{ left: '20%', top: '35%', animationDelay: '3.5s' }}>✨</span>
      <span className="floating-icon" style={{ left: '75%', top: '35%', animationDelay: '2s' }}>♥</span>
      <span className="floating-icon" style={{ left: '40%', top: '75%', animationDelay: '1s' }}>★</span>
      <span className="floating-icon" style={{ left: '25%', top: '50%', animationDelay: '0.8s' }}>✨</span>
      <span className="floating-icon" style={{ left: '70%', top: '20%', animationDelay: '2.2s' }}>♥</span>
      <span className="floating-icon" style={{ left: '12%', top: '45%', animationDelay: '1.7s' }}>★</span>
      <span className="floating-icon" style={{ left: '88%', top: '40%', animationDelay: '3.2s' }}>✨</span>
      <span className="floating-icon" style={{ left: '35%', top: '25%', animationDelay: '0.3s' }}>♥</span>
      <span className="floating-icon" style={{ left: '65%', top: '55%', animationDelay: '2.7s' }}>★</span>
      <span className="floating-icon" style={{ left: '8%', top: '65%', animationDelay: '1.2s' }}>✨</span>
      <span className="floating-icon" style={{ left: '92%', top: '25%', animationDelay: '3.8s' }}>♥</span>
      <span className="floating-icon" style={{ left: '45%', top: '60%', animationDelay: '0.6s' }}>★</span>
      <span className="floating-icon" style={{ left: '58%', top: '40%', animationDelay: '2.3s' }}>✨</span>
      <span className="floating-icon" style={{ left: '18%', top: '15%', animationDelay: '1.4s' }}>♥</span>
      <span className="floating-icon" style={{ left: '78%', top: '60%', animationDelay: '3.1s' }}>★</span>
      <span className="floating-icon" style={{ left: '3%', top: '35%', animationDelay: '0.9s' }}>✨</span>
      <span className="floating-icon" style={{ left: '62%', top: '75%', animationDelay: '2.5s' }}>♥</span>
      <span className="floating-icon" style={{ left: '32%', top: '70%', animationDelay: '1.6s' }}>★</span>
      <span className="floating-icon" style={{ left: '95%', top: '65%', animationDelay: '3.3s' }}>✨</span>
      <span className="floating-icon" style={{ left: '22%', top: '75%', animationDelay: '0.4s' }}>♥</span>
      <span className="floating-icon" style={{ left: '72%', top: '45%', animationDelay: '2.1s' }}>★</span>
      <span className="floating-icon" style={{ left: '38%', top: '15%', animationDelay: '1.8s' }}>✨</span>
      <span className="floating-icon" style={{ left: '82%', top: '85%', animationDelay: '3.5s' }}>♥</span>
      <span className="floating-icon" style={{ left: '7%', top: '25%', animationDelay: '0.7s' }}>★</span>
      <span className="floating-icon" style={{ left: '52%', top: '30%', animationDelay: '2.4s' }}>✨</span>
      <span className="floating-icon" style={{ left: '68%', top: '10%', animationDelay: '1.3s' }}>♥</span>
      
      <div className="rating-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="rating-modal-close" onClick={handleClose}>×</button>
        
        <h2>Rate {ratedUserName}</h2>
        <p className="rating-modal-subtitle">How was your experience with this user?</p>

        <form onSubmit={handleSubmit}>
          <div className="rating-stars-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`rating-star ${(hoverScore || score) >= star ? 'active' : ''}`}
                onClick={() => setScore(star)}
                onMouseEnter={() => setHoverScore(star)}
                onMouseLeave={() => setHoverScore(0)}
              >
                ★
              </button>
            ))}
          </div>

          {score > 0 && (
            <p className="rating-score-text">
              {score === 1 && 'Poor'}
              {score === 2 && 'Fair'}
              {score === 3 && 'Good'}
              {score === 4 && 'Very Good'}
              {score === 5 && 'Excellent'}
            </p>
          )}

          <textarea
            className="rating-comment"
            placeholder="Share your experience (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={4}
          />

          {error && <p className="rating-error">{error}</p>}

          <div className="rating-modal-actions">
            <button type="button" className="rating-btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="rating-btn-submit" disabled={loading || score === 0}>
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
