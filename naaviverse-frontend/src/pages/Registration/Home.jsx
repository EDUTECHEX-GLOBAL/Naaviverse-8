import React, { useEffect, useState } from 'react';
import logo from "./assets/new/favicon.png";
import axios from 'axios';
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import tickMark from "./tick.svg";
import tickMarkValid from "./tickMarkValid.svg";

const NewHomePage = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [partnerType, setPartnerType] = useState(""); // ⭐ Required field
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

  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const role = urlParams.get('role');
    setSignupRole(role || "Partner"); // Default to Partner
  }, [location]);

  const handleCreateAccount = () => {
    if (!partnerType) {
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

      axios.post("http://localhost:4545/api/auth/checkEmailDuplicate", {
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
    axios.post("http://localhost:4545/api/partner/signup", {
      username: userName,
      email: userEmail,
      password: userPassword,
      partnerType: partnerType // ⭐ MUST SEND THIS
    })
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
    axios.post("http://localhost:4545/api/partner/verifyotp", {
      email: userEmail.trim(),
      username: userName.trim(),
      otp: userOtp.trim(),
    })
    .then(({ data }) => {
      if (data.success) {
        navigate(`/login?role=${signupRole}`);
      } else {
        setWrongOtp(true);
      }
    })
    .catch(() => {
      alert("OTP verification failed.");
    });
  };

  return (
    <>
      <div className='regContainer'>
        <div className='regleftside'></div>

        <div className='regrightside'>
          <div>
            <img src={logo} alt="" className='logoimg' />
            <h2>Register</h2>

            {/* EMAIL */}
            <div className='input1'>
              <input
                type="email"
                placeholder='Email'
                disabled={showOtp}
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
              />
            </div>

            {/* USERNAME */}
            <div className='input1'>
              <input
                type="text"
                placeholder='Username...'
                disabled={showOtp}
                value={userName}
                onChange={e => setUserName(e.target.value)}
              />
            </div>

            {/* CLEAN PARTNER DROPDOWN */}
            <select
              disabled={showOtp}
              value={partnerType}
              onChange={(e) => setPartnerType(e.target.value)}
              className="partnerTypeDropdown"
            >
              <option value="">Select Partner Type</option>
              <option value="Distributor">Distributor</option>
              <option value="Vendor">Vendor</option>
              <option value="Mentor">Mentor</option>
              <option value="Institution">Institution</option>
            </select>

            {/* PASSWORD FIELDS */}
            <div className='passwordWrapper'>
              <div className='input2'>
                <input
                  type="password"
                  placeholder='Password'
                  disabled={showOtp}
                  value={userPassword}
                  onChange={e => setUserPassword(e.target.value)}
                />
              </div>

              <div className='input2'>
                <input
                  type="password"
                  placeholder='Confirm Password'
                  disabled={showOtp}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{
                    border: userPassword === confirmPassword ? "#e7e7e7" : "1px solid red"
                  }}
                />
              </div>
            </div>

            {/* PASSWORD REQUIREMENTS */}
            <div className='passreq' onClick={() => setShowPassReq(!showPassReq)}>
              See Password Requirements
            </div>

            {showPassReq && (
              <div className='passreqCard'>
                <div style={{ color: validations.capitalLetter ? 'green' : 'red' }}>
                  {validations.capitalLetter ? <img src={tickMarkValid} /> : <img src={tickMark} />}
                  Minimum One Capital Letter
                </div>
                <div style={{ color: validations.specialCharacter ? 'green' : 'red' }}>
                  {validations.specialCharacter ? <img src={tickMarkValid} /> : <img src={tickMark} />}
                  Minimum One Special Character
                </div>
                <div style={{ color: validations.tenCharacters ? 'green' : 'red' }}>
                  {validations.tenCharacters ? <img src={tickMarkValid} /> : <img src={tickMark} />}
                  Minimum Ten Characters
                </div>
                <div style={{ color: validations.oneNumber ? 'green' : 'red' }}>
                  {validations.oneNumber ? <img src={tickMarkValid} /> : <img src={tickMark} />}
                  Minimum One Number
                </div>
              </div>
            )}

            {/* OTP FIELD */}
            {showOtp && (
              <div className='input2' style={{ width: '100%', marginTop: "40px" }}>
                <input
                  type="text"
                  placeholder='Email verification code'
                  value={userOtp}
                  onChange={e => setUserOtp(e.target.value)}
                />
              </div>
            )}

            {/* NEXT BUTTON */}
            <div
              className='nextStep'
              style={{
                opacity:
                  userEmail &&
                  userName &&
                  partnerType &&
                  userPassword &&
                  confirmPassword &&
                  userPassword === confirmPassword &&
                  validations.capitalLetter &&
                  validations.specialCharacter &&
                  validations.tenCharacters &&
                  validations.oneNumber
                    ? 1
                    : 0.5
              }}
              onClick={showOtp ? confirmEmail : handleCreateAccount}
            >
              {loading ? "Loading..." : showOtp ? "Submit" : "Next Step"}
            </div>
          </div>
        </div>
      </div>

      {/* CSS FIX */}
      <style>{`
        .partnerTypeDropdown {
          width: 100%;
          height: 56px;
          padding: 0 15px;
          font-size: 16px;
          border-radius: 12px;
          border: 1px solid #c4d2e3;
          background-color: white;
          appearance: none;
          margin-bottom: 20px;
          background-image: url("data:image/svg+xml;utf8,<svg fill='gray' height='24' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24'><path d='M7 10l5 5 5-5z'/></svg>");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 18px;
        }

        .partnerTypeDropdown:focus {
          outline: none;
          border-color: #7aa7ff;
          box-shadow: 0 0 0 2px rgba(122,167,255,0.2);
        }
      `}</style>
    </>
  );
};

export default NewHomePage;
