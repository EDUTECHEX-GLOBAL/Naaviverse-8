import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./loginpage.scss";

import { useStore } from "../../components/store/store.ts";
import logo from '../../assets/images/logo/naavi_final_logo2.png';
import loginHero from "../../static/images/login/login_hero.png";

import loadinglogo from "./favicon3.png";
import axios from "axios";
import info from "./info.svg";
import { Loginservice } from "../../services/loginapis";


const BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* ── inline field icons (no new deps, matches signup page) ── */
const EmailIcon = () => (
    <svg className="fieldIcon" viewBox="0 0 24 24" fill="none">
        <path d="M3 6.5C3 5.67 3.67 5 4.5 5h15c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="m4 6.5 8 6.5 8-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const LockIcon = () => (
    <svg className="fieldIcon" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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

const EyeIcon = ({ open }) => (
    open ? (
        <svg viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5M6.6 6.7C4.5 8.1 3 10 2.5 12c1.3 4.2 5.3 7 9.5 7 1.6 0 3.1-.4 4.4-1.1M9.9 4.2A10.6 10.6 0 0 1 12 4c4.2 0 8.2 2.8 9.5 7-.4 1.3-1 2.5-1.9 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ) : (
        <svg viewBox="0 0 24 24" fill="none"><path d="M2.5 12C3.8 7.8 7.8 5 12 5s8.2 2.8 9.5 7c-1.3 4.2-5.3 7-9.5 7s-8.2-2.8-9.5-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /></svg>
    )
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

const Loginpage = ({ initialType }) => {
    const navigate = useNavigate();
    const { loginType, setLoginType } = useStore();
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

    // Force Password Update States (when mustChangePassword is true)
    const [mustChangePasswordMode, setMustChangePasswordMode] = useState(false);
    const [forceNewPassword, setForceNewPassword] = useState("");
    const [forceConfirmPassword, setForceConfirmPassword] = useState("");
    const [forcePasswordLoading, setForcePasswordLoading] = useState(false);
    const [forcePasswordError, setForcePasswordError] = useState("");
    const [forceEye1, setForceEye1] = useState(false);
    const [forceEye2, setForceEye2] = useState(false);
    const [partnerContext, setPartnerContext] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const role = urlParams.get("role");
        const type = urlParams.get("type");

        if (
            initialType === "Partner" ||
            window.location.pathname.includes("/partner/login") ||
            type === "partner" ||
            role === "Accountants" ||
            role === "partner"
        ) {
            setLoginType("Accountants");
        } else if (role === "Users" || role === "user" || type === "user") {
            setLoginType("Users");
        }
    }, [initialType, setLoginType]);

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

            localStorage.setItem("authToken", result.token);

            if (result.user) {
                localStorage.setItem("user", JSON.stringify(result.user));
            }

            localStorage.setItem("userType", loginType === "Users" ? "user" : "partner");

            const emailToStore =
                result?.user?.email ||
                result?.partner?.email ||
                obj.email ||
                email ||
                "";

            localStorage.setItem("loginEmail", emailToStore);

            console.log("🔥 STORED EMAIL:", emailToStore);

            if (loginType === "Users") {
                if (result.user) {
                    localStorage.setItem("user", JSON.stringify(result.user));

                    if (result.user.profilePicture) {
                        localStorage.setItem("userProfilePic", result.user.profilePicture);
                    }

                    try {
                        const profileRes = await axios.get(
                            `${BASE_URL}/api/users/get/${result.user.email}`
                        );
                        const profileData = profileRes.data?.data;
                        if (profileData?.name) {
                            localStorage.setItem("userName", profileData.name);
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
                const partnerData = result.partner || {};

                const isInternal = partnerData.creationSource === "admin_created";

                let approvalStatus = partnerData.approvalStatus || (isInternal ? "approved" : "");

                if (isInternal) {
                    approvalStatus = "approved";
                } else {
                    try {
                        const approvalRes = await axios.get(
                            `${BASE_URL}/api/approvals/status?email=${emailToStore}`
                        );
                        const liveStatus = approvalRes.data?.data?.status;
                        if (liveStatus) {
                            approvalStatus = liveStatus;
                            console.log("✅ Approval status fetched at login:", liveStatus);
                        } else if (!approvalStatus) {
                            approvalStatus = "not_submitted";
                        }
                    } catch (approvalErr) {
                        console.warn("Could not fetch approval status at login:", approvalErr?.message);
                        if (!approvalStatus) approvalStatus = "not_submitted";
                    }
                }

                let profileData = {};
                let rawMustChange = false;
                try {
                    const profileRes = await axios.get(
                        `${BASE_URL}/api/partner/get?email=${emailToStore}`
                    );
                    const raw = profileRes.data?.data || {};
                    if (raw) {
                        rawMustChange = raw.mustChangePassword === true || raw.mustChangePassword === "true";
                        profileData = {
                            firstName: raw.firstName,
                            lastName: raw.lastName,
                            businessName: raw.businessName,
                            website: raw.website,
                            mustChangePassword: rawMustChange,
                        };
                        console.log("✅ Partner profile fetched at login:", profileData.businessName);
                    }
                } catch (profileErr) {
                    console.warn("Could not fetch partner profile at login:", profileErr?.message);
                }

                const mustChange =
                    partnerData?.mustChangePassword === true ||
                    partnerData?.mustChangePassword === "true" ||
                    result?.partner?.mustChangePassword === true ||
                    result?.partner?.mustChangePassword === "true" ||
                    result?.mustChangePassword === true ||
                    result?.mustChangePassword === "true" ||
                    rawMustChange;

                const enrichedPartner = {
                    ...partnerData,
                    creationSource: partnerData.creationSource || (isInternal ? "admin_created" : "self_registered"),
                    approvalStatus,
                    ...profileData,
                    mustChangePassword: mustChange,
                };
                localStorage.setItem("partner", JSON.stringify(enrichedPartner));

                console.log("✅ Partner saved to localStorage. mustChangePassword:", mustChange, "approvalStatus:", approvalStatus);

                // Check if internal partner must update temporary password
                if (mustChange) {
                    console.log("🔒 Partner must change temporary password before dashboard access");
                    setPartnerContext({
                        partnerData: enrichedPartner,
                        emailToStore,
                        profileData,
                    });
                    setMustChangePasswordMode(true);
                    setIsLoading(false);
                    return;
                }

                const isProfileComplete = Boolean(profileData?.businessName && profileData?.website);

                if (isInternal) {
                    // Internal partner created by Admin -> direct home access
                    navigate("/dashboard/accountants/home");
                } else if (approvalStatus === "approved" && isProfileComplete) {
                    // Approved external partner with complete profile -> home access
                    navigate("/dashboard/accountants/home");
                } else {
                    // New external partner -> directly navigate to profile onboarding
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

    const handleGoogleAuth = () => {
        const isUser = loginType === "Users";
        const role = isUser ? "user" : "partner";
        localStorage.setItem("userType", role);
        localStorage.setItem("googleAuthRole", loginType);

        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        const redirectUri = encodeURIComponent(`${window.location.origin}/login`);

        if (!clientId) {
            alert(
                "Google Client ID is missing.\n\nPlease add REACT_APP_GOOGLE_CLIENT_ID=<your-google-client-id> to your .env file."
            );
            return;
        }

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=email%20profile%20openid&prompt=select_account`;

        window.location.href = googleAuthUrl;
    };

    const handleForcePasswordUpdate = async (e) => {
        if (e) e.preventDefault();
        if (!forceNewPassword || !forceConfirmPassword) {
            setForcePasswordError("Please enter and confirm your new password.");
            return;
        }
        if (forceNewPassword.length < 6) {
            setForcePasswordError("Password must be at least 6 characters long.");
            return;
        }
        if (forceNewPassword !== forceConfirmPassword) {
            setForcePasswordError("New passwords do not match.");
            return;
        }

        try {
            setForcePasswordLoading(true);
            setForcePasswordError("");
            const res = await axios.post(`${BASE_URL}/api/partner/internal/change-password`, {
                email: partnerContext?.emailToStore || email,
                oldPassword: password,
                newPassword: forceNewPassword,
            });

            if (res.data && res.data.success) {
                // Update partner object in localStorage so mustChangePassword is false
                const stored = JSON.parse(localStorage.getItem("partner") || "{}");
                localStorage.setItem("partner", JSON.stringify({
                    ...stored,
                    mustChangePassword: false,
                }));

                // Proceed to partner dashboard
                if (partnerContext?.profileData?.businessName) {
                    navigate("/dashboard/accountants/home");
                } else {
                    navigate("/dashboard/accountants/profile");
                }
            } else {
                setForcePasswordError(res.data?.message || "Error updating password.");
            }
        } catch (err) {
            console.error("Force password update error:", err);
            setForcePasswordError(err.response?.data?.message || "Failed to update password. Please try again.");
        } finally {
            setForcePasswordLoading(false);
        }
    };

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

    const heroContent = {
        Users: {
            badge: "Student & Professional Platform",
            title: "Navigate Your",
            highlight: "Career Path",
            subtitle: "Access personalized career assessments, skill-building pathways, and expert mentorship to achieve your professional goals.",
            stats: [
                { value: "10K+", label: "Active Users" },
                { value: "500+", label: "Career Paths" },
                { value: "98%", label: "Satisfaction" },
            ],
        },
        Accountants: {
            badge: "Partner Business Suite",
            title: "Grow Your",
            highlight: "Business",
            subtitle: "Join our network of trusted partners. Manage clients, expand your reach, and access exclusive tools designed for your success.",
            stats: [
                { value: "2K+", label: "Partners" },
                { value: "50K+", label: "Clients Served" },
                { value: "4.9★", label: "Partner Rating" },
            ],
        },
    };

    const hero = heroContent[loginType] || heroContent.Users;

    // ── RENDER: FORGOT PASSWORD FLOWS ──
    const renderForgotPassword = () => {
        if (forgotPasswordStep === 1) {
            return (
                <div className="login-box">
                    <div className="full-logo-box">
                        <img className="full-logo" src={logo} alt="Naaviverse" />
                    </div>
                    <div className="login-welcome">
                        <div className="welcome-title">Reset Password</div>
                        <div className="welcome-subtitle">Enter your email address and we'll send you a verification code.</div>
                    </div>
                    <div className="input-box">
                        <EmailIcon />
                        <input
                            className="input-inp"
                            type="text"
                            placeholder="Email address"
                            required
                            value={email}
                            onInput={(e) => {
                                setiserror(false);
                                setemail(e.target.value);
                            }}
                        />
                    </div>
                    <div
                        className={`login-btn ${loading || !email ? "disabled" : ""}`}
                        onClick={initiateForgotPassword}
                    >
                        {loading ? "Sending..." : "Send Verification Code"}
                    </div>
                    <div
                        className="back-link"
                        onClick={() => {
                            setForgotPassword(false);
                            setemail("");
                            setLoading(false);
                        }}
                    >
                        ← Back to Login
                    </div>
                </div>
            );
        }

        if (forgotPasswordStep === 2) {
            return (
                <div className="login-box">
                    <div className="full-logo-box">
                        <img className="full-logo" src={logo} alt="Naaviverse" />
                    </div>
                    <div className="login-welcome">
                        <div className="welcome-title">Verify Code</div>
                        <div className="welcome-subtitle">We've sent a verification code to your email. Please enter it below.</div>
                    </div>
                    <div className="input-box otp-box">
                        <OtpIcon />
                        <input
                            className="input-inp"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={code}
                            onInput={(e) => setCode(e.target.value)}
                            maxLength={6}
                        />
                    </div>
                    <div
                        className={`login-btn ${code?.length === 6 ? "" : "disabled"}`}
                        onClick={() => code?.length === 6 && setForgotPasswordStep(3)}
                    >
                        Verify Code
                    </div>
                    <div
                        className="back-link"
                        onClick={() => {
                            setForgotPasswordStep(1);
                            setCode("");
                        }}
                    >
                        ← Go Back
                    </div>
                </div>
            );
        }

        if (forgotPasswordStep === 3) {
            return (
                <div className="login-box">
                    <div className="full-logo-box">
                        <img className="full-logo" src={logo} alt="Naaviverse" />
                    </div>
                    <div className="login-welcome">
                        <div className="welcome-title">New Password</div>
                        <div className="welcome-subtitle">Create a strong password for your account.</div>
                    </div>
                    <div className="input-box password-box">
                        <LockIcon />
                        <input
                            className="input-inp"
                            type="password"
                            placeholder="New password"
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
                        className={`login-btn ${newPassword1?.length >= 6 ? "" : "disabled"}`}
                        onClick={() => newPassword1?.length >= 6 && setForgotPasswordStep(4)}
                    >
                        Continue
                    </div>
                    <div
                        className="back-link"
                        onClick={() => {
                            setForgotPasswordStep(2);
                            setNewPassword1("");
                        }}
                    >
                        ← Go Back
                    </div>
                </div>
            );
        }

        if (forgotPasswordStep === 4) {
            return (
                <div className="login-box">
                    <div className="full-logo-box">
                        <img className="full-logo" src={logo} alt="Naaviverse" />
                    </div>
                    <div className="login-welcome">
                        <div className="welcome-title">Confirm Password</div>
                        <div className="welcome-subtitle">Re-enter your new password to confirm.</div>
                    </div>
                    <div className="input-box password-box">
                        <LockIcon />
                        <input
                            className="input-inp"
                            type="password"
                            placeholder="Confirm password"
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
                        className={`login-btn ${newPassword2?.length >= 6 && newPassword2 === newPassword1 ? "" : "disabled"}`}
                        onClick={() =>
                            newPassword2?.length >= 6 &&
                            newPassword2 === newPassword1 &&
                            submitForgotPassword()
                        }
                    >
                        Reset Password
                    </div>
                    <div
                        className="back-link"
                        onClick={() => {
                            setForgotPasswordStep(3);
                            setNewPassword2("");
                        }}
                    >
                        ← Go Back
                    </div>
                </div>
            );
        }

        return null;
    };

    // ── RENDER: FORCE PASSWORD CHANGE FORM (Internal Partner First Login) ──
    const renderForcePasswordChange = () => (
        <div className="login-box">
            <div className="full-logo-box">
                <img className="full-logo" src={logo} alt="Naaviverse" />
            </div>

            <div className="login-welcome">
                <div className="welcome-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>Set Permanent Password</span>
                </div>
                <div className="welcome-subtitle">
                    You are logging in with a temporary password. Please set your new permanent password to secure your partner account.
                </div>
            </div>

            {forcePasswordError && (
                <div className="prompt-div" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>⚠️ {forcePasswordError}</span>
                </div>
            )}

            <div className="input-box password-box">
                <LockIcon />
                <input
                    className="input-inp"
                    type={forceEye1 ? "text" : "password"}
                    placeholder="New Password (min. 6 characters)"
                    value={forceNewPassword}
                    onChange={(e) => {
                        setForcePasswordError("");
                        setForceNewPassword(e.target.value);
                    }}
                />
                <div className="eye-icon" onClick={() => setForceEye1(!forceEye1)}>
                    <EyeIcon open={forceEye1} />
                </div>
            </div>

            <div className="input-box password-box" style={{ marginTop: "12px" }}>
                <LockIcon />
                <input
                    className="input-inp"
                    type={forceEye2 ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={forceConfirmPassword}
                    onChange={(e) => {
                        setForcePasswordError("");
                        setForceConfirmPassword(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleForcePasswordUpdate(e);
                    }}
                />
                <div className="eye-icon" onClick={() => setForceEye2(!forceEye2)}>
                    <EyeIcon open={forceEye2} />
                </div>
            </div>

            <div
                className={`login-btn ${forcePasswordLoading || !forceNewPassword || !forceConfirmPassword ? "disabled" : ""}`}
                style={{ marginTop: "20px" }}
                onClick={handleForcePasswordUpdate}
            >
                {forcePasswordLoading ? "Updating Password..." : "Set Password & Continue"}
            </div>
        </div>
    );

    // ── RENDER: MAIN LOGIN FORM ──
    const renderLoginForm = () => (
        <div className="login-box">
            <div className="full-logo-box">
                <img className="full-logo" src={logo} alt="Naaviverse" />
            </div>

            <div className="login-welcome">
                <div className="welcome-title">
                    {loginType === "Users" ? "Welcome Back" : "Partner Login"}
                </div>
                <div className="welcome-subtitle">
                    {loginType === "Users"
                        ? "Sign in to continue your career journey"
                        : "Access your partner dashboard and manage your business"}
                </div>
            </div>

            <div className="toggle-box">
                <div
                    className={`toggle-each ${loginType === "Users" ? "toggle-each-active" : ""}`}
                    onClick={() => setLoginType("Users")}
                >
                    <UserToggleIcon /> User
                </div>
                <div
                    className={`toggle-each ${loginType === "Accountants" ? "toggle-each-active" : ""}`}
                    onClick={() => setLoginType("Accountants")}
                >
                    <PartnerToggleIcon /> Partner
                </div>
            </div>

            {passwordResetMsg && (
                <div className="success-message">
                    ✅ {passwordResetMsg}
                </div>
            )}

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
                <EmailIcon />
                <input
                    className="input-inp"
                    type="text"
                    placeholder="Email address"
                    value={email}
                    onInput={(e) => {
                        setiserror(false);
                        setemail(e.target.value);
                    }}
                />
            </div>

            <div className="input-box password-box">
                <LockIcon />
                <input
                    className="input-inp"
                    type={eye ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                        setiserror(false);
                        setpassword(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && email && password) {
                            handleLogin();
                        }
                    }}
                />
                <div className="eye-icon" onClick={() => seteye(!eye)}>
                    {eye ? (
                        <svg viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5M6.6 6.7C4.5 8.1 3 10 2.5 12c1.3 4.2 5.3 7 9.5 7 1.6 0 3.1-.4 4.4-1.1M9.9 4.2A10.6 10.6 0 0 1 12 4c4.2 0 8.2 2.8 9.5 7-.4 1.3-1 2.5-1.9 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none"><path d="M2.5 12C3.8 7.8 7.8 5 12 5s8.2 2.8 9.5 7c-1.3 4.2-5.3 7-9.5 7s-8.2-2.8-9.5-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /></svg>
                    )}
                </div>
            </div>

            <div className="forgot" onClick={() => setForgotPassword(true)}>
                Forgot Password?
            </div>

            <div className="login-btn" onClick={handleLogin}>
                Sign In
            </div>

            <div className="login-divider">
                <div className="divider-line"></div>
                <span className="divider-text">or</span>
                <div className="divider-line"></div>
            </div>

            <div className="google-btn" onClick={handleGoogleAuth}>
                <GoogleIcon />
                <span>Continue with Google</span>
            </div>

            <div className="login-footer-link">
                Don't have an account?{" "}
                <span
                    className="link-highlight"
                    onClick={() => {
                        console.log("REGISTER CLICKED");
                        navigate(`/register?role=${loginType}`);
                    }}
                >
                    Create New Account
                </span>
            </div>
        </div>
    );

    return (
        <div className="login-main">
            {/* ── LEFT HERO PANEL ── */}
            <div className="login-hero-panel">
                <img src={loginHero} alt="Platform visual" className="hero-bg" />
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
                    <div className="hero-stats">
                        {hero.stats.map((stat, i) => (
                            <div className="stat-item" key={i}>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT FORM PANEL ── */}
            <div className="login-form-panel">
                {mustChangePasswordMode
                    ? renderForcePasswordChange()
                    : forgotPassword
                    ? renderForgotPassword()
                    : renderLoginForm()}
            </div>

            {/* ── LOADING OVERLAY ── */}
            {isLoading && (
                <div className="otclogo">
                    <img className="otclogoimg" src={loadinglogo} alt="" />
                </div>
            )}
        </div>
    );
};

export default Loginpage;