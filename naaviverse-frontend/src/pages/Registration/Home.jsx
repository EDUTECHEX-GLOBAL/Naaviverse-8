import React, { useEffect, useState } from 'react';
import logo from "../../logos/naavi_final_logo2.png"; // ⚠️ adjust to actual relative path from this file to src/logos
import signupHero from "./assets/images/signup_hero.png";
import axios from 'axios';
import "./App.scss";
import { useLocation, useNavigate } from "react-router-dom";
import tickMark from "./tick.svg";
import tickMarkValid from "./tickMarkValid.svg";
import { ApplyWelcomeBonus } from "../../views/inner-pages/pages/services/wallet";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* ── inline field icons (no new deps) ── */
const EmailIcon = () => (
  <svg className="fieldIcon" viewBox="0 0 24 24" fill="none">
    <path d="M3 6.5C3 5.67 3.67 5 4.5 5h15c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z" stroke="currentColor" strokeWidth="1.6" />
    <path d="m4 6.5 8 6.5 8-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const UserIcon = () => (
  <svg className="fieldIcon" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4.5 20c1.2-3.6 4.2-5.5 7.5-5.5s6.3 1.9 7.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const LockIcon = () => (
  <svg className="fieldIcon" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const EyeIcon = () => (
  <svg className="eyeToggleIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg className="eyeToggleIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg className="fieldIcon" viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="7.5" width="17" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
const OtpIcon = () => (
  <svg className="fieldIcon" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4 9h16" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const UserToggleIcon = () => (
  <svg className="toggleIcon" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4.5 20c1.2-3.6 4.2-5.5 7.5-5.5s6.3 1.9 7.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const PartnerToggleIcon = () => (
  <svg className="toggleIcon" viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="7.5" width="17" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const NewHomePage = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [partnerType, setPartnerType] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [userOtp, setUserOtp] = useState('');
  const [wrongOtp, setWrongOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupRole, setSignupRole] = useState("");
  const [showPassReq, setShowPassReq] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [validations, setValidations] = useState({
    capitalLetter: false,
    specialCharacter: false,
    tenCharacters: false,
    oneNumber: false
  });

  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const role = urlParams.get("role");
    const type = urlParams.get("type");
    if (role === "Accountants" || role === "partner" || type === "partner") {
      setSignupRole("Accountants");
    } else {
      setSignupRole("Users");
    }
  }, [location]);

  const isUser = signupRole === "Users";
  const isPartner = signupRole === "Accountants";

  useEffect(() => {
    validatePassword(userPassword);
  }, [userPassword]);

  const validatePassword = (password) => {
    const capitalLetterRegex = /[A-Z]/;
    const specialCharacterRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    const numberRegex = /[0-9]/;

    setValidations({
      capitalLetter: capitalLetterRegex.test(password),
      specialCharacter: specialCharacterRegex.test(password),
      tenCharacters: password.length >= 10,
      oneNumber: numberRegex.test(password)
    });
  };

  const handleCreateAccount = () => {
    if (isPartner && !partnerType) {
      alert("Please select a Partner Type.");
      return;
    }

    if (userPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (
      !validations.capitalLetter ||
      !validations.specialCharacter ||
      !validations.tenCharacters ||
      !validations.oneNumber
    ) {
      setErrorMessage("Please ensure all password requirements are met.");
      setShowPassReq(true);
      return;
    }

    setLoading(true);
    const cleanEmail = (userEmail || "").trim().toLowerCase();
    axios.post(`${BASE_URL}/api/auth/checkEmailDuplicate`, {
      email: cleanEmail
    })
      .then(({ data }) => {
        if (data.count === 1 || data.exists) {
          setLoading(false);
          setErrorMessage("This email is already registered.");
        } else {
          registerUser();
        }
      })
      .catch((err) => {
        setLoading(false);
        const msg = err.response?.data?.message;
        if (msg && msg.toLowerCase().includes("already exists")) {
          setErrorMessage("This email is already registered.");
        } else {
          setErrorMessage("Error checking email.");
        }
      });
  };

  const registerUser = () => {
    const signupUrl = isUser
      ? `${BASE_URL}/api/auth/signup`
      : `${BASE_URL}/api/partner/signup`;

    const cleanEmail = (userEmail || "").trim().toLowerCase();
    const cleanUser = (userName || "").trim();

    const payload = isUser
      ? {
        username: cleanUser,
        email: cleanEmail,
        password: userPassword,
      }
      : {
        username: cleanUser,
        email: cleanEmail,
        password: userPassword,
        partnerType: partnerType,
      };

    axios.post(signupUrl, payload)
      .then(({ data }) => {
        setLoading(false);
        if (data.success) {
          setShowOtp(true);
        } else {
          alert(data.message || "Signup failed.");
        }
      })
      .catch((err) => {
        setLoading(false);
        alert(err.response?.data?.message || "Signup failed.");
      });
  };

  const confirmEmail = () => {
    const verifyOtpUrl = isUser
      ? `${BASE_URL}/api/auth/verifyotp`
      : `${BASE_URL}/api/partner/verifyotp`;

    const cleanEmail = (userEmail || "").trim().toLowerCase();
    const cleanUser = (userName || "").trim();

    axios.post(verifyOtpUrl, {
      email: cleanEmail,
      username: cleanUser,
      password: userPassword,
      partnerType: partnerType,
      otp: (userOtp || "").trim(),
    })
      .then(({ data }) => {
        if (data.success) {
          if (isUser) {
            ApplyWelcomeBonus(cleanEmail)
              .then(() => console.log("Welcome bonus applied"))
              .catch((err) => console.error("Welcome bonus failed:", err.message));
          }
          navigate(`/login?role=${signupRole}`);
        } else {
          setWrongOtp(true);
        }
      })
      .catch(() => {
        setWrongOtp(true);
      });
  };

  const heroData = {
    Users: {
      badge: "Join 10,000+ Users",
      title: "Start Your",
      highlight: "Journey Today",
      subtitle: "Create your account and unlock personalized career assessments, AI-powered skill recommendations, and expert mentorship.",
      features: [
        { icon: "🎯", text: "Personalized career path recommendations" },
        { icon: "📊", text: "AI-powered skill gap analysis" },
        { icon: "🏆", text: "Industry-recognized certifications" },
      ],
    },
    Accountants: {
      badge: "Trusted Partner Network",
      title: "Become a",
      highlight: "Partner",
      subtitle: "Register as a partner to access exclusive business tools, manage your clients, and grow your professional practice.",
      features: [
        { icon: "💼", text: "Complete business management suite" },
        { icon: "📈", text: "Client analytics & growth insights" },
        { icon: "🤝", text: "Dedicated partner support team" },
      ],
    },
  };

  const hero = heroData[signupRole] || heroData.Accountants;

  const isFormValid =
    userEmail &&
    userName &&
    (isUser || partnerType) &&
    userPassword &&
    confirmPassword &&
    userPassword === confirmPassword &&
    validations.capitalLetter &&
    validations.specialCharacter &&
    validations.tenCharacters &&
    validations.oneNumber;

  const handleGoogleAuth = () => {
    const role = isUser ? "Users" : "Accountants";
    localStorage.setItem("userType", isUser ? "user" : "partner");
    localStorage.setItem("googleAuthRole", role);
    if (isPartner && partnerType) {
      localStorage.setItem("partnerType", partnerType);
    }

    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/register`);

    if (!clientId) {
      alert(
        "Google Client ID is missing.\n\nPlease add REACT_APP_GOOGLE_CLIENT_ID=<your-google-client-id> to your .env file."
      );
      return;
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=email%20profile%20openid&prompt=select_account`;

    window.location.href = googleAuthUrl;
  };

  return (
    <div className='regContainer'>
      {/* ── LEFT HERO PANEL (Logo above image in both desktop and mobile) ── */}
      <div className='regleftside'>
        <div className="auth-hero-header">
          <img src={logo} alt="SkillNaav" className="auth-hero-logo" onClick={() => navigate("/")} />
        </div>
        <div className="hero-visual-area">
          <img src={signupHero} alt="Join Naaviverse" className="hero-bg" />
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              {hero.badge}
            </div>
            <h1 className="hero-title">
              {hero.title}{" "}
              <span className="hero-highlight">{hero.highlight}</span>
            </h1>
            <p className="hero-subtitle">{hero.subtitle}</p>
            <div className="hero-features">
              {hero.features.map((feat, i) => (
                <div className="feature-item" key={i}>
                  <div className="feature-icon">{feat.icon}</div>
                  <span>{feat.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className='regrightside'>
        <div className='reginside'>

          <div className="brandRow">
            <img src={logo} alt="Naaviverse" className='logoimg' />
          </div>

          <div className="reg-welcome-title">
            {isUser ? "Create Your Account" : "Partner Registration"}
          </div>
          <div className="reg-welcome-subtitle">
            {isUser
              ? "Fill in your details to get started on your career journey"
              : "Register your business and join our growing partner network"}
          </div>

          {/* Role pill switcher */}
          <div className="toggle-box">
            <div
              className={`toggle-each ${isUser ? "toggle-each-active" : ""}`}
              onClick={() => {
                setSignupRole("Users");
                setErrorMessage("");
              }}
            >
              <UserToggleIcon /> User Signup
            </div>
            <div
              className={`toggle-each ${isPartner ? "toggle-each-active" : ""}`}
              onClick={() => {
                setSignupRole("Accountants");
                setErrorMessage("");
              }}
            >
              <PartnerToggleIcon /> Partner Signup
            </div>
          </div>

          {errorMessage && <div className="errorMsg">{errorMessage}</div>}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (loading) return;
              if (showOtp) {
                if (userOtp && userOtp.trim().length > 0) confirmEmail();
              } else if (isFormValid) {
                handleCreateAccount();
              }
            }}
            style={{ width: "100%" }}
          >
            <div className='input1'>
              <EmailIcon />
              <input
                type="email"
                placeholder='Email address'
                disabled={showOtp}
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
              />
            </div>

            <div className='input1'>
              <UserIcon />
              <input
                type="text"
                placeholder='Choose a username'
                disabled={showOtp}
                value={userName}
                onChange={e => setUserName(e.target.value)}
              />
            </div>

            {isPartner && (
              <div className={`input1 selectWrap ${partnerType ? "hasValue" : ""}`}>
                <BriefcaseIcon />
                <select
                  disabled={showOtp}
                  value={partnerType}
                  onChange={(e) => setPartnerType(e.target.value)}
                >
                  <option value="">Select Partner Type</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Mentor">Mentor</option>
                  <option value="Institution">Institution</option>
                </select>
              </div>
            )}

            <div className='passwordWrapper'>
              <div className='input2'>
                <LockIcon />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder='Create password'
                  disabled={showOtp}
                  value={userPassword}
                  onChange={e => setUserPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <div className='input2'>
                <LockIcon />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder='Confirm password'
                  disabled={showOtp}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{
                    borderColor: confirmPassword && userPassword !== confirmPassword ? "#ef4444" : undefined,
                  }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className='passreq' onClick={() => setShowPassReq(!showPassReq)}>
              {showPassReq ? "Hide" : "View"} Password Requirements
            </div>

            {showPassReq && (
              <div className='passreqCard'>
                <div>{validations.capitalLetter ? <img src={tickMarkValid} alt="✓" /> : <img src={tickMark} alt="○" />} One Capital Letter</div>
                <div>{validations.specialCharacter ? <img src={tickMarkValid} alt="✓" /> : <img src={tickMark} alt="○" />} One Special Character</div>
                <div>{validations.tenCharacters ? <img src={tickMarkValid} alt="✓" /> : <img src={tickMark} alt="○" />} Ten Characters</div>
                <div>{validations.oneNumber ? <img src={tickMarkValid} alt="✓" /> : <img src={tickMark} alt="○" />} One Number</div>
              </div>
            )}

            {showOtp && (
              <>
                <div className="otpHelperText">
                  {wrongOtp
                    ? <span className="otpError">Incorrect code. Please check and try again.</span>
                    : "We've sent a verification code to your email. Please enter it below."
                  }
                </div>
                <div className='input2 otpInput'>
                  <OtpIcon />
                  <input
                    type="text"
                    placeholder='Enter 6-digit code'
                    value={userOtp}
                    onChange={e => setUserOtp(e.target.value)}
                    maxLength={6}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={showOtp ? (!userOtp || userOtp.trim().length === 0 || loading) : (!isFormValid || loading)}
              className={`nextStep ${(showOtp ? (userOtp && userOtp.trim().length > 0 && !loading) : (isFormValid && !loading)) ? "" : "disabled"}`}
            >
              {loading ? "Creating Account..." : showOtp ? "Verify & Continue" : "Create Account"}
            </button>
          </form>

          <div className="login-divider">
            <div className="divider-line"></div>
            <span className="divider-text">or</span>
            <div className="divider-line"></div>
          </div>

          <div className="google-btn" onClick={handleGoogleAuth}>
            <GoogleIcon />
            <span>Continue with Google</span>
          </div>

          <div className="login-link-section">
            Already have an account?{" "}
            <span
              className="login-link"
              onClick={() => navigate(`/login?role=${signupRole}`)}
            >
              Sign In
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHomePage;