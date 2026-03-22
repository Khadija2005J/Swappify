import { useState } from "react";
import API from "../api";
import ReCAPTCHA from "react-google-recaptcha";
import "../App.css";

export default function Login() {
  const [isToggled, setIsToggled] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [loginMessage, setLoginMessage] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [loginCaptchaToken, setLoginCaptchaToken] = useState(null);
  const [registerCaptchaToken, setRegisterCaptchaToken] = useState(null);

  const RECAPTCHA_SITE_KEY =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LdUwIksAAAAAA2QlG-njMfKiP3p3z3-vdTdBjxx";

  const handleLoginChange = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginCaptchaToken) {
      setLoginMessage("Veuillez cocher la case reCAPTCHA.");
      return;
    }

    setLoginErrors({});
    setLoginMessage("");

    try {
      const res = await API.post("/login", { 
        ...loginForm, 
        'g-recaptcha-response': loginCaptchaToken 
      });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setLoginCaptchaToken(null);
      if (err.response?.data?.errors) {
        setLoginErrors(err.response.data.errors);
      } else {
        setLoginMessage(err.response?.data?.message || "Identifiants incorrects.");
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerCaptchaToken) {
      setRegisterMessage("Veuillez cocher la case reCAPTCHA.");
      return;
    }

    setRegisterErrors({});
    setRegisterMessage("");

    try {
      const res = await API.post("/register", { 
        ...registerForm, 
        'g-recaptcha-response': registerCaptchaToken 
      });
      localStorage.setItem("token", res.data.token);
      setRegisterMessage("Compte créé avec succès !");
      setTimeout(() => (window.location.href = "/dashboard"), 1000);
    } catch (err) {
      setRegisterCaptchaToken(null);
      if (err.response?.data?.errors) {
        setRegisterErrors(err.response.data.errors);
      } else {
        setRegisterMessage(err.response?.data?.message || "Erreur d'inscription.");
      }
    }
  };
  
  return (
    <>
      {/* Animated Background Icons */}
      <div className="floating-icons-login">
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
      
      <div className={isToggled ? "auth-wrapper toggled" : "auth-wrapper"}>
        <div className="background-shape"></div>
        <div className="secondary-shape"></div>

      {/* --- LOGIN PANEL --- */}
      <div className="credentials-panel signin">
        <h2 className="slide-element">Login</h2>
        <form onSubmit={handleLoginSubmit}>
          <div className="field-wrapper slide-element">
            <input
              type="text"
              name="email"
              required
              placeholder=" "
              value={loginForm.email}
              onChange={handleLoginChange}
            />
            <label>Email</label>
            <i className="fa-solid fa-envelope"></i>
            {loginErrors.email && (
              <span
                style={{
                  position: "absolute",
                  bottom: "-18px",
                  left: 0,
                  fontSize: "10px",
                  color: "red",
                }}
              >
                {loginErrors.email[0]}
              </span>
            )}
          </div>
          <div className="field-wrapper slide-element">
            <input
              type="password"
              name="password"
              required
              placeholder=" "
              value={loginForm.password}
              onChange={handleLoginChange}
            />
            <label>Password</label>
            <i className="fa-solid fa-lock"></i>
            {loginMessage && (
              <span
                style={{
                  position: "absolute",
                  bottom: "-18px",
                  left: 0,
                  fontSize: "10px",
                  color: "red",
                }}
              >
                {loginMessage}
              </span>
            )}
          </div>
          <div className="field-wrapper recaptcha-wrapper slide-element">
            <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} onChange={setLoginCaptchaToken} />
          </div>
          <div className="field-wrapper slide-element">
            <button className="submit-button" type="submit">
              Login
            </button>
          </div>
          <div className="switch-link slide-element">
            <p>
              Don't have an account? <br />
              <a
                href="#"
                className="register-trigger"
                onClick={(e) => {
                  e.preventDefault();
                  setIsToggled(true);
                }}
              >
                Sign Up
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* --- WELCOME BACK --- */}
      <div className="welcome-section signin">
        <h2 className="slide-element">WELCOME BACK!</h2>
      </div>

      {/* --- REGISTER PANEL --- */}
      <div className="credentials-panel signup">
        <h2 className="slide-element">Register</h2>
        <form onSubmit={handleRegisterSubmit}>
          {registerMessage && (
            <div
              className="slide-element"
              style={{
                marginBottom: "1rem",
                padding: "0.5rem",
                textAlign: "center",
                color: registerMessage.includes("successfully")
                  ? "#4caf50"
                  : "#f44336",
                fontSize: "0.9rem",
                marginTop: "-10px",
              }}
            >
              {registerMessage}
            </div>
          )}
          <div className="field-wrapper slide-element">
            <input
              type="text"
              name="name"
              required
              placeholder=" "
              value={registerForm.name}
              onChange={handleRegisterChange}
            />
            <label>Username</label>
            <i className="fa-solid fa-user"></i>
            {registerErrors.name && (
              <span
                style={{
                  position: "absolute",
                  bottom: "-18px",
                  left: 0,
                  fontSize: "10px",
                  color: "red",
                }}
              >
                {registerErrors.name[0]}
              </span>
            )}
          </div>
          <div className="field-wrapper slide-element">
            <input
              type="email"
              name="email"
              required
              placeholder=" "
              value={registerForm.email}
              onChange={handleRegisterChange}
            />
            <label>Email</label>
            <i className="fa-solid fa-envelope"></i>
            {registerErrors.email && (
              <span
                style={{
                  position: "absolute",
                  bottom: "-18px",
                  left: 0,
                  fontSize: "10px",
                  color: "red",
                }}
              >
                {registerErrors.email[0]}
              </span>
            )}
          </div>
          <div className="field-wrapper slide-element">
            <input
              type="password"
              name="password"
              required
              placeholder=" "
              value={registerForm.password}
              onChange={handleRegisterChange}
            />
            <label>Password</label>
            <i className="fa-solid fa-lock"></i>
            {registerErrors.password && (
              <span
                style={{
                  position: "absolute",
                  bottom: "-18px",
                  left: 0,
                  fontSize: "10px",
                  color: "red",
                }}
              >
                {registerErrors.password[0]}
              </span>
            )}
          </div>
          <div className="field-wrapper slide-element">
            <input
              type="password"
              name="password_confirmation"
              required
              placeholder=" "
              value={registerForm.password_confirmation}
              onChange={handleRegisterChange}
            />
            <label>Confirm Password</label>
            <i className="fa-solid fa-lock"></i>
            {registerErrors.password_confirmation && (
              <span
                style={{
                  position: "absolute",
                  bottom: "-18px",
                  left: 0,
                  fontSize: "10px",
                  color: "red",
                }}
              >
                {registerErrors.password_confirmation[0]}
              </span>
            )}
          </div>
          <div className="field-wrapper recaptcha-wrapper slide-element">
            <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} onChange={setRegisterCaptchaToken} />
          </div>
          <div className="field-wrapper slide-element">
            <button className="submit-button" type="submit">
              Register
            </button>
          </div>
          <div className="switch-link slide-element">
            <p>
              Already have an account? <br />
              <a
                href="#"
                className="login-trigger"
                onClick={(e) => {
                  e.preventDefault();
                  setIsToggled(false);
                }}
              >
                Sign In
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* --- WELCOME --- */}
      <div className="welcome-section signup">
        <h2 className="slide-element">WELCOME!</h2>
      </div>
      </div>
    </>
  );
}