import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  const [search] = useState("");

  const tags = ["React", "Node", "SQL", "Mobile Dev", "AI/ML", "Design", "DevOps"];

  return (
    <div className="landing-wrapper">
      {/* Animated Background Icons */}
      <div className="floating-icons">
        <i className="fa-solid fa-code floating-icon icon-1"></i>
        <i className="fa-solid fa-laptop-code floating-icon icon-2"></i>
        <i className="fa-solid fa-book floating-icon icon-3"></i>
        <i className="fa-solid fa-lightbulb floating-icon icon-4"></i>
        <i className="fa-solid fa-graduation-cap floating-icon icon-5"></i>
        <i className="fa-solid fa-rocket floating-icon icon-6"></i>
        <i className="fa-solid fa-brain floating-icon icon-7"></i>
        <i className="fa-solid fa-users floating-icon icon-8"></i>
        <i className="fa-solid fa-puzzle-piece floating-icon icon-9"></i>
        <i className="fa-solid fa-chart-line floating-icon icon-10"></i>
        <i className="fa-solid fa-book-open floating-icon icon-11"></i>
        <i className="fa-solid fa-microchip floating-icon icon-12"></i>
        <i className="fa-solid fa-arrows-rotate floating-icon icon-13"></i>
        <i className="fa-solid fa-user-group floating-icon icon-14"></i>
        <i className="fa-solid fa-pencil floating-icon icon-15"></i>
        <i className="fa-solid fa-database floating-icon icon-16"></i>
        <i className="fa-solid fa-repeat floating-icon icon-17"></i>
        <i className="fa-solid fa-people-group floating-icon icon-18"></i>
        <i className="fa-solid fa-calculator floating-icon icon-19"></i>
        <i className="fa-solid fa-server floating-icon icon-20"></i>
        <i className="fa-solid fa-handshake floating-icon icon-21"></i>
        <i className="fa-solid fa-mobile-screen floating-icon icon-22"></i>
        <i className="fa-solid fa-message floating-icon icon-23"></i>
        <i className="fa-solid fa-desktop floating-icon icon-24"></i>
        <i className="fa-solid fa-trophy floating-icon icon-25"></i>
        <i className="fa-solid fa-gear floating-icon icon-26"></i>
        <i className="fa-solid fa-star floating-icon icon-27"></i>
        <i className="fa-solid fa-clock floating-icon icon-28"></i>
        <i className="fa-solid fa-exchange-alt floating-icon icon-29"></i>
        <i className="fa-solid fa-certificate floating-icon icon-30"></i>
      </div>

      {/* NAVBAR */}
      <nav className="navbar-full">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="logo-brand"><i className="fa-solid fa-circle-nodes" style={{color: '#4fd1c5'}}></i> Swap<span>pify</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link to="/login" className="btn-connexion-glow">Sign In</Link>
          <Link to="/login" className="btn-register-glow">Get Started</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="hero-full">
        <div className="neuron-background"></div>
        <h1 className="main-title">Trade Skills, Learn Together</h1>
        <p className="sub-title">
          Connect with peers, exchange knowledge, and grow your skillset through collaborative learning
        </p>

        <div className="hero-search-box">
          <div className="search-inner">
            <i className="fa-solid fa-magnifying-glass" style={{ color: "#1de9b6" }}></i>
            <input
              type="text"
              placeholder="Search for skills: React, Python, Design..."
              value={search}
              readOnly
              style={{ cursor: "default" }}
            />
            <button className="btn-search-gradient">
              Find Matches
            </button>
          </div>
        </div>

        <div className="tags-row">
          {tags.map((tag) => (
            <div 
              key={tag} 
              className="skill-pill"
            >
              {tag}
            </div>
          ))}
        </div>

        {/* PROMO BANNER */}
        <div className="promo-banner">
          <div className="promo-content">
            <h2>Become a Master Swapper</h2>
            <p>Share your knowledge. Learn new skills. Level up together.</p>
            <Link to="/login" className="btn-start-swapping-hero">Start Swapping</Link>
          </div>
          
          <div className="promo-image">
            <img 
              src="https://wpvip.edutopia.org/wp-content/uploads/2024/12/hero_blog_Brain-Based-Learning_Teaching-Strategies_photo_iStock_2154414848_SeventyFour.jpg?w=2880&quality=85" 
              alt="Students learning together" 
            />
          </div>

          <div className="sparkle-icon">
            <i className="fa-solid fa-sparkles"></i>
          </div>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-icon">
              <i className="fa-solid fa-user-plus"></i>
            </div>
            <h3>1. Create Your Profile</h3>
            <p>List the skills you want to teach and what you want to learn</p>
          </div>
          <div className="step-card">
            <div className="step-icon">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <h3>2. Find Matches</h3>
            <p>Browse users with complementary skills and send swap requests</p>
          </div>
          <div className="step-card">
            <div className="step-icon">
              <i className="fa-solid fa-handshake"></i>
            </div>
            <h3>3. Start Learning</h3>
            <p>Connect via chat, schedule sessions, and grow together</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Swappify?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fa-solid fa-comments feature-icon"></i>
            <h3>Real-Time Chat</h3>
            <p>Instant messaging to coordinate learning sessions and share resources</p>
          </div>
          <div className="feature-card">
            <i className="fa-solid fa-star feature-icon"></i>
            <h3>Rating System</h3>
            <p>Build your reputation and find trusted learning partners</p>
          </div>
          <div className="feature-card">
            <i className="fa-solid fa-search feature-icon"></i>
            <h3>Smart Matching</h3>
            <p>Discover perfect skill swap partners based on your goals</p>
          </div>
          <div className="feature-card">
            <i className="fa-solid fa-calendar feature-icon"></i>
            <h3>Swap Requests</h3>
            <p>Organize and manage your skill exchanges effortlessly</p>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <footer className="footer-banner-full">
        <div className="footer-links">
          <div className="footer-column">
            <h4>Platform</h4>
            <Link to="/dashboard">Browse Users</Link>
            <Link to="/login">Sign In</Link>
          </div>
          <div className="footer-column">
            <h4>Community</h4>
            <Link to="/dashboard">Find Matches</Link>
            <Link to="/login">Join Now</Link>
          </div>
          <div className="footer-column">
            <h4>Swappify</h4>
            <p>© 2026 Swappify</p>
            <p>Trade skills, learn together</p>
          </div>
        </div>
      </footer>
    </div>
  );
}