import React, { useEffect, useState } from 'react';
import logo from "./assets/new/favicon.png";
import axios from 'axios';
import "./App.scss";
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import tickMark from "./tick.svg";
import tickMarkValid from "./tickMarkValid.svg";
import { ApplyWelcomeBonus } from "../../views/inner-pages/pages/services/wallet";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
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

          // ✅ Award welcome bonus only for Users, not Partners
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

  return (
    <>
      <div className='regContainer'>
        <div className='regleftside'></div>

        <div className='regrightside'>
          <div>
            <img src={logo} alt="" className='logoimg' />
            <h2>Register</h2>

            <div className='input1'>
              <input
                type="email"
                placeholder='Email'
                disabled={showOtp}
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
              />
            </div>

            <div className='input1'>
              <input
                type="text"
                placeholder='Username...'
                disabled={showOtp}
                value={userName}
                onChange={e => setUserName(e.target.value)}
              />
            </div>

            {isPartner && (
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
            )}

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

            <div className='passreq' onClick={() => setShowPassReq(!showPassReq)}>
              See Password Requirements
            </div>

            {showPassReq && (
              <div className='passreqCard'>
                <div>{validations.capitalLetter ? <img src={tickMarkValid} /> : <img src={tickMark} />} One Capital Letter</div>
                <div>{validations.specialCharacter ? <img src={tickMarkValid} /> : <img src={tickMark} />} One Special Character</div>
                <div>{validations.tenCharacters ? <img src={tickMarkValid} /> : <img src={tickMark} />} Ten Characters</div>
                <div>{validations.oneNumber ? <img src={tickMarkValid} /> : <img src={tickMark} />} One Number</div>
              </div>
            )}

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

            <div
              className='nextStep'
              style={{
                opacity:
                  userEmail &&
                    userName &&
                    (isUser || partnerType) &&
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
    </>
  );
};

export default NewHomePage; 