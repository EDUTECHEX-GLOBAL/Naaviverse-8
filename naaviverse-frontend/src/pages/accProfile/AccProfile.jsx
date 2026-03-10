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
import lg1 from "../../static/images/login/lg1.svg";
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

// Icons for the new UI
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 3L21 7L7 21H3V17L17 3Z" strokeLinejoin="round"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12H22M12 2C9.5 4 8 8 8 12C8 16 9.5 20 12 22C14.5 20 16 16 16 12C16 8 14.5 4 12 2Z"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22C12 22 20 16 20 10C20 5 16 2 12 2C8 2 4 5 4 10C4 16 12 22 12 22Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <path d="M8 6H16M8 10H16M8 14H12"/>
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"/>
    <path d="M22 6L12 13L2 6"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10 13C10.6 13.8 11.3 14.5 12.2 15.1C13.1 15.7 14.1 16.1 15.2 16.3C16.3 16.5 17.4 16.5 18.5 16.2C19.6 15.9 20.6 15.4 21.5 14.7L21.7 14.5C22.6 13.7 23.2 12.7 23.6 11.6C23.9 10.5 24 9.4 23.9 8.3C23.7 7.2 23.3 6.1 22.7 5.2C22.1 4.3 21.3 3.5 20.4 2.9C19.5 2.3 18.5 1.9 17.4 1.7C16.3 1.5 15.2 1.5 14.1 1.8C13 2.1 12 2.6 11.1 3.3L10.9 3.5"/>
    <path d="M14 11C13.4 10.2 12.7 9.5 11.8 8.9C10.9 8.3 9.9 7.9 8.8 7.7C7.7 7.5 6.6 7.5 5.5 7.8C4.4 8.1 3.4 8.6 2.5 9.3L2.3 9.5C1.4 10.3 0.8 11.3 0.4 12.4C0.1 13.5 0 14.6 0.1 15.7C0.3 16.8 0.7 17.9 1.3 18.8C1.9 19.7 2.7 20.5 3.6 21.1C4.5 21.7 5.5 22.1 6.6 22.3C7.7 22.5 8.8 22.5 9.9 22.2C11 21.9 12 21.4 12.9 20.7L13.1 20.5"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"/>
    <path d="M8 12L11 15L16 9" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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
  const [accStatus, setAccStatus] = useState("");
  const [hidden, setHidden] = useState(false);
  const [hidden1, setHidden1] = useState(false);
  const [hidden2, setHidden2] = useState(false);
  const [userNameAvailable, setUserNameAvailable] = useState(false);
  const [userNameAvailable1, setUserNameAvailable1] = useState(false);
  const [changing, setChanging] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit mode states
  const [editMode, setEditMode] = useState(null);
  const [editValue, setEditValue] = useState("");

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
    "0% - 35%",
    "36% - 60%",
    "61% - 75%",
    "76% - 85%",
    "86% - 95%",
    "96% - 100%",
  ];
  const financeList = ["0-25L", "25L-75L", "75L-3CR", "3CR+", "Other"];
  const personalityList = [
    "realistic",
    "investigative",
    "artistic",
    "social",
    "enterprising",
    "conventional",
  ];

  const {
    allSteps,
    setAllSteps,
    stepsToggle,
    setStepsToggle,
    pathSteps,
    setPathSteps,
    creatingPath,
    setCreatingPath,
    mypathsMenu,
    setMypathsMenu,
    selectedSteps,
    setSelectedSteps, 
    countryApiValue
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

  //accountant profile new values
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

  //upload part starts here
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
  const [position, setPosition] = useState('')

  const allSelected = businessName && businessDesc && website &&
    businessType && businessLogo && street && city && pinCode &&
    businessState && businessCountry && firstName && lastName && position

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
        console.log("Bulk upload success:", res.data);
        alert(`Uploaded ${res.data.count} steps successfully`);
        setpstep(12);
      } else {
        console.log("Upload failed:", res.data);
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
      console.log("All paths fetched:", result);
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
    console.log("getActiveSteps called");
    setLoading(true);
    const email = userDetails?.email || localStorage.getItem("loginEmail");
    console.log("📧 Email used for step fetch:", email);
    axios
      .get(`${BASE_URL}/api/steps?path_id=selectedPathId`)
      .then((response) => {
        let result = response?.data?.data;
        console.log("Active Steps Retrieved:", result);
        setPartnerStepsData(result || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching partner steps:", error.response?.data || error.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    console.log("Updated partnerStepsData:", partnerStepsData);
  }, [partnerStepsData]);

  const handleGrade = (item) => {
    if (grade.includes(item)) {
      setGrade(grade.filter((o) => o !== item));
    } else {
      setGrade([...grade, item]);
    }
  };

  const handleGradeAvg = (item) => {
    if (gradeAvg.includes(item)) {
      setGradeAvg(gradeAvg.filter((o) => o !== item));
    } else {
      setGradeAvg([...gradeAvg, item]);
    }
  };

  const handleCurriculum = (item) => {
    if (curriculum.includes(item)) {
      setCurriculum(curriculum.filter((o) => o !== item));
    } else {
      setCurriculum([...curriculum, item]);
    }
  };

  const handleStream = (item) => {
    if (stream.includes(item)) {
      setStream(stream.filter((o) => o !== item));
    } else {
      setStream([...stream, item]);
    }
  };

  const handleFinance = (item) => {
    if (finance.includes(item)) {
      setFinance(finance.filter((o) => o !== item));
    } else {
      setFinance([...finance, item]);
    }
  };

  const handlePersonality = (item) => {
    setPersonality(item);
  };

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
        console.log(err, "jkjkk");
        setIsLoading(false);
        toast.error("Something Went Wrong!", {
          position: toast.POSITION.TOP_RIGHT,
        });
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
      .catch((err) => {
        setIsPurchaseLoading(false);
      });
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
        console.log(err, "jkjkk");
        toast.error("Something Went Wrong!", {
          position: toast.POSITION.TOP_RIGHT,
        });
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
        console.log(err, "jkjkk");
        setIsCurrencies(false);
        toast.error("Something Went Wrong!", {
          position: toast.POSITION.TOP_RIGHT,
        });
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
    console.trace("🚨 LOGIN REDIRECT TRIGGERED FROM HERE");
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

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const uploadedUrl = await uploadImageFunc(e, setImage, setLoading);
    if (uploadedUrl) {
      setImage(uploadedUrl);
    }
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

  const myTimeoutService = () => {
    setTimeout(reloadService, 3000);
  };

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
          price:
            billingType === "One Time"
              ? firstMonthPrice !== ""
                ? parseFloat(firstMonthPrice)
                : 0
              : monthlyPrice !== ""
                ? parseFloat(monthlyPrice)
                : 0,
          coin: selectedCurrency.coinSymbol,
        },
      },
      grace_period:
        billingType === "One Time"
          ? 0
          : gracePeriod !== ""
            ? parseFloat(gracePeriod)
            : 0,
      first_retry:
        billingType === "One Time"
          ? 0
          : secondChargeAttempt !== ""
            ? parseFloat(secondChargeAttempt)
            : 0,
      second_retry:
        billingType === "One Time"
          ? 0
          : thirdChargeAttempt !== ""
            ? parseFloat(thirdChargeAttempt)
            : 0,
      staking_allowed: false,
      staking_details: {},
    };

    let objone = {
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
        lifetime: {
          price:
            billingType === "One Time"
              ? firstMonthPrice !== ""
                ? parseFloat(firstMonthPrice)
                : 0
              : monthlyPrice !== ""
                ? parseFloat(monthlyPrice)
                : 0,
          coin: selectedCurrency.coinSymbol,
        },
      },
      grace_period:
        billingType === "One Time"
          ? 0
          : gracePeriod !== ""
            ? parseFloat(gracePeriod)
            : 0,
      first_retry:
        billingType === "One Time"
          ? 0
          : secondChargeAttempt !== ""
            ? parseFloat(secondChargeAttempt)
            : 0,
      second_retry:
        billingType === "One Time"
          ? 0
          : thirdChargeAttempt !== ""
            ? parseFloat(thirdChargeAttempt)
            : 0,
      staking_allowed: false,
      staking_details: {},
    };

    let obj = billingType === "One Time" ? objone : objmonthly;
    CreatePopularService(obj)
      .then((res) => {
        let result = res.data;
        if (result.status) {
          myTimeoutService();
          setpstep(7);
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
          setfirstMonthPrice("");
          setmonthlyPrice("");
          setgracePeriod("");
          setsecondChargeAttempt("");
          setthirdChargeAttempt("");
          setIsSubmit(false);
          setImage(null);
        }
      })
      .catch((err) => {
        setIsSubmit(false);
      });
  };

  useEffect(() => {
    setaccsideNav("");
    resetpop();
    handleAccountantData();
  }, []);

  const myTimeout1 = () => {
    setTimeout(reload1, 3000);
  };

  function reload1() {
    setCreateBrandProfile(false);
    setCreateBrandProfileStep(1);
    setProfilePicture("");
    setFirstName("");
    setLastName("");
    setUserName("");
    setCoverPhoto1("");
    setBrandDisplayName("");
    setBrandUserName("");
    setBrandDescription("");
    setBrandColorCode("");
    setHeadquarter("");
    setBrandAddress("");
    setWhiteProPic("");
    handleAccountantData();
  }

  const handleAccountantData = () => {
    let mailId = userDetails?.email;
    CheckStatusAccountant(mailId)
      .then((res) => {
        console.log("🔍 CheckStatusAccountant response:", res);
        console.log("🔍 res.success:", res.success);
        console.log("🔍 res.data:", res.data);
        
        if (res.success && res.data && res.data.businessName) {
          setIsProfileData(true);
          setProfileData(res.data);
          setprofileSpecalities(res.data.specialities || []);
          setCreateBrandProfile(false);
          setAccStatus(res.data.isPublic ? "Public" : "Private");
          // Save profile info so sidebar can display the correct name
          const existing = JSON.parse(localStorage.getItem("partner") || "{}");
          localStorage.setItem("partner", JSON.stringify({
            ...existing,
            firstName: res.data.firstName || existing.firstName,
            lastName: res.data.lastName || existing.lastName,
            businessName: res.data.businessName || existing.businessName,
          }));
        } else {
          console.log("No profile found, opening create profile form");
          setIsProfileData(false);
          setProfileData({});
          setCreateBrandProfile(true);
        }
      })
      .catch((err) => {
        console.log("Error fetching profile data:", err);
        setIsProfileData(false);
        setProfileData({});
        setCreateBrandProfile(true);
      });
  };

  const createPartnerProfile = () => {
    let email = userDetails?.email;
    if (!email) return;

    console.log({
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
    }, "Creating Partner Profile");

    console.log("allSelected check:", {
      businessName,
      businessDesc,
      website,
      businessType,
      businessLogo,
      street,
      city,
      pinCode,
      businessState,
      businessCountry,
      firstName,
      lastName,
      position
    });
    
    axios.put(`${BASE_URL}/api/partner/add`, {
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
      yourPosition: position
    })
      .then(({ data }) => {
        if (data.success) {
          handleAccountantData();
          window.location.reload();
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
          bankerTag: brandUserName,
          colorCode: brandColorCode,
          address: brandAddress,
          coverPicURL: coverPhoto1,
          displayName: brandDisplayName,
          description: brandDescription,
          partneringInstitutions: [],
          country: headquarter,
          profilePicURL: profilePicture,
          profilePicPNG: profilePicture,
          profilePicWhite: whiteProPic,
          profilePicWhitePNG: whiteProPic,
          autoDeposit: false,
          sefcoin_cashback: false,
          other_data: {},
        },
        { headers: { email, token } }
      )
      .then((response) => {
        let result = response?.data;
        setIsloading(false);
        setCreateBrandProfileStep(3);
      })
      .catch((error) => {
        console.log(error, "error in createBankerProfile");
      });
  };

  const changeStatus = (value) => {
    setChanging(true);
    let email = userDetails?.email;
    
    axios
      .post(
        `${BASE_URL}/banker/assignCategory`,
        {
          categoryName: value === "Public" ? "education consultants" : "marketmakers",
          email,
        },
        { headers: { email, token: userDetails?.idToken } }
      )
      .then((response) => {
        let result = response?.data;
        if (result?.status) {
          setAccStatus(value);
          setChanging(false);
        } else {
          setChanging(false);
        }
      })
      .catch((error) => {
        console.log(error, "error in changeStatus");
        setChanging(false);
      });
  };

  const myTimeout = () => {
    setTimeout(reload, 2000);
  };

  function reload() {
    if (editAddress) {
      setEditAddress(false);
      setNewAddress("");
    } else if (editDisplayName) {
      setEditDisplayName(false);
      setNewDisplayName("");
    } else if (editDescription) {
      setEditDescription(false);
      setNewDescription("");
    } else if (editPhoneNo) {
      setEditPhoneNo(false);
      setNewPhoneNo("");
    } else if (editColorCode) {
      setEditColorCode(false);
      setNewColorCode("");
    } else if (editCountry) {
      setEditCountry(false);
      setNewCountry("");
    } else if (editCoverPic) {
      setEditCoverPic(false);
      setNewCoverPic("");
    } else if (editProfilePic) {
      setEditProfilePic(false);
      setNewProfilePic("");
    }
    handleAccountantData();
  }

  const editData = async (field, value) => {
    setLoading(true);

    let body = {
      [field]: value,
    };

    let email = userDetails?.email;
    let token = userDetails?.idToken;

    try {
      let result = await axios.put(
        `${BASE_URL}/lxUser/update/banker`,
        body,
        {
          headers: { token, email },
        }
      );
      if (result?.data?.status) {
        myTimeout();
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log(error, "error in editData");
    }
  };

  const handleChangeAccDashsidebar = () => {
    if (showDrop) {
      setShowDrop(false);
    }
    navigate("/dashboard/accountants");
  };

  useEffect(() => {
    let email = userDetails?.email;
    axios
      .get(`${BASE_URL}/steps/get?email=${email}`)
      .then((response) => {
        let result = response?.data?.data;
        setAllSteps(result);
      })
      .catch((error) => {
        console.log(error, "error in fetching all steps accprofile");
      });
  }, []);

  const pathSubmission = () => {
    setCreatingPath(true);
    axios
      .post(`${BASE_URL}/api/paths/add`, {
        ...pathSteps,
        performance: gradeAvg,
        curriculum: curriculum,
        grade: grade,
        stream: stream,
        financialSituation: finance,
        personality: personality,
        the_ids: pathSteps.the_ids.map(step => ({
          step_id: step.step_id,
          stepName: step.stepName,
          stepDescription: step.stepDescription,
          backup_pathId: step.backup_pathId,
          backupPathName: step.backupPathName,
          backupPathDescription: step.backupPathDescription
        })),
      })
      .then((response) => {
        let result = response?.data;
        if (result?.status) {
          setCreatingPath(false);
          window.location.reload();
        } else {
          setCreatingPath(false);
        }
      })
      .catch((error) => {
        console.log(error, "error in pathSubmission");
      });
  };

  const removeStep = (stepId) => {
    const updatedSelectedSteps = selectedSteps.filter(
      (step) => step._id !== stepId
    );
    setSelectedSteps(updatedSelectedSteps);
    const updatedTheIds = pathSteps?.the_ids?.filter(
      (obj) => obj.step_id !== stepId
    );
    setPathSteps({
      ...pathSteps,
      the_ids: updatedTheIds,
    });
  };

  const handleEdit = (field, currentValue) => {
    setEditMode(field);
    setEditValue(currentValue || "");
  };

  const saveEdit = () => {
    if (!editValue.trim()) {
      setEditMode(null);
      return;
    }
    editData(editMode, editValue);
    setEditMode(null);
  };

  // Profile Card Component
  const ProfileCard = ({ icon: Icon, label, value, field }) => (
    <div className="profile-card-item">
      <div className="profile-card-icon">
        <Icon />
      </div>
      <div className="profile-card-content">
        <div className="profile-card-label">{label}</div>
        {editMode === field ? (
          <div className="profile-card-edit">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              autoFocus
              className="profile-edit-input"
              onBlur={saveEdit}
              onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
            />
          </div>
        ) : (
          <div className="profile-card-value">
            {value || "—"}
            <button className="profile-edit-btn" onClick={() => handleEdit(field, value)}>
              <EditIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ overflow: "hidden" }}>
      <div className="dashboard-main">
        <div className="dashboard-body">
          <div>
            <AccDashsidebar
              handleChangeAccDashsidebar={handleChangeAccDashsidebar}
            />
          </div>
          <div className="dashboard-screens" onClick={() => resetpop()} style={{ background: "#F8FAFC" }}>
            <div style={{ height: "100%" }}>
              <MenuNav
                showDrop={showDrop}
                setShowDrop={setShowDrop}
                searchPlaceholder="Search..."
              />
              <>
                {isProfileData ? (
                  <div className="profile-modern-container" style={{ maxWidth: "100%", width: "100%", padding: "0 24px", boxSizing: "border-box" }}>

                    {/* ── PROFILE HEADER ── */}
                    <div style={{ position: "relative", marginBottom: "0" }}>
                      {/* Cover Banner */}
                      <div style={{
                        height: "160px",
                        background: "linear-gradient(135deg, #1a4a2e 0%, #2d6a4f 60%, #3d8b6f 100%)",
                        borderRadius: "16px",
                        width: "100%",
                      }} />
                      {/* Avatar overlapping cover */}
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
                            e.target.parentNode.style.background = "linear-gradient(135deg, #1a4a2e, #2d6a4f)";
                            e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:700">${(profileData?.businessName || "P").charAt(0).toUpperCase()}</div>`;
                          }}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditProfilePic(true); }}
                          style={{
                            position: "absolute", bottom: 0, right: 0,
                            width: "24px", height: "24px",
                            background: "#182542", border: "none", borderRadius: "6px 0 0 0",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: "#fff",
                          }}
                        >
                          <EditIcon />
                        </button>
                      </div>
                    </div>

                    {/* Name + badge row — all inline next to avatar */}
                    <div style={{
                      paddingLeft: "140px", paddingRight: "24px",
                      paddingTop: "10px", paddingBottom: "20px",
                      display: "flex", alignItems: "center",
                      gap: "16px", flexWrap: "wrap",
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
                    {/* ── END PROFILE HEADER ── */}

                    {/* Single unified profile details card */}
                    <div style={{
                      background: "#fff",
                      borderRadius: "16px",
                      border: "1px solid #eef0f3",
                      boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                      margin: "0 0 24px 0",
                      overflow: "hidden",
                    }}>
                      {/* Row of fields — horizontal layout */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        borderBottom: "1px solid #f0f2f5",
                      }}>
                        {[
                          { label: "Business Name", value: profileData?.businessName },
                          { label: "Business Type", value: profileData?.type },
                          { label: "Website", value: profileData?.website },
                          { label: "Email", value: userDetails?.email },
                        ].map((item, i, arr) => (
                          <div key={item.label} style={{
                            padding: "18px 20px",
                            borderRight: i < arr.length - 1 ? "1px solid #f0f2f5" : "none",
                          }}>
                            <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                              {item.label}
                            </div>
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "#1a1f36", wordBreak: "break-all" }}>
                              {item.value || "—"}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Second row */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        borderBottom: "1px solid #f0f2f5",
                      }}>
                        {[
                          { label: "First Name", value: profileData?.firstName },
                          { label: "Last Name", value: profileData?.lastName },
                          { label: "Position", value: profileData?.yourPosition },
                          { label: "Country", value: profileData?.country },
                        ].map((item, i, arr) => (
                          <div key={item.label} style={{
                            padding: "18px 20px",
                            borderRight: i < arr.length - 1 ? "1px solid #f0f2f5" : "none",
                          }}>
                            <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                              {item.label}
                            </div>
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "#1a1f36" }}>
                              {item.value || "—"}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Third row — Description + Address */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                      }}>
                        <div style={{ padding: "18px 20px", borderRight: "1px solid #f0f2f5" }}>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                            Description
                          </div>
                          <span style={{ fontSize: "14px", color: "#1a1f36", lineHeight: "1.6" }}>
                            {profileData?.description || "—"}
                          </span>
                        </div>
                        <div style={{ padding: "18px 20px" }}>
                          <div style={{ fontSize: "11px", fontWeight: "600", color: "#9aa0ac", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                            Address
                          </div>
                          <div style={{ fontSize: "14px", color: "#1a1f36", lineHeight: "1.7" }}>
                            <div>{profileData?.street || "—"}</div>
                            <div>{[profileData?.city, profileData?.state].filter(Boolean).join(", ")}</div>
                            <div>{[profileData?.country, profileData?.pincode].filter(Boolean).join(" ")}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* end profile card */}
                  </div>
                ) : (
                  <div className="create-profile-prompt">
                    <div className="prompt-card">
                      <h2>Create Your Partner Profile</h2>
                      <p>Get started by setting up your business profile on Naavi</p>
                      <button 
                        className="prompt-btn"
                        onClick={() => setCreateBrandProfile(true)}
                      >
                        Create Profile
                      </button>
                    </div>
                  </div>
                )}
              </>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Actions Modal */}
      {ispopular && (
        <div
          className="acc-popular"
          onClick={() => setShowDrop(false)}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="acc-popular-top">
            <div className="acc-popular-head">
              {pstep === 8
                ? "New Path"
                : pstep > 1 && pstep < 8
                  ? "New Service"
                  : "Popular Actions"}
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
                <div className="acc-step-text">New</div>
                <div>
                  <div
                    className="acc-step-box"
                    onClick={() => {
                      setselectNew("Service");
                      setpstep(2);
                    }}
                    style={{
                      background: selectNew === "Service" ? "#182542" : "",
                      color: selectNew === "Service" ? "#FFF" : "",
                    }}
                  >
                    Service
                  </div>

                  <div
                    className="acc-step-box"
                    onClick={() => {
                      setselectNew("Path");
                      setispopular(false);
                      navigate('/dashboard/accountants', { 
                        state: { openCreatePath: true } 
                      });
                    }}
                    style={{
                      background: selectNew === "Path" ? "#182542" : "",
                      color: selectNew === "Path" ? "#FFF" : "",
                    }}
                  >
                    Path
                  </div>

                  <div
                    className="acc-step-box"
                    onClick={() => {
                      setselectNew("Step");
                      setpstep(9);
                    }}
                    style={{
                      background: selectNew === "Step" ? "#182542" : "",
                      color: selectNew === "Step" ? "#FFF" : "",
                    }}
                  >
                    Step
                  </div>
                  <div
                    className="acc-step-box"
                    onClick={() => {
                      setselectNew("Step");
                      setpstep(10);
                    }}
                    style={{
                      background: selectNew === "Step" ? "#182542" : "",
                      color: selectNew === "Step" ? "#FFF" : "",
                    }}
                  >
                    Bulk Path
                  </div>
                  <div
                    className="acc-step-box"
                    onClick={() => {
                      setselectNew("Step");
                      setpstep(11);
                    }}
                    style={{
                      background: selectNew === "Step" ? "#182542" : "",
                      color: selectNew === "Step" ? "#FFF" : "",
                    }}
                  >
                    Bulk Step
                  </div>
                </div>
              </div>
            ) : pstep === 2 ? (
              <div>
                <div className="acc-step-text">Select Billing Type</div>
                <div>
                  <div
                    className="acc-step-box"
                    onClick={() => {
                      setbillingType("Monthly Subscription");
                      handleCategories();
                      setpstep(3);
                    }}
                    style={{
                      background: billingType === "Monthly Subscription" ? "#182542" : "",
                      color: billingType === "Monthly Subscription" ? "#FFF" : "",
                    }}
                  >
                    Monthly Subscription
                  </div>
                  <div
                    className="acc-step-box"
                    onClick={() => {
                      setbillingType("One Time");
                      handleCategories();
                      setpstep(3);
                    }}
                    style={{
                      background: billingType === "One Time" ? "#182542" : "",
                      color: billingType === "One Time" ? "#FFF" : "",
                    }}
                  >
                    One Time
                  </div>
                  <div
                    className="acc-step-box"
                    style={{
                      opacity: "0.4",
                      cursor: "not-allowed",
                      background: billingType === "Staking" ? "#182542" : "",
                      color: billingType === "Staking" ? "#FFF" : "",
                    }}
                  >
                    Staking
                  </div>
                </div>
                <div className="goBack" onClick={() => { setpstep(1); setbillingType(""); }}>
                  Go Back
                </div>
              </div>
            ) : pstep === 3 ? (
              <div>
                <div className="acc-step-text">How would you categorize this product?</div>
                <>
                  {isCatoading ? (
                    <div className="acc-step-allbox">
                      {[1, 2, 3].map((each, i) => (
                        <div className="acc-step-box" key={i}>
                          <Skeleton style={{ width: "150px" }} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="acc-step-allbox">
                      {categoriesData.map((each, i) => (
                        <div
                          className="acc-step-box"
                          key={i}
                          onClick={() => {
                            setselectCategory(each.name);
                            setpstep(4);
                          }}
                          style={{
                            background: selectCategory === each.name ? "#182542" : "",
                            color: selectCategory === each.name ? "#FFF" : "",
                          }}
                        >
                          {each.name}
                        </div>
                      ))}
                    </div>
                  )}
                </>
                <div className="goBack" onClick={() => { setpstep(2); setselectCategory(""); }}>
                  Go Back
                </div>
              </div>
            ) : pstep === 4 ? (
              <div>
                <div className="acc-step-text">Service Information</div>
                <div className="acc-step-allbox1">
                  <div className="acc-upload">
                    <div className="acc-upload-title">Upload Profile Image</div>
                    <div className="acc-upload-imgbox">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        style={{ display: "none" }}
                        ref={fileInputRef}
                      />
                      <img
                        className="acc-upload-img"
                        src={isUploadLoading ? upgif : image ? image : uploadv}
                        alt=""
                        onClick={handleImageClick}
                      />
                    </div>
                  </div>
                  <div className="acc-step-box">
                    <input
                      className="acc-step-input"
                      type="text"
                      placeholder="Service Name"
                      value={serviceNameInput}
                      onChange={(e) => setServiceNameInput(e.target.value)}
                    />
                  </div>
                  <div className="acc-step-box">
                    <input
                      className="acc-step-input"
                      type="text"
                      placeholder="Service Code"
                      value={serviceCodeInput}
                      onChange={(e) => setServiceCodeInput(e.target.value)}
                    />
                  </div>
                  <div className="acc-step-box">
                    <input
                      className="acc-step-input"
                      type="text"
                      placeholder="Product Label"
                      value={productLabel}
                      onChange={(e) => setProductLabel(e.target.value)}
                    />
                  </div>
                  <div className="acc-step-box">
                    <input
                      className="acc-step-input"
                      type="text"
                      placeholder="Service Tagline"
                      value={serviceTagline}
                      onChange={(e) => setServiceTagline(e.target.value)}
                    />
                  </div>
                  <div className="acc-step-box1">
                    <textarea
                      className="acc-step-input1"
                      placeholder="Service Description"
                      value={serviceDescription}
                      onChange={(e) => setServiceDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="goNext" onClick={() => { handleGetCurrencies(); setpstep(5); }}>
                      Next Step
                    </div>
                    <div className="goBack1" onClick={() => { setpstep(3); setServiceNameInput(""); setServiceCodeInput(""); setProductLabel(""); setServiceTagline(""); setServiceDescription(""); setCoverImageS3url(""); setImage(null); }}>
                      Go Back
                    </div>
                  </div>
                </div>
              </div>
            ) : pstep === 5 ? (
              <div style={{ height: "calc(100% - 3rem)" }}>
                <div className="acc-step-text">What currency do you want to collect?</div>
                <div style={{ width: "100%", height: "3.5rem", border: "1px solid #e5e5e5", borderRadius: "10px", padding: "0 25px", marginBottom: "1rem", marginTop: "1rem" }}>
                  <input
                    type="text"
                    placeholder="Search Currency..."
                    style={{ width: "100%", height: "100%", border: "none", fontSize: "1rem", fontWeight: "500" }}
                    onChange={(e) => setSearchCurrency(e.target.value)}
                    value={searchCurrency}
                  />
                </div>
                <>
                  {isCurrencies ? (
                    <div className="acc-step-allbox" style={{ height: "calc(100% - 76px - 7.5rem)" }}>
                      {[1, 2, 3].map((each, i) => (
                        <div className="acc-step-box" key={i}>
                          <Skeleton style={{ width: "150px" }} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="acc-step-allbox" style={{ height: "calc(100% - 76px - 7.5rem)" }}>
                      {allCurrencies
                        ?.filter(
                          (entry) =>
                            entry?.coinName?.toLowerCase()?.includes(searchCurrency?.toLowerCase()) ||
                            entry?.coinSymbol?.toLowerCase()?.includes(searchCurrency?.toLowerCase())
                        )
                        .map((each, i) => (
                          <div
                            className="acc-step-box"
                            key={i}
                            onClick={() => { setSelectedCurrency(each); setpstep(6); setSearchCurrency(""); }}
                            style={{ background: selectedCurrency === each ? "#182542" : "", color: selectedCurrency === each ? "#FFF" : "" }}
                          >
                            {each.coinName}
                          </div>
                        ))}
                    </div>
                  )}
                </>
                <div className="goBack" onClick={() => { setpstep(4); setSelectedCurrency({}); setSearchCurrency(""); }}>
                  Go Back
                </div>
              </div>
            ) : pstep === 6 ? (
              <div>
                <div className="acc-step-text">Pricing Information</div>
                <div className="acc-step-allbox1">
                  <div className="acc-step-box">
                    <input
                      className="acc-step-input2"
                      type="number"
                      placeholder={billingType === "One Time" ? "Service Price" : "First Months Price"}
                      value={firstMonthPrice}
                      onChange={(e) => setfirstMonthPrice(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                    />
                    <div className="acc-step-feildHead">{selectedCurrency.coinSymbol}</div>
                  </div>
                  <div className="acc-step-box" style={{ display: billingType === "One Time" ? "none" : "" }}>
                    <input
                      className="acc-step-input2"
                      type="number"
                      placeholder="Monthly Price"
                      value={monthlyPrice}
                      onChange={(e) => setmonthlyPrice(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                    />
                    <div className="acc-step-feildHead">{selectedCurrency.coinSymbol}</div>
                  </div>
                  <div className="acc-step-box" style={{ display: billingType === "One Time" ? "none" : "" }}>
                    <input
                      className="acc-step-input2"
                      type="number"
                      placeholder="Grace Period"
                      value={gracePeriod}
                      onChange={(e) => setgracePeriod(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                    />
                    <div className="acc-step-feildHead">Days</div>
                  </div>
                  <div className="acc-step-box" style={{ display: billingType === "One Time" ? "none" : "" }}>
                    <input
                      className="acc-step-input2"
                      type="number"
                      placeholder="Second Charge Attempt"
                      value={secondChargeAttempt}
                      onChange={(e) => setsecondChargeAttempt(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                    />
                    <div className="acc-step-feildHead">Days</div>
                  </div>
                  <div className="acc-step-box" style={{ display: billingType === "One Time" ? "none" : "" }}>
                    <input
                      className="acc-step-input2"
                      type="number"
                      placeholder="Third Charge Attempt"
                      value={thirdChargeAttempt}
                      onChange={(e) => setthirdChargeAttempt(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                    />
                    <div className="acc-step-feildHead">Days</div>
                  </div>
                  <div>
                    <div style={{ position: billingType === "One Time" ? "fixed" : "initial", bottom: billingType === "One Time" ? "0px" : "" }}>
                      <div className="goNext" onClick={handleFinalSubmit}>Submit</div>
                      <div className="goBack1" onClick={() => { setpstep(5); setfirstMonthPrice(""); setmonthlyPrice(""); setgracePeriod(""); setsecondChargeAttempt(""); setthirdChargeAttempt(""); }}>
                        Go Back
                      </div>
                    </div>
                  </div>
                </div>
                <div>{isSubmit ? <div className="popularlogo"><img className="popularlogoimg" src={lg1} alt="" /></div> : ""}</div>
              </div>
            ) : pstep === 7 ? (
              <div className="success-box">You Have Successfully Created A New Service</div>
            ) : pstep === 9 ? (
              <NewStep1 setpstep={setpstep} />
            ) : pstep === 10 ? (
              <div>
                <div className="acc-step-text">Bulk Path Action</div>
                <div>
                  <div className="acc-step-box" style={{ background: billingType === "Download" ? "#182542" : "", color: billingType === "Download" ? "#FFF" : "" }}>
                    Download
                  </div>
                  <div className="acc-step-box" onClick={handleImageClick} style={{ background: billingType === "Upload" ? "#182542" : "", color: billingType === "Upload" ? "#FFF" : "" }}>
                    Upload
                    <input type="file" onChange={handleFileInputChange1} style={{ display: "none" }} ref={fileInputRef} />
                  </div>
                </div>
                <div className="goBack" onClick={() => setpstep(1)}>Go Back</div>
              </div>
            ) : pstep === 11 ? (
              <div>
                <div className="acc-step-text">Bulk Step Action</div>
                <div>
                  <div className="acc-step-box" style={{ background: billingType === "Download" ? "#182542" : "", color: billingType === "Download" ? "#FFF" : "" }}>
                    Download
                  </div>
                  <div className="acc-step-box" onClick={handleImageClick} style={{ background: billingType === "Upload" ? "#182542" : "", color: billingType === "Upload" ? "#FFF" : "" }}>
                    Upload
                    <input type="file" onChange={handleFileInputChange2} style={{ display: "none" }} ref={fileInputRef} />
                  </div>
                </div>
                <div className="goBack" onClick={() => setpstep(1)}>Go Back</div>
              </div>
            ) : pstep === 12 ? (
              <div>
                <div className="acc-step-text">Uploaded Successfully</div>
                <div className="goBack" onClick={() => { setpstep(1); setbillingType(""); }}>Go Back</div>
              </div>
            ) : (
              ""
            )}
          </>
        </div>
      )}

      {/* Create Brand Profile Modal */}
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
              <div className="overall-div" style={{ height: "calc(100% - 4rem)" }}>
                <div className={styles.labelClass}>Business information *</div>
                <InputDivsCreatePartner
                  placeholderText="Business name...."
                  setFunc={setBusinessName}
                  funcValue={businessName}
                />
                <InputDivsTextAreaPartner
                  placeholderText="Business description...."
                  setFunc={setBusinessDesc}
                  funcValue={businessDesc}
                />
                <InputDivsCreatePartner
                  placeholderText="Website...."
                  setFunc={setWebsite}
                  funcValue={website}
                />
                <InputDivsCreatePartner
                  placeholderText="Type of business...."
                  setFunc={setBusinessType}
                  funcValue={businessType}
                />
                <div className={styles.imgContainer}>
                  <ImageUploadDivProfilePic
                    setFunc={setBusinessLogo}
                    funcValue={businessLogo}
                  />
                  <div className={styles.logoText}>Upload Logo *</div>
                </div>
                <div className={styles.labelClass} style={{ paddingTop: "30px" }}>Business address *</div>
                <InputDivsCreatePartner
                  placeholderText="street...."
                  setFunc={setStreet}
                  funcValue={street}
                />
                <InputDivsCreatePartner
                  placeholderText="city...."
                  setFunc={setCity}
                  funcValue={city}
                />
                <InputDivsCreatePartner
                  placeholderText="pincode...."
                  setFunc={setPinCode}
                  funcValue={pinCode}
                />
                <InputDivsCreatePartner
                  placeholderText="state...."
                  setFunc={setBusinessState}
                  funcValue={businessState}
                />

                <div className={styles.inputDivs} style={{ border: '1px solid #2c7cb2', borderRadius: '4px', fontSize: "13px", fontWeight: "500", paddingLeft: '0px', marginTop: '0px' }}>
                  <select name="country" id="country" style={{ border: "none", padding: '1rem', width: '90%', fontSize: "16px" }} onChange={(e) => setBusinessCountry(e.target.value)}>
                    <option value="">Click to Select</option>
                    {countryApiValue?.map((item) => (
                      <option key={item.cca2} value={item?.name?.common}>{item?.name?.common}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.labelClass} style={{ paddingTop: "30px" }}>Your information *</div>
                <InputDivsCreatePartner
                  placeholderText="First name...."
                  setFunc={setFirstName}
                  funcValue={firstName}
                />
                <InputDivsCreatePartner
                  placeholderText="Last name...."
                  setFunc={setLastName}
                  funcValue={lastName}
                />
                <InputDivsCreatePartner
                  placeholderText="Your position......."
                  setFunc={setPosition}
                  funcValue={position}
                />
                <div className={styles.submitBtn} style={{ opacity: allSelected ? 1 : 0.4 }} onClick={e => allSelected && createPartnerProfile()}>Become a partner</div>
              </div>
            </>
          )}

          {createBrandProfileStep === 2 && (
            <>
              <div className="head-txt" style={{ padding: "0 3rem", height: "4rem" }}>
                <div>Step 2</div>
                <div onClick={() => { setCreateBrandProfile(false); setCreateBrandProfileStep(1); setWhiteProPic(""); setBrandAddress(""); setHeadquarter(""); setBrandColorCode(""); setBrandDescription(""); setBrandUserName(""); setBrandDisplayName(""); setUserName(""); setLastName(""); setFirstName(""); setProfilePicture(""); }} className="close-div">
                  <img src={close} alt="" />
                </div>
              </div>
              <div className="overall-div" style={{ height: "calc(100% - 4rem)" }}>
                <div className="coverPic-container">
                  <div className="coverPicDiv">
                    <ImageUploadDivCoverPic1 setFunc={setCoverPhoto1} funcValue={coverPhoto1} />
                  </div>
                  <div className="logoDiv">
                    <img src={profilePicture} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", border: "none" }} />
                  </div>
                </div>
                <div className="inputs-container">
                  <InputDivsWithMT
                    heading="Display Name *"
                    placeholderText="Display Name.."
                    setFunc={setBrandDisplayName}
                    funcValue={brandDisplayName}
                  />
                  <InputDivsCheckFunctionality
                    heading="Naavi Username *"
                    placeholderText="Username.."
                    setFunc={setBrandUserName}
                    funcValue={brandUserName}
                    userNameAvailable={userNameAvailable1}
                  />
                  <InputDivsTextArea1
                    heading="Naavi Bio *"
                    placeholderText="Bio..."
                    setFunc={setBrandDescription}
                    funcValue={brandDescription}
                  />
                  <InputDivsWithColorCode
                    heading="Colour Code *"
                    placeholderText="#000000"
                    setFunc={setBrandColorCode}
                    funcValue={brandColorCode}
                    colorCode={brandColorCode}
                  />

                  <div style={{ paddingTop: '30px' }}>Select Country *</div>
                  <div className={styles.inputDivs} style={{ border: '1px solid #e7e7e7', borderRadius: '30px', fontSize: "13px", fontWeight: "500", paddingLeft: '10px' }}>
                    <select name="country" id="country" style={{ border: "none", padding: '1rem', width: '90%', fontSize: "16px" }} onChange={(e) => setHeadquarter(e.target.value)}>
                      <option value="">Click to Select</option>
                      {countryApiValue?.map((item) => (
                        <option key={item.cca2} value={item?.name?.common}>{item?.name?.common}</option>
                      ))}
                    </select>
                  </div>
                  <InputDivsWithMT
                    heading="What is your office address? *"
                    placeholderText="Enter address..."
                    setFunc={setBrandAddress}
                    funcValue={brandAddress}
                  />
                  <div style={{ marginTop: "3rem", marginBottom: "0.5rem", fontSize: "1.1rem" }}>
                    Upload white profile picture *
                  </div>
                  <ImageUploadProfilePic2 setFunc={setWhiteProPic} funcValue={whiteProPic} />
                  <div className="stepBtns" style={{ marginTop: "3.5rem" }}>
                    <div style={{ cursor: "pointer", background: "#1F304F", width: "48%" }} onClick={() => { setWhiteProPic(""); setBrandAddress(""); setHeadquarter(""); setBrandColorCode(""); setBrandDescription(""); setBrandUserName(""); setBrandDisplayName(""); setCoverPhoto1(""); setCreateBrandProfileStep(1); }}>
                      Go Back
                    </div>
                    <div
                      style={{
                        opacity: coverPhoto1 && whiteProPic && brandAddress && headquarter && brandColorCode && brandDescription && brandUserName.length > 0 && brandDisplayName && userNameAvailable1 ? "1" : "0.25",
                        cursor: coverPhoto1 && whiteProPic && brandAddress && headquarter && brandColorCode && brandDescription && brandUserName.length > 0 && brandDisplayName && userNameAvailable1 ? "pointer" : "not-allowed",
                        background: "#59A2DD",
                        width: "48%",
                      }}
                      onClick={() => {
                        if (coverPhoto1 && whiteProPic && brandAddress && headquarter && brandColorCode && brandDescription && brandUserName.length > 0 && brandDisplayName && userNameAvailable1) {
                          createBankerProfile();
                        }
                      }}
                    >
                      Complete
                    </div>
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

      {/* Edit Modals */}
      {editCountry && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Country</div>
            <div onClick={() => { setEditCountry(false); setNewCountry(""); }} className="close-div">
              <img src={close} alt="" />
            </div>
          </div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1">
              <div>{profileData?.country}</div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div className="each-action1">
              <select name="country" id="country" style={{ border: "none", padding: '1.5rem', width: '90%', fontSize: "16px" }} onChange={(e) => setNewCountry(e.target.value)}>
                {countryApiValue?.map((item) => (
                  <option key={item.cca2} value={item?.name?.common}>{item?.name?.common}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div style={{ opacity: newCountry ? "1" : "0.25", cursor: newCountry ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newCountry) { editData("country", newCountry); } }}>
              Submit Edit
            </div>
          </div>
          {loading && (
            <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}>
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {editAddress && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Address</div>
            <div onClick={() => { setEditAddress(false); setNewAddress(""); }} className="close-div">
              <img src={close} alt="" />
            </div>
          </div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1">
              <div>{profileData?.address}</div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div className="each-action1">
              <input type="text" placeholder="New Address.." onChange={(e) => setNewAddress(e.target.value)} />
            </div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div style={{ opacity: newAddress ? "1" : "0.25", cursor: newAddress ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newAddress) { editData("address", newAddress); } }}>
              Submit Edit
            </div>
          </div>
          {loading && (
            <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}>
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {editDisplayName && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Display Name</div>
            <div onClick={() => { setEditDisplayName(false); setNewDisplayName(""); }} className="close-div">
              <img src={close} alt="" />
            </div>
          </div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1">
              <div>{profileData?.displayName}</div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div className="each-action1">
              <input type="text" placeholder="New Display Name.." onChange={(e) => setNewDisplayName(e.target.value)} />
            </div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div style={{ opacity: newDisplayName ? "1" : "0.25", cursor: newDisplayName ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newDisplayName) { editData("displayName", newDisplayName); } }}>
              Submit Edit
            </div>
          </div>
          {loading && (
            <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}>
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {editPhoneNo && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Phone Number</div>
            <div onClick={() => { setEditPhoneNo(false); setNewPhoneNo(""); }} className="close-div">
              <img src={close} alt="" />
            </div>
          </div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1">
              <div>{profileData?.phone}</div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div className="each-action1">
              <input type="number" placeholder="New Phone Number.." onChange={(e) => setNewPhoneNo(e.target.value)} />
            </div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div style={{ opacity: newPhoneNo ? "1" : "0.25", cursor: newPhoneNo ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newPhoneNo) { editData("phone", newPhoneNo); } }}>
              Submit Edit
            </div>
          </div>
          {loading && (
            <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}>
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {editDescription && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Description</div>
            <div onClick={() => { setEditDescription(false); setNewDescription(""); }} className="close-div">
              <img src={close} alt="" />
            </div>
          </div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1">
              <div>{profileData?.description}</div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div className="each-action1">
              <input type="text" placeholder="New Description.." onChange={(e) => setNewDescription(e.target.value)} />
            </div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div style={{ opacity: newDescription ? "1" : "0.25", cursor: newDescription ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newDescription) { editData("description", newDescription); } }}>
              Submit Edit
            </div>
          </div>
          {loading && (
            <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}>
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {editColorCode && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Colour Code</div>
            <div onClick={() => { setEditColorCode(false); setNewColorCode(""); }} className="close-div">
              <img src={close} alt="" />
            </div>
          </div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1" style={{ position: "relative" }}>
              <div>{profileData?.colorCode}</div>
              <div className="bgColorDiv" style={{ background: `#${profileData?.colorCode}` }}></div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div className="each-action1" style={{ position: "relative" }}>
              <input type="text" placeholder="New Colour Code.." onChange={(e) => setNewColorCode(e.target.value)} />
              <div className="bgColorDiv" style={{ background: newColorCode ? `#${newColorCode}` : "transparent" }}></div>
            </div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div style={{ opacity: newColorCode ? "1" : "0.25", cursor: newColorCode ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newColorCode) { editData("colorCode", newColorCode); } }}>
              Submit Edit
            </div>
          </div>
          {loading && (
            <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}>
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {editProfilePic && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Profile Picture</div>
            <div onClick={() => { setEditProfilePic(false); setNewProfilePic(""); }} className="close-div">
              <img src={close} alt="" />
            </div>
          </div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1" style={{ border: "none", justifyContent: "center" }}>
              <div style={{ height: "120px", width: "120px" }}>
                <img src={profileData?.profilePicURL} alt="" style={{ height: "100%", width: "100%", borderRadius: "50%", border: "0.5px solid #e5e5e5" }} />
              </div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div className="each-action1" style={{ border: "none", justifyContent: "center" }}>
              <ImageUploadDivProfilePic setFunc={setNewProfilePic} funcValue={newProfilePic} />
            </div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div style={{ opacity: newProfilePic ? "1" : "0.25", cursor: newProfilePic ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newProfilePic) { editData("profilePicURL", newProfilePic); } }}>
              Submit Edit
            </div>
          </div>
          {loading && (
            <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}>
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {editCoverPic && (
        <div className="popularS">
          <div className="head-txt">
            <div>Edit Cover Photo</div>
            <div onClick={() => { setEditCoverPic(false); setNewCoverPic(""); }} className="close-div">
              <img src={close} alt="" />
            </div>
          </div>
          <div className="overall-div" style={{ height: "calc(100% - 10.5rem)" }}>
            <div className="each-action1" style={{ height: "12rem", padding: "0" }}>
              <div style={{ height: "100%", width: "100%" }}>
                <img src={profileData?.coverPicURL} alt="" style={{ height: "100%", width: "100%" }} />
              </div>
            </div>
            <div className="line-container">
              <div className="linee"></div>
              <div className="new-txt">New</div>
              <div className="linee"></div>
            </div>
            <div className="each-action1" style={{ height: "12rem", padding: "0" }}>
              <ImageUploadDivCoverPic setFunc={setNewCoverPic} funcValue={newCoverPic} />
            </div>
          </div>
          <div className="stepBtns" style={{ height: "4.5rem" }}>
            <div style={{ opacity: newCoverPic ? "1" : "0.25", cursor: newCoverPic ? "pointer" : "not-allowed", background: "#59A2DD" }} onClick={() => { if (newCoverPic) { editData("coverPicURL", newCoverPic); } }}>
              Submit Edit
            </div>
          </div>
          {loading && (
            <div className="loading-component" style={{ top: "0", right: "0", width: "100%", height: "calc(100% - 70px)", position: "absolute", display: "flex" }}>
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {changing && (
        <div className="loading-overlay">
          <LoadingAnimation1 icon={lg1} width={200} />
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default AccProfile;

export const ImageUploadDivProfilePic1 = ({ setFunc, funcValue }) => {
  const { planBAccountPicUploading, setplanBAccountPicUploading, setSelectedDropDown } = useStore();

  return (
    <div className="imageUploadDiv" onClick={() => setSelectedDropDown("")} style={{ minWidth: "140px", minHeight: "140px", maxWidth: "140px", maxHeight: "140px", border: "0.5px solid #e7e7e7", borderRadius: "50%" }}>
      {funcValue ? (
        <div className="imageDiv" style={{ height: "100%", width: "100%", marginRight: "0" }}>
          <img src={funcValue} alt="planBAccountPic" className="profileImg" htmlFor="profileUpdateImgPlanB" style={{ width: "100%", height: "100%" }} />
        </div>
      ) : (
        <label htmlFor="profileUpdateImgPlanB" className="uploadFileDiv" style={{ width: "100%", height: "100%", marginBottom: "0" }}>
          <input className="uploadNewPicPlanB" type="file" onChange={(e) => { uploadImageFunc(e, setFunc, setplanBAccountPicUploading); }} accept="image/*" id="profileUpdateImgPlanB" />
          <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", border: "0.5px solid #2c7cb2 ", borderRadius: "50%" }}>
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
        <div className="imageDiv" style={{ height: "100%", width: "100%", marginRight: "0" }}>
          <img src={funcValue} alt="planBAccountPic" className="profileImg" htmlFor="profileUpdateImgPlanB" style={{ width: "100%", height: "100%" }} />
        </div>
      ) : (
        <label htmlFor="profileUpdateImgPlanB" className="uploadFileDiv" style={{ width: "140px", height: "140px", marginBottom: "0" }}>
          <input className="uploadNewPicPlanB" type="file" onChange={(e) => { uploadImageFunc(e, setFunc, setplanBAccountPicUploading); }} accept="image/*" id="profileUpdateImgPlanB" />
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
        <div className="imageDiv" style={{ height: "100%", width: "100%", marginRight: "0" }}>
          <img src={funcValue} alt="planBAccountPic" className="profileImg" htmlFor="profileUpdateImgPlanB" style={{ width: "100%", height: "100%", borderRadius: "0" }} />
        </div>
      ) : (
        <label htmlFor="profileUpdateImgPlanB" className="uploadFileDiv" style={{ width: "100%", height: "100%", marginBottom: "0" }}>
          <input className="uploadNewPicPlanB" type="file" onChange={(e) => { uploadImageFunc(e, setFunc, setplanBAccountPicUploading); }} accept="image/*" id="profileUpdateImgPlanB" />
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
        <input className={classNames.inputFields} placeholder={placeholderText} onChange={(event) => { setFunc(event.target.value); }} value={funcValue ? funcValue : ""} style={{ borderRadius: "35px" }} />
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
        <input className={classNames.inputFields} placeholder={placeholderText} onChange={(event) => { setFunc(event.target.value); }} value={funcValue ? funcValue : ""} style={{ borderRadius: "35px" }} />
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
        <div className="imageDiv" style={{ height: "100%", width: "100%", marginRight: "0" }}>
          <img src={funcValue} alt="planBAccountPic" className="profileImg" htmlFor="profileUpdateImgPlanB" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
        </div>
      ) : (
        <label htmlFor="profileUpdateImgPlanB" className="uploadFileDiv" style={{ width: "100%", height: "100%", marginBottom: "0" }}>
          <input className="uploadNewPicPlanB" type="file" onChange={(e) => { uploadImageFunc(e, setFunc, setplanBAccountPicUploading); }} accept="image/*" id="profileUpdateImgPlanB" />
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
        <div className="imageDiv" style={{ height: "100%", width: "100%", marginRight: "0" }}>
          <img src={funcValue} alt="planBAccountPic" className="profileImg" htmlFor="profileUpdateImgPlanB" style={{ width: "100%", height: "100%" }} />
        </div>
      ) : (
        <label htmlFor="profileUpdateImgPlanB" className="uploadFileDiv" style={{ width: "100%", height: "100%", marginBottom: "0" }}>
          <input className="uploadNewPicPlanB" type="file" onChange={(e) => { uploadImageFunc(e, setFunc, setplanBAccountPicUploading); }} accept="image/*" id="profileUpdateImgPlanB" />
          <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", border: "none" }}>
            {planBAccountPicUploading ? <div>Uploading...</div> : <div><img src={upload} alt="" style={{ width: "50px", height: "50px" }} /></div>}
          </div>
        </label>
      )}
    </div>
  );
};