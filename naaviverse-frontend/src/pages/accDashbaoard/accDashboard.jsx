import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import "./accDashboard.scss";
import Marketplace from "./Marketplace";
import DraftPathView from "../DraftPathView";
import { Outlet } from "react-router-dom";
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
import close from "../../images/close.svg";
import upload from "../../images/upload.svg";
import { useStore } from "../../components/store/store.ts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AccDashsidebar from "../../components/accDashsidebar/accDashsidebar";
import logo from "../../assets/images/logo/naavi_final_logo2.png";
import CreateNewPath from './CreateNewPath';
import CreateNewService from './CreateNewService';
import "./CreateNewPath.scss";
import {
  GetFollowersPerAccount,
  GetCategoriesAcc,
  GetAllCustomerLicenses,
  GetLogServices,
  GetAllCurrencies,
  CreatePopularService,
  DeleteServiceFunction,
  addCompPlanFunction,
} from "../../services/accountant";
import { formatDate } from "../../utils/time";
import * as jose from "jose";
import EarningCalendar from "./EarningCalendar/index";
import { LoadingAnimation1 } from "../../components/LoadingAnimation1";
import { uploadImageFunc } from "../../utils/imageUpload";
import Vaults from "../Vaults";
import Toggle from "../../components/Toggle";
import Tasks from "../Tasks";
import arrow from "./arrow.svg";
import trash from "./trash.svg";
import { useCoinContextData } from "../../context/CoinContext";
import MyPaths from "../MyPaths";
import CreateNewStep from "./CreateNewStep";
import VaultTransactions from "../VaultTransactions/index.jsx";
import { Country, State, City } from 'country-state-city';
import TransactionPage from "../dashboard/TransactionPage/index.jsx";
import PurchasePage from "./PurchasePage/index.jsx";
import MenuNav from "../../components/MenuNav/index.jsx";
import MyStepsAcc from "./MyStepsAcc/index.jsx";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import PathPage from "../../components/Pathview/PathPage";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const getPartner = () => {
  try {
    const raw = localStorage.getItem("partner");

    if (!raw || raw === "undefined" || raw === "null") {
      return {};
    }

    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const AccDashboard = () => {
  const location = useLocation();   // ✅ MUST COME FIRST
  let navigate = useNavigate();

  const {
    accsideNav,
    setaccsideNav,
    ispopular,
    setispopular,
    coinType,
    setCoinType,
    balanceToggle,
    setBalanceToggle,
  } = useStore();


  let Country = require('country-state-city').Country;
  // console.log(Country.getAllCountries(), "kjefbkjbfkjwef")
  const [search, setSearch] = useState("");
  const [crmMenu, setcrmMenu] = useState("Clients");
  const [servicesMenu, setservicesMenu] = useState("Services");
  const [isLoading, setIsLoading] = useState(false);
  // const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const [isCatoading, setIsCatLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [followCount, setfollowCount] = useState(0);
  const [followData, setfollowData] = useState([]);
  const [coverImageS3url, setCoverImageS3url] = useState("");
  const [selectedFollower, setSelectedFollower] = useState({});
  const [pstep, setpstep] = useState(1);
  const [stepCount, setStepCount] = useState(1);
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
  const [image, setImage] = useState(
    localStorage.getItem("profileImage") || null
  );

  const [isSubmit, setIsSubmit] = useState(false);
  const [isServicesAcc, setIsServicesAcc] = useState(false);
  const [servicesAcc, setservicesAcc] = useState([]);
  const [serviceActionEnabled, setServiceActionEnabled] = useState(false);
  const [serviceActionStep, setServiceActionStep] = useState(1);
  const [selectedService, setSelectedService] = useState([]);
  const [isloading, setIsloading] = useState(false);
  const [updatedIcon, setUpdatedIcon] = useState("");
  const [userSteps, setUserSteps] = useState([]);
  const user = useSelector((state) => state.user);
  const [countryApiValue, setCountryApiValue] = useState([]);
  const didFetchCountriesRef = useRef(false);
  const [currentStepId, setCurrentStepId] = useState(null);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [showPathModal, setShowPathModal] = useState(true);
  const [showStepCountModal, setShowStepCountModal] = useState(false);
  const [showCreateStepModal, setShowCreateStepModal] = useState(false);
  const [createStepForPathId, setCreateStepForPathId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isViewPathRoute =
    location.pathname.startsWith("/dashboard/accountants/path/");

  const [viewPathMode, setViewPathMode] = useState(isViewPathRoute);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (location.pathname.includes("/dashboard/accountants/crm")) {
      if (tab === "purchases") {
        setcrmMenu("Purchases");
      } else {
        setcrmMenu("Clients");
      }
    }
  }, [location.search, location.pathname]);
  // Add this with your other useEffects
  useEffect(() => {
    if (location.state?.openCreatePath) {
      setaccsideNav("CREATE_PATH");
      // Only clear state, don't navigate away
      window.history.replaceState({}, '', location.pathname);
    }
  }, []);


  // ✅ FIX — add location.pathname as dependency so it re-runs on URL change
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard/accountants/paths')) {
      setaccsideNav("Paths");
    } else if (path.includes('/dashboard/accountants/steps')) {
      setaccsideNav("Steps");
    } else if (path.includes('/dashboard/accountants/marketplace')) {
      setaccsideNav("Marketplace");
    } else if (path.includes('/dashboard/accountants/crm')) {
      setaccsideNav("CRM");
    } else if (path.includes('/dashboard/accountants/home')) {
      setaccsideNav("Home");
    } else if (path === '/dashboard/accountants' || path === '/dashboard/accountants/') {
      setaccsideNav("CRM");
      navigate("/dashboard/accountants/crm?tab=clients");
    }
  }, [location.pathname]);

  useEffect(() => {
    setViewPathMode(
      location.pathname.startsWith("/dashboard/accountants/path/")
    );
  }, [location.pathname]);

  useEffect(() => {
    const isPath =
      location.pathname.startsWith("/dashboard/accountants/path/");
    setViewPathMode(isPath);
  }, [location.pathname]);

  useEffect(() => {
    if (didFetchCountriesRef.current) return;  // ⛔ prevents 2nd execution
    didFetchCountriesRef.current = true;

    console.log("useEffect for countries running...");

    const fetchCountries = async () => {
      try {
        console.log("Fetching countries...");
        const res = await axios.get(`${BASE_URL}/api/countries`);
        console.log("Countries fetched:", res.data);
        setCountryApiValue(res.data);
      } catch (err) {
        console.log("Error fetching countries:", err);
      }
    };

    fetchCountries();
  }, []);
  //add compPlan


  const [addCompPlan, setAddCompPlan] = useState(false);
  const [addCompPlanStep, setAddCompPlanStep] = useState("step1");
  const [userCreatedApps, setUserCreatedApps] = useState([]);
  const [compPlanApp, setCompPlanApp] = useState("");
  const [levels, setLevels] = useState();
  const [addingComp, setAddingComp] = useState(false);
  const [inputValues, setInputValues] = useState([]);
  const [multiplier, setMultiplier] = useState([]);
  const [isfetching, setIsfetching] = useState(false);

  //with compPlan
  const [withCompPlanData, setWithCompPlanData] = useState([]);
  const [gettingData, setGettingData] = useState(false);

  // new step
  const [mainMenu, setMainMenu] = useState("");
  const [step, setStep] = useState("");
  const [loading, setLoading] = useState(false);
  const [backupPathList, setBackupPathList] = useState([]);
  const [showBackupPathList, setShowBackupPathList] = useState(false);

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

  const billingFrequency = [
    {
      value: 'monthly',
      view: 'Monthly'
    },
    {
      value: 'annual',
      view: 'Annual'
    },
    {
      value: 'lifetime',
      view: 'One time'
    }]

  const [servicePrice, setServicePrice] = useState(null)
  const [selectedServiceCurrency, setSelectedServiceCurrency] = useState(null)



  // CRM USERS (optional)
  const [crmUserData, setCrmUserData] = useState([]);
  const [isUserLoading, setIsUserLoading] = useState(false);

  // CRM CLIENTS
  const [crmClientData, setCrmClientData] = useState([]);
  const [isClientLoading, setClientLoading] = useState(false);

  // CRM PURCHASES
  const [crmPurchaseData, setCrmPurchaseData] = useState([]);
  const [isPurchaseLoading, setPurchaseLoading] = useState(false);

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

    //vault action
    transactionSelected,
    setTransactionSelected,
    setTransactionData,
    setSelectedCoin,
    coinActionEnabled,
    setCoinActionEnabled,
    coinAction,
    setCoinAction,
    selectedCoin,

    // Forex Currency Add Action
    addActionStep,
    setAddActionStep,
    paymentMethodData,
    setPaymentMethodData,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    addForexAmount,
    setAddForexAmount,
    forexPathId,
    setForexPathId,
    forexQuote,
    setForexQuote,
  } = useCoinContextData();

  const [profileId, setProfileId] = useState("");

  //upload part starts here

  const secret = "uyrw7826^&(896GYUFWE&*#GBjkbuaf"; // secret not to be disclosed anywhere.
  const emailDev = "rahulrajsb@outlook.com"; // email of the developer.
  // Read partner once, normalize email/token fields for safe use throughout component.
  const userDetails = getPartner();
  const partnerEmail = userDetails?.email || userDetails?.user?.email || null;
  const partnerToken = userDetails?.idToken || userDetails?.token || null;
  // console.log("PARTNER VALUE:", userDetails);

  const handleGrade = (item) => {
    if (grade.includes(item)) {
      // If the grade is already selected, remove it
      setGrade(grade.filter((o) => o !== item));
    } else {
      // If the grade is not selected, add it
      setGrade([...grade, item]);
    }
  };

  const handleGradeAvg = (item) => {
    if (gradeAvg.includes(item)) {
      // If the gradeAvg is already selected, remove it
      setGradeAvg(gradeAvg.filter((o) => o !== item));
    } else {
      // If the gradeAvg is not selected, add it
      setGradeAvg([...gradeAvg, item]);
    }
  };

  const handleCurriculum = (item) => {
    if (curriculum.includes(item)) {
      // If the curriculum is already selected, remove it
      setCurriculum(curriculum.filter((o) => o !== item));
    } else {
      // If the curriculum is not selected, add it
      setCurriculum([...curriculum, item]);
    }
  };

  const handleStream = (item) => {
    if (stream.includes(item)) {
      // If the stream is already selected, remove it
      setStream(stream.filter((o) => o !== item));
    } else {
      // If the stream is not selected, add it
      setStream([...stream, item]);
    }
  };

  const handleFinance = (item) => {
    if (finance.includes(item)) {
      // If the finance is already selected, remove it
      setFinance(finance.filter((o) => o !== item));
    } else {
      // If the finance is not selected, add it
      setFinance([...finance, item]);
    }
  };

  const handlePersonality = (item) => {
    setPersonality(item);
    // if (personality.includes(item)) {
    //   // If the personality is already selected, remove it
    //   setPersonality(personality.filter((o) => o !== item));
    // } else {
    //   // If the personality is not selected, add it
    //   setPersonality([...personality, item]);
    // }
  };

  useEffect(() => {
    axios.get(`https://careers.marketsverse.com/paths/get`).then((res) => {
      let result = res?.data?.data;
      // console.log(result, "all paths fetched");
      setBackupPathList(result);
    });
  }, []);

  const addBackupPath = (backupPathId, selectedStepId) => {
    // console.log(pathSteps, "kjedkjweld");

    setPathSteps(prev => {
      const the_ids = Array.isArray(prev?.the_ids) ? prev.the_ids.map(item => {
        if (item.step_id === selectedStepId) {
          return { ...item, backup_pathId: backupPathId };
        }
        return item;
      }) : [];
      return { ...prev, the_ids };
    });
    setShowBackupPathList(false);

    // console.log(selectedSteps, "lkashclkweoiuk");
    // const found = pathSteps.find((element) => element._id === backupPathId);
  };

  useEffect(() => {
    if (userDetails) {
      setPathSteps((prev) => {
        return {
          ...prev,
          email: userDetails?.email,
        };
      });
    }
  }, []);

  useEffect(() => {
    const partner = getPartner();

    if (!partner?.email) {
      console.warn("Partner missing — skipping protected calls");
      return;
    }

    handleFollowerPerAccountants();
    handleGetCurrencies();
    resetpop();
  }, []);

  //upload end here

  const handleFollowerPerAccountants = () => {
    setIsLoading(true);
    const partner = getPartner();
    if (!partner?.email) {
      console.warn("No partner set — skipping follower fetch");
      setIsLoading(false);
      return;
    }
    GetFollowersPerAccount(partner.email)
      .then((res) => {
        let result = res?.data;
        if (result?.status) {
          setfollowCount(result?.data?.count);
          setfollowData(result?.data?.followers);
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
    const email = userDetails?.email;

    if (!email) return;

    setPurchaseLoading(true);

    axios
      .get(`${BASE_URL}/api/crm/purchases?creatoremail=${email}`)
      .then(({ data }) => {
        console.log("CRM PURCHASE RESPONSE:", data);

        // Always update crmPurchaseData
        setCrmPurchaseData(data?.data || []);

        setPurchaseLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching CRM purchases:", err);
        setPurchaseLoading(false);
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

  const handleGetCurrencies = React.useCallback(() => {
    // prevent double calls
    if (isCurrencies) return;

    setIsCurrencies(true);

    GetAllCurrencies()
      .then((res) => {
        const result = res?.data;
        console.log("📦 Currency API result:", result);

        if (result?.status && Array.isArray(result.currencies)) {
          console.log("💰 Raw currencies:", result.currencies.slice(0, 5), "...");

          const formatted = result.currencies.map((c) => ({
            coinName: c.code,
            coinSymbol: c.code,
            fullName: c.currency,
          }));

          console.log("🔁 Formatted currencies:", formatted.slice(0, 5), "...");

          setallCurrencies(formatted);
        } else {
          console.warn("⚠️ Currencies not found or invalid structure");
        }

        setIsCurrencies(false);
      })
      .catch((err) => {
        console.error("❌ Currency fetch failed:", err?.response?.data || err);
        setIsCurrencies(false);
      });
  }, [isCurrencies]);

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
    setSelectedServiceCurrency(null)
    setServicePrice(null)
  };

  const handleLogout = () => {
    localStorage.removeItem("partner");
    localStorage.removeItem("loginEmail");
    navigate("/login");
  };

  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file); // Set preview immediately
    const uploadedUrl = await uploadImageFunc(e, setImage, setLoading);

    if (uploadedUrl) {
      setImage(uploadedUrl); // Set the final uploaded image URL
    }
  };
  const uploadBulkPath = async (file) => {
    try {
      setIsUploadLoading(true);

      const text = await file.text();
      let records = JSON.parse(text);

      if (!Array.isArray(records) || records.length === 0) {
        alert("JSON must contain array of paths");
        return;
      }

      records = records.map(r => {
        delete r._id;
        delete r.createdAt;
        delete r.updatedAt;
        delete r.__v;

        if (Array.isArray(r.personality)) r.personality = r.personality[0];
        if (Array.isArray(r.grade_avg)) r.grade_avg = r.grade_avg[0];
        if (!['K12', 'Degree'].includes(r.path_cat)) r.path_cat = 'K12';
        if (!['education', 'career', 'immigration'].includes(r.path_type)) r.path_type = 'education';

        return r;
      });

      const email = localStorage.getItem("loginEmail");

      const body = { email, records };

      const res = await axios.post(
        `${BASE_URL}/api/paths/bulk`,
        body
      );

      console.log("SERVER RESPONSE:", res.data);

      alert(
        res.data.message
          ? `${res.data.message} | Count: ${res.data.count ?? 0}`
          : `Uploaded ${res.data.count ?? 0} paths successfully`
      );

      setpstep(12);

    } catch (err) {
      console.error("Bulk Path upload error:", err);
      alert("Bulk path upload failed - check console");
    } finally {
      setIsUploadLoading(false);
    }
  };

  const uploadBulkStep = async (file) => {
    try {
      setIsUploadLoading(true);

      const text = await file.text();
      const records = JSON.parse(text);

      if (!Array.isArray(records) || records.length === 0) {
        alert("Invalid JSON: Must contain array");
        return;
      }

      const email = localStorage.getItem("loginEmail");

      const body = {
        email,
        records
      };

      const res = await axios.post(
        `${BASE_URL}/api/steps/bulk`,
        body
      );

      console.log("BULK STEP RESPONSE:", res.data);  // 👈 ADD THIS

      if (res.data?.status === true) {               // 👈 MAKE CHECK STRICT
        alert(`Uploaded ${res.data.count} steps successfully`);
        setpstep(12);
      } else {
        alert("Step upload failed");
      }

    } catch (err) {
      console.error("Bulk Step upload error:", err);
      alert("Bulk Step upload error");
    } finally {
      setIsUploadLoading(false);
    }
  };

  const uploadBulkService = async (file) => {
    try {
      setIsUploadLoading(true);

      const text = await file.text();
      const parsed = JSON.parse(text);

      // IMPORTANT: Ensure parsed is an array
      const records = Array.isArray(parsed) ? parsed : [parsed];

      const email = localStorage.getItem("loginEmail");

      const body = {
        email,
        records
      };

      const res = await axios.post(
        `${BASE_URL}/api/services/bulk`,
        body
      );

      if (res.data?.status) {
        alert(`Uploaded ${res.data.count} services successfully`);
      } else {
        alert("Upload failed");
      }

    } catch (err) {
      console.error("Bulk Service upload error:", err);
    } finally {
      setIsUploadLoading(false);
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

  const handleFileInputChange3 = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storedUser = JSON.parse(localStorage.getItem("partner"));

    if (!storedUser || !storedUser.email) {
      console.error("Partner email not found");
      return;
    }

    const email = storedUser.email;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log("Email:", email);
      console.log("Records:", jsonData.length);

      try {
        const response = await axios.post("/api/services/bulk", {
          email: email,
          records: jsonData
        });

        console.log("Bulk success:", response.data);
      } catch (error) {
        console.error("Bulk upload error:", error.response?.data || error.message);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const myTimeoutService = () => {
    setTimeout(reloadService, 3000);
  };

  function reloadService() {
    setpstep(1);
    setispopular(false);
    setaccsideNav("Marketplace");
    setservicesMenu("Services");
  }

  const handleFinalSubmit = () => {
    setIsSubmit(true);

    let userDetails = JSON.parse(localStorage.getItem("partner"));

    // COMMON FIELDS FOR BOTH ONE-TIME & MONTHLY
    const base = {
      productcreatoremail: userDetails.email,

      ...(currentStepId ? { step_id: currentStepId } : {}),

      // REQUIRED BACKEND FIELDS
      name: serviceNameInput,                 // ✔ MUST BE `name`
      chargingtype: billingType,              // ✔ MUST BE `chargingtype`
      description: serviceDescription,        // ✔ MUST BE `description`

      product_code: serviceCodeInput,
      product_icon: coverImageS3url,          // ✔ Use uploaded S3 URL
      revenue_account: userDetails.email,
      client_app: "naavi",

      product_category_code: "CoE",
      sub_category_code: "",
      custom_product_label: productLabel,
      points_creation: false,
      sub_text: serviceTagline,

      // FIRST A (BOTH MODELS)
      first_purchase: {
        price: firstMonthPrice ? parseFloat(firstMonthPrice) : 0,
        coin: selectedCurrency.coinSymbol,
      },

      grace_period:
        billingType === "One Time"
          ? 0
          : gracePeriod
            ? parseFloat(gracePeriod)
            : 0,

      first_retry:
        billingType === "One Time"
          ? 0
          : secondChargeAttempt
            ? parseFloat(secondChargeAttempt)
            : 0,

      second_retry:
        billingType === "One Time"
          ? 0
          : thirdChargeAttempt
            ? parseFloat(thirdChargeAttempt)
            : 0,

      staking_allowed: false,
      staking_details: {},
    };

    // ------------------------------
    // MONTHLY PLAN OBJECT
    // ------------------------------
    const objmonthly = {
      ...base,
      billing_cycle: {
        monthly: {
          price:
            monthlyPrice !== ""
              ? parseFloat(monthlyPrice)
              : firstMonthPrice
                ? parseFloat(firstMonthPrice)
                : 0,
          coin: selectedCurrency.coinSymbol,
        },
      },
    };

    // ------------------------------
    // ONE-TIME PLAN OBJECT
    // ------------------------------
    const objone = {
      ...base,
      billing_cycle: {
        lifetime: {
          price:
            firstMonthPrice !== ""
              ? parseFloat(firstMonthPrice)
              : monthlyPrice !== ""
                ? parseFloat(monthlyPrice)
                : 0,
          coin: selectedCurrency.coinSymbol,
        },
      },
    };

    // FINAL PAYLOAD
    const obj = billingType === "One Time" ? objone : objmonthly;

    console.log("FINAL SERVICE PAYLOAD:", obj);

    CreatePopularService(obj)
      .then((res) => {
        let result = res.data;

        if (result.status) {
          myTimeoutService();
          setpstep(7);

          // RESET ALL FIELDS
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
          setIsSubmit(false);
        }
      })
      .catch((err) => {
        console.error("SERVICE CREATE ERROR:", err);
        setIsSubmit(false);
      });
  };

  const getAllServices = async () => {
    const userDetails = getPartner();

    if (!userDetails?.email) {
      console.warn("No partner email found");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/services/getservices?productcreatoremail=${userDetails.email}`
      );

      if (data?.status) {
        setservicesAcc(data.data || []);
      } else {
        setservicesAcc([]);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setservicesAcc([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllServicesAgain = () => {
    const userDetails = JSON.parse(localStorage.getItem("partner"));

    if (!userDetails || !userDetails.email) {
      console.warn("⚠ No partner user found in localStorage.");
      return;
    }

    getAllServices(userDetails.email);
  };

  useEffect(() => {
    if (!ispopular) {
      const userDetails = JSON.parse(localStorage.getItem("partner"));
      if (userDetails?.email) {
        getAllServices(userDetails.email);
      }
    } else {
      getAllServices();
    }
  }, [ispopular]);

  useEffect(() => {
    resetpop();

    if (accsideNav === "CRM" && crmMenu === "Followers") {
      handleFollowerPerAccountants();
    }
    else if (accsideNav === "CRM" && crmMenu === "Purchases") {
      handleAllCustomerLicenses();
    }
    else if (accsideNav === "Marketplace" && servicesMenu === "Services") {
      const userDetails = getPartner();

      if (!userDetails || !userDetails.email) {
        console.warn("No partner found — skipping service reload.");
        return;
      }

      getAllServices();
    }
  }, [crmMenu, servicesMenu, accsideNav]);

  const myTimeout = () => {
    setTimeout(reload, 2000);
  };

  function reload() {
    setServiceActionEnabled(false);
    setServiceActionStep(1);
    setSelectedService("");
    setUpdatedIcon("");
    // Force refresh services
    const userDetails =
      JSON.parse(localStorage.getItem("partner")) ||
      JSON.parse(localStorage.getItem("user"));

    if (userDetails?.email) {
      getAllServices(userDetails.email);
    }
  }

  const deleteService = async () => {
    const serviceId = selectedService?._id;
    if (!serviceId) return;

    try {
      setIsloading(true);

      await axios.delete(`${BASE_URL}/api/services/delete/${serviceId}`, {
        headers: {
          Authorization: `Bearer ${userDetails?.idToken}`,
          email: userDetails?.email,
        },
      });

      // If request succeeds (200), consider delete successful
      setServiceActionEnabled(false);
      resetpop();
      getAllServices();
    } catch (error) {
      console.error("Delete service failed:", error);
    } finally {
      setIsloading(false);
    }
  };

  const changeServiceIcon = () => {
    // Debug log
    console.log("Starting icon update:", {
      serviceId: selectedService?._id,
      serviceName: selectedService?.name,
      currentIcon: selectedService?.product_icon,
      newIcon: updatedIcon
    });

    if (!updatedIcon || !selectedService?._id) {
      toast.error("Please upload an image first");
      return;
    }

    setIsloading(true);

    // Get user details
    const userDetails = JSON.parse(localStorage.getItem("partner"));
    const payload = {
      icon: updatedIcon,
      email: userDetails?.email
    };

    console.log("Sending payload:", payload);
    console.log("Service ID:", selectedService._id);

    // Try updating with product_icon field
    axios
      .put(`${BASE_URL}/api/services/update/${selectedService._id}`, {
        ...payload,
        product_icon: updatedIcon  // Use product_icon field
      })
      .then((response) => {
        console.log("API Response:", response.data);

        if (response.data?.status) {
          toast.success("Icon updated successfully!");
          setServiceActionStep(6);
          myTimeout();
        } else {
          // Try alternative endpoint
          return axios.put(`${BASE_URL}/api/services/updateIcon`, {
            product_id: selectedService._id,
            product_icon: updatedIcon,
            email: userDetails?.email
          });
        }
      })
      .then((response) => {
        if (response?.data?.status) {
          toast.success("Icon updated successfully!");
          setServiceActionStep(6);
          myTimeout();
        } else {
          toast.error(response?.data?.message || "Failed to update icon");
        }
      })
      .catch((error) => {
        console.error("Update error:", error);
        console.error("Error response:", error.response?.data);

        // Try one more endpoint as fallback
        axios.put(`${BASE_URL}/api/services/icon/${selectedService._id}`, {
          product_icon: updatedIcon
        })
          .then(res => {
            if (res.data?.status) {
              toast.success("Icon updated!");
              setServiceActionStep(6);
              myTimeout();
            } else {
              toast.error("All update attempts failed");
            }
          })
          .catch(err => {
            toast.error("Could not update icon. Check console.");
          });
      })
      .finally(() => {
        setIsloading(false);
      });
  };

  const getAppsforUser = () => {
    setIsfetching(true);
    axios
      .get("https://comms.globalxchange.io/gxb/apps/get")
      .then((response) => {
        let result = response?.data?.apps;
        // console.log(result, 'getAppsforUser result');
        setUserCreatedApps(result);
        setIsfetching(false);
      })
      .catch((error) => {
        console.log(error, "getAppsforUser error");
      });
  };

  const handleSavePath = () => {
    console.log("📨 FINAL PATH STEPS SUBMITTED:", pathSteps);
    // save logic...
  };

  const myTimeout1 = () => {
    setTimeout(reload1, 3000);
  };

  function reload1() {
    setAddCompPlan(false);
    setAddCompPlanStep("step1");
    setUserCreatedApps([]);
    setCompPlanApp("");
    setLevels();
    setInputValues([]);
    setMultiplier([]);
    getWithCompPlan();
    setservicesMenu("With CompPlan");
  }

  const addComplan = () => {
    setAddingComp(true);

    let fixedPayouts = inputValues.map((e, i) => {
      return {
        level: i,
        percentage: e,
      };
    });
    // console.log(fixedPayouts, 'fixedPayouts');

    let numValues = multiplier.map((e, i) => {
      return {
        level: i,
        numerator: e,
      };
    });
    // console.log(numValues, 'numValues');

    let obj = {
      email: userDetails?.email,
      token: userDetails?.idToken,
      app_code: compPlanApp,
      product_id: selectedService?.product_id,
      comp_plan_id: "comp4",
      fixed_payouts: fixedPayouts,
      numeratorValues: numValues,
    };
    // console.log(obj, 'object');

    addCompPlanFunction(obj).then((response) => {
      let result = response?.data;
      console.log(result);
      if (result?.status) {
        setAddingComp(false);
        setAddCompPlanStep("step6");
        myTimeout1();
      } else {
        setAddingComp(false);
      }
    });
  };

  const styles = {
    opacity: "0.25",
    pointerEvents: "none",
  };
  const applyStyle = (condition) => (condition ? {} : styles);

  function spreadFunc(value) {
    if (value.length > 0) {
      const result = value.reduce((acc, val) => acc && val);
      // console.log(result, 'resultttt');
      return result;
    }
  }

  const handleLevelChange = (event) => {
    const newLevel = parseInt(event.target.value);
    if (newLevel >= 1) {
      setLevels(newLevel);
      setInputValues(Array(newLevel).fill(""));
      setMultiplier(Array(newLevel).fill(""));
    }
  };

  const handleInputChange = (index, event, funcValue, func) => {
    const newInputValues = [...funcValue];
    newInputValues[index] = event.target.value;
    // console.log(newInputValues, 'newInputValues');
    func(newInputValues);
  };

  const renderLevelInputs = (funcValue, func) => {
    return funcValue.map((value, index) => (
      <div className="each-action1" key={index}>
        <div className="partition">
          <div>{index}</div>
          <input
            type="number"
            value={value}
            onChange={(event) =>
              handleInputChange(index, event, funcValue, func)
            }
            placeholder="0.00%"
          />
        </div>
      </div>
    ));
  };

  const getWithCompPlan = () => {
    setGettingData(true);
    let obj = {
      product_creator: userDetails?.email,
    };
    axios
      .post(
        `https://comms.globalxchange.io/gxb/product/price/with/fees/get`,
        obj
      )
      .then((response) => {
        let result = response?.data?.products;
        setWithCompPlanData(result);
        setGettingData(false);
      })
      .catch((error) => {
        console.log(error, "error in getWithCompPlan");
      });
  };

  useEffect(() => {
    getWithCompPlan();
  }, []);

  const getCounsellorEmail = () => {
    const local = JSON.parse(localStorage.getItem("partner"));
    return user?.email || local?.email;
  };

  useEffect(() => {
    const email = getCounsellorEmail();
    if (!email) return;

    setClientLoading(true);

    axios.get(`${BASE_URL}/api/crm/clients?creatoremail=${email}`)
      .then(res => {
        setCrmClientData(res.data?.data || []);
        setClientLoading(false);
      })
      .catch(err => {
        console.log("CRM CLIENT ERROR:", err);
        setClientLoading(false);
      });
  }, []);

  const pathSubmission = (totalStepsOverride) => {
    console.log("🚀 ---- PATH SUBMISSION TRIGGERED ----");

    // 1️⃣ Log Redux user object
    console.log("🔥 Redux USER VALUE:", user);

    // 2️⃣ Log localStorage user raw string
    const rawLocal = localStorage.getItem("user");
    console.log("🔥 LocalStorage USER VALUE RAW:", rawLocal);

    // 3️⃣ Parse localStorage safely
    let storedUser = {};
    try {
      storedUser = rawLocal ? JSON.parse(rawLocal) : {};
    } catch (e) {
      storedUser = {};
    }

    // 4️⃣ Log parsed localStorage value
    console.log("🔥 Parsed LocalStorage User:", storedUser);

    // 5️⃣ Find final email from all possible sources
    const finalEmail =
      user?.email ||
      user?.user?.email ||
      user?.currentUser?.email ||
      storedUser?.email ||
      storedUser?.user?.email ||
      storedUser?.currentUser?.email ||
      localStorage.getItem("loginEmail");   // ⭐ REQUIRED LAST CHECK

    // 6️⃣ Log final email decision
    console.log("🔥 FINAL EMAIL USED:", finalEmail);

    // 7️⃣ If missing, stop execution
    if (!finalEmail) {
      console.log("❌ User email missing. Cannot create path.");
      alert("User email missing. Please login again.");
      return;
    }

    // 8️⃣ Build the payload
    const payload = {
      email: finalEmail,
      nameOfPath: pathSteps.nameOfPath,
      description: pathSteps.description,
      total_steps: Number(totalStepsOverride ?? stepCount),
      current_coordinates: {
        grade: grade,
        curriculum: curriculum,
        stream: stream,
        grade_avg: gradeAvg,
        financialSituation: finance,
        personality: personality,
      },

      feature_coordinates: {
        program: pathSteps.program,
        destination_degree: pathSteps.destination_degree || "unknown",
        destination_institution: pathSteps.destination_institution,
        path_type: pathSteps.path_type || "education",
        path_cat: pathSteps.path_cat || "K12",
        city: pathSteps.city,
        country: pathSteps.country,
      },

      program: pathSteps.program,
      university: [],
      the_ids: pathSteps.the_ids.map((step) => ({
        step_id: step.step_id,
        stepName: step.stepName || "",
        stepDescription: step.stepDescription || "",
        backup_pathId: step.backup_pathId || null,
        backupPathName: step.backupPathName || "",
        backupPathDescription: step.backupPathDescription || ""
      })),
      path_type: pathSteps.path_type || "education",
      path_cat: pathSteps.path_cat || "K12",
      personality: personality,
      destination_degree: pathSteps.destination_degree || "unknown",
      destination_institution: pathSteps.destination_institution,
      length: Number(pathSteps.length),
      city: pathSteps.city,
      country: pathSteps.country,
      financialSituation: finance,
      curriculum: curriculum,
      grade: grade,
      stream: stream,
      grade_avg: gradeAvg,
      performance: gradeAvg[0],
      status: "waitingforapproval",
    };

    // 9️⃣ Log the payload before sending
    console.log("📦 PAYLOAD GOING TO API:", payload);

    setCreatingPath(true);

    // 🔟 Send request
    axios
      .post(`${BASE_URL}/api/paths/add`, payload)
      .then((response) => {
        console.log("✅ API RESPONSE:", response.data);

        if (response.data?.status) {
          const createdPathId = response.data.data._id;

          // 1️⃣ Save path id (optional)
          localStorage.setItem("selectedPathId", createdPathId);

          // 2️⃣ Close create-path UI first
          setCreatingPath(false);

          // 3️⃣ Reset the popup/modal
          resetpop();

          // 4️⃣ Set viewPathMode to true to show the path view
          setViewPathMode(true);

          // 5️⃣ Navigate to view path
          setTimeout(() => {
            navigate(`/dashboard/accountants/path/${createdPathId}`, {
              replace: true,
            });
          }, 0);
        }
      })
      .catch((err) => {
        console.log("❌ API ERROR:", err.response?.data || err);
        setCreatingPath(false);
      });
  };

  const removeStep = (stepId) => {
    // Remove the step from selectedSteps
    const updatedSelectedSteps = selectedSteps.filter(
      (step) => step._id !== stepId
    );
    setSelectedSteps(updatedSelectedSteps);

    // Remove the step_id from pathSteps
    const updatedTheIds = pathSteps?.the_ids?.filter(
      (obj) => obj.step_id !== stepId
    );
    setPathSteps({
      ...pathSteps,
      the_ids: updatedTheIds,
    });
  };

  useEffect(() => {
    const email = getCounsellorEmail();
    if (!email) return;

    setClientLoading(true);

    axios.get(`${BASE_URL}/api/crm/clients?creatoremail=${email}`)
      .then(res => {
        setCrmClientData(res.data?.data || []);
        setClientLoading(false);
      })
      .catch(err => {
        console.log("CRM CLIENT ERROR:", err);
        setClientLoading(false);
      });
  }, []);

  function customDateFormat(date) {
    if (date instanceof Date && !isNaN(date.valueOf())) {
      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "long" });
      const year = date.getFullYear();

      const suffix =
        day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th";

      const customFormattedDate = `${month} ${day}${suffix} ${year}`;
      return customFormattedDate;
    } else {
      console.log("Invalid date object");
    }
  }

  // coin action
  const resetCoinAction = () => {
    setCoinActionEnabled(false);
    setCoinAction(["Menu"]);
    setAddActionStep(1);
    setSelectedCoin({});
    setProfileId("");
    setPaymentMethodData([]);
    setSelectedPaymentMethod("");
    setForexPathId("");
    setAddForexAmount("");
    setForexQuote([]);
  };

  // get profile id
  useEffect(() => {
    let email = userDetails?.email;
    if (coinAction?.includes("Add") && addActionStep === 1) {
      axios
        .get(`https://comms.globalxchange.io/user/details/get?email=${email}`)
        .then((res) => {
          const { data } = res;
          if (data?.status) {
            // console.log(data?.user["naavi_profile_id"], "profile id");
            setProfileId(data?.user["naavi_profile_id"]);
          }
        });
    }
  }, [coinAction, addActionStep]);

  // get payment methods for forex add action
  useEffect(() => {
    if (coinAction?.includes("Add") && selectedCoin?.coinSymbol) {
      axios
        .get(
          `https://comms.globalxchange.io/coin/vault/service/payment/stats/get?select_type=fund&to_currency=${selectedCoin?.coinSymbol}&from_currency=${selectedCoin?.coinSymbol}&country=India&banker=shorupan@indianotc.com`
        )
        .then((response) => {
          let result = response?.data?.pathData?.paymentMethod;
          // console.log(result, "payment methods result");
          setPaymentMethodData(result);
        })
        .catch((error) => {
          console.log(error, "error in fetching payment methods");
        });
    }
  }, [coinAction, selectedCoin]);

  const getPathId = () => {
    axios
      .get(
        `https://comms.globalxchange.io/coin/vault/service/payment/paths/get?from_currency=${selectedCoin?.coinSymbol}&to_currency=${selectedCoin?.coinSymbol}&select_type=fund&banker=shorupan@indianotc.com&paymentMethod=${selectedPaymentMethod}`
      )
      .then((response) => {
        let result = response?.data?.paths;
        // console.log(result, "getPathId result");
        if (result?.length > 0) {
          setForexPathId(result[0]?.path_id);
          // console.log(result[0]?.path_id, "pathId");
        }
      })
      .catch((error) => {
        console.log(error, "error in getPathId");
      });
  };

  const onBlur = (e) => {
    const float = parseFloat(e.target.value);
    setAddForexAmount(float.toFixed(2));
  };
  const getQuote = () => {
    const partner = getPartner();
    const partnerEmailLocal = partner?.email || partner?.user?.email;
    const partnerTokenLocal = partner?.idToken || partner?.token;

    if (!partnerEmailLocal) {
      toast.error("Please login to continue");
      return;
    }

    let obj = {
      token: partnerTokenLocal,
      email: partnerEmailLocal,
      app_code: "naavi",
      profile_id: profileId,
      coin_purchased: selectedCoin?.coinSymbol,
      purchased_from: selectedCoin?.coinSymbol,
      from_amount: addForexAmount,
      stats: true,
      identifier: `Add ${addForexAmount} ${selectedCoin?.coinSymbol} Via ${selectedPaymentMethod}`,
      path_id: forexPathId,
    };

    axios
      .post(
        `https://comms.globalxchange.io/coin/vault/service/trade/execute`,
        obj
      )
      .then((response) => {
        let result = response?.data;
        // console.log(result, "getQuote result");
        if (result?.status) {
          setForexQuote(result);
          setAddActionStep(3);
        }
      })
      .catch((error) => {
        console.log(error, "error in getQuote");
      });
  };

  const conditionalBilling = (item) => {
    if (item === "lifetime") {
      return "One Time"
    } else if (item === "monthly") {
      return "Monthly"
    } else if (item === "annual") {
      return "Annual"
    }
  }

  const getBillingInfo = (billing_cycle = {}) => {
    if (billing_cycle?.monthly?.price !== undefined) {
      return {
        type: "Monthly",
        price: billing_cycle.monthly.price,
        coin: billing_cycle.monthly.coin || "-"
      };
    }

    if (billing_cycle?.annual?.price !== undefined) {
      return {
        type: "Annual",
        price: billing_cycle.annual.price,
        coin: billing_cycle.annual.coin || "-"
      };
    }

    if (billing_cycle?.lifetime?.price !== undefined) {
      return {
        type: "One Time",
        price: billing_cycle.lifetime.price,
        coin: billing_cycle.lifetime.coin || "-"
      };
    }

    return {
      type: "N/A",
      price: "-",
      coin: "-"
    };
  };

  const handleDownload = (type) => {
    let filePath;

    if (type === "Path") {
      filePath = "/PathTemplate.xlsx";
    } else if (type === "Step") {
      filePath = "/StepTemplate.xlsx";
    } else {
      filePath = "/ServiceTemplate.xlsx";
    }

    const link = document.createElement("a");
    link.href = filePath;
    link.download = filePath.substring(filePath.lastIndexOf("/") + 1);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 🔥 Delay closing modal
    setTimeout(() => {
      resetpop();
    }, 300);
  };

  return (
    <div style={{
      height: "100vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      maxWidth: "100vw"   // ← ADD THIS
    }}>


      {/* ── MOBILE TOPBAR ── only visible on ≤768px via CSS ── */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-left">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label="Open menu"
          >
            {/* Hamburger icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <img className="mobile-topbar-logo" src={logo} alt="Naavi" />
        </div>
        <div className="mobile-topbar-right">
          {/* Optional: user avatar or notification icon */}
        </div>
      </div>


      <div className="dashboard-main" style={{ flex: 1, display: "flex", minHeight: 0, width: "100%", overflow: "hidden" }}>

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.3)",
              zIndex: 1000,
              pointerEvents: "all",
            }}
          />
        )}

        {/* ✅ Sidebar OUTSIDE dashboard-body so ::after blur never touches it */}
        <AccDashsidebar
          accStatus={JSON.parse(localStorage.getItem("partner") || "{}")?.approvalStatus}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="dashboard-body">
          <div className="dashboard-screens">
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", height: "100%" }}>
              {viewPathMode ? (
                createStepForPathId ? (
                  <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
                    <div style={{
                      padding: "0 35px",
                      height: "60px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "0.5px solid #E5E5E5",
                      background: "#fff",
                      flexShrink: 0
                    }}>
                      <div style={{
                        padding: "10px 30px",
                        borderRadius: "35px",
                        fontWeight: "700",
                        fontSize: "15px",
                        background: "rgba(241,241,241,0.5)"
                      }}>
                        Create New Step
                      </div>
                      <div
                        style={{
                          fontWeight: "600",
                          textDecorationLine: "underline",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          paddingRight: "35px"
                        }}
                        onClick={() => setCreateStepForPathId(null)}
                      >
                        ← Back to Path
                      </div>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", background: "#fff", minHeight: 0 }}>
                      <CreateNewStep
                        inlineMode={true}
                        pathId={createStepForPathId}
                        onSuccess={() => setCreateStepForPathId(null)}
                        onCancel={() => setCreateStepForPathId(null)}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <MenuNav
                      showDrop={showDrop}
                      setShowDrop={setShowDrop}
                      searchTerm={search}
                      setSearchterm={setSearch}
                      searchPlaceholder="Search Path..."
                    />
                    <div
                      className="services-main"
                      onClick={() => setShowDrop(false)}
                      style={{
                        height: "calc(100% - 70px)",
                        overflowY: "auto",
                        display: "block",
                        background: "#f5f7fa"
                      }}
                    >
                      <DraftPathView onAddStep={(pathId) => setCreateStepForPathId(pathId)} />
                    </div>
                  </>
                )
              ) : accsideNav === "CREATE_PATH" ? (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  width: "100%",
                  overflow: "hidden"
                }}>
                  <div style={{
                    padding: "0 35px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "0.5px solid #E5E5E5",
                    flexShrink: 0,
                    backgroundColor: "#ffffff"
                  }}>
                    <div style={{
                      padding: "10px 30px",
                      borderRadius: "35px",
                      fontWeight: "700",
                      fontSize: "15px",
                      color: "#1f304f",
                      background: "rgba(241, 241, 241, 0.5)"
                    }}>
                      Create New Path
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    padding: "0",
                    backgroundColor: "#ffffff"
                  }}>
                    <CreateNewPath
                      setpstep={setpstep}
                      setaccsideNav={setaccsideNav}
                      pathSubmission={pathSubmission}
                      pathSteps={pathSteps}
                      setPathSteps={setPathSteps}
                      setStepCount={setStepCount}
                      grade={grade}
                      setGrade={setGrade}
                      gradeAvg={gradeAvg}
                      setGradeAvg={setGradeAvg}
                      curriculum={curriculum}
                      setCurriculum={setCurriculum}
                      stream={stream}
                      setStream={setStream}
                      finance={finance}
                      setFinance={setFinance}
                      personality={personality}
                      setPersonality={setPersonality}
                      gradeList={gradeList}
                      gradePointAvg={gradePointAvg}
                      curriculumList={curriculumList}
                      streamList={streamList}
                      financeList={financeList}
                      personalityList={personalityList}
                      countryApiValue={countryApiValue}
                      handleGrade={handleGrade}
                      handleGradeAvg={handleGradeAvg}
                      handleCurriculum={handleCurriculum}
                      handleStream={handleStream}
                      handleFinance={handleFinance}
                      handlePersonality={handlePersonality}
                    />
                  </div>
                </div>
              ) : accsideNav === "CREATE_STEP" ? (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  width: "100%",
                  overflow: "hidden"
                }}>
                  <div style={{
                    padding: "0 35px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "0.5px solid #E5E5E5",
                    background: "#fff",
                    flexShrink: 0
                  }}>
                    <div style={{
                      padding: "10px 30px",
                      borderRadius: "35px",
                      fontWeight: "700",
                      background: "rgba(241,241,241,.5)"
                    }}>
                      Create New Step
                    </div>
                    <div
                      style={{
                        fontWeight: "600",
                        textDecorationLine: "underline",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        paddingRight: "35px"
                      }}
                      onClick={() => setaccsideNav("Paths")}
                    >
                      ← Back to My Paths
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    overflowY: "auto",
                    background: "#fff",
                    minHeight: 0
                  }}>
                    <CreateNewStep
                      inlineMode={true}
                      onCancel={() => setaccsideNav("Paths")}
                      onSuccess={() => setaccsideNav("Paths")}
                    />
                  </div>
                </div>
              ) : accsideNav === "CREATE_SERVICE" ? (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  width: "100%",
                  overflow: "hidden"
                }}>
                  <div style={{
                    padding: "0 35px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "0.5px solid #E5E5E5",
                    flexShrink: 0,
                    backgroundColor: "#ffffff"
                  }}>
                    <div style={{
                      padding: "10px 30px",
                      borderRadius: "35px",
                      fontWeight: "700",
                      fontSize: "15px",
                      color: "#1f304f",
                      background: "rgba(241, 241, 241, 0.5)"
                    }}>
                      Create New Service
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    padding: "0",
                    backgroundColor: "#ffffff"
                  }}>
                    <CreateNewService
                      setaccsideNav={setaccsideNav}
                    />
                  </div>
                </div>
              ) : accsideNav === "CRM" ? (
                <>
                  <MenuNav
                    showDrop={showDrop}
                    setShowDrop={setShowDrop}
                    searchTerm={search}
                    setSearchterm={setSearch}
                    searchPlaceholder={crmMenu === "Followers"
                      ? "Search Followers.."
                      : crmMenu === "Purchases"
                        ? "Search Purchases.."
                        : crmMenu === "Users"
                          ? "Search Users.."
                          : "Search Clients..."}
                  />
                  <div className="crm-main" onClick={() => setShowDrop(false)}>
                    <div className="crm-all-menu" style={{ padding: "12px 35px" }}>

                      {/* ── Clients Tab ── */}
                      <div
                        className="crm-each-menu"
                        style={{
                          marginLeft: "0px",
                          background: crmMenu === "Clients" ? "rgba(241, 241, 241, 0.5)" : "",
                          fontWeight: crmMenu === "Clients" ? "700" : "",
                        }}
                        onClick={() => {
                          setcrmMenu("Clients");
                          setSearch("");
                          navigate("/dashboard/accountants/crm?tab=clients");
                        }}
                      >
                        Clients ({crmClientData?.length})
                      </div>

                      {/* ── Purchases Tab ── */}
                      <div
                        className="crm-each-menu"
                        style={{
                          background: crmMenu === "Purchases" ? "rgba(241,241,241,0.5)" : "",
                          fontWeight: crmMenu === "Purchases" ? "700" : "",
                        }}
                        onClick={() => {
                          setcrmMenu("Purchases");
                          setSearch("");
                          navigate("/dashboard/accountants/crm?tab=purchases");
                        }}
                      >
                        Purchases ({crmPurchaseData.length})
                      </div>

                    </div>
                    <div className="crm-all-box">
                      {crmMenu === "Followers" ? (
                        <>
                          <div className="crm-follow-tab" style={{ padding: "10px 35px" }}>
                            <div className="crm-follow-col1">Name</div>
                            <div className="crm-follow-col2">Following Since</div>
                          </div>
                          <>
                            {followData.length > 0 && !isLoading ? (
                              <div className="follow-data-main">
                                {followData
                                  .filter((element) => element.userEmail.toLowerCase().startsWith(search.toLowerCase()))
                                  .map((each, i) => (
                                    <div
                                      className="follower-box"
                                      style={{
                                        background: selectedFollower === each ? "rgba(241, 241, 241, 0.5)" : "",
                                        padding: "22px 35px",
                                        width: "100%",
                                      }}
                                      onClick={() => setSelectedFollower(each)}
                                    >
                                      <div className="follower-details">
                                        <div><img className="user-icon" src={each.profile_img} alt="" /></div>
                                        <div>
                                          <div className="follower-mail">{each.username}</div>
                                          <div className="follower-name" style={{ textTransform: "lowercase" }}>{each.userEmail}</div>
                                        </div>
                                      </div>
                                      <div className="follow-time">{formatDate(each.timeStamp)}</div>
                                    </div>
                                  ))}
                              </div>
                            ) : isLoading ? (
                              <div className="follow-data-main">
                                {[1, 2, 3, 4, 5, 6].map((each, index) => (
                                  <div key={index} className="follower-box">
                                    <div className="follower-details">
                                      <div><Skeleton className="user-icon" /></div>
                                      <Skeleton className="follower-mail" style={{ width: "200px" }} />
                                    </div>
                                    <Skeleton className="follow-time" style={{ width: "150px" }} />
                                  </div>
                                ))}
                              </div>
                            ) : ""}
                          </>
                        </>
                      ) : crmMenu === "Purchases" ? (
                        <PurchasePage purchaseData={crmPurchaseData} search={search} />
                      ) : crmMenu === "Clients" ? (
                        <>
                          <div className="crm-tab" style={{ padding: "10px 35px" }}>
                            <div className="crm-each-col" style={{ margin: "0", width: "25%" }}>Name</div>
                            <div className="crm-each-col" style={{ margin: "0", width: "30%", paddingLeft: "1rem" }}>Email</div>
                            <div className="crm-each-col" style={{ margin: "0", width: "20%", paddingLeft: "1rem" }}>Phone</div>
                            <div className="crm-each-col" style={{ margin: "0", width: "15%", paddingLeft: "1rem" }}>Country</div>
                            <div className="crm-each-col" style={{ margin: "0", width: "10%", paddingLeft: "1rem" }}>Purchases</div>
                          </div>
                          <div className="clients-alldata">
                            {isClientLoading
                              ? Array(10).fill("").map((e, i) => (
                                <div className="each-clientData" key={i}>
                                  <div className="each-client-name"><Skeleton width={125} height={30} /></div>
                                  <div className="each-client-email"><Skeleton width={150} height={30} /></div>
                                  <div className="each-client-email"><Skeleton width={100} height={30} /></div>
                                  <div className="each-client-email"><Skeleton width={75} height={30} /></div>
                                  <div className="each-client-email"><Skeleton width={50} height={30} /></div>
                                </div>
                              ))
                              : crmClientData
                                ?.filter((item) =>
                                  item.name.toLowerCase().startsWith(search.toLowerCase()) ||
                                  item.email.toLowerCase().startsWith(search.toLowerCase())
                                )
                                ?.map((e, i) => (
                                  <div className="each-clientData" key={i}>
                                    <div className="each-client-name" style={{ width: "25%" }}>{e?.name}</div>
                                    <div className="each-client-email" style={{ width: "30%" }}>{e?.email}</div>
                                    <div className="each-client-email" style={{ width: "20%" }}>{e?.phoneNumber}</div>
                                    <div className="each-client-email" style={{ width: "15%" }}>{e?.country}</div>
                                    <div className="each-client-email" style={{ width: "10%" }}>{e?.purchaseDetails?.length}</div>
                                  </div>
                                ))}
                          </div>
                        </>
                      ) : crmMenu === "Users" ? (
                        <>
                          <div className="crm-tab" style={{ padding: "10px 35px" }}>
                            <div className="crm-each-col" style={{ textAlign: "left", margin: "0", width: "15%" }}>Name</div>
                            <div className="crm-each-col" style={{ textAlign: "left", margin: "0", width: "20%", paddingLeft: "1rem" }}>Email</div>
                            <div className="crm-each-col" style={{ textAlign: "left", margin: "0", width: "15%", paddingLeft: "1rem" }}>User Since</div>
                            <div className="crm-each-col" style={{ textAlign: "left", margin: "0", width: "25%", paddingLeft: "1rem" }}>Affiliate</div>
                            <div className="crm-each-col" style={{ textAlign: "left", margin: "0", width: "25%", paddingLeft: "1rem" }}>Profile ID</div>
                          </div>
                          <div className="users-alldata">
                            {isUserLoading
                              ? Array(10).fill("").map((e, i) => (
                                <div className="each-userData" key={i}>
                                  <div className="each-user-email" style={{ width: "15%" }}><Skeleton width={100} height={25} /></div>
                                  <div className="each-user-email"><Skeleton width={100} height={25} /></div>
                                  <div className="each-user-email" style={{ width: "15%" }}><Skeleton width={100} height={25} /></div>
                                  <div className="each-user-email" style={{ width: "25%" }}><Skeleton width={100} height={25} /></div>
                                  <div className="each-user-email" style={{ width: "25%" }}><Skeleton width={200} height={25} /></div>
                                </div>
                              ))
                              : crmUserData
                                ?.filter((item) =>
                                  item.name.toLowerCase().startsWith(search.toLowerCase()) ||
                                  item.email.toLowerCase().startsWith(search.toLowerCase())
                                )
                                .map((e, i) => (
                                  <div className="each-userData" key={i}>
                                    <div className="each-user-email" style={{ width: "15%" }}>{e?.name}</div>
                                    <div className="each-user-email" style={{ textTransform: "none", paddingLeft: "1rem" }}>{e?.email}</div>
                                    <div className="each-user-email" style={{ width: "15%", paddingLeft: "1rem" }}>
                                      {e?.naavi_timestamp ? customDateFormat(new Date(e.naavi_timestamp)) : ""}
                                    </div>
                                    <div className="each-user-email" style={{ width: "25%", textTransform: "none", paddingLeft: "1rem" }}>{e?.ref_affiliate}</div>
                                    <div className="each-user-email" style={{ width: "25%", textTransform: "none", paddingLeft: "1rem" }}>{e?.naavi_profile_id}</div>
                                  </div>
                                ))}
                          </div>
                        </>
                      ) : ""}
                    </div>
                  </div>
                </>
              ) : accsideNav === "Home" ? (
                <>
                  <MenuNav
                    showDrop={showDrop}
                    setShowDrop={setShowDrop}
                    searchTerm={search}
                    setSearchterm={setSearch}
                    searchPlaceholder="Search..."
                  />
                  <div className="services-main" onClick={() => setShowDrop(false)}>
                    <div style={{ padding: "35px" }}>
                      <p style={{ color: "#617388", marginTop: "8px" }}>
                        Welcome back, {getPartner()?.businessName || "Partner"}
                      </p>
                    </div>
                  </div>
                </>
              ) : accsideNav === "Marketplace" ? (
                <>
                  <MenuNav
                    showDrop={showDrop}
                    setShowDrop={setShowDrop}
                    searchTerm={search}
                    setSearchterm={setSearch}
                    searchPlaceholder="Search marketplace items by name, role, description..."
                  />
                  <div
                    className="services-main"
                    onClick={() => setShowDrop(false)}
                    style={{
                      height: "calc(100% - 70px)",
                      overflowY: "auto",
                      display: "block",
                      paddingBottom: "60px"
                    }}
                  >
                    <Marketplace search={search} selectedRole={selectedRole} />
                  </div>
                </>
              ) : accsideNav === "Calendar" ? (
                <>
                  <MenuNav
                    showDrop={showDrop}
                    setShowDrop={setShowDrop}
                    searchTerm={search}
                    setSearchterm={setSearch}
                    searchPlaceholder="Search Services..."
                  />
                  <div className="services-main" onClick={() => setShowDrop(false)}>
                    <EarningCalendar />
                  </div>
                </>
              ) : accsideNav === "Wallet" ? (
                transactionSelected ? (
                  <>
                    <MenuNav showDrop={showDrop} setShowDrop={setShowDrop} searchPlaceholder="Search..." />
                    <div className="services-main" style={{ height: "calc(100% - 70px)" }} onClick={() => setShowDrop(false)}>
                      <div className="services-all-menu" style={{ borderBottom: "0.5px solid #E5E5E5" }}>
                        <div style={{ display: "flex", width: "calc(100% - 110px)" }}>
                          <div
                            className="services-each-menu"
                            style={{
                              background: coinType === "fiat" ? "rgba(241, 241, 241, 0.5)" : "",
                              fontWeight: coinType === "fiat" ? "700" : "",
                            }}
                            onClick={() => { setCoinType("fiat"); setSearch(""); }}
                          >
                            Forex
                          </div>
                        </div>
                        <div
                          style={{ fontWeight: "600", textDecorationLine: "underline", cursor: "pointer", fontSize: "0.9rem" }}
                          onClick={() => { setTransactionSelected(false); setTransactionData([]); setSelectedCoin({}); }}
                        >
                          Back
                        </div>
                      </div>
                      <VaultTransactions />
                    </div>
                  </>
                ) : (
                  <>
                    <MenuNav
                      showDrop={showDrop}
                      setShowDrop={setShowDrop}
                      searchTerm={search}
                      setSearchterm={setSearch}
                      searchPlaceholder="Search Wallet..."
                    />
                    <div className="services-main" style={{ height: "calc(100% - 70px)" }} onClick={() => setShowDrop(false)}>
                      <div className="services-all-menu" style={{ borderBottom: "0.5px solid #E5E5E5" }}>
                        <div style={{ display: "flex", width: "83%" }}>
                          <div
                            className="services-each-menu"
                            style={{
                              background: coinType === "fiat" ? "rgba(241, 241, 241, 0.5)" : "",
                              fontWeight: coinType === "fiat" ? "700" : "",
                            }}
                            onClick={() => { setCoinType("fiat"); setSearch(""); }}
                          >
                            Forex
                          </div>
                        </div>
                        <div style={{ display: "flex" }}>
                          <Toggle toggle={balanceToggle} setToggle={setBalanceToggle} coinType={coinType} />
                        </div>
                      </div>
                      <Vaults searchedValue={search} />
                    </div>
                  </>
                )
              ) : accsideNav === "Tasks" ? (
                <>
                  <MenuNav
                    showDrop={showDrop}
                    setShowDrop={setShowDrop}
                    searchTerm={search}
                    setSearchterm={setSearch}
                    searchPlaceholder="Search..."
                  />
                  <div className="services-main" style={{ height: "calc(100% - 70px)" }} onClick={() => setShowDrop(false)}>
                    <Tasks />
                  </div>
                </>
              ) : accsideNav === "Paths" ? (
                <>
                  <MenuNav
                    showDrop={showDrop}
                    setShowDrop={setShowDrop}
                    searchTerm={search}
                    setSearchterm={setSearch}
                    searchPlaceholder={mypathsMenu === "Paths" ? "Search For Paths..." : "Search For Steps..."}
                  />
                  <div
                    className="services-main"
                    style={{ height: "calc(100% - 70px)", overflowY: "auto", display: "block", paddingBottom: "60px" }}
                    onClick={() => setShowDrop(false)}
                  >
                    <MyPaths search={search} fetchAllServicesAgain={fetchAllServicesAgain} />
                  </div>
                </>
              ) : accsideNav === "Steps" ? (
                <MyStepsAcc
                  search={search}
                  setSearch={setSearch}
                  showDrop={showDrop}
                  setShowDrop={setShowDrop}
                  loading={loading}
                  setLoading={setLoading}
                />
              ) : (
                <div className="services-main">Coming Soon</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keep all your existing modal code below - don't change anything */}
      <>
        {ispopular && accsideNav !== "CREATE_PATH" && !viewPathMode &&
          JSON.parse(localStorage.getItem("partner") || "{}")?.approvalStatus === "approved" ? (

          <>
            {/* ✅ BLUR OVERLAY */}
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
                  {pstep > 1 && pstep < 8
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
                    {/* <div className="acc-step-text">New</div> */}
                    <div>
                      <div
                        className="acc-step-box"
                        onClick={() => {
                          setselectNew("Service");
                          setispopular(false); // Close the modal
                          setaccsideNav("CREATE_SERVICE"); // Set navigation to show create service
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
                          setispopular(false); // Close the modal
                          setaccsideNav("CREATE_PATH"); // Set navigation to show create path
                          // Don't call resetpop() here - it might reset things we need
                        }}
                        style={{
                          background: selectNew === "Path" ? "#182542" : "",
                          color: selectNew === "Path" ? "#FFF" : "",
                        }}
                      >
                        Path
                      </div>

                      {/* <div
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
                    </div> */}
                      <div
                        className="acc-step-box"
                        data-type="bulk-service"
                        onClick={() => {
                          setselectNew("Bulk Service");
                          setpstep(13);
                        }}
                      >
                        Bulk Service
                      </div>

                      <div
                        className="acc-step-box"
                        data-type="bulk-path"
                        onClick={() => {
                          setselectNew("Bulk Path");
                          setpstep(10);
                        }}
                      >
                        Bulk Path
                      </div>

                      <div
                        className="acc-step-box"
                        data-type="bulk-step"
                        onClick={() => {
                          setselectNew("Bulk Step");
                          setpstep(11);
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
                          background:
                            billingType === "Monthly Subscription"
                              ? "#182542"
                              : "",
                          color:
                            billingType === "Monthly Subscription" ? "#FFF" : "",
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
                    <div
                      className="goBack"
                      onClick={() => {
                        setpstep(1);
                        setbillingType("");
                      }}
                    >
                      Go Back
                    </div>
                  </div>
                ) : pstep === 3 ? (
                  <div>
                    <div className="acc-step-text">
                      How would you categorize this product?
                    </div>
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
                              key={each._id}
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
                    <div
                      className="goBack"
                      onClick={() => {
                        setpstep(2);
                        setselectCategory("");
                      }}
                    >
                      Go Back
                    </div>
                  </div>
                ) : pstep === 4 ? (
                  <div>
                    <div className="acc-step-text">Service Information</div>
                    <div className="acc-step-allbox1">
                      <div className="acc-upload">
                        <div className="acc-upload-title">
                          Upload Profile Image
                        </div>
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
                            src={
                              isUploadLoading
                                ? upgif
                                : image
                                  ? image
                                  : uploadv
                            }
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
                          type="text"
                          placeholder="Service Description"
                          value={serviceDescription}
                          onChange={(e) => setServiceDescription(e.target.value)}
                        />
                      </div>
                      <div>
                        <div
                          className="goNext"
                          onClick={() => {
                            handleGetCurrencies();
                            setpstep(5);
                          }}
                        >
                          Next Step
                        </div>
                        <div
                          className="goBack1"
                          onClick={() => {
                            setpstep(3);
                            setServiceNameInput("");
                            setServiceCodeInput("");
                            setProductLabel("");
                            setServiceTagline("");
                            setServiceDescription("");
                            setCoverImageS3url("");
                            setImage(null);
                          }}
                        >
                          Go Back
                        </div>
                      </div>
                    </div>
                  </div>
                ) : pstep === 5 ? (
                  <div style={{ height: "calc(100% - 3rem)" }}>
                    <div className="acc-step-text">
                      What currency do you want to collect?
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "3.5rem",
                        border: "1px solid #e5e5e5",
                        borderRadius: "10px",
                        padding: "0 25px",
                        marginBottom: "1rem",
                        marginTop: "1rem",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Search Currency..."
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          fontSize: "1rem",
                          fontWeight: "500",
                        }}
                        onChange={(e) => {
                          setSearchCurrency(e.target.value);
                        }}
                        value={searchCurrency}
                      />
                    </div>
                    <>
                      {isCurrencies ? (
                        <div
                          className="acc-step-allbox"
                          style={{ height: "calc(100% - 76px - 7.5rem)" }}
                        >
                          {[1, 2, 3].map((each, i) => (
                            <div className="acc-step-box" key={i}>
                              <Skeleton style={{ width: "150px" }} />
                            </div>
                          ))}

                        </div>
                      ) : (
                        <div
                          className="acc-step-allbox"
                          style={{ height: "calc(100% - 76px - 7.5rem)" }}
                        >
                          {allCurrencies
                            ?.filter(
                              (entry) =>
                                entry?.coinName
                                  ?.toLowerCase()
                                  ?.includes(searchCurrency?.toLowerCase()) ||
                                entry?.coinSymbol
                                  ?.toLowerCase()
                                  ?.includes(searchCurrency?.toLowerCase())
                            )
                            .map((each, i) => (
                              <div
                                className="acc-step-box"
                                onClick={() => {
                                  setSelectedCurrency(each);
                                  setpstep(6);
                                  setSearchCurrency("");
                                }}
                                style={{
                                  background:
                                    selectedCurrency === each ? "#182542" : "",
                                  color: selectedCurrency === each ? "#FFF" : "",
                                }}
                              >
                                {each.coinName}
                              </div>
                            ))}
                        </div>
                      )}
                    </>
                    <div
                      className="goBack"
                      onClick={() => {
                        setpstep(4);
                        setSelectedCurrency({});
                        setSearchCurrency("");
                      }}
                    >
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
                          placeholder={
                            billingType === "One Time"
                              ? "Service Price"
                              : "First Months Price"
                          }
                          value={firstMonthPrice}
                          onChange={(e) => setfirstMonthPrice(e.target.value)}
                          onWheel={(e) => e.target.blur()}
                        />
                        <div className="acc-step-feildHead">
                          {selectedCurrency.coinSymbol}
                        </div>
                      </div>
                      <div
                        className="acc-step-box"
                        style={{
                          display: billingType === "One Time" ? "none" : "",
                        }}
                      >
                        <input
                          className="acc-step-input2"
                          type="number"
                          placeholder="Monthly Price"
                          value={monthlyPrice}
                          onChange={(e) => setmonthlyPrice(e.target.value)}
                          onWheel={(e) => e.target.blur()}
                        />
                        <div className="acc-step-feildHead">
                          {selectedCurrency.coinSymbol}
                        </div>
                      </div>
                      <div
                        className="acc-step-box"
                        style={{
                          display: billingType === "One Time" ? "none" : "",
                        }}
                      >
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
                      <div
                        className="acc-step-box"
                        style={{
                          display: billingType === "One Time" ? "none" : "",
                        }}
                      >
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
                      <div
                        className="acc-step-box"
                        style={{
                          display: billingType === "One Time" ? "none" : "",
                        }}
                      >
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
                        <div
                          style={{
                            position:
                              billingType === "One Time" ? "fixed" : "initial",
                            bottom: billingType === "One Time" ? "0px" : "",
                          }}
                        >
                          <div
                            className="goNext"
                            onClick={() => {
                              handleFinalSubmit();
                            }}
                          >
                            Submit
                          </div>
                          <div
                            className="goBack1"
                            onClick={() => {
                              setpstep(5);
                              setfirstMonthPrice("");
                              setmonthlyPrice("");
                              setgracePeriod("");
                              setsecondChargeAttempt("");
                              setthirdChargeAttempt("");
                            }}
                          >
                            Go Back
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      {isSubmit ? (
                        <div className="popularlogo">
                          <img className="popularlogoimg" src={lg1} alt="" />
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                ) : pstep === 7 ? (
                  <div className="success-box">
                    You Have Successfully Created A New Service
                  </div>
                ) : pstep === 10 ? (
                  <div>
                    <div className="acc-step-text">Bulk Path Action</div>
                    <div>
                      <div
                        className="acc-step-box"

                        style={{
                          background:
                            billingType === "Download"
                              ? "#182542"
                              : "",
                          color:
                            billingType === "Download" ? "#FFF" : "",
                        }}
                        onClick={e => handleDownload('Path')}
                      >
                        Download

                      </div>
                      <div
                        className="acc-step-box"
                        onClick={handleImageClick}
                        style={{
                          background: billingType === "Upload" ? "#182542" : "",
                          color: billingType === "Upload" ? "#FFF" : "",
                        }}
                      >
                        Upload
                        <input
                          type="file"
                          onChange={handleFileInputChange1}
                          style={{ display: "none" }}
                          ref={fileInputRef}
                        />

                      </div>

                    </div>
                    <div
                      className="goBack"
                      onClick={() => {
                        setpstep(1);
                      }}
                    >
                      Go Back
                    </div>
                  </div>
                ) : pstep === 11 ? (
                  <div>
                    <div className="acc-step-text">Bulk Step Action</div>
                    <div>
                      <div
                        className="acc-step-box"
                        onClick={e => handleDownload('Step')}
                        style={{
                          background:
                            billingType === "Download"
                              ? "#182542"
                              : "",
                          color:
                            billingType === "Download" ? "#FFF" : "",
                        }}

                      >
                        Download

                      </div>
                      <div
                        className="acc-step-box"
                        onClick={handleImageClick}
                        style={{
                          background: billingType === "Upload" ? "#182542" : "",
                          color: billingType === "Upload" ? "#FFF" : "",
                        }}
                      >
                        Upload
                        <input
                          type="file"
                          onChange={handleFileInputChange2}
                          style={{ display: "none" }}
                          ref={fileInputRef}
                        />

                      </div>

                    </div>
                    <div
                      className="goBack"
                      onClick={() => {
                        setpstep(1);
                      }}
                    >
                      Go Back
                    </div>
                  </div>
                ) : pstep === 12 ? (
                  <div>
                    <div className="acc-step-text">Uploaded Successfully</div>

                    <div
                      className="goBack"
                      onClick={() => {
                        setpstep(1);
                        setbillingType("");
                      }}
                    >
                      Go Back
                    </div>
                  </div>
                ) : pstep === 13 ? (
                  <div>
                    <div className="acc-step-text">Bulk Service Action</div>
                    <div>
                      <div
                        className="acc-step-box"

                        style={{
                          background:
                            billingType === "Download"
                              ? "#182542"
                              : "",
                          color:
                            billingType === "Download" ? "#FFF" : "",
                        }}
                        onClick={e => handleDownload('Service')}
                      >
                        Download

                      </div>
                      <div
                        className="acc-step-box"
                        onClick={handleImageClick}
                        style={{
                          background: billingType === "Upload" ? "#182542" : "",
                          color: billingType === "Upload" ? "#FFF" : "",
                        }}
                      >
                        Upload
                        <input
                          type="file"
                          onChange={handleFileInputChange3}
                          style={{ display: "none" }}
                          ref={fileInputRef}
                        />

                      </div>

                    </div>
                    <div
                      className="goBack"
                      onClick={() => {
                        setpstep(1);
                      }}
                    >
                      Go Back
                    </div>
                  </div>
                ) : (
                  ""
                )}


              </>
            </div>
          </>
        ) : (
          ""
        )}

        {showStepsModal && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "32px",
                padding: "40px",
                maxWidth: "500px",
                width: "90%",
                boxShadow: "0 30px 60px rgba(0,0,0,0.3)"
              }}
            >
              <h2 style={{ fontSize: "24px", color: "#0b1e3a", marginBottom: "16px" }}>
                Add Steps to Your Path
              </h2>

              <p style={{ color: "#617388", marginBottom: "24px" }}>
                How many steps do you want to add to this path? You can add as many as you need.
              </p>

              <input
                type="number"
                min="1"
                value={stepCount}
                onChange={(e) => setStepCount(e.target.value)}
                placeholder="Enter number of steps"
                style={{
                  width: "100%",
                  padding: "16px",
                  border: "1.5px solid #dce3ec",
                  borderRadius: "16px",
                  fontSize: "18px",
                  marginBottom: "24px"
                }}
              />

              <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowStepsModal(false)}
                  style={{
                    padding: "16px 42px",
                    borderRadius: "50px",
                    fontWeight: "700",
                    fontSize: "16px",
                    border: "2px solid #d3deed",
                    background: "white",
                    color: "#1f3a5f",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setShowStepsModal(false);
                    setispopular(false);
                    setaccsideNav("CREATE_STEP");
                  }}
                  style={{
                    padding: "16px 42px",
                    borderRadius: "50px",
                    fontWeight: "700",
                    fontSize: "16px",
                    border: "none",
                    background: "#2a9d8f",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        )}
      </>



      {/* Service Action Popup */}
      {serviceActionEnabled && (
        <div
          className="acc-popular1"
          style={{
            background: "linear-gradient(135deg, #e8f4fd 0%, #fef9e7 100%)",
            borderLeft: "4px solid #0d6b6e",
            boxShadow: "-8px 0 32px rgba(13, 107, 110, 0.15)",
            width: "520px",
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            zIndex: 999
          }}
        >
          <div
            className="acc-popular-top1"
            style={{
              background: "rgba(13, 107, 110, 0.08)",
              borderBottom: "1px solid rgba(13, 107, 110, 0.2)",
              padding: "20px 25px"
            }}
          >
            <div className="acc-popular-head1">
              {serviceActionStep === 1 && "Service Actions"}
              {serviceActionStep === 2 && "Edit Service"}
              {serviceActionStep === 3 && "Delete Service"}
              {serviceActionStep === 4 && "Service Details"}
              {serviceActionStep === 5 && "Change Icon"}
              {serviceActionStep === 6 && "Success"}
            </div>
            <div
              className="acc-popular-img-box1"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setServiceActionEnabled(false);
                setServiceActionStep(1);
                setSelectedService({});
              }}
            >
              <img className="acc-popular-img1" src={closepop} alt="" />
            </div>
          </div>

          <div className="acc-mt-div" style={{ overflowY: "auto", height: "calc(100vh - 80px)", paddingBottom: "30px" }}>      {serviceActionStep === 1 && (
            <div className="acc-scroll-div">
              <div
                className="acc-step-box4"
                onClick={() => setServiceActionStep(4)}
              >
                View Details
              </div>
              <div
                className="acc-step-box4"
                onClick={() => setServiceActionStep(2)}
              >
                Edit Service
              </div>
              <div
                className="acc-step-box4"
                onClick={() => setServiceActionStep(5)}
              >
                Change Icon
              </div>
              <div
                className="acc-step-box4"
                onClick={() => setServiceActionStep(3)}
              >
                Delete Service
              </div>
              <div className="goBack3" onClick={() => setServiceActionEnabled(false)}>
                Cancel
              </div>
            </div>
          )}

            {/* Step 2: Edit Service */}
            {serviceActionStep === 2 && (
              <div>
                <div className="acc-sub-text">Edit Service: {selectedService?.name}</div>
                <div className="acc-scroll-div">
                  <div className="acc-step-box4" style={{ height: "auto", padding: "1rem" }}>
                    <input
                      type="text"
                      placeholder="Service Name"
                      value={selectedService?.name || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, name: e.target.value })}
                      style={{ width: "100%", border: "none", outline: "none" }}
                    />
                  </div>
                  <div className="acc-step-box4" style={{ height: "auto", padding: "1rem" }}>
                    <textarea
                      placeholder="Description"
                      value={selectedService?.description || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, description: e.target.value })}
                      style={{ width: "100%", border: "none", outline: "none", minHeight: "100px" }}
                    />
                  </div>
                  <div className="acc-step-box4" onClick={() => {/* Save logic */ }}>
                    Save Changes
                  </div>
                </div>
                <div className="goBack3" onClick={() => setServiceActionStep(1)}>
                  Go Back
                </div>
              </div>
            )}

            {/* Step 3: Delete Confirmation */}
            {serviceActionStep === 3 && (
              <div>
                <div className="acc-sub-text">
                  Are you sure you want to delete "{selectedService?.name}"?
                </div>
                <div className="acc-scroll-div">
                  <div className="acc-step-box4" onClick={deleteService}>
                    Yes, Delete
                  </div>
                </div>
                <div className="goBack3" onClick={() => setServiceActionStep(1)}>
                  Cancel
                </div>
              </div>
            )}

            {serviceActionStep === 4 && (
              <div className="service-details-modal" style={{ paddingBottom: "80px" }}>

                {/* Service Name */}
                <div className="detail-section">
                  <h4>Service Name</h4>
                  <p className="service-name-large">
                    {selectedService?.name || 'Unnamed Service'}
                  </p>
                </div>

                {/* Description */}
                <div className="detail-section">
                  <h4>Description</h4>
                  <p>{selectedService?.description || selectedService?.sub_text || 'No description provided.'}</p>
                </div>

                {/* Path & Step Association */}
                <div className="detail-section">
                  <h4>Path & Step Association</h4>
                  <div className="detail-grid">
                    {selectedService?.path_id ? (
                      <div className="detail-item">
                        <div className="label">Path ID</div>
                        <div className="value">{selectedService.path_id}</div>
                      </div>
                    ) : (
                      <div className="detail-item">
                        <div className="label">Path</div>
                        <div className="value">Not linked to any path</div>
                      </div>
                    )}
                    {selectedService?.step_id ? (
                      <div className="detail-item">
                        <div className="label">Step ID</div>
                        <div className="value">{selectedService.step_id}</div>
                      </div>
                    ) : (
                      <div className="detail-item">
                        <div className="label">Step</div>
                        <div className="value">Not linked to any step</div>
                      </div>
                    )}
                    {selectedService?.macro_name && (
                      <div className="detail-item">
                        <div className="label">Macro</div>
                        <div className="value">{selectedService.macro_name}</div>
                      </div>
                    )}
                    {selectedService?.micro_name && (
                      <div className="detail-item">
                        <div className="label">Micro</div>
                        <div className="value">{selectedService.micro_name}</div>
                      </div>
                    )}
                    {selectedService?.nano_name && (
                      <div className="detail-item">
                        <div className="label">Nano</div>
                        <div className="value">{selectedService.nano_name}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Billing Details */}
                <div className="detail-section">
                  <h4>Billing Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="label">Billing Type</div>
                      <div className="value">
                        {getBillingInfo(selectedService?.billing_cycle).type}
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="label">Price</div>
                      <div className="value">
                        {getBillingInfo(selectedService?.billing_cycle).price === '-'
                          ? '0'
                          : getBillingInfo(selectedService?.billing_cycle).price}{' '}
                        {getBillingInfo(selectedService?.billing_cycle).coin}
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="label">Service Code</div>
                      <div className="value">
                        {selectedService?.product_code || '-'}
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="label">Product Label</div>
                      <div className="value">
                        {selectedService?.custom_product_label || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="detail-section">
                  <h4>Additional Information</h4>
                  <div className="detail-grid">
                    {selectedService?.goal && (
                      <div className="detail-item">
                        <div className="label">Goal</div>
                        <div className="value">{selectedService.goal}</div>
                      </div>
                    )}
                    {selectedService?.duration && (
                      <div className="detail-item">
                        <div className="label">Duration</div>
                        <div className="value">{selectedService.duration}</div>
                      </div>
                    )}
                    {selectedService?.outcomes && (
                      <div className="detail-item">
                        <div className="label">Outcomes</div>
                        <div className="value">{selectedService.outcomes}</div>
                      </div>
                    )}
                    {selectedService?.iterations && (
                      <div className="detail-item">
                        <div className="label">Iterations</div>
                        <div className="value">{selectedService.iterations}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="detail-section">
                  <h4>Features</h4>
                  <p>
                    {selectedService?.features ||
                      selectedService?.description ||
                      'No features listed.'}
                  </p>
                </div>

                {/* Metadata */}
                <div className="detail-section">
                  <h4>Metadata</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="label">Created</div>
                      <div className="value">
                        {selectedService?.createdAt
                          ? new Date(selectedService.createdAt).toLocaleDateString()
                          : '-'}
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="label">Last Updated</div>
                      <div className="value">
                        {selectedService?.updatedAt
                          ? new Date(selectedService.updatedAt).toLocaleDateString()
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close button - inline not fixed */}
                <div
                  style={{
                    padding: "15px 0",
                    display: "flex",
                    justifyContent: "center"
                  }}
                >
                  <button
                    onClick={() => setServiceActionStep(1)}
                    style={{
                      width: "100%",
                      height: "50px",
                      background: "#e2edf5",
                      border: "none",
                      borderRadius: "35px",
                      fontWeight: "600",
                      fontSize: "15px",
                      cursor: "pointer",
                      color: "#1f304f"
                    }}
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Change Icon */}
            {serviceActionStep === 5 && (
              <div>
                <div className="acc-sub-text">Upload New Icon</div>
                <div className="acc-upload-imgbox" style={{ margin: "20px auto", width: "120px", height: "120px" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const uploadedUrl = await uploadImageFunc(e, setUpdatedIcon, setIsloading);
                        if (uploadedUrl) {
                          setUpdatedIcon(uploadedUrl);
                        }
                      }
                    }}
                    style={{ display: "none" }}
                    id="icon-upload"
                  />
                  <label htmlFor="icon-upload" style={{ cursor: "pointer", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img
                      className="acc-upload-img"
                      src={updatedIcon || selectedService?.product_icon || uploadv}
                      alt=""
                      style={{ width: "80px", height: "80px", objectFit: "cover" }}
                    />
                  </label>
                </div>
                <div className="acc-scroll-div">
                  <div className="acc-step-box4" onClick={changeServiceIcon}>
                    Save Icon
                  </div>
                </div>
                <div className="goBack3" onClick={() => setServiceActionStep(1)}>
                  Cancel
                </div>
              </div>
            )}

            {/* Step 6: Success Message */}
            {serviceActionStep === 6 && (
              <div className="success-box1">Action Completed Successfully!</div>
            )}
          </div>

          {isloading && (
            <div className="popularlogo">
              <img className="popularlogoimg" src={lg1} alt="" />
            </div>
          )}
        </div>
      )}


      {/* Keep all your other modal code (coinActionEnabled, serviceActionEnabled, addCompPlan) exactly as is */}
      {/* ... */}

      <ToastContainer />
    </div>
  );
};

export default AccDashboard;

export const ImageUploadDivProfilePic = ({ setFunc, funcValue }) => {
  const {
    planBAccountPicUploading,
    setplanBAccountPicUploading,
    setSelectedDropDown,
  } = useStore();

  return (
    <div
      className="imageUploadDiv"
      onClick={() => setSelectedDropDown("")}
      style={{
        width: "120px",
        height: "120px",
        border: "0.5px solid #e7e7e7",
        borderRadius: "50%",
      }}
    >
      {funcValue ? (
        <div
          className="imageDiv"
          style={{ height: "100%", width: "100%", marginRight: "0" }}
        >
          <img
            src={funcValue}
            alt="planBAccountPic"
            className="profileImg"
            htmlFor="profileUpdateImgPlanB"
            style={{ width: "100%", height: "100%", borderRadius: "50%" }}
          />
        </div>
      ) : (
        <label
          htmlFor="profileUpdateImgPlanB"
          className="uploadFileDiv"
          style={{
            width: "100%",
            height: "100%",
            marginBottom: "0",
          }}
        >
          <input
            className="uploadNewPicPlanB"
            type="file"
            onChange={(e) => {
              uploadImageFunc(e, setFunc, setplanBAccountPicUploading);
            }}
            accept="image/*"
            id="profileUpdateImgPlanB"
          />
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "none",
            }}
          >
            {planBAccountPicUploading ? (
              <div>Uploading...</div>
            ) : (
              <div>
                <img
                  src={upload}
                  alt=""
                  style={{ width: "30px", height: "30px" }}
                />
              </div>
            )}
          </div>
        </label>
      )}
    </div>
  );
};