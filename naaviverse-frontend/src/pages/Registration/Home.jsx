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

const NewHomePage = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    setSignupRole(role || "Accountants");
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

    if (
      validations.capitalLetter &&
      validations.specialCharacter &&
      validations.tenCharacters &&
      validations.oneNumber &&
      userPassword === confirmPassword
    ) {
      setLoading(true);

      axios.post(`${BASE_URL}/api/auth/checkEmailDuplicate`, {
        email: userEmail
      })
        .then(({ data }) => {
          if (data.count === 1) {
            setLoading(false);
            setErrorMessage("This email is already registered.");
          } else {
            registerUser();
          }
        })
        .catch(() => {
          setLoading(false);
          setErrorMessage("Error checking email.");
        });
    } else {
      alert("Ensure all password requirements are met.");
    }
  };

  const registerUser = () => {
    const signupUrl = isUser
      ? `${BASE_URL}/api/auth/signup`
      : `${BASE_URL}/api/partner/signup`;

    const payload = isUser
      ? {
        username: userName,
        email: userEmail,
        password: userPassword,
      }
      : {
        username: userName,
        email: userEmail,
        password: userPassword,
        partnerType: partnerType,
      };

    axios.post(signupUrl, payload)
      .then(({ data }) => {
        setLoading(false);
        if (data.success) {
          setShowOtp(true);
        } else {
          alert("Signup failed.");
        }
      })
      .catch(() => {
        setLoading(false);
        alert("Signup failed.");
      });
  };

  const confirmEmail = () => {
    const verifyOtpUrl = isUser
      ? `${BASE_URL}/api/auth/verifyotp`
      : `${BASE_URL}/api/partner/verifyotp`;

    axios.post(verifyOtpUrl, {
      email: userEmail.trim(),
      username: userName.trim(),
      otp: userOtp.trim(),
    })
      .then(({ data }) => {
        if (data.success) {
          if (isUser) {
            ApplyWelcomeBonus(userEmail.trim().toLowerCase())
              .then(() => console.log("Welcome bonus applied"))
              .catch((err) => console.error("Welcome bonus failed:", err.message));
          }
          navigate(`/login?role=${signupRole}`);
        } else {
          setWrongOtp(true);
        }
      })
      .catch(() => {
        alert("OTP verification failed.");
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

  return (
    <div className='regContainer'>
      {/* ── LEFT HERO PANEL ── */}
      <div className='regleftside'>
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

      {/* ── RIGHT FORM PANEL ── */}
      <div className='regrightside'>
        <div className="regFormCard">
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

          {errorMessage && <div className="errorMsg">{errorMessage}</div>}

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
                type="password"
                placeholder='Create password'
                disabled={showOtp}
                value={userPassword}
                onChange={e => setUserPassword(e.target.value)}
              />
            </div>

            <div className='input2'>
              <LockIcon />
              <input
                type="password"
                placeholder='Confirm password'
                disabled={showOtp}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{
                  borderColor: confirmPassword && userPassword !== confirmPassword ? "#ef4444" : undefined,
                }}
              />
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

          <div
            className={`nextStep ${isFormValid ? "" : "disabled"}`}
            onClick={showOtp ? confirmEmail : handleCreateAccount}
          >
            {loading ? "Creating Account..." : showOtp ? "Verify & Continue" : "Create Account"}
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