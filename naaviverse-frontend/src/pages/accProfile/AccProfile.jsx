import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../accDashbaoard/accDashboard.scss";
import styles from "./new.module.scss"
import searchic from "../../static/images/dashboard/searchic.svg";
import downarrow from "../../static/images/dashboard/downarrow.svg";
import uploadv from "../../static/images/dashboard/uploadv.svg";
import nvest from "../../static/images/dashboard/nvest.svg";
import profile from "../../static/images/dashboard/profile.svg";
import closepop from "../../static/images/dashboard/closepop.svg";
import accounts from "../../static/images/dashboard/accounts.svg";
import vaults from "../../static/images/dashboard/vaults.svg";
import profilea from "../../static/images/dashboard/profilea.svg";
import support from "../../static/images/dashboard/support.svg";
import settings from "../../static/images/dashboard/settings.svg";
import sidearrow from "../../static/images/dashboard/sidearrow.svg";
import logout from "../../static/images/dashboard/logout.svg";
import upgif from "../../static/images/dashboard/upgif.gif";
import lg1 from "../login/favicon3.png";
import threedot from "../../static/images/dashboard/threedot.svg";
import { useStore } from "../../components/store/store.ts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AccDashsidebar from "../../components/accDashsidebar/accDashsidebar";
import {
  GetFollowersPerAccount,
  GetCategoriesAcc,
  GetAllCustomerLicenses,
  GetLogServices,
  GetAllCurrencies,
  CreatePopularService,
  CheckStatusAccountant,
} from "../../services/accountant";
import { formatDate } from "../../utils/time";
import * as jose from "jose";
import { LoadingAnimation1 } from "../../components/LoadingAnimation1";
import { useCoinContextData } from "../../context/CoinContext";
import NewStep1 from "../../globalComponents/GlobalDrawer/NewStep1";

import cover from "../../images/cover.svg";
import uploadGrey from "../../images/uploadGrey.svg";
import close from "../../images/close.svg";
import arrow from "../../images/arrow.svg";
import colorArrow from "../../images/colorArrow.svg";
import edit from "../../images/edit.svg";
import downArrow from "../../images/downArrow.svg";
import upArrow from "../../images/upArrow.svg";
import upload from "../../images/upload.svg";
import {
  InputDivsCheck,
  InputDivsTextArea1,
  InputDivsWithMT,
  InputDivsWithColorCode,
  InputDivsCreatePartner,
  InputDivsTextAreaPartner,
} from "../../components/createAccountant/CreatePlanB";
import { uploadImageFunc } from "../../utils/imageUpload";
import classNames from "../../components/createAccountant/components.module.scss";
import trash from "../accDashbaoard/trash.svg";
import { State } from "country-state-city";
import MenuNav from "../../components/MenuNav/index.jsx";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ─── Icons ────────────────────────────────────────────────────────────────────

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 3L21 7L7 21H3V17L17 3Z" strokeLinejoin="round" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12H22M12 2C9.5 4 8 8 8 12C8 16 9.5 20 12 22C14.5 20 16 16 16 12C16 8 14.5 4 12 2Z" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22C12 22 20 16 20 10C20 5 16 2 12 2C8 2 4 5 4 10C4 16 12 22 12 22Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6H16M8 10H16M8 14H12" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" />
    <path d="M22 6L12 13L2 6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6V12L16 14" strokeLinecap="round" />
  </svg>
);

const XCircleIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9L9 15M9 9L15 15" strokeLinecap="round" />
  </svg>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const AccProfile = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const { accsideNav, setaccsideNav, ispopular, setispopular } = useStore();
  const [search, setSearch] = useState("");
  const [crmMenu, setcrmMenu] = useState("Followers");
  const [servicesMenu, setservicesMenu] = useState("Services");
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const [isCatoading, setIsCatLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [followCount, setfollowCount] = useState(0);
  const [followData, setfollowData] = useState([]);
  const [coverImageS3url, setCoverImageS3url] = useState("");
  const [selectedFollower, setSelectedFollower] = useState({});
  const [pstep, setpstep] = useState(1);
  const [selectNew, setselectNew] = useState("");
  const [billingType, setbillingType] = useState("");
  const [categoriesData, setcategoriesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [selectCategory, setselectCategory] = useState("");
  const [serviceNameInput, setServiceNameInput] = useState("");
  const [serviceCodeInput, setServiceCodeInput] = useState("");
  const [productLabel, setProductLabel] = useState("");
  const [serviceTagline, setServiceTagline] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [isCurrencies, setIsCurrencies] = useState(false);
  const [allCurrencies, setallCurrencies] = useState([]);
  const [searchCurrency, setSearchCurrency] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState({});
  const [firstMonthPrice, setfirstMonthPrice] = useState("");
  const [monthlyPrice, setmonthlyPrice] = useState("");
  const [gracePeriod, setgracePeriod] = useState("");
  const [secondChargeAttempt, setsecondChargeAttempt] = useState("");
  const [thirdChargeAttempt, setthirdChargeAttempt] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isServicesAcc, setIsServicesAcc] = useState(false);
  const [servicesAcc, setservicesAcc] = useState([]);
  const [isProfileData, setIsProfileData] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [profileSpecalities, setprofileSpecalities] = useState([]);
  const [email, setemail] = useState("");
  const [brandtag, setbrandtag] = useState("");
  const [country, setcountry] = useState("");
  const [address, setaddress] = useState("");
  const [displayname, setdisplayname] = useState("");
  const [phno, setphno] = useState("");
  const [description, setdescription] = useState("");
  const [colorcode, setcolorcode] = useState("");
  const [patneringinstitution, setpatneringinstitution] = useState("");
  const [autodeposit, setautodeposit] = useState("");
  const [cashback, setcashback] = useState("");
  const [category, setcategory] = useState("");
  const [subcategory, setsubcategory] = useState("");
  const [shouldReload, setShouldReload] = useState(false);

  // ── NEW: approval status state ────────────────────────────────────────────
  // Possible values: "" | "pending" | "approved" | "rejected"
  const [accStatus, setAccStatus] = useState("");
  // Rejection reason returned by the admin (if any)
  const [rejectionReason, setRejectionReason] = useState("");
  // Loading state while we check approval / fetch profile
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // create brand profile
  const [createBrandProfile, setCreateBrandProfile] = useState(false);
  const [createBrandProfileStep, setCreateBrandProfileStep] = useState(1);
  const [profilePicture, setProfilePicture] = useState();
  const [userName, setUserName] = useState("");
  const [coverPhoto1, setCoverPhoto1] = useState();
  const [brandDisplayName, setBrandDisplayName] = useState();
  const [brandUserName, setBrandUserName] = useState("");
  const [brandDescription, setBrandDescription] = useState();
  const [brandColorCode, setBrandColorCode] = useState();
  const [headquarter, setHeadquarter] = useState();
  const [brandAddress, setBrandAddress] = useState();
  const [whiteProPic, setWhiteProPic] = useState();
  const [isloading, setIsloading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hidden1, setHidden1] = useState(false);
  const [hidden2, setHidden2] = useState(false);
  const [userNameAvailable, setUserNameAvailable] = useState(false);
  const [userNameAvailable1, setUserNameAvailable1] = useState(false);
  const [changing, setChanging] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit mode states
  const [editMode, setEditMode] = useState(null);
  const [editValue, setEditValue] = useState({});

  // new path
  const [grade, setGrade] = useState([]);
  const [gradeAvg, setGradeAvg] = useState([]);
  const [curriculum, setCurriculum] = useState([]);
  const [stream, setStream] = useState([]);
  const [finance, setFinance] = useState([]);
  const [personality, setPersonality] = useState("");
  const streamList = ["MPC", "BIPC", "CEC", "MEC", "HEC"];
  const curriculumList = ["IB", "IGCSE", "CBSE", "ICSE", "Nordic"];
  const gradeList = ["9", "10", "11", "12"];
  const gradePointAvg = [
    "0% - 35%", "36% - 60%", "61% - 75%",
    "76% - 85%", "86% - 95%", "96% - 100%",
  ];
  const financeList = ["0-25L", "25L-75L", "75L-3CR", "3CR+", "Other"];
  const personalityList = [
    "realistic", "investigative", "artistic",
    "social", "enterprising", "conventional",
  ];

  const {
    allSteps, setAllSteps,
    stepsToggle, setStepsToggle,
    pathSteps, setPathSteps,
    creatingPath, setCreatingPath,
    mypathsMenu, setMypathsMenu,
    selectedSteps, setSelectedSteps,
    countryApiValue,
  } = useCoinContextData();

  let navigate = useNavigate();

  // edit accountant data
  const [editProfilePic, setEditProfilePic] = useState(false);
  const [editCountry, setEditCountry] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(false);
  const [editPhoneNo, setEditPhoneNo] = useState(false);
  const [editDescription, setEditDescription] = useState(false);
  const [editCoverPic, setEditCoverPic] = useState(false);
  const [editColorCode, setEditColorCode] = useState(false);
  const [editPartneringInstitutions, setEditPartneringInstitutions] = useState(false);
  const [editCategory, setEditCategory] = useState(false);
  const [editSubCategory, setEditSubCategory] = useState(false);
  const [editSpecialities, setEditSpecialities] = useState(false);

  // accountant profile new values
  const [newAddress, setNewAddress] = useState();
  const [newDisplayName, setNewDisplayName] = useState();
  const [newPhoneNo, setNewPhoneNo] = useState();
  const [newDescription, setNewDescription] = useState();
  const [newColorCode, setNewColorCode] = useState();
  const [newCountry, setNewCountry] = useState();
  const [newPartneringInstitutions, setNewPartneringInstitutions] = useState();
  const [newAutoDeposit, setNewAutoDeposit] = useState();
  const [newCashBack, setNewCashBack] = useState();
  const [newCategory, setNewCategory] = useState(false);
  const [newSubCategory, setNewSubCategory] = useState();
  const [newSpecialities, setNewSpecialities] = useState(false);
  const [newCoverPic, setNewCoverPic] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState();
  const [partnerStepsData, setPartnerStepsData] = useState([]);

  const [backupPathList, setBackupPathList] = useState([]);
  const [showBackupPathList, setShowBackupPathList] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // upload part starts here
  const secrAet = "uyrw7826^&(896GYUFWE&*#GBjkbuaf";
  const emailDev = "rahulrajsb@outlook.com";
  const userDetails = JSON.parse(localStorage.getItem("partner"));

  useEffect(() => {
    console.log("Partner data retrieved from localStorage:", userDetails);
  }, []);

  const [businessName, setBusinessName] = useState('');
  const [businessDesc, setBusinessDesc] = useState('');
  const [website, setWebsite] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessLogo, setBusinessLogo] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [businessState, setBusinessState] = useState('');
  const [businessCountry, setBusinessCountry] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');

  const handleDownload = (type) => {
    let filePath;
    if (type === "Path") filePath = "/PathTemplate.xlsx";
    else if (type === "Step") filePath = "/StepTemplate.xlsx";
    else filePath = "/ServiceTemplate.xlsx";

    const link = document.createElement("a");
    link.href = filePath;
    link.download = filePath.substring(filePath.lastIndexOf("/") + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => resetpop(), 300);
  };
  const allSelected = businessName && businessDesc && website &&
    businessType && businessLogo && street && city && pinCode &&
    businessState && businessCountry && firstName && lastName && position;

  // ─── Approval Flow Helpers ──────────────────────────────────────────────────

  /**
   * Writes the approval status into localStorage so we can skip the
   * approval API on the next page load if we already know the answer.
   */
  const updateLocalStorage = (status) => {
    const existing = JSON.parse(localStorage.getItem("partner") || "{}");
    localStorage.setItem("partner", JSON.stringify({ ...existing, approvalStatus: status }));
  };

  /**
   * Fetches the partner profile data and populates state.
   * Pass the target status so we set accStatus correctly
   * (approved partners can edit; pending/rejected see read-only).
   */
  const fetchAndShowProfile = (mailId, targetStatus = "approved") => {
    axios
      .get(`${BASE_URL}/api/partner/get?email=${mailId}`)
      .then((profileRes) => {
        const raw = profileRes.data?.data || {};

        if (!raw || !raw.businessName) {
          // API returned empty data - no profile exists yet
          setIsProfileData(false);
          setProfileData({});
          setCreateBrandProfile(true);
          setIsLoadingProfile(false);
          return;
        }

        const normalized = {
          ...raw,
          type: raw.type || raw.partnerType || raw.businessType || "",
        };
        setIsProfileData(true);
        setProfileData(normalized);
        setprofileSpecalities(raw.specialities || []);
        setCreateBrandProfile(false);
        setAccStatus(targetStatus);

        // Always sync to localStorage for ALL statuses so the sidebar shows
        // the business name correctly and approvalStatus survives logout/re-login
        const existing = JSON.parse(localStorage.getItem("partner") || "{}");
        localStorage.setItem("partner", JSON.stringify({
          ...existing,
          approvalStatus: targetStatus,
          firstName: raw.firstName || existing.firstName,
          lastName: raw.lastName || existing.lastName,
          businessName: raw.businessName || existing.businessName,
        }));

        setIsLoadingProfile(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        // Network error - do NOT open create form, show empty state
        setIsProfileData(false);
        setProfileData({});
        setAccStatus("");
        setIsLoadingProfile(false);
      });
  };

  /**
   * Step 1 of the flow: hit the approvals endpoint first, then branch.
   * For pending AND rejected we still fetch the profile so it can be
   * displayed in read-only mode with a status banner on top.
   */
  const loadApprovalThenProfile = (mailId) => {
    axios
      .get(`${BASE_URL}/api/approvals/status?email=${mailId}`)
      .then((approvalRes) => {
        const liveStatus = approvalRes.data?.data?.status;
        // Grab any rejection reason the admin may have left
        const reason = approvalRes.data?.data?.reason || approvalRes.data?.data?.rejectionReason || "";
        console.log("🔍 liveStatus:", liveStatus, "| reason:", reason);

        if (liveStatus === "approved") {
          updateLocalStorage("approved");
          fetchAndShowProfile(mailId, "approved");
        } else if (liveStatus === "rejected") {
          setRejectionReason(reason);
          updateLocalStorage("rejected");
          setCreateBrandProfile(false);
          // Still load the profile so the partner can see what they submitted
          fetchAndShowProfile(mailId, "rejected");
        } else if (liveStatus === "pending") {
          updateLocalStorage("pending");
          setCreateBrandProfile(false);
          // Still load the profile so the partner can see what they submitted
          fetchAndShowProfile(mailId, "pending");
        } else {
          // No approval record yet — but the partner might have just submitted
          // their profile (API delay) or the approval doc wasn't created yet.
          // Check whether a partner profile row actually exists before showing
          // the create form — avoids the "create again" loop.
          axios
            .get(`${BASE_URL}/api/partner/get?email=${mailId}`)
            .then((profileRes) => {
              const raw = profileRes.data?.data || {};
              if (raw && raw.businessName) {
                // Profile exists but no approval record yet — treat as pending
                console.log("Profile found but no approval record -> pending");
                const normalized = { ...raw, type: raw.type || raw.partnerType || raw.businessType || "" };
                setIsProfileData(true);
                setProfileData(normalized);
                setprofileSpecalities(raw.specialities || []);
                setCreateBrandProfile(false);
                setAccStatus("pending");
                // Write pending + profile fields so sidebar shows businessName
                // and approvalStatus survives logout/re-login
                const existingLS = JSON.parse(localStorage.getItem("partner") || "{}");
                localStorage.setItem("partner", JSON.stringify({
                  ...existingLS,
                  approvalStatus: "pending",
                  firstName: raw.firstName || existingLS.firstName,
                  lastName: raw.lastName || existingLS.lastName,
                  businessName: raw.businessName || existingLS.businessName,
                }));
              } else {
                // Genuinely no profile yet -> show create form
                setIsProfileData(false);
                setProfileData({});
                setAccStatus("");
                setCreateBrandProfile(true);
              }
              setIsLoadingProfile(false);
            })
            .catch(() => {
              // Cannot fetch profile -> show create form as fallback
              setIsProfileData(false);
              setProfileData({});
              setAccStatus("");
              setCreateBrandProfile(true);
              setIsLoadingProfile(false);
            });
        }
      })
      .catch((err) => {
        console.log("Error fetching approval status:", err);
        // Approvals API failed — fall back to checking the partner profile
        // directly so we don't wrongly show the create form to a partner
        // who already submitted (e.g. approval service is slow / down).
        axios
          .get(`${BASE_URL}/api/partner/get?email=${mailId}`)
          .then((profileRes) => {
            const raw = profileRes.data?.data || {};
            if (raw && raw.businessName) {
              const normalized = { ...raw, type: raw.type || raw.partnerType || raw.businessType || "" };
              setIsProfileData(true);
              setProfileData(normalized);
              setprofileSpecalities(raw.specialities || []);
              setCreateBrandProfile(false);
              setAccStatus("pending"); // treat as pending when approval API is unreachable
              const existingLS = JSON.parse(localStorage.getItem("partner") || "{}");
              localStorage.setItem("partner", JSON.stringify({
                ...existingLS,
                approvalStatus: "pending",
                firstName: raw.firstName || existingLS.firstName,
                lastName: raw.lastName || existingLS.lastName,
                businessName: raw.businessName || existingLS.businessName,
              }));
            } else {
              setIsProfileData(false);
              setProfileData({});
              setAccStatus("");
              setCreateBrandProfile(true);
            }
            setIsLoadingProfile(false);
          })
          .catch(() => {
            setIsProfileData(false);
            setProfileData({});
            setAccStatus("");
            setIsLoadingProfile(false);
          });
      });
  };

  /**
   * Main entry-point (replaces the old handleAccountantData).
   * Only "approved" uses a fast path (approved cannot revert).
   * "pending" and "rejected" always do a live approval check so admin
   * actions (approve / reject) are reflected immediately on next page load.
   */
  const handleAccountantData = () => {
    const mailId = userDetails?.email;
    if (!mailId) return;

    const cachedStatus = userDetails?.approvalStatus;

    if (cachedStatus === "approved") {
      // Fast path only for approved — this status never reverts
      fetchAndShowProfile(mailId, "approved");
    } else {
      // For pending, rejected, or no cached status — always check live
      // so that admin approval/rejection is picked up immediately
      loadApprovalThenProfile(mailId);
    }
  };

  // ─── Everything below is unchanged from the original ──────────────────────

  const uploadBulkPath = async (file) => {
    try {
      setIsUploadLoading(true);
      const text = await file.text();
      const json = JSON.parse(text);
      let { data } = await axios.post(`${BASE_URL}/api/paths/bulk`, json);
      if (data?.status) {
        setIsUploadLoading(false);
        alert("Bulk paths uploaded successfully!");
      } else {
        setIsUploadLoading(false);
        alert("Error uploading");
      }
    } catch (error) {
      setIsUploadLoading(false);
      console.error("Bulk upload error:", error);
    }
  };

  const uploadBulkStep = async (file) => {
    try {
      setIsUploadLoading(true);
      const text = await file.text();
      const records = JSON.parse(text);
      if (!Array.isArray(records) || records.length === 0) {
        alert("JSON must contain an array of records");
        setIsUploadLoading(false);
        return;
      }
      const email = localStorage.getItem("loginEmail");
      if (!email) {
        alert("User email missing. Login again.");
        setIsUploadLoading(false);
        return;
      }
      const body = { email, records };
      const res = await axios.post(`${BASE_URL}/api/steps/bulk`, body);
      if (res.data?.status) {
        alert(`Uploaded ${res.data.count} steps successfully`);
        setpstep(12);
      } else {
        alert("Upload failed, check console");
      }
    } catch (err) {
      console.error("Error uploading bulk steps:", err);
      alert("Bulk upload error. Check console.");
    } finally {
      setIsUploadLoading(false);
    }
  };

  const uploadBulkService = async (file) => {
    try {
      setIsUploadLoading(true);
      const text = await file.text();
      const records = JSON.parse(text);
      if (!Array.isArray(records) || records.length === 0) {
        alert("JSON must contain an array of records");
        setIsUploadLoading(false);
        return;
      }
      const email = JSON.parse(localStorage.getItem("partner"))?.email;
      if (!email) {
        alert("User email missing");
        setIsUploadLoading(false);
        return;
      }
      const body = { email, records };
      const res = await axios.post(`${BASE_URL}/api/services/bulk`, body);
      if (res.data?.status) {
        alert(`Uploaded ${res.data.count} services successfully`);
        setpstep(12);
      } else {
        alert("Upload failed, check console");
      }
    } catch (err) {
      console.error("Error uploading bulk services:", err);
      alert("Bulk upload error. Check console.");
    } finally {
      setIsUploadLoading(false);
    }
  };

  const signJwt = async (fileName, emailDev, secret) => {
    try {
      const jwts = await new jose.SignJWT({ name: fileName, email: emailDev })
        .setProtectedHeader({ alg: "HS512" })
        .setIssuer("gxjwtenchs512")
        .setExpirationTime("10m")
        .sign(new TextEncoder().encode(secret));
      return jwts;
    } catch (error) {
      console.log(error, "kjbedkjwebdw");
    }
  };

  useEffect(() => {
    axios.get(`${BASE_URL}/api/paths/active`).then((res) => {
      let result = res?.data?.data;
      setBackupPathList(result);
    });
  }, []);

  const addBackupPath = (backupPathId, selectedStepId) => {
    pathSteps?.the_ids.map((item) => {
      if (item.step_id === selectedStepId) {
        item.backup_pathId = backupPathId;
      }
    });
    setShowBackupPathList(false);
  };

  function renameFile(originalFile, newName) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

  const getActiveSteps = () => {
    setLoading(true);
    const email = userDetails?.email || localStorage.getItem("loginEmail");
    axios
      .get(`${BASE_URL}/api/steps?path_id=selectedPathId`)
      .then((response) => {
        let result = response?.data?.data;
        setPartnerStepsData(result || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching partner steps:", error.response?.data || error.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    console.log("Updated partnerStepsData:", partnerStepsData);
  }, [partnerStepsData]);

  const handleGrade = (item) => {
    if (grade.includes(item)) setGrade(grade.filter((o) => o !== item));
    else setGrade([...grade, item]);
  };

  const handleGradeAvg = (item) => {
    if (gradeAvg.includes(item)) setGradeAvg(gradeAvg.filter((o) => o !== item));
    else setGradeAvg([...gradeAvg, item]);
  };

  const handleCurriculum = (item) => {
    if (curriculum.includes(item)) setCurriculum(curriculum.filter((o) => o !== item));
    else setCurriculum([...curriculum, item]);
  };

  const handleStream = (item) => {
    if (stream.includes(item)) setStream(stream.filter((o) => o !== item));
    else setStream([...stream, item]);
  };

  const handleFinance = (item) => {
    if (finance.includes(item)) setFinance(finance.filter((o) => o !== item));
    else setFinance([...finance, item]);
  };

  const handlePersonality = (item) => setPersonality(item);

  const handleFollowerPerAccountants = () => {
    setIsLoading(true);
    GetFollowersPerAccount()
      .then((res) => {
        let result = res.data;
        if (result.status) {
          setfollowCount(result.data.count);
          setfollowData(result.data.followers);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        toast.error("Something Went Wrong!", { position: toast.POSITION.TOP_RIGHT });
      });
  };

  const handleAllCustomerLicenses = () => {
    const userDetails = JSON.parse(localStorage.getItem("partner"));
    setIsPurchaseLoading(true);
    GetAllCustomerLicenses(userDetails.email)
      .then((res) => {
        let result = res.data;
        if (result.status) {
          setPurchaseData(result.licenses);
          setIsPurchaseLoading(false);
        }
      })
      .catch(() => setIsPurchaseLoading(false));
  };

  const handleCategories = () => {
    setIsCatLoading(true);
    GetCategoriesAcc()
      .then((res) => {
        let result = res.data;
        if (result.status) {
          setcategoriesData(result.categories);
          setIsCatLoading(false);
        }
      })
      .catch((err) => {
        setIsCatLoading(false);
        toast.error("Something Went Wrong!", { position: toast.POSITION.TOP_RIGHT });
      });
  };

  const handleGetCurrencies = () => {
    setIsCurrencies(true);
    GetAllCurrencies()
      .then((res) => {
        let result = res.data;
        if (result.status) {
          setallCurrencies(result.coins);
          setIsCurrencies(false);
        }
      })
      .catch((err) => {
        setIsCurrencies(false);
        toast.error("Something Went Wrong!", { position: toast.POSITION.TOP_RIGHT });
      });
  };

  const resetpop = () => {
    setispopular(false);
    setpstep(1);
    setbillingType("");
    setselectNew("");
    setselectCategory("");
    setcategoriesData([]);
    setSearch("");
    setSelectedCurrency({});
    setServiceNameInput("");
    setServiceCodeInput("");
    setProductLabel("");
    setServiceTagline("");
    setServiceDescription("");
    setfirstMonthPrice("");
    setmonthlyPrice("");
    setgracePeriod("");
    setsecondChargeAttempt("");
    setthirdChargeAttempt("");
    setCoverImageS3url("");
    setImage(null);
    setPathSteps({
      email: userDetails?.email,
      nameOfPath: "",
      description: "",
      length: "",
      path_type: "",
      the_ids: [],
      destination_institution: "",
    });
    setSelectedSteps([]);
    setGrade([]);
    setGradeAvg([]);
    setCurriculum([]);
    setStream([]);
    setFinance([]);
    setPersonality("");
    setSearchCurrency("");
    setIsSubmit(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("partner");
    localStorage.removeItem("loginEmail");
    navigate("/login");
  };

  const handleServicesForLogged = () => {
    setIsServicesAcc(true);
    GetLogServices()
      .then((res) => {
        let result = res.data;
        if (result.status) {
          setservicesAcc(result.products);
          setIsServicesAcc(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setIsServicesAcc(false);
      });
  };

  const fileInputRef = useRef(null);

  const handleImageClick = () => fileInputRef.current.click();

  const handleFileInputChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const uploadedUrl = await uploadImageFunc(e, setImage, setLoading);
    if (uploadedUrl) setImage(uploadedUrl);
  };

  const handleFileInputChange1 = (e) => {
    setImage(e.target.files[0]);
    uploadBulkPath(e.target.files[0]);
  };

  const handleFileInputChange2 = (e) => {
    setImage(e.target.files[0]);
    uploadBulkStep(e.target.files[0]);
  };

  const handleFileInputChange3 = (e) => {
    setImage(e.target.files[0]);
    uploadBulkService(e.target.files[0]);
  };

  const myTimeoutService = () => setTimeout(reloadService, 3000);

  function reloadService() {
    setispopular(false);
    setpstep(1);
    navigate('/dashboard/accountants');
    setaccsideNav("My Services");
    setservicesMenu("Services");
  }

  const handleFinalSubmit = () => {
    setIsSubmit(true);
    let userDetails = JSON.parse(localStorage.getItem("partner"));
    let objmonthly = {
      productcreatoremail: userDetails.email,
      token: userDetails.idToken,
      product_code: serviceCodeInput,
      product_name: serviceNameInput,
      product_icon: image,
      revenue_account: userDetails.email,
      client_app: "naavi",
      product_category_code: "CoE",
      sub_category_code: "",
      custom_product_label: productLabel,
      points_creation: false,
      sub_text: serviceTagline,
      full_description: serviceDescription,
      first_purchase: {
        price: firstMonthPrice !== "" ? parseFloat(firstMonthPrice) : 0,
        coin: selectedCurrency.coinSymbol,
      },
      billing_cycle: {
        monthly: {
          price: billingType === "One Time"
            ? firstMonthPrice !== "" ? parseFloat(firstMonthPrice) : 0
            : monthlyPrice !== "" ? parseFloat(monthlyPrice) : 0,
          coin: selectedCurrency.coinSymbol,
        },
      },
      grace_period: billingType === "One Time" ? 0 : gracePeriod !== "" ? parseFloat(gracePeriod) : 0,
      first_retry: billingType === "One Time" ? 0 : secondChargeAttempt !== "" ? parseFloat(secondChargeAttempt) : 0,
      second_retry: billingType === "One Time" ? 0 : thirdChargeAttempt !== "" ? parseFloat(thirdChargeAttempt) : 0,
      staking_allowed: false,
      staking_details: {},
    };

    let objone = {
      ...objmonthly,
      billing_cycle: {
        lifetime: {
          price: billingType === "One Time"
            ? firstMonthPrice !== "" ? parseFloat(firstMonthPrice) : 0
            : monthlyPrice !== "" ? parseFloat(monthlyPrice) : 0,
          coin: selectedCurrency.coinSymbol,
        },
      },
    };

    let obj = billingType === "One Time" ? objone : objmonthly;
    CreatePopularService(obj)
      .then((res) => {
        let result = res.data;
        if (result.status) {
          myTimeoutService();
          setpstep(7);
          setbillingType(""); setselectNew(""); setselectCategory("");
          setcategoriesData([]); setSearch(""); setSelectedCurrency({});
          setServiceNameInput(""); setServiceCodeInput(""); setProductLabel("");
          setServiceTagline(""); setServiceDescription("");
          setfirstMonthPrice(""); setmonthlyPrice(""); setgracePeriod("");
          setsecondChargeAttempt(""); setthirdChargeAttempt("");
          setIsSubmit(false); setImage(null);
        }
      })
      .catch(() => setIsSubmit(false));
  };

  useEffect(() => {
    setaccsideNav("");
    resetpop();
    handleAccountantData(); // ← uses the new approval-aware flow
  }, []);

  const myTimeout1 = () => setTimeout(reload1, 3000);

  function reload1() {
    setCreateBrandProfile(false);
    setCreateBrandProfileStep(1);
    setProfilePicture("");
    setFirstName(""); setLastName(""); setUserName("");
    setCoverPhoto1(""); setBrandDisplayName(""); setBrandUserName("");
    setBrandDescription(""); setBrandColorCode(""); setHeadquarter("");
    setBrandAddress(""); setWhiteProPic("");
    handleAccountantData();
  }

  const createPartnerProfile = () => {
    let email = userDetails?.email;
    if (!email) return;

    axios.put(`${BASE_URL}/api/partner/add`, {
      email, firstName, lastName, businessName,
      logo: businessLogo, street, city,
      state: businessState, pincode: pinCode,
      country: businessCountry, description: businessDesc,
      website, type: businessType, yourPosition: position,
    })
      .then(({ data }) => {
        if (data.success) {
          // Populate profileData immediately from form values so the
          // pending read-only view renders without a second API call.
          const freshProfile = {
            email,
            firstName,
            lastName,
            businessName,
            logo: businessLogo,
            street,
            city,
            state: businessState,
            pincode: pinCode,
            country: businessCountry,
            description: businessDesc,
            website,
            type: businessType,
            yourPosition: position,
          };
          setProfileData(freshProfile);
          setIsProfileData(true);
          setAccStatus("pending");
          // Write pending + businessName so sidebar shows correct name
          // immediately and survives logout/re-login
          const existingLS = JSON.parse(localStorage.getItem("partner") || "{}");
          localStorage.setItem("partner", JSON.stringify({
            ...existingLS,
            approvalStatus: "pending",
            firstName: firstName || existingLS.firstName,
            lastName: lastName || existingLS.lastName,
            businessName: businessName || existingLS.businessName,
          }));
          setCreateBrandProfile(false);
        }
      })
      .catch(err => console.error("Profile creation error:", err));
  };

  const createBankerProfile = () => {
    setIsloading(true);
    let email = userDetails?.user?.email;
    let token = userDetails?.idToken;
    axios
      .post(
        `${BASE_URL}/lxUser/register/banker`,
        {
          bankerTag: brandUserName, colorCode: brandColorCode,
          address: brandAddress, coverPicURL: coverPhoto1,
          displayName: brandDisplayName, description: brandDescription,
          partneringInstitutions: [], country: headquarter,
          profilePicURL: profilePicture, profilePicPNG: profilePicture,
          profilePicWhite: whiteProPic, profilePicWhitePNG: whiteProPic,
          autoDeposit: false, sefcoin_cashback: false, other_data: {},
        },
        { headers: { email, token } }
      )
      .then(() => {
        setIsloading(false);
        setCreateBrandProfileStep(3);
      })
      .catch((error) => console.log(error, "error in createBankerProfile"));
  };

  const changeStatus = (value) => {
    setChanging(true);
    let email = userDetails?.email;
    axios
      .post(
        `${BASE_URL}/banker/assignCategory`,
        { categoryName: value === "Public" ? "education consultants" : "marketmakers", email },
        { headers: { email, token: userDetails?.idToken } }
      )
      .then((response) => {
        let result = response?.data;
        if (result?.status) { setAccStatus(value); setChanging(false); }
        else setChanging(false);
      })
      .catch(() => setChanging(false));
  };

  const myTimeout = () => setTimeout(reload, 2000);

  function reload() {
    if (editAddress) { setEditAddress(false); setNewAddress(""); }
    else if (editDisplayName) { setEditDisplayName(false); setNewDisplayName(""); }
    else if (editDescription) { setEditDescription(false); setNewDescription(""); }
    else if (editPhoneNo) { setEditPhoneNo(false); setNewPhoneNo(""); }
    else if (editColorCode) { setEditColorCode(false); setNewColorCode(""); }
    else if (editCountry) { setEditCountry(false); setNewCountry(""); }
    else if (editCoverPic) { setEditCoverPic(false); setNewCoverPic(""); }
    else if (editProfilePic) { setEditProfilePic(false); setNewProfilePic(""); }
    handleAccountantData();
  }

  const editData = async (field, value) => {
    setLoading(true);
    let email = userDetails?.email;
    let token = userDetails?.idToken;
    try {
      let result = await axios.put(
        `${BASE_URL}/lxUser/update/banker`,
        { [field]: value },
        { headers: { token, email } }
      );
      if (result?.data?.status) { myTimeout(); setLoading(false); }
      else setLoading(false);
    } catch (error) {
      console.log(error, "error in editData");
    }
  };

  const handleChangeAccDashsidebar = () => {
    if (showDrop) setShowDrop(false);
  };

  useEffect(() => {
    let email = userDetails?.email;
    axios
      .get(`${BASE_URL}/api/steps/get?email=${email}`)
      .then((response) => setAllSteps(response?.data?.data))
      .catch((error) => console.log(error, "error in fetching all steps accprofile"));
  }, []);

  const pathSubmission = () => {
    setCreatingPath(true);
    axios
      .post(`${BASE_URL}/api/paths/add`, {
        ...pathSteps,
        performance: gradeAvg, curriculum, grade, stream,
        financialSituation: finance, personality,
        the_ids: pathSteps.the_ids.map(step => ({
          step_id: step.step_id, stepName: step.stepName,
          stepDescription: step.stepDescription, backup_pathId: step.backup_pathId,
          backupPathName: step.backupPathName, backupPathDescription: step.backupPathDescription,
        })),
      })
      .then((response) => {
        if (response?.data?.status) { setCreatingPath(false); window.location.reload(); }
        else setCreatingPath(false);
      })
      .catch(() => setCreatingPath(false));
  };

  const removeStep = (stepId) => {
    setSelectedSteps(selectedSteps.filter((step) => step._id !== stepId));
    setPathSteps({ ...pathSteps, the_ids: pathSteps?.the_ids?.filter((obj) => obj.step_id !== stepId) });
  };

  const handleEdit = (field, currentValue) => {
    setEditMode(field);
    setEditValue(currentValue || "");
  };

  const saveEdit = () => {
    if (!editValue.trim()) { setEditMode(null); return; }
    editData(editMode, editValue);
    setEditMode(null);
  };

  // ─── JSX ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div className="dashboard-main" style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div className="dashboard-body">
          <div>
            <AccDashsidebar
              handleChangeAccDashsidebar={handleChangeAccDashsidebar}
              accStatus={accStatus}
            />
          </div>
          <div className="dashboard-screens" onClick={() => resetpop()} style={{ background: "#F8FAFC" }}>
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", height: "100%" }}>
              <MenuNav
                showDrop={showDrop}
                setShowDrop={setShowDrop}
                searchPlaceholder="Search..."
                hideSearch={true}
              />

              {/* ── PROFILE LOADING STATE ── */}
              {isLoadingProfile ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
                  <LoadingAnimation1 icon={lg1} width={160} />
                </div>

                /* ── APPROVED: show full profile ── */
              ) : isProfileData && accStatus === "approved" ? (
                <div className="profile-modern-container" style={{ maxWidth: "100%", width: "100%", padding: "0 24px", boxSizing: "border-box", overflowY: "auto", flex: 1, minHeight: 0 }}>

                  {/* Cover Banner */}
                  <div style={{ position: "relative", marginBottom: "0" }}>
                    <div style={{
                      height: "160px",
                      background: "linear-gradient(135deg, #43c97e 0%, #38b8a0 50%, #2dd4bf 100%)",
                      borderRadius: "16px", width: "100%", position: "relative",
                      display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
                      padding: "16px", boxSizing: "border-box",
                    }}>
                      <button
                        onClick={() => { setEditMode("all"); setEditValue({}); }}
                        style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          padding: "9px 20px", background: "#ffffff",
                          border: "none", borderRadius: "10px",
                          color: "#1a1f36", fontWeight: "700", fontSize: "14px",
                          cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                      >
                        <EditIcon /> Edit Profile
                      </button>
                    </div>

                    {/* Avatar */}
                    <div style={{
                      position: "absolute", bottom: "-44px", left: "36px",
                      width: "88px", height: "88px", borderRadius: "14px",
                      border: "3px solid #fff", background: "#fff",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)", overflow: "hidden",
                    }}>
                      <img
                        src={profileData?.logo}
                        alt={profileData?.businessName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
                          e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:700">${(profileData?.businessName || "P").charAt(0).toUpperCase()}</div>`;
                        }}
                      />

                    </div>
                  </div>

                  {/* Name + badge row */}
                  <div style={{
                    paddingLeft: "140px", paddingRight: "24px",
                    paddingTop: "10px", paddingBottom: "20px",
                    display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
                  }}>
                    <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1f36", margin: 0 }}>
                      {profileData?.businessName}
                    </h1>
                    <span style={{ fontSize: "13px", color: "#718096" }}>
                      {profileData?.type || "Business"}
                    </span>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      padding: "3px 10px", background: "#e6f7ee", borderRadius: "20px",
                      fontSize: "12px", fontWeight: "600", color: "#2d6a4f",
                    }}>
                      <CheckIcon /><span>Verified Partner</span>
                    </div>
                  </div>

                  {/* Profile details card */}
                  <div style={{
                    background: "#fff", borderRadius: "16px",
                    border: "1px solid #eef0f3", boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    margin: "0 0 24px 0", overflow: "hidden",
                  }}>
                    {/* Row 1 */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #f0f2f5" }}>
                      {[
                        { label: "Business Name", value: profileData?.businessName, field: "businessName" },
                        { label: "Business Type", value: profileData?.type, field: "partnerType" },
                        { label: "Website", value: profileData?.website, field: "website" },
                        { label: "Email", value: userDetails?.email, field: null },
                      ].map((item, i, arr) => (
                        <div key={item.label} style={{ padding: "18px 20px", borderRight: i < arr.length - 1 ? "1px solid #f0f2f5" : "none" }}>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{item.label}</div>
                          {editMode === "all" && item.field ? (
                            <input defaultValue={item.value || ""} onChange={e => setEditValue(prev => ({ ...prev, [item.field]: e.target.value }))} style={{ fontSize: "14px", fontWeight: "500", color: "#1a1f36", border: "1px solid #43c97e", borderRadius: "6px", padding: "4px 8px", width: "100%", outline: "none" }} />
                          ) : (
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "#1a1f36", wordBreak: "break-all" }}>{item.value || "—"}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Row 2 */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #f0f2f5" }}>
                      {[
                        { label: "First Name", value: profileData?.firstName, field: "firstName" },
                        { label: "Last Name", value: profileData?.lastName, field: "lastName" },
                        { label: "Position", value: profileData?.yourPosition, field: "yourPosition" },
                        { label: "Country", value: profileData?.country, field: "country" },
                      ].map((item, i, arr) => (
                        <div key={item.label} style={{ padding: "18px 20px", borderRight: i < arr.length - 1 ? "1px solid #f0f2f5" : "none" }}>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{item.label}</div>
                          {editMode === "all" && item.field ? (
                            <input defaultValue={item.value || ""} onChange={e => setEditValue(prev => ({ ...prev, [item.field]: e.target.value }))} style={{ fontSize: "14px", fontWeight: "500", color: "#1a1f36", border: "1px solid #43c97e", borderRadius: "6px", padding: "4px 8px", width: "100%", outline: "none" }} />
                          ) : (
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "#1a1f36" }}>{item.value || "—"}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Row 3 — Description + Address */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                      <div style={{ padding: "18px 20px", borderRight: "1px solid #f0f2f5" }}>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Description</div>
                        {editMode === "all" ? (
                          <textarea
                            defaultValue={profileData?.description || ""}
                            onChange={e => setEditValue(prev => ({ ...prev, description: e.target.value }))}
                            style={{ fontSize: "14px", color: "#1a1f36", lineHeight: "1.6", border: "1px solid #43c97e", borderRadius: "6px", padding: "4px 8px", width: "100%", outline: "none", resize: "vertical", minHeight: "60px" }}
                          />
                        ) : (
                          <span style={{ fontSize: "14px", color: "#1a1f36", lineHeight: "1.6" }}>{profileData?.description || "—"}</span>
                        )}
                      </div>
                      <div style={{ padding: "18px 20px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Address</div>
                        <div style={{ fontSize: "14px", color: "#1a1f36", lineHeight: "1.7" }}>
                          <div>{profileData?.street || "—"}</div>
                          <div>{[profileData?.city, profileData?.state].filter(Boolean).join(", ")}</div>
                          <div>{[profileData?.country, profileData?.pincode].filter(Boolean).join(" ")}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save / Cancel */}
                  {editMode === "all" && (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px", gap: "10px" }}>
                      <button
                        onClick={() => { setEditMode(null); setEditValue({}); }}
                        style={{ padding: "10px 22px", background: "#f1f5f9", border: "none", borderRadius: "10px", color: "#475569", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const email = userDetails?.email;
                          const updates = editValue || {};
                          axios.put(`${BASE_URL}/api/partner/add`, { email, ...updates })
                            .then(({ data }) => {
                              if (data.success) {
                                setEditMode(null);
                                setEditValue({});
                                handleAccountantData();
                                toast.success("Profile has been updated!", { position: toast.POSITION.TOP_RIGHT, autoClose: 3000 });
                              }
                            })
                            .catch(err => console.error("Update error:", err));
                        }}
                        style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          padding: "10px 22px",
                          background: "linear-gradient(135deg, #43c97e 0%, #2dd4bf 100%)",
                          border: "none", borderRadius: "10px",
                          color: "#fff", fontWeight: "700", fontSize: "14px",
                          cursor: "pointer", boxShadow: "0 4px 14px rgba(67,201,126,0.35)",
                        }}
                      >
                        <EditIcon /> Save Profile
                      </button>
                    </div>
                  )}
                </div>

                /* ── PENDING: profile visible in read-only + yellow banner ── */
              ) : accStatus === "pending" && isProfileData ? (
                <div className="profile-modern-container" style={{ maxWidth: "100%", width: "100%", padding: "0 24px", boxSizing: "border-box" }}>

                  {/* ── Pending status banner ── */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "14px 20px", marginBottom: "20px",
                    background: "#fffbeb", borderRadius: "12px",
                    border: "1px solid #fde68a",
                  }}>
                    <div style={{ color: "#f59e0b", flexShrink: 0 }}><ClockIcon /></div>
                    <div>
                      <div style={{ fontWeight: "700", color: "#92400e", fontSize: "14px" }}>
                        Profile Under Review
                      </div>
                      <div style={{ fontSize: "13px", color: "#b45309", marginTop: "2px" }}>
                        Your profile has been submitted and is awaiting admin approval. All fields are read-only until approved. This usually takes 1–2 business days.
                      </div>
                    </div>
                  </div>

                  {/* Cover Banner — no Edit button */}
                  <div style={{ position: "relative", marginBottom: "0" }}>
                    <div style={{
                      height: "160px",
                      background: "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)",
                      borderRadius: "16px", width: "100%",
                    }} />
                    {/* Avatar */}
                    <div style={{
                      position: "absolute", bottom: "-44px", left: "36px",
                      width: "88px", height: "88px", borderRadius: "14px",
                      border: "3px solid #fff", background: "#fff",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)", overflow: "hidden",
                    }}>
                      <img
                        src={profileData?.logo}
                        alt={profileData?.businessName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.style.background = "linear-gradient(135deg, #9ca3af, #6b7280)";
                          e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:700">${(profileData?.businessName || "P").charAt(0).toUpperCase()}</div>`;
                        }}
                      />
                    </div>
                  </div>

                  {/* Name + pending badge */}
                  <div style={{
                    paddingLeft: "140px", paddingRight: "24px",
                    paddingTop: "10px", paddingBottom: "20px",
                    display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
                  }}>
                    <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1f36", margin: 0 }}>
                      {profileData?.businessName}
                    </h1>
                    <span style={{ fontSize: "13px", color: "#718096" }}>
                      {profileData?.type || "Business"}
                    </span>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      padding: "3px 10px", background: "#fffbeb", borderRadius: "20px",
                      fontSize: "12px", fontWeight: "600", color: "#92400e",
                      border: "1px solid #fde68a",
                    }}>
                      <ClockIcon /><span>Pending Approval</span>
                    </div>
                  </div>

                  {/* Read-only profile details card */}
                  <div style={{
                    background: "#fff", borderRadius: "16px",
                    border: "1px solid #eef0f3", boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    margin: "0 0 24px 0", overflow: "hidden",
                    opacity: 0.85,
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #f0f2f5" }}>
                      {[
                        { label: "Business Name", value: profileData?.businessName },
                        { label: "Business Type", value: profileData?.type },
                        { label: "Website", value: profileData?.website },
                        { label: "Email", value: userDetails?.email },
                      ].map((item, i, arr) => (
                        <div key={item.label} style={{ padding: "18px 20px", borderRight: i < arr.length - 1 ? "1px solid #f0f2f5" : "none" }}>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{item.label}</div>
                          <span style={{ fontSize: "14px", fontWeight: "500", color: "#1a1f36", wordBreak: "break-all" }}>{item.value || "—"}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #f0f2f5" }}>
                      {[
                        { label: "First Name", value: profileData?.firstName },
                        { label: "Last Name", value: profileData?.lastName },
                        { label: "Position", value: profileData?.yourPosition },
                        { label: "Country", value: profileData?.country },
                      ].map((item, i, arr) => (
                        <div key={item.label} style={{ padding: "18px 20px", borderRight: i < arr.length - 1 ? "1px solid #f0f2f5" : "none" }}>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{item.label}</div>
                          <span style={{ fontSize: "14px", fontWeight: "500", color: "#1a1f36" }}>{item.value || "—"}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                      <div style={{ padding: "18px 20px", borderRight: "1px solid #f0f2f5" }}>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Description</div>
                        <span style={{ fontSize: "14px", color: "#1a1f36", lineHeight: "1.6" }}>{profileData?.description || "—"}</span>
                      </div>
                      <div style={{ padding: "18px 20px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Address</div>
                        <div style={{ fontSize: "14px", color: "#1a1f36", lineHeight: "1.7" }}>
                          <div>{profileData?.street || "—"}</div>
                          <div>{[profileData?.city, profileData?.state].filter(Boolean).join(", ")}</div>
                          <div>{[profileData?.country, profileData?.pincode].filter(Boolean).join(" ")}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                /* ── REJECTED: profile visible in read-only + red banner with reason ── */
              ) : accStatus === "rejected" && isProfileData ? (
                <div className="profile-modern-container" style={{ maxWidth: "100%", width: "100%", padding: "0 24px", boxSizing: "border-box" }}>

                  {/* ── Rejection banner with reason ── */}
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: "12px",
                    padding: "14px 20px", marginBottom: "20px",
                    background: "#fef2f2", borderRadius: "12px",
                    border: "1px solid #fecaca",
                  }}>
                    <div style={{ color: "#ef4444", flexShrink: 0, marginTop: "2px" }}><XCircleIcon /></div>
                    <div>
                      <div style={{ fontWeight: "700", color: "#991b1b", fontSize: "14px" }}>
                        Application Not Approved
                      </div>
                      <div style={{ fontSize: "13px", color: "#b91c1c", marginTop: "4px" }}>
                        {rejectionReason
                          ? <><strong>Reason: </strong>{rejectionReason}</>
                          : "Your application was not approved. Please contact support@naavi.com for more information."
                        }
                      </div>
                    </div>
                  </div>

                  {/* Cover Banner — no Edit button, greyed out */}
                  <div style={{ position: "relative", marginBottom: "0" }}>
                    <div style={{
                      height: "160px",
                      background: "linear-gradient(135deg, #fca5a5 0%, #f87171 100%)",
                      borderRadius: "16px", width: "100%",
                    }} />
                    <div style={{
                      position: "absolute", bottom: "-44px", left: "36px",
                      width: "88px", height: "88px", borderRadius: "14px",
                      border: "3px solid #fff", background: "#fff",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)", overflow: "hidden",
                    }}>
                      <img
                        src={profileData?.logo}
                        alt={profileData?.businessName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.style.background = "linear-gradient(135deg, #f87171, #ef4444)";
                          e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:700">${(profileData?.businessName || "P").charAt(0).toUpperCase()}</div>`;
                        }}
                      />
                    </div>
                  </div>

                  {/* Name + rejected badge */}
                  <div style={{
                    paddingLeft: "140px", paddingRight: "24px",
                    paddingTop: "10px", paddingBottom: "20px",
                    display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
                  }}>
                    <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1f36", margin: 0 }}>
                      {profileData?.businessName}
                    </h1>
                    <span style={{ fontSize: "13px", color: "#718096" }}>{profileData?.type || "Business"}</span>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      padding: "3px 10px", background: "#fef2f2", borderRadius: "20px",
                      fontSize: "12px", fontWeight: "600", color: "#991b1b",
                      border: "1px solid #fecaca",
                    }}>
                      <XCircleIcon /><span>Not Approved</span>
                    </div>
                  </div>

                  {/* Read-only profile details card */}
                  <div style={{
                    background: "#fff", borderRadius: "16px",
                    border: "1px solid #fee2e2", boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    margin: "0 0 24px 0", overflow: "hidden", opacity: 0.75,
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #f0f2f5" }}>
                      {[
                        { label: "Business Name", value: profileData?.businessName },
                        { label: "Business Type", value: profileData?.type },
                        { label: "Website", value: profileData?.website },
                        { label: "Email", value: userDetails?.email },
                      ].map((item, i, arr) => (
                        <div key={item.label} style={{ padding: "18px 20px", borderRight: i < arr.length - 1 ? "1px solid #f0f2f5" : "none" }}>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{item.label}</div>
                          <span style={{ fontSize: "14px", fontWeight: "500", color: "#1a1f36", wordBreak: "break-all" }}>{item.value || "—"}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #f0f2f5" }}>
                      {[
                        { label: "First Name", value: profileData?.firstName },
                        { label: "Last Name", value: profileData?.lastName },
                        { label: "Position", value: profileData?.yourPosition },
                        { label: "Country", value: profileData?.country },
                      ].map((item, i, arr) => (
                        <div key={item.label} style={{ padding: "18px 20px", borderRight: i < arr.length - 1 ? "1px solid #f0f2f5" : "none" }}>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{item.label}</div>
                          <span style={{ fontSize: "14px", fontWeight: "500", color: "#1a1f36" }}>{item.value || "—"}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                      <div style={{ padding: "18px 20px", borderRight: "1px solid #f0f2f5" }}>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Description</div>
                        <span style={{ fontSize: "14px", color: "#1a1f36", lineHeight: "1.6" }}>{profileData?.description || "—"}</span>
                      </div>
                      <div style={{ padding: "18px 20px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Address</div>
                        <div style={{ fontSize: "14px", color: "#1a1f36", lineHeight: "1.7" }}>
                          <div>{profileData?.street || "—"}</div>
                          <div>{[profileData?.city, profileData?.state].filter(Boolean).join(", ")}</div>
                          <div>{[profileData?.country, profileData?.pincode].filter(Boolean).join(" ")}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                /* ── NO PROFILE YET: show create form trigger ── */
              ) : (
                <div className="create-profile-prompt">
                  <div className="prompt-card">
                    <h2>Create Your Partner Profile</h2>
                    <p>Get started by setting up your business profile on Naavi</p>
                    <button className="prompt-btn" onClick={() => setCreateBrandProfile(true)}>
                      Create Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {ispopular && accStatus === "approved" && (
        <>
          {/* BLUR OVERLAY */}
          <div
            onClick={() => resetpop()}
            style={{
              position: "fixed",
              inset: 0,
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              background: "rgba(0, 0, 0, 0.25)",
              zIndex: 998,
            }}
          />

          <div
            className="acc-popular"
            onClick={() => setShowDrop(false)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="acc-popular-top">
              <div className="acc-popular-head">
                {pstep > 1 && pstep < 8 ? "New Service" : "Popular Actions"}
              </div>
              <div
                className="acc-popular-img-box"
                onClick={() => resetpop()}
                style={{ cursor: "pointer" }}
              >
                <img className="acc-popular-img" src={closepop} alt="" />
              </div>
            </div>

            <>
              {pstep === 1 ? (
                <div>
                  <div>
                    {/* ✅ UPDATED: Service */}
                    <div
                      className="acc-step-box"
                      onClick={() => {
                        setselectNew("Service");
                        setispopular(false);
                        navigate("/dashboard/accountants", {
                          state: { openCreateService: true },
                        });
                      }}
                    >
                      Service
                    </div>

                    {/* ✅ UPDATED: Path */}
                    <div
                      className="acc-step-box"
                      onClick={() => {
                        setselectNew("Path");
                        setispopular(false);
                        navigate("/dashboard/accountants", {
                          state: { openCreatePath: true },
                        });
                      }}
                    >
                      Path
                    </div>

                    {/* ✅ UPDATED: Bulk Service */}
                    <div
                      className="acc-step-box"
                      onClick={() => {
                        setselectNew("Bulk Service");
                        setpstep(13);
                      }}
                    >
                      Bulk Service
                    </div>

                    {/* ✅ UPDATED: Bulk Path */}
                    <div
                      className="acc-step-box"
                      onClick={() => {
                        setselectNew("Bulk Path");
                        setpstep(10);
                      }}
                    >
                      Bulk Path
                    </div>

                    {/* ✅ UPDATED: Bulk Step */}
                    <div
                      className="acc-step-box"
                      onClick={() => {
                        setselectNew("Bulk Step");
                        setpstep(11);
                      }}
                    >
                      Bulk Step
                    </div>
                  </div>
                </div>
              ) : pstep === 10 ? (
                <div>
                  <div className="acc-step-text">Bulk Path Action</div>
                  <div>
                    <div className="acc-step-box" onClick={() => handleDownload("Path")}>
                      Download
                    </div>
                    <div className="acc-step-box" onClick={handleImageClick}>
                      Upload
                      <input
                        type="file"
                        onChange={handleFileInputChange1}
                        style={{ display: "none" }}
                        ref={fileInputRef}
                      />
                    </div>
                  </div>
                  <div className="goBack" onClick={() => setpstep(1)}>
                    Go Back
                  </div>
                </div>
              ) : pstep === 11 ? (
                <div>
                  <div className="acc-step-text">Bulk Step Action</div>
                  <div>
                    <div className="acc-step-box" onClick={() => handleDownload("Step")}>
                      Download
                    </div>
                    <div className="acc-step-box" onClick={handleImageClick}>
                      Upload
                      <input
                        type="file"
                        onChange={handleFileInputChange2}
                        style={{ display: "none" }}
                        ref={fileInputRef}
                      />
                    </div>
                  </div>
                  <div className="goBack" onClick={() => setpstep(1)}>
                    Go Back
                  </div>
                </div>
              ) : pstep === 13 ? (
                <div>
                  <div className="acc-step-text">Bulk Service Action</div>
                  <div>
                    <div className="acc-step-box" onClick={() => handleDownload("Service")}>
                      Download
                    </div>
                    <div className="acc-step-box" onClick={handleImageClick}>
                      Upload
                      <input
                        type="file"
                        onChange={handleFileInputChange3}
                        style={{ display: "none" }}
                        ref={fileInputRef}
                      />
                    </div>
                  </div>
                  <div className="goBack" onClick={() => setpstep(1)}>
                    Go Back
                  </div>
                </div>
              ) : pstep === 12 ? (
                <div>
                  <div className="acc-step-text">Uploaded Successfully</div>
                  <div className="goBack" onClick={() => { setpstep(1); setbillingType(""); }}>
                    Go Back
                  </div>
                </div>
              ) : null}
            </>
          </div>
        </>
      )}


      {/* ── Create Brand Profile Modal ── */}
      {createBrandProfile && (
        <div className="popularS" style={{ padding: createBrandProfileStep === 2 ? "1rem 0rem 2rem" : "1rem 3rem 2rem" }}>
          {createBrandProfileStep === 1 && (
            <>
              <div className="head-txt" style={{ height: "4rem" }}>
                <div>Create Partner</div>
                <div onClick={() => { setCreateBrandProfile(false); setUserName(""); setLastName(""); setFirstName(""); setProfilePicture(""); }} className="close-div">
                  <img src={close} alt="" />
                </div>
              </div>
              <div className="overall-div" style={{ overflowY: "auto", overflowX: "hidden" }}>                <InputDivsCreatePartner placeholderText="Business name...." setFunc={setBusinessName} funcValue={businessName} />
                <InputDivsTextAreaPartner placeholderText="Business description...." setFunc={setBusinessDesc} funcValue={businessDesc} />
                <InputDivsCreatePartner placeholderText="Website...." setFunc={setWebsite} funcValue={website} />
                <InputDivsCreatePartner placeholderText="Type of business...." setFunc={setBusinessType} funcValue={businessType} />
                <div className={styles.imgContainer}>
                  <ImageUploadDivProfilePic setFunc={setBusinessLogo} funcValue={businessLogo} />
                  <div className={styles.logoText}>Upload Logo *</div>
                </div>
                <div className={styles.labelClass} style={{ paddingTop: "30px" }}>Business address *</div>
                <InputDivsCreatePartner placeholderText="street...." setFunc={setStreet} funcValue={street} />
                <InputDivsCreatePartner placeholderText="city...." setFunc={setCity} funcValue={city} />
                <InputDivsCreatePartner placeholderText="pincode...." setFunc={setPinCode} funcValue={pinCode} />
                <InputDivsCreatePartner placeholderText="state...." setFunc={setBusinessState} funcValue={businessState} />
                <div className={styles.inputDivs} style={{ border: '1px solid #2c7cb2', borderRadius: '4px', fontSize: "13px", fontWeight: "500", paddingLeft: '0px', marginTop: '0px' }}>
                  <select name="country" id="country" style={{ border: "none", padding: '1rem', width: '90%', fontSize: "16px" }} onChange={(e) => setBusinessCountry(e.target.value)}>
                    <option value="">Click to Select</option>
                    {countryApiValue?.map((item) => (
                      <option key={item.cca2} value={item?.name?.common}>{item?.name?.common}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.labelClass} style={{ paddingTop: "30px" }}>Your information *</div>
                <InputDivsCreatePartner placeholderText="First name...." setFunc={setFirstName} funcValue={firstName} />
                <InputDivsCreatePartner placeholderText="Last name...." setFunc={setLastName} funcValue={lastName} />
                <InputDivsCreatePartner placeholderText="Your position......." setFunc={setPosition} funcValue={position} />
                <div className={styles.submitBtn} style={{ opacity: allSelected ? 1 : 0.4 }} onClick={() => allSelected && createPartnerProfile()}>
                  Become a partner
                </div>
              </div>
            </>
          )}

          {createBrandProfileStep === 2 && (
            <>
              <div className="head-txt" style={{ padding: "0 3rem", height: "4rem" }}>
                <div>Step 2</div>
                <div onClick={() => { setCreateBrandProfile(false); setCreateBrandProfileStep(1); }} className="close-div">
                  <img src={close} alt="" />
                </div>
              </div>
              <div className="overall-div" style={{ height: "calc(100% - 4rem)" }}>
                <div className="coverPic-container">
                  <div className="coverPicDiv"><ImageUploadDivCoverPic1 setFunc={setCoverPhoto1} funcValue={coverPhoto1} /></div>
                  <div className="logoDiv"><img src={profilePicture} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", border: "none" }} /></div>
                </div>
                <div className="inputs-container">
                  <InputDivsWithMT heading="Display Name *" placeholderText="Display Name.." setFunc={setBrandDisplayName} funcValue={brandDisplayName} />
                  <InputDivsCheckFunctionality heading="Naavi Username *" placeholderText="Username.." setFunc={setBrandUserName} funcValue={brandUserName} userNameAvailable={userNameAvailable1} />
                  <InputDivsTextArea1 heading="Naavi Bio *" placeholderText="Bio..." setFunc={setBrandDescription} funcValue={brandDescription} />
                  <InputDivsWithColorCode heading="Colour Code *" placeholderText="#000000" setFunc={setBrandColorCode} funcValue={brandColorCode} colorCode={brandColorCode} />
                  <div style={{ paddingTop: '30px' }}>Select Country *</div>
                  <div className={styles.inputDivs} style={{ border: '1px solid #e7e7e7', borderRadius: '30px', fontSize: "13px", fontWeight: "500", paddingLeft: '10px' }}>
                    <select name="country" style={{ border: "none", padding: '1rem', width: '90%', fontSize: "16px" }} onChange={(e) => setHeadquarter(e.target.value)}>
                      <option value="">Click to Select</option>
                      {countryApiValue?.map((item) => <option key={item.cca2} value={item?.name?.common}>{item?.name?.common}</option>)}
                    </select>
                  </div>
                  <InputDivsWithMT heading="What is your office address? *" placeholderText="Enter address..." setFunc={setBrandAddress} funcValue={brandAddress} />
                  <div style={{ marginTop: "3rem", marginBottom: "0.5rem", fontSize: "1.1rem" }}>Upload white profile picture *</div>
                  <ImageUploadProfilePic2 setFunc={setWhiteProPic} funcValue={whiteProPic} />
                  <div className="stepBtns" style={{ marginTop: "3.5rem" }}>
                    <div style={{ cursor: "pointer", background: "#1F304F", width: "48%" }} onClick={() => { setCreateBrandProfileStep(1); }}>Go Back</div>
                    <div
                      style={{ opacity: coverPhoto1 && whiteProPic && brandAddress && headquarter && brandColorCode && brandDescription && brandUserName.length > 0 && brandDisplayName && userNameAvailable1 ? "1" : "0.25", cursor: coverPhoto1 && whiteProPic && brandAddress && headquarter && brandColorCode && brandDescription && brandUserName.length > 0 && brandDisplayName && userNameAvailable1 ? "pointer" : "not-allowed", background: "#59A2DD", width: "48%" }}
                      onClick={() => { if (coverPhoto1 && whiteProPic && brandAddress && headquarter && brandColorCode && brandDescription && brandUserName.length > 0 && brandDisplayName && userNameAvailable1) createBankerProfile(); }}
                    >Complete</div>
                  </div>
                </div>
              </div>
              {isloading && (
                <div className="loading-component" style={{ top: "0", left: "0", width: "100%", height: "100%", position: "absolute", display: "flex" }}>
                  <LoadingAnimation1 icon={lg1} width={200} />
                </div>
              )}
            </>
          )}

          {createBrandProfileStep === 3 && (
            <div className="successMsg">You Have Successfully Created Your Naavi Profile.</div>
          )}
        </div>
      )}

      {/* ── Edit Modals (unchanged) ── */}
      {editCountry && (
        <div className="popularS">
          <div className="head-txt"><div>Edit Country</div><div onClick={() => { setEditCountry(false); setNewCountry(""); }} className="close-div"><img src={close} alt="" /></div></div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1"><div>{profileData?.country}</div></div>
            <div className="line-container"><div className="linee"></div><div className="new-txt">New</div><div className="linee"></div></div>
            <div className="each-action1">
              <select name="country" style={{ border: "none", padding: '1.5rem', width: '90%', fontSize: "16px" }} onChange={(e) => setNewCountry(e.target.value)}>
                {countryApiValue?.map((item) => <option key={item.cca2} value={item?.name?.common}>{item?.name?.common}</option>)}
              </select>
            </div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}><div style={{ opacity: newCountry ? "1" : "0.25", cursor: newCountry ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newCountry) editData("country", newCountry); }}>Submit Edit</div></div>
          {loading && <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}><LoadingAnimation1 icon={lg1} width={200} /></div>}
        </div>
      )}

      {editAddress && (
        <div className="popularS">
          <div className="head-txt"><div>Edit Address</div><div onClick={() => { setEditAddress(false); setNewAddress(""); }} className="close-div"><img src={close} alt="" /></div></div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1"><div>{profileData?.address}</div></div>
            <div className="line-container"><div className="linee"></div><div className="new-txt">New</div><div className="linee"></div></div>
            <div className="each-action1"><input type="text" placeholder="New Address.." onChange={(e) => setNewAddress(e.target.value)} /></div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}><div style={{ opacity: newAddress ? "1" : "0.25", cursor: newAddress ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newAddress) editData("address", newAddress); }}>Submit Edit</div></div>
          {loading && <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}><LoadingAnimation1 icon={lg1} width={200} /></div>}
        </div>
      )}

      {editDisplayName && (
        <div className="popularS">
          <div className="head-txt"><div>Edit Display Name</div><div onClick={() => { setEditDisplayName(false); setNewDisplayName(""); }} className="close-div"><img src={close} alt="" /></div></div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1"><div>{profileData?.displayName}</div></div>
            <div className="line-container"><div className="linee"></div><div className="new-txt">New</div><div className="linee"></div></div>
            <div className="each-action1"><input type="text" placeholder="New Display Name.." onChange={(e) => setNewDisplayName(e.target.value)} /></div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}><div style={{ opacity: newDisplayName ? "1" : "0.25", cursor: newDisplayName ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newDisplayName) editData("displayName", newDisplayName); }}>Submit Edit</div></div>
          {loading && <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}><LoadingAnimation1 icon={lg1} width={200} /></div>}
        </div>
      )}

      {editPhoneNo && (
        <div className="popularS">
          <div className="head-txt"><div>Edit Phone Number</div><div onClick={() => { setEditPhoneNo(false); setNewPhoneNo(""); }} className="close-div"><img src={close} alt="" /></div></div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1"><div>{profileData?.phone}</div></div>
            <div className="line-container"><div className="linee"></div><div className="new-txt">New</div><div className="linee"></div></div>
            <div className="each-action1"><input type="number" placeholder="New Phone Number.." onChange={(e) => setNewPhoneNo(e.target.value)} /></div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}><div style={{ opacity: newPhoneNo ? "1" : "0.25", cursor: newPhoneNo ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newPhoneNo) editData("phone", newPhoneNo); }}>Submit Edit</div></div>
          {loading && <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}><LoadingAnimation1 icon={lg1} width={200} /></div>}
        </div>
      )}

      {editDescription && (
        <div className="popularS">
          <div className="head-txt"><div>Edit Description</div><div onClick={() => { setEditDescription(false); setNewDescription(""); }} className="close-div"><img src={close} alt="" /></div></div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1"><div>{profileData?.description}</div></div>
            <div className="line-container"><div className="linee"></div><div className="new-txt">New</div><div className="linee"></div></div>
            <div className="each-action1"><input type="text" placeholder="New Description.." onChange={(e) => setNewDescription(e.target.value)} /></div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}><div style={{ opacity: newDescription ? "1" : "0.25", cursor: newDescription ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newDescription) editData("description", newDescription); }}>Submit Edit</div></div>
          {loading && <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}><LoadingAnimation1 icon={lg1} width={200} /></div>}
        </div>
      )}

      {editColorCode && (
        <div className="popularS">
          <div className="head-txt"><div>Edit Colour Code</div><div onClick={() => { setEditColorCode(false); setNewColorCode(""); }} className="close-div"><img src={close} alt="" /></div></div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1" style={{ position: "relative" }}><div>{profileData?.colorCode}</div><div className="bgColorDiv" style={{ background: `#${profileData?.colorCode}` }}></div></div>
            <div className="line-container"><div className="linee"></div><div className="new-txt">New</div><div className="linee"></div></div>
            <div className="each-action1" style={{ position: "relative" }}><input type="text" placeholder="New Colour Code.." onChange={(e) => setNewColorCode(e.target.value)} /><div className="bgColorDiv" style={{ background: newColorCode ? `#${newColorCode}` : "transparent" }}></div></div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}><div style={{ opacity: newColorCode ? "1" : "0.25", cursor: newColorCode ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newColorCode) editData("colorCode", newColorCode); }}>Submit Edit</div></div>
          {loading && <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}><LoadingAnimation1 icon={lg1} width={200} /></div>}
        </div>
      )}

      {editProfilePic && (
        <div className="popularS">
          <div className="head-txt"><div>Edit Profile Picture</div><div onClick={() => { setEditProfilePic(false); setNewProfilePic(""); }} className="close-div"><img src={close} alt="" /></div></div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1" style={{ border: "none", justifyContent: "center" }}><div style={{ height: "120px", width: "120px" }}><img src={profileData?.profilePicURL} alt="" style={{ height: "100%", width: "100%", borderRadius: "50%", border: "0.5px solid #e5e5e5" }} /></div></div>
            <div className="line-container"><div className="linee"></div><div className="new-txt">New</div><div className="linee"></div></div>
            <div className="each-action1" style={{ border: "none", justifyContent: "center" }}><ImageUploadDivProfilePic setFunc={setNewProfilePic} funcValue={newProfilePic} /></div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}><div style={{ opacity: newProfilePic ? "1" : "0.25", cursor: newProfilePic ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newProfilePic) editData("profilePicURL", newProfilePic); }}>Submit Edit</div></div>
          {loading && <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}><LoadingAnimation1 icon={lg1} width={200} /></div>}
        </div>
      )}

      {editCoverPic && (
        <div className="popularS">
          <div className="head-txt"><div>Edit Cover Photo</div><div onClick={() => { setEditCoverPic(false); setNewCoverPic(""); }} className="close-div"><img src={close} alt="" /></div></div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1" style={{ height: "12rem", padding: "0" }}><div style={{ height: "100%", width: "100%" }}><img src={profileData?.coverPicURL} alt="" style={{ height: "100%", width: "100%" }} /></div></div>
            <div className="line-container"><div className="linee"></div><div className="new-txt">New</div><div className="linee"></div></div>
            <div className="each-action1" style={{ height: "12rem", padding: "0" }}><ImageUploadDivCoverPic setFunc={setNewCoverPic} funcValue={newCoverPic} /></div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}><div style={{ opacity: newCoverPic ? "1" : "0.25", cursor: newCoverPic ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newCoverPic) editData("coverPicURL", newCoverPic); }}>Submit Edit</div></div>
          {loading && <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}><LoadingAnimation1 icon={lg1} width={200} /></div>}
        </div>
      )}

      {changing && <div className="loading-overlay"><LoadingAnimation1 icon={lg1} width={200} /></div>}

      <ToastContainer />
    </div>
  );
};

export default AccProfile;

// ─── Exported sub-components (unchanged) ──────────────────────────────────────

export const ImageUploadDivProfilePic1 = ({ setFunc, funcValue }) => {
  const { planBAccountPicUploading, setplanBAccountPicUploading, setSelectedDropDown } = useStore();
  return (
    <div className="imageUploadDiv" onClick={() => setSelectedDropDown("")} style={{ minWidth: "140px", minHeight: "140px", maxWidth: "140px", maxHeight: "140px", border: "0.5px solid #e7e7e7", borderRadius: "50%" }}>
      {funcValue ? (
        <div className="imageDiv" style={{ height: "100%", width: "100%", marginRight: "0" }}><img src={funcValue} alt="planBAccountPic" className="profileImg" style={{ width: "100%", height: "100%" }} /></div>
      ) : (
        <label htmlFor="profileUpdateImgPlanB" className="uploadFileDiv" style={{ width: "100%", height: "100%", marginBottom: "0" }}>
          <input className="uploadNewPicPlanB" type="file" onChange={(e) => uploadImageFunc(e, setFunc, setplanBAccountPicUploading)} accept="image/*" id="profileUpdateImgPlanB" />
          <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", border: "0.5px solid #2c7cb2", borderRadius: "50%" }}>
            {planBAccountPicUploading ? <div>Uploading...</div> : <div><img src={uploadGrey} alt="" style={{ width: "40px", height: "40px" }} /></div>}
          </div>
        </label>
      )}
    </div>
  );
};

export const ImageUploadProfilePic2 = ({ setFunc, funcValue }) => {
  const { planBAccountPicUploading, setplanBAccountPicUploading, setSelectedDropDown } = useStore();
  return (
    <div className="imageUploadDiv" onClick={() => setSelectedDropDown("")} style={{ minWidth: "140px", minHeight: "140px", maxWidth: "140px", maxHeight: "140px", border: "0.5px solid #e7e7e7", borderRadius: "50%", display: "flex" }}>
      {funcValue ? (
        <div className="imageDiv" style={{ height: "100%", width: "100%", marginRight: "0" }}><img src={funcValue} alt="planBAccountPic" className="profileImg" style={{ width: "100%", height: "100%" }} /></div>
      ) : (
        <label htmlFor="profileUpdateImgPlanB" className="uploadFileDiv" style={{ width: "140px", height: "140px", marginBottom: "0" }}>
          <input className="uploadNewPicPlanB" type="file" onChange={(e) => uploadImageFunc(e, setFunc, setplanBAccountPicUploading)} accept="image/*" id="profileUpdateImgPlanB" />
          <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", border: "none", borderRadius: "50%" }}>
            {planBAccountPicUploading ? <div>Uploading...</div> : <div><img src={uploadGrey} alt="" style={{ width: "40px", height: "40px" }} /></div>}
          </div>
        </label>
      )}
    </div>
  );
};

export const ImageUploadDivCoverPic1 = ({ setFunc, funcValue }) => {
  const { planBAccountPicUploading, setplanBAccountPicUploading, setSelectedDropDown } = useStore();
  return (
    <div className="imageUploadDiv" onClick={() => setSelectedDropDown("")} style={{ width: "100%", height: "100%" }}>
      {funcValue ? (
        <div className="imageDiv" style={{ height: "100%", width: "100%", marginRight: "0" }}><img src={funcValue} alt="planBAccountPic" className="profileImg" style={{ width: "100%", height: "100%", borderRadius: "0" }} /></div>
      ) : (
        <label htmlFor="profileUpdateImgPlanB" className="uploadFileDiv" style={{ width: "100%", height: "100%", marginBottom: "0" }}>
          <input className="uploadNewPicPlanB" type="file" onChange={(e) => uploadImageFunc(e, setFunc, setplanBAccountPicUploading)} accept="image/*" id="profileUpdateImgPlanB" />
          <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", border: "none" }}>
            {planBAccountPicUploading ? <div>Uploading</div> : <div><img src={cover} alt="" /></div>}
          </div>
        </label>
      )}
    </div>
  );
};

export const InputDivsCheckFunctionality = ({ heading, placeholderText, setFunc, funcValue, userNameAvailable }) => {
  return (
    <div className={classNames.inputDivs} style={{ marginTop: "3rem" }}>
      <div className={classNames.heading}>{heading}</div>
      <div className={classNames.inputHolder}>
        <input className={classNames.inputFields} placeholder={placeholderText} onChange={(event) => setFunc(event.target.value)} value={funcValue ? funcValue : ""} style={{ borderRadius: "35px" }} />
        <div className={classNames.currencyDiv2} style={{ background: userNameAvailable ? "#86D5BD" : "#1f304f" }}>
          {userNameAvailable ? "Available" : "Check"}
        </div>
      </div>
      {funcValue?.length > 0 && !userNameAvailable && (
        <div style={{ fontSize: "0.8rem", zIndex: "2", width: "95%", display: "flex", justifyContent: "center", background: "rgba(241, 244, 246)", padding: "5px", borderBottomLeftRadius: "35px", borderBottomRightRadius: "35px", margin: "-16px auto" }}>
          This username is not available. Please try again.
        </div>
      )}
    </div>
  );
};

export const InputDivsCheckFunctionality1 = ({ heading, placeholderText, setFunc, funcValue, userNameAvailable }) => {
  return (
    <div className={classNames.inputDivs} style={{ marginTop: "3rem" }}>
      <div className={classNames.heading}>{heading}</div>
      <div className={classNames.inputHolder}>
        <input className={classNames.inputFields} placeholder={placeholderText} onChange={(event) => setFunc(event.target.value)} value={funcValue ? funcValue : ""} style={{ borderRadius: "35px" }} />
        <div className={classNames.currencyDiv2} style={{ background: userNameAvailable ? "#86D5BD" : "#1f304f" }}>
          {userNameAvailable ? "Available" : "Check"}
        </div>
      </div>
    </div>
  );
};

export const ImageUploadDivProfilePic = ({ setFunc, funcValue }) => {
  const { planBAccountPicUploading, setplanBAccountPicUploading, setSelectedDropDown } = useStore();
  return (
    <div className="imageUploadDiv" onClick={() => setSelectedDropDown("")} style={{ width: "120px", height: "120px", border: "0.5px solid #2c7cb2", borderRadius: "50%" }}>
      {funcValue ? (
        <div className="imageDiv" style={{ height: "100%", width: "100%", marginRight: "0" }}><img src={funcValue} alt="planBAccountPic" className="profileImg" style={{ width: "100%", height: "100%", borderRadius: "50%" }} /></div>
      ) : (
        <label htmlFor="profileUpdateImgPlanB" className="uploadFileDiv" style={{ width: "100%", height: "100%", marginBottom: "0" }}>
          <input className="uploadNewPicPlanB" type="file" onChange={(e) => uploadImageFunc(e, setFunc, setplanBAccountPicUploading)} accept="image/*" id="profileUpdateImgPlanB" />
          <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", border: "none" }}>
            {planBAccountPicUploading ? <div>Uploading...</div> : <div><img src={upload} alt="" style={{ width: "30px", height: "30px" }} /></div>}
          </div>
        </label>
      )}
    </div>
  );
};

export const ImageUploadDivCoverPic = ({ setFunc, funcValue }) => {
  const { planBAccountPicUploading, setplanBAccountPicUploading, setSelectedDropDown } = useStore();
  return (
    <div className="imageUploadDiv" onClick={() => setSelectedDropDown("")} style={{ width: "100%", height: "100%" }}>
      {funcValue ? (
        <div className="imageDiv" style={{ height: "100%", width: "100%", marginRight: "0" }}><img src={funcValue} alt="planBAccountPic" className="profileImg" style={{ width: "100%", height: "100%" }} /></div>
      ) : (
        <label htmlFor="profileUpdateImgPlanB" className="uploadFileDiv" style={{ width: "100%", height: "100%", marginBottom: "0" }}>
          <input className="uploadNewPicPlanB" type="file" onChange={(e) => uploadImageFunc(e, setFunc, setplanBAccountPicUploading)} accept="image/*" id="profileUpdateImgPlanB" />
          <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", border: "none" }}>
            {planBAccountPicUploading ? <div>Uploading...</div> : <div><img src={upload} alt="" style={{ width: "50px", height: "50px" }} /></div>}
          </div>
        </label>
      )}
    </div>
  );
};