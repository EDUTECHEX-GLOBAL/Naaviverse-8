import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
import axios from "axios";

import AdminCRM from "./Admincrm.jsx";
import { useNavigate } from "react-router-dom";
import "./accDashboard.scss";
import Dashboard from "./Dashboard";
import { Outlet, useLocation } from "react-router-dom";
import AdminMarketplace from "./AdminMarketplace";
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
import close from "../../images/close.svg";
import upload from "../../images/upload.svg";
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
import MyPaths1 from "../MyPathsAdmin/index.jsx";
import NewStep1 from "../../globalComponents/GlobalDrawer/NewStep1";
import VaultTransactions from "../VaultTransactions/index.jsx";
import { Country, State, City } from "country-state-city";
import MyPathsAdmin from "../MyPathsAdmin/index.jsx";
import AdminAccDashsidebar from "../../components/AdminAccDashsidebar/index.jsx";
import AdminStepDataPage from "./AdminStepDataPage.jsx";
import MyStepsAdmin from "./MyStepsAdmin/index.jsx";
import MenuNav from "../../components/MenuNav/index.jsx";
import EditServiceForm from "./EditServices";
import Subscriptions from "./Subscriptions.jsx";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AccDashboard = () => {
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

  /* ---------------- BASIC UI STATES ---------------- */
  const [search, setSearch] = useState("");
  const [crmMenu, setcrmMenu] = useState("Clients");
  const [servicesMenu, setservicesMenu] = useState("Active Services");
  const [showAdminProfile, setShowAdminProfile] = useState(false);

  /* ---------------- CRM STATES ---------------- */
  const [crmUserData, setCrmUserData] = useState([]);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [partnerData, setPartnerData] = useState([]);
  const [followData, setfollowData] = useState([]);

  /* ---------------- PAGINATION ---------------- */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ---------------- SAFE PAGINATION CALCULATIONS ---------------- */
  const safeUsers = Array.isArray(crmUserData) ? crmUserData : [];
  const totalPages = Math.ceil(safeUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = safeUsers.slice(startIndex, endIndex);

  /* ---------------- OTHER STATES ---------------- */
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const [isCatoading, setIsCatLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [followCount, setfollowCount] = useState(0);
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
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDrawerOpen, setServiceDrawerOpen] = useState(false);
  const [serviceMode, setServiceMode] = useState("actions");
  const [isloading, setIsloading] = useState(false);
  const [updatedIcon, setUpdatedIcon] = useState("");
  const [serviceStatus, setServiceStatus] = useState("active");

  // routing
  const location = useLocation();
  const isProfilePage = location.pathname === "/admin/dashboard/profile";

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

  const [universitiesData, setUniversitiesData] = useState([]);
  const [isUniLoading, setIsUniLoading] = useState(false);

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

  let navigate = useNavigate();

  //users data
  //clients data
  const [crmClientData, setCrmClientData] = useState([]);
  const [isClientLoading, setClientLoading] = useState(false);

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
    transactionSelected,
    setTransactionSelected,
    setTransactionData,
    setSelectedCoin,
    coinActionEnabled,
    setCoinActionEnabled,
    coinAction,
    setCoinAction,
    selectedCoin,
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
    countryApiValue,
  } = useCoinContextData();

  const URL_TO_NAV = {
    "/admin/dashboard/accountants": "Overview",
    "/admin/dashboard/crm": "CRM",
    "/admin/dashboard/paths": "Paths",
    "/admin/dashboard/steps": "Steps",
    "/admin/dashboard/marketplace": "Marketplace",
  };
  const [profileId, setProfileId] = useState("");

  // Get user details safely
  const getUserDetails = () => {
    try {
      const user = localStorage.getItem("adminuser");
      return user ? JSON.parse(user) : {};
    } catch (error) {
      console.error("Error parsing user data:", error);
      return {};
    }
  };

  const userDetails = getUserDetails();

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

  useEffect(() => {
    if (accsideNav === "Universities") loadUniversities();
  }, [accsideNav]);

  const loadUniversities = async () => {
    setIsUniLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/universities`);
      if (res.data.status) setUniversitiesData(res.data.data);
    } catch (err) {
      console.log("Error loading universities", err);
    }
    setIsUniLoading(false);
  };

  // useEffect(() => {
  //   axios.get(`https://careers.marketsverse.com/paths/get`).then((res) => {
  //     let result = res?.data?.data;
  //     setBackupPathList(result || []);
  //   });
  // }, []);

  const addBackupPath = (backupPathId, selectedStepId) => {
    if (pathSteps?.the_ids) {
      pathSteps.the_ids.map((item) => {
        if (item.step_id === selectedStepId) {
          item.backup_pathId = backupPathId;
        }
      });
    }
    setShowBackupPathList(false);
  };

  useEffect(() => {
    if (userDetails) {
      setPathSteps((prev) => ({
        ...prev,
        email: userDetails?.email || "",
      }));
    }
  }, []);

  useEffect(() => {
    handleFollowerPerAccountants();
    handleGetCurrencies();
    resetpop();

    const userDetails = getUserDetails();
    if (!userDetails?.email) {
      navigate("/admin/login");
    }
  }, []);


  useEffect(() => {
    const navTitle = URL_TO_NAV[location.pathname];
    if (navTitle) {
      setaccsideNav(navTitle);
    }
  }, [location.pathname]);

  useEffect(() => {
    resetpop();
    if (accsideNav === "CRM" && crmMenu === "Followers") {
      handleFollowerPerAccountants();
    } else if (accsideNav === "CRM" && crmMenu === "Purchases") {
      handleAllCustomerLicenses();
    } else if (accsideNav === "Services") {
      getAdminServices();
    }
  }, [crmMenu, servicesMenu, accsideNav]);

  const uploadCoverImage = async (file) => {
    setIsUploadLoading(true);
    try {
      const fileName = `${new Date().getTime()}${file.name.substr(
        file.name.lastIndexOf(".")
      )}`;

      const formData = new FormData();
      const newfile = renameFile(file, fileName);
      formData.append("files", newfile);

      const { data } = await axios.post(
        `https://insurance.apimachine.com/insurance/general/upload`,
        formData,
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      if (data?.length > 0) {
        setCoverImageS3url(data[0]?.urlName);
        return data[0]?.urlName;
      }
    } catch (error) {
      console.log("error in uploading image", error);
    } finally {
      setIsUploadLoading(false);
    }
  };

  const uploadBulkPath = async (file) => {
    setIsUploadLoading(true);
    try {
      const fileName = `${new Date().getTime()}${file?.name?.substr(
        file.name.lastIndexOf(".")
      )}`;

      const formData = new FormData();
      const newfile = renameFile(file, fileName);
      formData.append("file", newfile);

      const { data } = await axios.post(
        `https://careers.marketsverse.com/paths/addmultiplepaths`,
        formData,
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      if (data?.status) {
        setpstep(12);
      }
    } catch (error) {
      console.log("error in uploading bulk path", error);
    } finally {
      setIsUploadLoading(false);
    }
  };

  const uploadBulkStep = async (file) => {
    setIsUploadLoading(true);
    try {
      const fileName = `${new Date().getTime()}${file?.name?.substr(
        file.name.lastIndexOf(".")
      )}`;

      const formData = new FormData();
      const newfile = renameFile(file, fileName);
      formData.append("file", newfile);

      const { data } = await axios.post(
        `${BASE_URL}/api/steps/addmultiplesteps`,
        formData,
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      if (data?.status) {
        setpstep(12);
      }
    } catch (error) {
      console.log("error in uploading bulk step", error);
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
      console.log(error);
    }
  };

  function renameFile(originalFile, newName) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

  const handleFollowerPerAccountants = () => {
    setIsLoading(true);
    const mailId = userDetails?.email;

    if (!mailId) {
      setIsLoading(false);
      return;
    }

    GetFollowersPerAccount(mailId)
      .then((res) => {
        const result = res?.data;
        if (result?.status) {
          setfollowCount(result?.data?.count || 0);
          setfollowData(result?.data?.followers || []);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
        toast.error("Something Went Wrong!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };

  const handleAllCustomerLicenses = () => {
    const userDetails = getUserDetails();
    setIsPurchaseLoading(true);

    if (!userDetails?.user?.email) {
      setIsPurchaseLoading(false);
      return;
    }

    GetAllCustomerLicenses(userDetails.user.email)
      .then((res) => {
        const result = res.data;
        if (result.status) {
          setPurchaseData(result.licenses || []);
        }
        setIsPurchaseLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsPurchaseLoading(false);
      });
  };

  const getPartnerData = () => {
    axios.get(`${BASE_URL}/api/partner/getpartners`).then(({ data }) => {
      if (data.success) {
        setPartnerData(data?.partners || []);
      }
    });
  };

  useEffect(() => {
    if (crmMenu === "Partners") {
      getPartnerData();
    }
  }, [crmMenu]);

  const handleCategories = () => {
    setIsCatLoading(true);
    GetCategoriesAcc()
      .then((res) => {
        const result = res.data;
        if (result.status) {
          setcategoriesData(result.categories || []);
        }
        setIsCatLoading(false);
      })
      .catch((err) => {
        setIsCatLoading(false);
        console.log(err);
        toast.error("Something Went Wrong!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };

  const handleGetCurrencies = () => {
    setIsCurrencies(true);
    GetAllCurrencies()
      .then((res) => {
        const result = res?.data;
        if (result?.status) {
          setallCurrencies(result?.coins || []);
        }
        setIsCurrencies(false);
      })
      .catch((err) => {
        console.log(err);
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
    setCoverImageS3url("");
    setImage(null);
    setPathSteps({
      email: userDetails?.email || "",
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
  };

  useEffect(() => {
    const openProfile = () => setShowAdminProfile(true);
    window.addEventListener("openAdminProfile", openProfile);
    return () => window.removeEventListener("openAdminProfile", openProfile);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      uploadCoverImage(e.target.files[0]);
    }
  };

  const handleFileInputChange1 = (e) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      uploadBulkPath(e.target.files[0]);
    }
  };

  const handleFileInputChange2 = (e) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      uploadBulkStep(e.target.files[0]);
    }
  };

  const myTimeoutService = () => {
    setTimeout(reloadService, 3000);
  };

  function reloadService() {
    setpstep(1);
    setispopular(false);
    setaccsideNav("Services");
    setservicesMenu("Services");
  }

  const handleFinalSubmit = () => {
    setIsSubmit(true);
    const userDetails = getUserDetails();

    if (!userDetails?.email || !selectedCurrency?.coinSymbol) {
      setIsSubmit(false);
      toast.error("Missing required fields");
      return;
    }

    const baseObj = {
      email: userDetails.email,
      token: userDetails.idToken,
      product_code: serviceCodeInput,
      product_name: serviceNameInput,
      product_icon: coverImageS3url,
      revenue_account: userDetails.email,
      client_app: "naavi",
      product_category_code: "CoE",
      sub_category_code: "",
      custom_product_label: productLabel,
      points_creation: false,
      sub_text: serviceTagline,
      full_description: serviceDescription,
      first_purchase: {
        price: firstMonthPrice ? parseFloat(firstMonthPrice) : 0,
        coin: selectedCurrency.coinSymbol,
      },
      staking_allowed: false,
      staking_details: {},
    };

    const objmonthly = {
      ...baseObj,
      billing_cycle: {
        monthly: {
          price: monthlyPrice ? parseFloat(monthlyPrice) : 0,
          coin: selectedCurrency.coinSymbol,
        },
      },
      grace_period: gracePeriod ? parseFloat(gracePeriod) : 0,
      first_retry: secondChargeAttempt ? parseFloat(secondChargeAttempt) : 0,
      second_retry: thirdChargeAttempt ? parseFloat(thirdChargeAttempt) : 0,
    };

    const objone = {
      ...baseObj,
      billing_cycle: {
        lifetime: {
          price: firstMonthPrice ? parseFloat(firstMonthPrice) : 0,
          coin: selectedCurrency.coinSymbol,
        },
      },
      grace_period: 0,
      first_retry: 0,
      second_retry: 0,
    };

    const obj = billingType === "One Time" ? objone : objmonthly;

    CreatePopularService(obj)
      .then((res) => {
        const result = res.data;
        if (result.status) {
          myTimeoutService();
          setpstep(7);
          resetpop();
        }
        setIsSubmit(false);
      })
      .catch((err) => {
        console.log(err);
        setIsSubmit(false);
      });
  };

  const fetchAllServicesAgain = () => {
    getAdminServices();
  };

  useEffect(() => {
    if (!ispopular && accsideNav === "Services") {
      getAdminServices();
    }
  }, [ispopular, accsideNav, servicesMenu]);

  const myTimeout = () => {
    setTimeout(reload, 3000);
  };

  function reload() {
    setServiceDrawerOpen(false);
    setServiceMode("actions");
    setSelectedService(null);
    setUpdatedIcon("");
    getAdminServices();
  }

  const deleteService = () => {
    setIsloading(true);
    axios
      .delete(`/admin/services/delete/${selectedService?._id}`)
      .then((res) => {
        console.log("Deleted:", res.data);
        myTimeout();
      })
      .catch((err) => console.log("Delete error:", err))
      .finally(() => setIsloading(false));
  };

  const restoreService = () => {
    setIsloading(true);
    axios
      .put(`/admin/services/restore/${selectedService?._id}`)
      .then(({ data }) => {
        console.log("Service Restored:", data);
        if (data.status) {
          myTimeout();
        }
      })
      .catch((err) => {
        console.log("Restore Error:", err);
      })
      .finally(() => setIsloading(false));
  };

  // const changeServiceIcon = () => {
  //   setIsloading(true);
  //   const obj = {
  //     email: userDetails?.email,
  //     token: userDetails?.idToken,
  //     field_name: "product_icon",
  //     field_value: updatedIcon,
  //     product_id: selectedService?.product_id,
  //   };
  //   axios
  //     .post(`https://comms.globalxchange.io/gxb/product/edit`, obj)
  //     .then((response) => {
  //       const result = response?.data;
  //       if (result?.status) {
  //         myTimeout();
  //       }
  //     })
  //     .catch((error) => {
  //       console.log(error, "error in changeServiceIcon");
  //     })
  //     .finally(() => setIsloading(false));
  // };

  // const getAppsforUser = () => {
  //   setIsfetching(true);
  //   axios
  //     .get("https://comms.globalxchange.io/gxb/apps/get")
  //     .then((response) => {
  //       const result = response?.data?.apps;
  //       setUserCreatedApps(result || []);
  //       setIsfetching(false);
  //     })
  //     .catch((error) => {
  //       console.log(error, "getAppsforUser error");
  //       setIsfetching(false);
  //     });
  // };

  useEffect(() => {
    if (pathSteps) {
      console.log(pathSteps);
    }
  }, [pathSteps]);

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
    setservicesMenu("With CompPlan");
  }

  const addComplan = () => {
    setAddingComp(true);

    const fixedPayouts = inputValues.map((e, i) => ({
      level: i,
      percentage: e,
    }));

    const numValues = multiplier.map((e, i) => ({
      level: i,
      numerator: e,
    }));

    const obj = {
      email: userDetails?.email,
      token: userDetails?.idToken,
      app_code: compPlanApp,
      product_id: selectedService?.product_id,
      comp_plan_id: "comp4",
      fixed_payouts: fixedPayouts,
      numeratorValues: numValues,
    };

    addCompPlanFunction(obj)
      .then((response) => {
        const result = response?.data;
        if (result?.status) {
          setAddCompPlanStep("step6");
          myTimeout1();
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setAddingComp(false));
  };

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

  // const getWithCompPlan = () => {
  //   setGettingData(true);
  //   const obj = {
  //     product_creator: userDetails?.user?.email,
  //   };
  //   axios
  //     .post(
  //       `https://comms.globalxchange.io/gxb/product/price/with/fees/get`,
  //       obj
  //     )
  //     .then((response) => {
  //       const result = response?.data?.products;
  //       setWithCompPlanData(result || []);
  //       setGettingData(false);
  //     })
  //     .catch((error) => {
  //       console.log(error, "error in getWithCompPlan");
  //       setGettingData(false);
  //     });
  // };

  // useEffect(() => {
  //   getWithCompPlan();
  // }, []);

  useEffect(() => {
    const email = userDetails?.email;
    if (email) {
      axios
        .get(`${BASE_URL}/api/steps/get?email=${email}`)
        .then((response) => {
          const result = response?.data?.data;
          setAllSteps(result || []);
        })
        .catch((error) => {
          console.log(error, "error in fetching all steps");
        });
    }
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
      })
      .then((response) => {
        const result = response?.data;
        if (result?.status) {
          window.location.reload();
        }
      })
      .catch((error) => {
        console.log(error, "error in pathSubmission");
      })
      .finally(() => setCreatingPath(false));
  };

  const removeStep = (stepId) => {
    const updatedSelectedSteps = selectedSteps.filter(
      (step) => step?._id !== stepId
    );
    setSelectedSteps(updatedSelectedSteps);

    const updatedTheIds = pathSteps?.the_ids?.filter(
      (obj) => obj?.step_id !== stepId
    );
    setPathSteps({
      ...pathSteps,
      the_ids: updatedTheIds || [],
    });
  };

  useEffect(() => {
    if (accsideNav === "CRM" && crmMenu === "Clients") {
      setIsUserLoading(true);
      axios
        .get(`${BASE_URL}/api/users`)
        .then((response) => {
          setCrmUserData(response?.data?.data || []);
          setIsUserLoading(false);
        })
        .catch(() => setIsUserLoading(false));
    }
  }, [accsideNav, crmMenu]);

  function customDateFormat(date) {
    if (date instanceof Date && !isNaN(date.valueOf())) {
      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "long" });
      const year = date.getFullYear();

      const suffix =
        day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th";

      return `${month} ${day}${suffix} ${year}`;
    }
    return "";
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
  // useEffect(() => {
  //   const email = userDetails?.email;
  //   if (coinAction?.includes("Add") && addActionStep === 1 && email) {
  //     axios
  //       .get(`https://comms.globalxchange.io/user/details/get?email=${email}`)
  //       .then((res) => {
  //         const { data } = res;
  //         if (data?.status) {
  //           setProfileId(data?.user?.["naavi_profile_id"] || "");
  //         }
  //       });
  //   }
  // }, [coinAction, addActionStep, userDetails?.email]);

  // get payment methods for forex add action
  // useEffect(() => {
  //   if (coinAction?.includes("Add") && selectedCoin?.coinSymbol) {
  //     axios
  //       .get(
  //         `https://comms.globalxchange.io/coin/vault/service/payment/stats/get?select_type=fund&to_currency=${selectedCoin?.coinSymbol}&from_currency=${selectedCoin?.coinSymbol}&country=India&banker=shorupan@indianotc.com`
  //       )
  //       .then((response) => {
  //         const result = response?.data?.pathData?.paymentMethod;
  //         setPaymentMethodData(result || []);
  //       })
  //       .catch((error) => {
  //         console.log(error, "error in fetching payment methods");
  //       });
  //   }
  // }, [coinAction, selectedCoin]);

  // const getPathId = () => {
  //   axios
  //     .get(
  //       `https://comms.globalxchange.io/coin/vault/service/payment/paths/get?from_currency=${selectedCoin?.coinSymbol}&to_currency=${selectedCoin?.coinSymbol}&select_type=fund&banker=shorupan@indianotc.com&paymentMethod=${selectedPaymentMethod}`
  //     )
  //     .then((response) => {
  //       const result = response?.data?.paths;
  //       if (result?.length > 0) {
  //         setForexPathId(result[0]?.path_id);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log(error, "error in getPathId");
  //     });
  // };

  const onBlur = (e) => {
    const float = parseFloat(e.target.value);
    setAddForexAmount(float.toFixed(2));
  };

  const getQuote = () => {
    if (!addForexAmount || !selectedCoin?.coinSymbol) {
      console.warn("Missing amount or coin");
      return;
    }

    const mockQuote = {
      status: true,
      coin: selectedCoin.coinSymbol,
      amount: addForexAmount,
      paymentMethod: selectedPaymentMethod || "N/A",
      path_id: forexPathId || null,
      message: "Quote generated locally",
      timestamp: Date.now(),
    };

    setForexQuote(mockQuote);
    setAddActionStep(3);
  };

  // =============== SERVICES STATES ===============
  const [allAdminServices, setAllAdminServices] = useState([]);
  const [filteredAdminServices, setFilteredAdminServices] = useState([]);

  const getAdminServices = () => {
    setIsUserLoading(true);
    axios
      .get(`${BASE_URL}/api/services/admin?status=all`)
      .then(({ data }) => {
        if (data?.status) {
          setAllAdminServices(data.data || []);
        } else {
          setAllAdminServices([]);
          setFilteredAdminServices([]);
        }
        setIsUserLoading(false);
      })
      .catch((err) => {
        console.log("Admin API Error:", err);
        setAllAdminServices([]);
        setFilteredAdminServices([]);
        setIsUserLoading(false);
      });
  };

  useEffect(() => {
    if (serviceStatus === "all") {
      setFilteredAdminServices(allAdminServices);
    } else if (serviceStatus === "active") {
      setFilteredAdminServices(
        allAdminServices.filter((s) => s?.status === "active")
      );
    } else if (serviceStatus === "inactive") {
      setFilteredAdminServices(
        allAdminServices.filter((s) => s?.status === "inactive")
      );
    }
  }, [serviceStatus, allAdminServices]);

  useEffect(() => {
    getAdminServices();
  }, [serviceStatus]);

  const conditionalBilling = (item) => {
    if (item === "lifetime") return "One Time";
    if (item === "monthly") return "Monthly";
    if (item === "annual") return "Annual";
    return item;
  };

  return (
    <div>
      <div className="dashboard-main">
        <div className="dashboard-body">
          {/* SIDEBAR */}
          <div onClick={() => setShowDrop(false)}>
            <AdminAccDashsidebar admin={true} />
          </div>

          {/* MAIN CONTENT */}
          <div
            className="dashboard-screens"
            onClick={() => resetpop()}
            style={{
              height: "100vh",
              overflow: "auto",
              flex : 1,
              maxWidth: "calc(100vw - 220px)",
              width: "calc(100% - 20px)",
            }}
          >
            <div style={{ height: "100%" }}>
              {/* PROFILE ROUTE HANDLER */}
              {isProfilePage ? (
                <Outlet />
              ) : (
                <>
                  {/* ── DASHBOARD OVERVIEW ────────────────────────────────────
                      FIX 1: Added this block — was missing entirely.
                      FIX 2: "Dashboard" added to the known nav list below
                      so it never hits the "Coming Soon" fallback.          */}
                 {(accsideNav === "Dashboard" || accsideNav === "Overview") && <Dashboard />}

                  {accsideNav === "CRM" && <AdminCRM />}


                  {accsideNav === "Subscriptions" && (
  <Subscriptions />
)}

                  {/* MARKETPLACE SECTION */}
                  {accsideNav === "Marketplace" && (
                    <AdminMarketplace />
                  )}

                  {/* CALENDAR SECTION */}
                  {accsideNav === "Calendar" && (
                    <>
                      <MenuNav
                        showDrop={showDrop}
                        setShowDrop={setShowDrop}
                        searchTerm={search}
                        setSearchterm={setSearch}
                        searchPlaceholder="Search..."
                      />
                      <EarningCalendar />
                    </>
                  )}

                  {/* WALLET SECTION */}
                  {accsideNav === "Wallet" && (
                    <>
                      <MenuNav
                        showDrop={showDrop}
                        setShowDrop={setShowDrop}
                        searchTerm={search}
                        setSearchterm={setSearch}
                        searchPlaceholder="Search Wallet..."
                      />
                      {/* Wallet content here */}
                    </>
                  )}

                  {/* TASKS SECTION */}
                  {accsideNav === "Tasks" && (
                    <>
                      <MenuNav
                        showDrop={showDrop}
                        setShowDrop={setShowDrop}
                        searchTerm={search}
                        setSearchterm={setSearch}
                        searchPlaceholder="Search..."
                      />
                      <Tasks />
                    </>
                  )}

                  {/* PATHS SECTION */}
                  {accsideNav === "Paths" && (
                    <MyPathsAdmin
                      search={search}
                      admin={true}
                      fetchAllServicesAgain={fetchAllServicesAgain}
                    />
                  )}

                  {/* UNIVERSITIES SECTION */}
                  {accsideNav === "Universities" && (
                    <>
                      <MenuNav
                        showDrop={showDrop}
                        setShowDrop={setShowDrop}
                        searchTerm={search}
                        setSearchterm={setSearch}
                        searchPlaceholder="Search Universities..."
                      />
                      {/* University content here */}
                    </>
                  )}

                  {/* STEPS SECTION */}
                  {accsideNav === "Steps" && (
                    <MyStepsAdmin
                      search={search}
                      admin={true}
                      fetchAllServicesAgain={fetchAllServicesAgain}
                      stepDataPage={true}
                    />
                  )}

                  {/* ── COMING SOON FALLBACK ──────────────────────────────────
                      FIX: Added "Dashboard" to this list so it never shows
                      "Coming Soon" when the default nav loads on first visit  */}
                  {![
                    "Dashboard",
                    "Overview",   // ← THIS WAS MISSING — caused "Coming Soon" on load
                    "CRM",
                    "Subscriptions",
                    "Marketplace",
                    "Calendar",
                    "Wallet",
                    "Tasks",
                    "Paths",
                    "Universities",
                    "Steps",
                  ].includes(accsideNav) && (
                      <div
                        style={{
                          height: "calc(100% - 70px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                          fontWeight: "600",
                        }}
                      >
                        Coming Soon
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* SERVICE DRAWER */}
        {serviceDrawerOpen && selectedService && (
          <>
            <div
              className="service-backdrop"
              onClick={() => setServiceDrawerOpen(false)}
            />

            <div className="service-drawer improved">
              <div className="drawer-header">
                <h3>Service Actions</h3>
                <button
                  className="drawer-close"
                  onClick={() => setServiceDrawerOpen(false)}
                >
                  ✕
                </button>
              </div>

              {serviceMode === "actions" && (
                <div className="drawer-actions">
                  <button
                    className="drawer-action-btn primary"
                    onClick={() => setServiceMode("view")}
                  >
                    👁 View Service
                  </button>

                  <button
                    className="drawer-action-btn"
                    onClick={() => setServiceMode("edit")}
                  >
                    ✏️ Edit Service
                  </button>

                  <button
                    className="drawer-action-btn danger"
                    onClick={async () => {
                      if (!window.confirm("Delete this service?")) return;
                      try {
                        await axios.delete(
                          `/admin/services/delete/${selectedService._id}`
                        );
                        setServiceDrawerOpen(false);
                        getAdminServices();
                      } catch (error) {
                        console.error("Delete error:", error);
                      }
                    }}
                  >
                    🗑 Delete Service
                  </button>
                </div>
              )}

              {serviceMode === "view" && (
                <div className="drawer-content">
                  <h4>{selectedService.name}</h4>
                  <p>{selectedService.description || "No description"}</p>
                </div>
              )}

              {serviceMode === "edit" && (
                <EditServiceForm
                  service={selectedService}
                  onSave={() => {
                    setServiceDrawerOpen(false);
                    getAdminServices();
                  }}
                  onCancel={() => setServiceDrawerOpen(false)}
                />
              )}
            </div>
          </>
        )}
        <ToastContainer />
      </div>
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
        border: "0.5px solid #e9ecef",
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
              if (e.target.files?.[0]) {
                uploadImageFunc(e, setFunc, setplanBAccountPicUploading);
              }
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