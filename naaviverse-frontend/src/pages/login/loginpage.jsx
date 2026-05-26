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
import logo from '../../assets/images/logo/naavi_final_logo2.png';

import loadinglogo from "./favicon3.png";
import axios from "axios";
import info from "./info.svg";
import { Loginservice } from "../../services/loginapis";


const IconMenu = [
    { id: 0, icon: lg1 },
    { id: 1, icon: lg2 },
];

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

    const getProfilePic = async (email, loginType) => {
        try {
            const url =
                loginType === "Users"
                    ? `${BASE_URL}/api/auth/get-profile-pic`
                    : `${BASE_URL}/api/partner/get-profile-pic`;

            const response = await axios.get(url, { params: { email } });

            if (response.data.status && response.data.profilePic) {
                localStorage.setItem("userProfilePic", response.data.profilePic);
                return response.data.profilePic;
            }

            return null;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.warn("No profile picture found, using default.");
                return null;
            }
            console.error("Error fetching profile picture:", error);
            return null;
        }
    };

    const handleLogin = async () => {
        setIsLoading(true);
        const obj = { email, password };

        try {
            const response = await Loginservice(obj, loginType);
            const result = response.data;

            console.log("🔥 FULL LOGIN RESPONSE:", result);

            if (!result?.token) {
                console.error("Login failed:", result?.message || "Unknown error");
                setiserror(true);
                setIsLoading(false);
                return;
            }

            // Always store token
            localStorage.setItem("authToken", result.token);

            // Store user/partner safely
            if (result.user) {
                localStorage.setItem("user", JSON.stringify(result.user));
            }

            // Store type
            localStorage.setItem("userType", loginType === "Users" ? "user" : "partner");

            // Safest email storage
            const emailToStore =
                result?.user?.email ||
                result?.partner?.email ||
                obj.email ||
                email ||
                "";

            localStorage.setItem("loginEmail", emailToStore);

            console.log("🔥 STORED EMAIL:", emailToStore);

            // ✅ ROUTING LOGIC
            if (loginType === "Users") {
                if (result.user) {
                    localStorage.setItem("user", JSON.stringify(result.user));

                    if (result.user.profilePicture) {
                        localStorage.setItem("userProfilePic", result.user.profilePicture);
                    }

                    // ✅ Fetch profile to get the real name and save it immediately
                    try {
                        const profileRes = await axios.get(
                            `${BASE_URL}/api/users/get/${result.user.email}`
                        );
                        const profileData = profileRes.data?.data;
                        if (profileData?.name) {
                            localStorage.setItem("userName", profileData.name);
                            // Also update the user object with name
                            localStorage.setItem("user", JSON.stringify({
                                ...result.user,
                                name: profileData.name,
                            }));
                        }
                        if (profileData?.profilePicture) {
                            localStorage.setItem("userProfilePic", profileData.profilePicture);
                        }
                    } catch (e) {
                        console.warn("Could not fetch profile at login:", e?.message);
                    }
                }
                navigate("/dashboard/users/home");


            } else {
                // ── PARTNER LOGIN ──────────────────────────────────────────────
                const partnerData = result.partner || {};

                // ✅ KEY FIX: Check approval status from API immediately at login
                // This ensures localStorage has approvalStatus so sidebar shows
                // correct lock/unlock state without needing to visit profile first
                let approvalStatus = partnerData.approvalStatus || "";

                try {
                    const approvalRes = await axios.get(
                        `${BASE_URL}/api/approvals/status?email=${emailToStore}`
                    );
                    const liveStatus = approvalRes.data?.data?.status;
                    if (liveStatus) {
                        approvalStatus = liveStatus;
                        console.log("✅ Approval status fetched at login:", liveStatus);
                    }
                } catch (approvalErr) {
                    console.warn("Could not fetch approval status at login:", approvalErr?.message);
                    // Fall back to whatever the partner object says
                }

                // Also fetch partner profile to get businessName for sidebar display
                let profileData = {};
                try {
                    const profileRes = await axios.get(
                        `${BASE_URL}/api/partner/get?email=${emailToStore}`
                    );
                    const raw = profileRes.data?.data || {};
                    if (raw?.businessName) {
                        profileData = {
                            firstName: raw.firstName,
                            lastName: raw.lastName,
                            businessName: raw.businessName,
                        };
                        console.log("✅ Partner profile fetched at login:", profileData.businessName);
                    }
                } catch (profileErr) {
                    console.warn("Could not fetch partner profile at login:", profileErr?.message);
                }

                // ✅ Save partner to localStorage WITH approvalStatus + businessName
                const enrichedPartner = {
                    ...partnerData,
                    approvalStatus,
                    ...profileData, // merge businessName, firstName, lastName if found
                };
                localStorage.setItem("partner", JSON.stringify(enrichedPartner));

                console.log("✅ Partner saved to localStorage with approvalStatus:", approvalStatus);


               if (profileData?.businessName) {
    // Has a complete profile — go to home
    navigate("/dashboard/accountants/home");
} else {
    // No profile yet — force profile creation
    navigate("/dashboard/accountants/profile");
}
            }

            getProfilePic(emailToStore, loginType);
            setiserror(false);

        } catch (error) {
            console.error("Error during login:", error.message || error);
            setiserror(true);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Updated initiateForgotPassword
    const initiateForgotPassword = async () => {
        if (!email) return;

        setLoading(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/${loginType === "Users" ? "api/auth" : "api/partner"}/forgotPassword`,
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
                `${BASE_URL}/${loginType === "Users" ? "api/auth" : "api/partner"}/updatepassword`,
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
                    <div className="input-box password-box">
                        <input
                            className="input-inp"
                            type={eye ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                                setiserror(false);
                                setpassword(e.target.value);
                            }}
                        />
                        <img
                            src={eye ? eye2 : eye1}
                            alt="toggle password"
                            className="eye-icon"
                            onClick={() => seteye(!eye)}
                        />
                    </div>

                    <div className="forgot" onClick={() => setForgotPassword(true)}>
                        Forgot Password
                    </div>
                    <div className="login-btn" onClick={handleLogin}>
                        Login
                    </div>
                    <div
                        className="google-btn"
                        onClick={() => {
                            console.log("REGISTER CLICKED");
                            navigate(`/register?role=${loginType}`);
                        }}
                    >
                        <img
                            src={google}
                            alt="Google"
                            style={{ width: 20, height: 20, marginRight: 10 }}
                        />
                        Register With Email
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