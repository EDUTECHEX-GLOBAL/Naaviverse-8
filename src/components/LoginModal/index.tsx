import React, { useState, useEffect } from "react";
import OtpInput from "react-otp-input";
import axios from "axios";
import { useMutation } from "react-query";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import classNames from "./loginModal.module.scss";
import { APP_CODE, FULL_LOGO } from "../../configs";
import eyeIcon from "../../static/images/icons/eye.svg";
import eyeSlash from "../../static/images/icons/eyeSlash.svg";
import { Link } from "react-router-dom";
import { APP_NAME } from "../../configs";
import { login } from "../../app/loginSlice";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
async function loginFunc(paramData: any) {
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/login`, // <-- local backend
    paramData
  );
  return data;
}

// Similarly update other functions:
async function verifyEmail(paramData: any) {
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/verifyotp`, // example endpoint
    paramData
  );
  return data;
}

async function resetPswdPin(paramData: any) {
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/resetPassword`, // example endpoint
    paramData
  );
  return data;
}

async function forgotPswd(paramData: any) {
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/forgotPassword`, // example endpoint
    paramData
  );
  return data;
}


async function registerOnApp(email: string) {
  const { data } = await axios.post(
    "https://gxauth.apimachine.com/gx/user/password/forgot/request",
    {
      email: email,
      app_code: APP_CODE,
    }
  );
  return data;
}

const capRegex = new RegExp(/^.*[A-Z].*/);
const numRegex = new RegExp(/^.*[0-9].*/);
const speRegex = new RegExp(/^.*[!@#$%^&*()+=].*/);

function LoginModal({ onClose = () => {}, onSuccess = () => {} }) {
  const dispatch = useDispatch();
  const [emailid, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFaPin, setTwoFaPin] = useState("");
  const [isReset, setIsReset] = useState(false);
  const { mutate: registerApp } = useMutation(registerOnApp, {});
  const {
    data: loginData,
    isLoading,
    mutate,
  } = useMutation(loginFunc, {
    onSuccess: (data) => {
      if (data.status) {
        dispatch(
          login({
            email: emailid,
            token: data.idToken,
            accesToken: data.accessToken,
            deviceId: data.device_key,
            refreshToken: data.refreshToken,
          })
        );
        registerApp(emailid);
        onSuccess();
      } else {
        toast(data.message || "Some Thing Went Wrong!");
        setPassword("");
      }
    },
  });

  const loginvalidate = () => {
    if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(emailid)) {
      mutate({ email: emailid, password, totp_code: twoFaPin?.toString() });
    } else {
      toast("Enter Valid EmailId");
    }
  };

  function gerFromContent() {
    switch (true) {
      case isReset:
        return (
          <ResetForgotPassword
            emailid={emailid}
            loginvalidate={mutate}
            setEmailId={setEmailId}
          />
        );
      case loginData?.mfa:
        return <TwoFAForm twoFaPin={twoFaPin} setTwoFaPin={setTwoFaPin} />;
      case loginData?.resend_code:
        return <ResendCode emailid={emailid} loginvalidate={loginvalidate} />;
      case loginData?.resetPassword:
        return (
          <ForcedReset
            emailid={emailid}
            loginvalidate={mutate}
            oldPassword={password}
          />
        );
      case loginData?.passwordResetPassword:
        return <ForcedVerifyReset emailid={emailid} loginvalidate={mutate} />;
      default:
        return (
          <LoginForm
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            emailid={emailid}
            setEmailId={setEmailId}
            password={password}
            setPassword={setPassword}
            setIsReset={setIsReset}
          />
        );
    }
  }

  return (
    <div className={classNames.loginModal}>
      <div
        className={classNames.overlayClose}
        onClick={() => {
          try {
            onClose();
          } catch (error) {}
        }}
      />
      <div className={classNames.loginCard}>
        <div className={classNames.inCard}>
          <img src={FULL_LOGO} alt="" className={classNames.logo} />
          <div className={classNames.form}>{gerFromContent()}</div>
        </div>
        {isReset ||
        loginData?.resend_code ||
        loginData?.resetPassword ||
        loginData?.passwordResetPassword ? (
          ""
        ) : (
          <div className={classNames.footerBtns}>
            <Link to="/signup" className={classNames.btnReg}>
              <span>Get Started</span>
            </Link>
            <div
              className={classNames.btnLogin}
              onClick={() => {
                try {
                  loginvalidate();
                } catch (error) {}
              }}
            >
              <span>Login</span>
            </div>
          </div>
        )}
        {isLoading && (
          <div className={classNames.loadingAnim}>
            {/* <LoadingAnim /> */}
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}

function LoginForm({
  showPassword,
  setShowPassword,
  emailid,
  setEmailId,
  password,
  setPassword,
  setIsReset,
}: any) {
  return (
    <>
      <div className={classNames.group}>
        <input
          type="text"
          name="email"
          value={emailid}
          onChange={(e) => setEmailId(e.target.value)}
          required
        />
        <label>Email</label>
      </div>
      <div className={classNames.group}>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <img
          className={classNames.eye}
          onClick={() => {
            setShowPassword(!showPassword);
          }}
          src={showPassword ? eyeSlash : eyeIcon}
          alt=""
        />
        <label>Password</label>
      </div>
      <div className={classNames.forgot} onClick={() => setIsReset(true)}>
        Forgot Your Password?
      </div>
    </>
  );
}

function TwoFAForm({ twoFaPin, setTwoFaPin }: any) {
  return (
    <>
      <div className={classNames.twoFaLabel}>
        Enter The Code On Your Google Authenticator
      </div>
      {/* <OtpInput
        containerStyle={classNames.otpInputWrapper}
        value={twoFaPin}
        onChange={(otp: string) => setTwoFaPin(otp)}
        numInputs={6}
        renderSeparator={<span> </span>}
        inputStyle={classNames.otpInput}
        shouldAutoFocus
      /> */}
    </>
  );
}

function ResendCode({ emailid, loginvalidate }: any) {
  //Form Values
  const [pin, setPin] = useState("");
  const [invalidPin, setInvalidPin] = useState(false);

  const {
    data: loginData,
    isLoading: loading,
    mutate,
  } = useMutation(verifyEmail, {
    onSuccess: (data) => {
      if (data.status) {
      } else {
        setInvalidPin(true);
      }
    },
  });

  function getStep() {
    switch (true) {
      case loginData?.status:
        setTimeout(() => {
          loginvalidate();
        }, 2000);
        return (
          <div className={classNames.success}>
            <div className={classNames.succesTitle}>
              You Have Successfully Verified Your Email
            </div>
            <div className={classNames.succesBottom}>
              You Will Automatically Be Logged In
            </div>
          </div>
        );
      default:
        return (
          <>
            <h5>
              {invalidPin
                ? "Incorrect Code. Please Enter It Again"
                : `We Need You To Verify Your Email. Please Enter The Code That Was Just Sent To Your ${APP_NAME} Email`}
            </h5>
            {/* <OtpInput
              value={pin}
              onChange={setPin}
              numInputs={6}
              separator={<span> </span>}
              shouldAutoFocus
              containerStyle={classNames.otpInputWrapper}
              inputStyle={classNames.otpInput}
            /> */}
            <div className={classNames.group}>
              <button
                type="submit"
                disabled={loading}
                className={classNames.btnMain}
                onClick={() => {
                  if (String(pin).length === 6) {
                    mutate({ email: emailid, code: pin });
                  }
                }}
              >
                {loading ? "Loading..." : "Enter"}
              </button>
            </div>
            {loading && (
              <div className={classNames.loadingAnim}>
                {/* <LoadingAnim /> */}
              </div>
            )}
          </>
        );
    }
  }
  return <>{getStep()}</>;
}

function ForcedReset({ emailid, loginvalidate, oldPassword }: any) {
  const [step, setStep] = useState("start");
  //Form Values
  const [isValid, setIsValid] = useState<any>({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { isLoading: loading, mutate } = useMutation(loginFunc, {
    onSuccess: (data) => {
      if (data.status) {
        setStep("succes");
      } else {
        toast(data.message);
      }
    },
  });

  useEffect(() => {
    setIsValid({
      password:
        capRegex.test(password) &&
        numRegex.test(password) &&
        speRegex.test(password) &&
        password.length >= 8,
      confirmPassword: confirmPassword === password,
    });
  }, [password, confirmPassword]);

  const [eye, setEye] = useState(false);

  function getStep() {
    switch (step) {
      case "start":
        return (
          <div className={classNames.success}>
            <div className={classNames.succesTitle}>
              In Order To Login, We Need You To Need Update Your Password In
              Accordance With Our Security Standards.
            </div>
            <div className={classNames.group}>
              <button
                type="submit"
                className={classNames.btnMain}
                onClick={() => {
                  setStep("enterPassWord");
                }}
              >
                {loading ? "Loading..." : "Enter"}
              </button>
            </div>
          </div>
        );
      case "enterPassWord":
        return (
          <>
            <h5>Enter The Verification Code</h5>
            <div
              className={`${classNames.group} ${classNames[isValid.password]}`}
            >
              <input
                type={eye ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isValid.password) {
                    setStep("enterCPassWord");
                  }
                }}
              />
              <img
                className={classNames.eye}
                onClick={() => {
                  setEye(!eye);
                }}
                src={eye ? eyeSlash : eyeIcon}
                alt=""
              />
            </div>
            <div className={classNames.group}>
              <button
                type="submit"
                disabled={loading}
                className={classNames.btnMain}
                onClick={() => {
                  if (isValid.password) {
                    setStep("enterCPassWord");
                  }
                }}
              >
                {loading ? "Loading..." : "Enter"}
              </button>
            </div>
          </>
        );
      case "enterCPassWord":
        return (
          <>
            <h5>Enter The Verification Code</h5>
            <div
              className={`${classNames.group} ${
                classNames[isValid.confirmPassword]
              }`}
            >
              <input
                type={eye ? "text" : "password"}
                placeholder="Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    mutate({
                      email: emailid,
                      password: oldPassword,
                      newPassword: password,
                    });
                  }
                }}
              />
              <img
                className={classNames.eye}
                onClick={() => {
                  setEye(!eye);
                }}
                src={eye ? eyeSlash : eyeIcon}
                alt=""
              />
            </div>
            <div className={classNames.group}>
              <button
                type="submit"
                disabled={loading}
                className={classNames.btnMain}
                onClick={() =>
                  mutate({
                    email: emailid,
                    password: oldPassword,
                    newPassword: password,
                  })
                }
              >
                {loading ? "Loading..." : "Enter"}
              </button>
            </div>
          </>
        );
      case "succes":
        setTimeout(() => {
          loginvalidate({ password, email: emailid });
        }, 2000);
        return (
          <div className={classNames.success}>
            <div className={classNames.succesTitle}>
              You Have Successfully Reset Your Password
            </div>
            <div className={classNames.succesBottom}>
              You Will Automatically Be Logged In
            </div>
          </div>
        );
      default:
        return "";
    }
  }
  return <>{getStep()}</>;
}

function ForcedVerifyReset({ emailid, loginvalidate }: any) {
  const [step, setStep] = useState("enterPin");
  const [invalidPin, setInvalidPin] = useState(false);

  //Form Values
  const [isValid, setIsValid] = useState<any>({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    setIsValid({
      password:
        capRegex.test(password) &&
        numRegex.test(password) &&
        speRegex.test(password) &&
        password.length >= 8,
      confirmPassword: confirmPassword === password,
    });
  }, [password, confirmPassword]);

  const { isLoading: loading, mutate } = useMutation(resetPswdPin, {
    onSuccess: (data) => {
      if (data.status) {
        setStep("succes");
      } else {
        setInvalidPin(true);
        setStep("enterPin");
      }
    },
  });
  const [eye, setEye] = useState(false);

  const resetPassword = () => {
    if (isValid.confirmPassword) {
      mutate({ email: emailid, code: pin, newPassword: password });
    } else {
      toast("Passwords Not Match");
    }
  };

  function getStep() {
    switch (step) {
      case "enterPin":
        return (
          <>
            <h5>
              {invalidPin
                ? "Incorrect Code. Please Enter It Again"
                : `We Need You To Verify Your Email. Please Enter The Code That Was Just Sent To Your ${APP_NAME} Email`}
            </h5>
            {/* <OtpInput
              value={pin}
              onChange={setPin}
              numInputs={6}
              separator={<span> </span>}
              shouldAutoFocus
              containerStyle={classNames.otpInputWrapper}
              inputStyle={classNames.otpInput}
            /> */}
            <div className={classNames.group}>
              <button
                type="submit"
                disabled={loading}
                className={classNames.btnMain}
                onClick={() => {
                  if (isValid.pin) {
                    setStep("enterPassWord");
                  }
                }}
              >
                {loading ? "Loading..." : "Enter"}
              </button>
            </div>
          </>
        );
      case "enterPassWord":
        return (
          <>
            <h5>Enter The Verification Code</h5>
            <div
              className={`${classNames.group} ${classNames[isValid.password]}`}
            >
              <input
                type={eye ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isValid.password) {
                    setStep("enterCPassWord");
                  }
                }}
              />
              <img
                className={classNames.eye}
                onClick={() => {
                  setEye(!eye);
                }}
                src={eye ? eyeSlash : eyeIcon}
                alt=""
              />
            </div>
            <div className={classNames.group}>
              <button
                type="submit"
                disabled={loading}
                className={classNames.btnMain}
                onClick={() => {
                  if (isValid.password) {
                    setStep("enterCPassWord");
                  }
                }}
              >
                {loading ? "Loading..." : "Enter"}
              </button>
            </div>
          </>
        );
      case "enterCPassWord":
        return (
          <>
            <h5>Enter The Verification Code</h5>
            <div
              className={`${classNames.group} ${
                classNames[isValid.confirmPassword]
              }`}
            >
              <input
                type={eye ? "text" : "password"}
                placeholder="Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    resetPassword();
                  }
                }}
              />
              <img
                className={classNames.eye}
                onClick={() => {
                  setEye(!eye);
                }}
                src={eye ? eyeSlash : eyeIcon}
                alt=""
              />
            </div>
            <div className={classNames.group}>
              <button
                type="submit"
                disabled={loading}
                className={classNames.btnMain}
                onClick={() => resetPassword()}
              >
                {loading ? "Loading..." : "Enter"}
              </button>
            </div>
          </>
        );
      case "succes":
        setTimeout(() => {
          loginvalidate({ password, email: emailid });
        }, 2000);
        return (
          <div className={classNames.success}>
            <div className={classNames.succesTitle}>
              You Have Successfully Reset Your Password
            </div>
            <div className={classNames.succesBottom}>
              You Will Automatically Be Logged In
            </div>
          </div>
        );
      default:
        return "";
    }
  }
  return <>{getStep()}</>;
}

function ResetForgotPassword({ emailid, setEmailId, loginvalidate }: any) {
  const [inValidMail, setInValidMail] = useState(false);
  const [step, setStep] = useState("");

  //Form Values
  const [isValid, setIsValid] = useState<any>({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");

  const { isLoading: loading, mutate } = useMutation(forgotPswd, {
    onSuccess: (data) => {
      if (data.status) {
        setStep("enterPin");
      } else {
        setInValidMail(true);
      }
    },
  });

  const { isLoading: loadingReset, mutate: mutateReset } = useMutation(
    resetPswdPin,
    {
      onSuccess: (data) => {
        if (data.status) {
          setStep("succes");
        } else {
          setInvalidPin(true);
          setStep("enterPin");
        }
      },
    }
  );

  useEffect(() => {
    setIsValid({
      password:
        capRegex.test(password) &&
        numRegex.test(password) &&
        speRegex.test(password) &&
        password.length >= 8,
      confirmPassword: confirmPassword === password,
      pin: String(pin).length === 6,
    });
  }, [password, confirmPassword, pin]);

  function sendPin() {
    mutate({
      email: emailid,
      app_code: APP_CODE,
    });
  }
  const [invalidPin, setInvalidPin] = useState(false);
  function resetPassword() {
    mutateReset({
      email: emailid,
      code: pin,
      newPassword: password,
    });
  }

  const [eye, setEye] = useState(false);

  function getStep() {
    switch (step) {
      case "enterPin":
        return (
          <>
            <h5>
              {invalidPin
                ? "Incorrect Code. Please Enter It Again"
                : "Enter The Verification Code"}
            </h5>
            {/* <OtpInput
              value={pin}
              onChange={setPin}
              numInputs={6}
              separator={<span> </span>}
              shouldAutoFocus
              containerStyle={classNames.otpInputWrapper}
              inputStyle={classNames.otpInput}
            /> */}
            <div className={classNames.group}>
              <button
                type="submit"
                disabled={loading || loadingReset}
                className={classNames.btnMain}
                onClick={() => {
                  if (isValid.pin) {
                    setStep("enterPassWord");
                  }
                }}
              >
                {loading || loadingReset ? "Loading..." : "Enter"}
              </button>
            </div>
          </>
        );
      case "enterPassWord":
        return (
          <>
            <h5>Enter New Password</h5>
            <div
              className={`${classNames.group} ${classNames[isValid.password]}`}
            >
              <input
                type={eye ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isValid.password) {
                    setStep("enterCPassWord");
                  }
                }}
              />
              <img
                className={classNames.eye}
                onClick={() => {
                  setEye(!eye);
                }}
                src={eye ? eyeSlash : eyeIcon}
                alt=""
              />
            </div>
            <div className={classNames.group}>
              <button
                type="submit"
                disabled={loading || loadingReset}
                className={classNames.btnMain}
                onClick={() => {
                  if (isValid.password) {
                    setStep("enterCPassWord");
                  }
                }}
              >
                {loading || loadingReset ? "Loading..." : "Enter"}
              </button>
            </div>
          </>
        );
      case "enterCPassWord":
        return (
          <>
            <h5>Enter Confirm Password</h5>
            <div
              className={`${classNames.group} ${
                classNames[isValid.confirmPassword]
              }`}
            >
              <input
                type={eye ? "text" : "password"}
                placeholder="Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    resetPassword();
                  }
                }}
              />
              <img
                className={classNames.eye}
                onClick={() => {
                  setEye(!eye);
                }}
                src={eye ? eyeSlash : eyeIcon}
                alt=""
              />
            </div>
            <div className={classNames.group}>
              <button
                type="submit"
                disabled={loading || loadingReset}
                className={classNames.btnMain}
                onClick={() => resetPassword()}
              >
                {loading || loadingReset ? "Loading..." : "Enter"}
              </button>
            </div>
          </>
        );
      case "succes":
        setTimeout(() => {
          loginvalidate({ password, email: emailid });
        }, 2000);
        return (
          <div className={classNames.success}>
            <div className={classNames.succesTitle}>
              You Have Successfully Reset Your Password
            </div>
            <div className={classNames.succesBottom}>
              You Will Automatically Be Logged In
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className={classNames.group}>
              <input
                type="text"
                name="email"
                value={emailid}
                onChange={(e) => setEmailId(e.target.value)}
                required
                onFocus={() => setInValidMail(false)}
                placeholder={inValidMail ? "Invalid Mail" : "Email"}
              />
            </div>
            <div className={classNames.group}>
              <button
                type="submit"
                disabled={loading || loadingReset}
                className={classNames.btnMain}
                onClick={() => sendPin()}
              >
                {loading || loadingReset ? "Loading..." : "Enter"}
              </button>
            </div>
          </>
        );
    }
  }
  return (
    <>
      {getStep()}
      {(loading || loadingReset) && (
        <div className={classNames.loadingAnim}>{/* <LoadingAnim /> */}</div>
      )}
    </>
  );
}

export default LoginModal;
