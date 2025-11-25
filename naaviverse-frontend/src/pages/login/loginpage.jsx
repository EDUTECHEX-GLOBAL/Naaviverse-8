import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./loginpage.scss";
import lg1 from "../../static/images/login/lg1.svg";
import lg2 from "../../static/images/login/lg2.svg";
import google from "../../static/images/login/google.svg";
import realtorfull from "../../static/images/login/realtorfull.svg";
import eye1 from "../../static/images/login/eye1.svg";
import eye2 from "../../static/images/login/eye2.svg";
import { useStore } from "../../components/store/store.ts";
import logo from "./naavi_final_logo4.jpg";
import loadinglogo from "./naaviicon.png";
import axios from "axios";
import info from "./info.svg";
import { Loginservice } from "../../services/loginapis";


const IconMenu = [
    { id: 0, icon: lg1 },
    { id: 1, icon: lg2 },
];

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4545"; // ✅ default fallback

const Loginpage = () => {
    const navigate = useNavigate();
    const { accsideNav, setaccsideNav, loginType, setLoginType } = useStore();
    const [icon, setIcon] = useState(0);
    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const [eye, seteye] = useState(false);
    const [iserror, setiserror] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
    const [code, setCode] = useState("");
    const [newPassword1, setNewPassword1] = useState("");
    const [newPassword2, setNewPassword2] = useState("");
    const [passwordResetMsg, setPasswordResetMsg] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        localStorage.clear();
    }, []);

    const getProfilePic = async (email, loginType) => {
        try {
            const url =
                loginType === "Users"
                    ? `/api/auth/get-profile-pic`
                    : `/api/partner/get-profile-pic`;

            const response = await axios.get(url, { params: { email } });
            const data = response.data;

            if (data.status && data.profilePic) {
                localStorage.setItem("userProfilePic", data.profilePic);
                return data.profilePic;
            }
            return null;
        } catch (error) {
            console.error("Error fetching profile picture:", error);
            return null;
        }
    };

    const handleLogin = () => {
        setIsLoading(true);
        const obj = { email, password };

        Loginservice(obj, loginType)
            .then((response) => {
                const result = response.data;

                if (result?.token) {
                    localStorage.setItem("authToken", result.token);
                    localStorage.setItem("user", JSON.stringify(result.user));
                    localStorage.setItem("partner", JSON.stringify(result.partner));
                    localStorage.setItem("userType", loginType === "Users" ? "user" : "partner");

                    if (loginType === "Users") {
                        navigate("/dashboard/users/profile");
                    } else {
                        navigate("/dashboard/accountants/profile");
                    }

                    getProfilePic(email, loginType);
                    setiserror(false);
                } else {
                    console.error("Login failed:", result?.message || "Unknown error");
                    setiserror(true);
                }
            })
            .catch((error) => {
                console.error("Error during login:", error.message || error);
                setiserror(true);
            })
            .finally(() => setIsLoading(false));
    };

    // ✅ Updated initiateForgotPassword
    const initiateForgotPassword = async () => {
        if (!email) return;

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/${loginType === "Users" ? "api/auth" : "api/partner"}/forgotPassword`,
                { email }
            );

            const result = response.data;

            if (result?.success) {
                setForgotPasswordStep(2);
                console.log("OTP sent successfully");
            } else {
                console.error("Forgot password failed:", result?.message);
                alert(result?.message || "Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Error in initiateForgotPassword:", error);
            alert("Failed to send reset email. Please check the backend connection.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Updated submitForgotPassword
    const submitForgotPassword = async () => {
        if (!code || !newPassword2) return;

        const obj = {
            email,
            code,
            newPassword: newPassword2,
        };

        try {
            const response = await axios.post(
                `${API_BASE_URL}/${loginType === "Users" ? "api/auth" : "api/partner"}/updatepassword`,
                obj
            );

            const result = response.data;
            if (result?.success) {
                setPasswordResetMsg("Password reset successfully");
                setForgotPassword(false);
                setForgotPasswordStep(1);
                setemail("");
                setCode("");
                setNewPassword1("");
                setNewPassword2("");
            } else {
                console.error("Submit forgot password failed:", result?.message);
                alert(result?.message || "Password reset failed. Try again.");
            }
        } catch (error) {
            console.error("Error in submitForgotPassword:", error);
            alert("Error submitting password reset. Please try again.");
        }
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
                                value={email}
                                onInput={(e) => {
                                    setiserror(false);
                                    setemail(e.target.value);
                                }}
                            />
                        </div>
                        <div
                            className="login-btn"
                            onClick={initiateForgotPassword}
                            style={{ opacity: loading || !email ? "0.5" : "1" }}
                        >
                            {loading ? "Loading..." : "Next Step"}
                        </div>
                        <div
                            className="google-btn"
                            onClick={() => {
                                setForgotPassword(false);
                                setemail("");
                                setLoading(false);
                            }}
                        >
                            <div>Never Mind</div>
                        </div>
                    </div>
                ) : forgotPasswordStep === 2 ? (
                    <div className="login-box">
                        <div className="full-logo-box" style={{ marginBottom: "5rem" }}>
                            <img className="full-logo" src={logo} alt="" style={{ width: "50%" }} />
                        </div>
                        <div style={{ marginBottom: "1.5rem" }}>We have sent a code to your email</div>
                        <div className="input-box" style={{ marginBottom: "5rem" }}>
                            <input
                                className="input-inp"
                                type="text"
                                placeholder="Enter Code..."
                                value={code}
                                onInput={(e) => setCode(e.target.value)}
                                maxLength={6}
                            />
                        </div>
                        <div
                            className="login-btn"
                            onClick={() => code?.length === 6 && setForgotPasswordStep(3)}
                            style={{ opacity: code?.length === 6 ? "1" : "0.5" }}
                        >
                            Next Step
                        </div>
                        <div
                            className="google-btn"
                            onClick={() => {
                                setForgotPasswordStep(1);
                                setCode("");
                            }}
                        >
                            <div>Go Back</div>
                        </div>
                    </div>
                ) : forgotPasswordStep === 3 ? (
                    <div className="login-box">
                        <div className="full-logo-box" style={{ marginBottom: "5rem" }}>
                            <img className="full-logo" src={logo} alt="" style={{ width: "50%" }} />
                        </div>
                        <div style={{ marginBottom: "1.5rem" }}>Create new password</div>
                        <div className="input-box" style={{ marginBottom: "5rem" }}>
                            <input
                                style={{ width: "90%" }}
                                className="input-inp"
                                type="password"
                                placeholder="Password..."
                                value={newPassword1}
                                onInput={(e) => setNewPassword1(e.target.value)}
                            />
                            <div className="password-check">
                                <div
                                    style={{
                                        background:
                                            newPassword1?.length >= 6
                                                ? "linear-gradient(90deg, #47B4D5 0.02%, #29449D 119.26%)"
                                                : "#FE2C55",
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div
                            className="login-btn"
                            onClick={() => newPassword1?.length >= 6 && setForgotPasswordStep(4)}
                            style={{ opacity: newPassword1?.length >= 6 ? "1" : "0.5" }}
                        >
                            Next Step
                        </div>
                        <div
                            className="google-btn"
                            onClick={() => {
                                setForgotPasswordStep(2);
                                setNewPassword1("");
                            }}
                        >
                            <div>Go Back</div>
                        </div>
                    </div>
                ) : forgotPasswordStep === 4 ? (
                    <div className="login-box">
                        <div className="full-logo-box" style={{ marginBottom: "5rem" }}>
                            <img className="full-logo" src={logo} alt="" style={{ width: "50%" }} />
                        </div>
                        <div style={{ marginBottom: "1.5rem" }}>Confirm new password</div>
                        <div className="input-box" style={{ marginBottom: "5rem" }}>
                            <input
                                style={{ width: "90%" }}
                                className="input-inp"
                                type="password"
                                placeholder="Password..."
                                value={newPassword2}
                                onInput={(e) => setNewPassword2(e.target.value)}
                            />
                            <div className="password-check">
                                <div
                                    style={{
                                        background:
                                            newPassword2?.length >= 6 && newPassword2 === newPassword1
                                                ? "linear-gradient(90deg, #47B4D5 0.02%, #29449D 119.26%)"
                                                : "#FE2C55",
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div
                            className="login-btn"
                            onClick={() =>
                                newPassword2?.length >= 6 &&
                                newPassword2 === newPassword1 &&
                                submitForgotPassword()
                            }
                            style={{
                                opacity:
                                    newPassword2?.length >= 6 && newPassword2 === newPassword1
                                        ? "1"
                                        : "0.5",
                            }}
                        >
                            Next Step
                        </div>
                        <div
                            className="google-btn"
                            onClick={() => {
                                setForgotPasswordStep(3);
                                setNewPassword2("");
                            }}
                        >
                            <div>Go Back</div>
                        </div>
                    </div>
                ) : (
                    ""
                )
            ) : (
                <div className="login-box">
                    <div className="full-logo-box">
                        <img className="full-logo" src={logo} alt="" style={{ width: "50%" }} />
                    </div>
                    <div className="toggle-box">
                        <div
                            className="toggle-each"
                            style={{
                                background: loginType === "Users" ? "#F1F4F6" : "",
                                fontWeight: loginType === "Users" ? "600" : "",
                                fontSize: loginType === "Users" ? "18px" : "",
                            }}
                            onClick={() => setLoginType("Users")}
                        >
                            Users
                        </div>
                        <div
                            className="toggle-each"
                            style={{
                                background: loginType === "Accountants" ? "#F1F4F6" : "",
                                fontWeight: loginType === "Accountants" ? "600" : "",
                                fontSize: loginType === "Accountants" ? "18px" : "",
                            }}
                            onClick={() => setLoginType("Accountants")}
                        >
                            Partners
                        </div>
                    </div>
                    {passwordResetMsg && <div style={{ margin: "1.5rem 0" }}>{passwordResetMsg}</div>}
                    {iserror && (
                        <div className="prompt-div">
                            <div>
                                <img src={info} alt="" />
                            </div>
                            <div>
                                The credentials you entered are incorrect. Please try again or
                                reset your password.
                            </div>
                        </div>
                    )}
                    <div className="input-box">
                        <input
                            className="input-inp"
                            type="text"
                            placeholder="Email"
                            value={email}
                            onInput={(e) => {
                                setiserror(false);
                                setemail(e.target.value);
                            }}
                        />
                    </div>
                    <div className="input-box">
                        <input
                            className="input-inp"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onInput={(e) => {
                                setiserror(false);
                                setpassword(e.target.value);
                            }}
                        />
                    </div>
                    <div className="forgot" onClick={() => setForgotPassword(true)}>
                        Forgot Password
                    </div>
                    <div className="login-btn" onClick={handleLogin}>
                        Login
                    </div>
                    <div className="google-btn" onClick={() => navigate(`/register?role=${loginType}`)}>
                        <div>Register With Email</div>
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

export default Loginpage;
