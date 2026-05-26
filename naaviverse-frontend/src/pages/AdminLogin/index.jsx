import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from "../../assets/images/logo/naavi_final_logo2.png";
import loadinglogo from "./loadinglogo.svg"; // Update with your loading logo path
import info from "./info.svg";


const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
    const [newPassword2, setNewPassword2] = useState('');
    const [passwordResetMsg, setPasswordResetMsg] = useState('');
    const navigate = useNavigate();
    const [code, setCode] = useState('');

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const handleLogin = async () => {
  setIsLoading(true);

  try {
    const response = await axios.post(
      `${BASE_URL}/api/admin/login`,
      { email, password }
    );

    if (response.status === 200) {
      localStorage.setItem("adminuser", JSON.stringify({ email }));
      navigate('/admin/dashboard/accountants');
    }
  } catch (error) {
    setIsError(true);
    console.error('Login failed:', error);
  } finally {
    setIsLoading(false);
  }
};

    const initiateForgotPassword = () => {
        setIsLoading(true);
        let obj = {
            email: email,
            app_code: "naavi",
        };
        axios
            .post(
                `https://gxauth.apimachine.com/gx/user/password/forgot/request`,
                obj
            )
            .then((response) => {
                let result = response?.data;
                // console.log(result, "initiateForgotPassword result");
                if (result?.status) {
                    setIsLoading(false);
                    setForgotPasswordStep(2);
                }
            })
            .catch((error) => {
                console.log(error, "error in initiateForgotPassword");
            });
    };

    const submitForgotPassword = () => {
        let obj = {
            email: email,
            code: code,
            newPassword: newPassword2,
        };
        axios
            .post(
                `https://gxauth.apimachine.com/gx/user/password/forgot/confirm`,
                obj
            )
            .then((response) => {
                let result = response?.data;
                // console.log(result, "submitForgotPassword result");
                if (result?.status) {
                    setPasswordResetMsg("Password reset successfully");
                    setForgotPassword(false);
                    setForgotPasswordStep(1);
                    setEmail("");
                }
            })
            .catch((error) => {
                console.log(error, " error in submitForgotPassword");
            });
    };



    return (
        <div className="login-main">
            {forgotPassword ? (
                forgotPasswordStep === 1 ? (
                    <div className="login-box">
                        <div className="full-logo-box" style={{ marginBottom: "5rem" }}>
                            <img className="full-logo" src={logo} alt="" style={{ width: "50%" }} />
                        </div>
                        <div className="input-box" style={{ marginBottom: "5rem" }}>
                            <input
                                className="input-inp"
                                type="text"
                                placeholder="Email"
                                required
                                id="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onInput={(e) => { setIsError(false); setEmail(e.target.value); }}
                            />
                        </div>
                        <div
                            className="login-btn"
                            onClick={() => { if (email?.length > 0) { initiateForgotPassword(); } }}
                            style={{ opacity: email?.length > 0 ? "1" : "0.5" }}
                        >
                            Next Step
                        </div>
                        <div className="google-btn" onClick={() => { setForgotPassword(false); setEmail(""); }}>
                            <div>Never Mind</div>
                        </div>
                    </div>
                ) : (
                    <div className="login-box">
                        <div className="input-box">
                            <input
                                className="input-inp"
                                type="text"
                                placeholder="Enter code"
                                value={code}
                                onInput={e => setCode(e.target.value)}
                            />
                        </div>
                        <div className="input-box">
                            <input
                                className="input-inp"
                                type="password"
                                placeholder="New Password"
                                value={newPassword2}
                                onInput={e => setNewPassword2(e.target.value)}
                            />
                        </div>
                        <div
                            className="login-btn"
                            onClick={() => { if (code && newPassword2) submitForgotPassword(); }}
                            style={{ opacity: (code && newPassword2) ? "1" : "0.5" }}
                        >
                            Submit
                        </div>
                        <div className="google-btn" onClick={() => { setForgotPassword(false); setForgotPasswordStep(1); setCode(""); setNewPassword2(""); }}>
                            <div>Cancel</div>
                        </div>
                    </div>
                )
            ) : (
                <div className="login-box">
                    <div className="full-logo-box">
                        <img className="full-logo" src={logo} alt="" style={{ width: "50%" }} />
                    </div>
                    <div style={{ marginTop: passwordResetMsg?.length > 1 ? "1.5rem" : "", marginBottom: passwordResetMsg?.length > 1 ? "1.5rem" : "", }}>
                        {passwordResetMsg?.length > 1 ? passwordResetMsg : ""}
                    </div>
                    {isError && (
                        <div className="prompt-div">
                            <div>
                                <img src={info} alt="" />
                            </div>
                            <div>The credentials you entered are incorrect. Please try again or reset your password.</div>
                        </div>
                    )}
                    <div className="input-box">
                        <input
                            className="input-inp"
                            type="text"
                            placeholder="Email"
                            required
                            id="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onInput={(e) => { setIsError(false); setEmail(e.target.value); }}
                        />
                    </div>
                    <div className="input-box">
                        <input
                            className="input-inp"
                            type="password"
                            placeholder="Password"
                            id="password"
                            autoComplete="new-password"
                            name="password"
                            required
                            value={password}
                            onInput={(e) => { setIsError(false); setPassword(e.target.value); }}
                        />
                    </div>
                    <div className="forgot" onClick={() => { setForgotPassword(true); setIsError(false); }}>
                        Forgot Password
                    </div>
                    <div className="login-btn" onClick={handleLogin}>
                        Login
                    </div>
                </div>
            )}
            {isLoading && (
                <div className="otclogo">
                    <img className="otclogoimg" src={loadinglogo} alt="" />
                </div>
            )}
        </div>
    );
};

export default AdminLogin;




