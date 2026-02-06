import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./accDashboard.scss";

import { Outlet, useLocation } from "react-router-dom";

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

  /* 🔥 ADD THESE BACK */
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

  /* ---------------- PAGINATION CALCULATIONS ---------------- */
  /* ---------------- PAGINATION CALCULATIONS ---------------- */
const safeUsers = Array.isArray(crmUserData) ? crmUserData : [];

const totalPages = Math.ceil(safeUsers.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentUsers = safeUsers.slice(startIndex, endIndex);

  /* ---------------- OTHER STATES (UNCHANGED) ---------------- */
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
// actions | view | edit


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
    countryApiValue,
  } = useCoinContextData();

  const [profileId, setProfileId] = useState("");

  //upload part starts here

  // const secret = "uyrw7826^&(896GYUFWE&*#GBjkbuaf"; // secret not to be disclosed anywhere.
  const emailDev = "rahulrajsb@outlook.com"; // email of the developer.
  const userDetails = JSON.parse(localStorage.getItem("adminuser"));

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

  useEffect(() => {
    axios.get(`https://careers.marketsverse.com/paths/get`).then((res) => {
      let result = res?.data?.data;
      // console.log(result, "all paths fetched");
      setBackupPathList(result);
    });
  }, []);

  const addBackupPath = (backupPathId, selectedStepId) => {
    // console.log(pathSteps, "kjedkjweld");

    pathSteps.the_ids.map((item) => {
      if (item.step_id === selectedStepId) {
        item.backup_pathId = backupPathId;
      }
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
    handleFollowerPerAccountants();
    handleGetCurrencies();
    // setaccsideNav("CRM")
    resetpop();
    const userDetails = JSON.parse(localStorage.getItem("adminuser"));
    if (!userDetails?.email) {
      navigate("/admin/login");
    }
  }, []);

  useEffect(() => {
    resetpop();
    if (accsideNav == "CRM" && crmMenu == "Followers") {
      handleFollowerPerAccountants();
    } else if (accsideNav == "CRM" && crmMenu == "Purchases") {
      handleAllCustomerLicenses();
    } else if (accsideNav == "Services") {
      getAdminServices();
    }
  }, [crmMenu, servicesMenu, accsideNav]);

  const uploadCoverImage = async (file) => {
    setIsUploadLoading(true);

    const fileName = `${new Date().getTime()}${file.name.substr(
      file.name.lastIndexOf(".")
    )}`;

    const formData = new FormData();
    const newfile = renameFile(file, fileName);
    formData.append("files", newfile);
    const path_inside_brain = "root/";

    const jwts = await signJwt(fileName, emailDev);
    console.log(jwts, "lkjkswedcf");
    let { data } = await axios.post(
      `https://insurance.apimachine.com/insurance/general/upload`,
      formData,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

    if (data?.length > 0) {
      console.log(data[0], "dfile name upload");
      setCoverImageS3url(data[0]?.urlName);
      setIsUploadLoading(false);
      return data[0]?.urlName;
    } else {
      // setIsUploadLoading(false);
      console.log("error in uploading image");
    }
  };

  const uploadBulkPath = async (file) => {
    setIsUploadLoading(true);

    const fileName = `${new Date().getTime()}${file?.name?.substr(
      file.name.lastIndexOf(".")
    )}`;

    const formData = new FormData();
    const newfile = renameFile(file, fileName);
    formData.append("file", newfile);

    let { data } = await axios.post(
      `https://careers.marketsverse.com/paths/addmultiplepaths`,
      formData,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

    if (data?.status) {
      console.log(data[0], "dfile name upload");
      setpstep(12);
      // setCoverImageS3url(data[0]?.urlName);
      setIsUploadLoading(false);
      // return data[0]?.urlName;
    } else {
      // setIsUploadLoading(false);
      console.log("error in uploading image");
    }
  };

  const uploadBulkStep = async (file) => {
    setIsUploadLoading(true);

    const fileName = `${new Date().getTime()}${file?.name?.substr(
      file.name.lastIndexOf(".")
    )}`;

    const formData = new FormData();
    const newfile = renameFile(file, fileName);
    formData.append("file", newfile);

    let { data } = await axios.post(
      `${BASE_URL}/api/steps/addmultiplesteps`,
      formData,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

    if (data?.status) {
      console.log(data[0], "dfile name upload");
      setpstep(12);
      // setCoverImageS3url(data[0]?.urlName);
      setIsUploadLoading(false);
      // return data[0]?.urlName;
    } else {
      // setIsUploadLoading(false);
      console.log("error in uploading image");
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

  function renameFile(originalFile, newName) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

  //upload end here
  const handleFollowerPerAccountants = () => {
    setIsLoading(true);
    let mailId = userDetails?.email;
    GetFollowersPerAccount(mailId)
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
    const userDetails = JSON.parse(localStorage.getItem("adminuser"));
    setIsPurchaseLoading(true);
    GetAllCustomerLicenses(userDetails.user.email)
      .then((res) => {
        let result = res.data;
        if (result.status) {
          setPurchaseData(result.licenses);
          setIsPurchaseLoading(false);
        }
      })
      .catch((err) => {
        // console.log(err)
        setIsPurchaseLoading(false);
      });
  };

  const getPartnerData = () => {
    axios.get(`${BASE_URL}/api/partner/getpartners`).then(({ data }) => {
      if (data.success) {
        // Change 'status' to 'success'
        setPartnerData(data?.partners); // Change 'data' to 'partners'
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
        let result = res?.data;
        if (result?.status) {
          setallCurrencies(result?.coins);
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

  //   const fileInputRef = useRef(null);

  //   const handleImageClick = () => {
  //     fileInputRef.current.click();
  //   };

  const handleFileInputChange = (e) => {
    setImage(e.target.files[0]);
    uploadCoverImage(e.target.files[0]);
  };
  const handleFileInputChange1 = (e) => {
    setImage(e.target.files[0]);
    uploadBulkPath(e.target.files[0]);
  };
  const handleFileInputChange2 = (e) => {
    setImage(e.target.files[0]);
    uploadBulkStep(e.target.files[0]);
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
    let userDetails = JSON.parse(localStorage.getItem("adminuser"));
    let objmonthly = {
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
      email: userDetails.email,
      token: userDetails.idToken,
      product_code: serviceCodeInput,
      product_name: serviceNameInput,
      product_icon: coverImageS3url,
      revenue_account: userDetails.user.email,
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
          setCoverImageS3url("");
          setImage(null);
        }
      })
      .catch((err) => {
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
    let obj = {
      email: userDetails?.email,
      token: userDetails?.idToken,
      product_id: selectedService?.product_id,
    };
    axios
      .delete(`/admin/services/delete/${selectedService?._id}`)
      .then((res) => {
        console.log("Deleted:", res.data);
        myTimeout();
      })
      .catch((err) => console.log("Delete error:", err));
  };

  const restoreService = () => {
    setIsloading(true);

    axios
      .put(`/admin/services/restore/${selectedService?._id}`)
      .then(({ data }) => {
        console.log("Service Restored:", data);

        if (data.status) {
          //setServiceActionStep(3);
          myTimeout();
        }

        setIsloading(false);
      })
      .catch((err) => {
        console.log("Restore Error:", err);
        setIsloading(false);
      });
  };

  const changeServiceIcon = () => {
    setIsloading(true);
    let obj = {
      email: userDetails?.email,
      token: userDetails?.idToken,
      field_name: "product_icon",
      field_value: updatedIcon,
      product_id: selectedService?.product_id,
    };
    axios
      .post(`https://comms.globalxchange.io/gxb/product/edit`, obj)
      .then((response) => {
        let result = response?.data;
        console.log(result, "changeServiceIcon result");
        if (result?.status) {
          setIsloading(false);
          // setServiceActionStep(6);
          myTimeout();
        } else {
          setIsloading(false);
        }
      })
      .catch((error) => {
        console.log(error, "error in changeServiceIcon");
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

  useEffect(() => {
    if (pathSteps) {
      console.log(pathSteps, "kjwegfljwefljwef");
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
      product_creator: userDetails?.user?.email,
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

  useEffect(() => {
    let email = userDetails?.email;
    axios
      .get(`${BASE_URL}/api/steps/get?email=${email}`)
      .then((response) => {
        let result = response?.data?.data;
        // console.log(result, "all steps fetched");
        setAllSteps(result);
      })
      .catch((error) => {
        console.log(error, "error in fetching all steps");
      });
  }, []);

  const pathSubmission = () => {
    console.log(pathSteps, "api body");
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
        let result = response?.data;
        // console.log(result, "pathSubmission result");
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

  // const removeStep = (stepId) => {
  //   const updatedSelectedSteps = selectedSteps.filter(
  //     (step) => step._id !== stepId
  //   );
  //   setSelectedSteps(updatedSelectedSteps);

  //   const updatedStepIds = pathSteps?.step_ids?.filter((id) => id !== stepId);
  //   setPathSteps({
  //     ...pathSteps,
  //     step_ids: updatedStepIds,
  //   });
  // };

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
    if (accsideNav === "CRM" && crmMenu === "Clients") {
      setIsUserLoading(true);

     
        axios.get(`${BASE_URL}/api/users`)
        .then((response) => {
          setCrmUserData(response?.data?.data || []);
          setIsUserLoading(false);
        })
        .catch(() => setIsUserLoading(false));
    }
  }, [accsideNav, crmMenu]);

  const isFetched = useRef(false);

  const fetchedOnceRef = useRef(false);

  const hasFetchedRef = useRef(false);

  const [hasLoadedUsers, setHasLoadedUsers] = useState(false);

  const usersFetchRef = useRef(false);

  const fetchedRef = useRef(false);



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
    // 🔒 Safety checks (prevents runtime errors)
    if (!addForexAmount || !selectedCoin?.coinSymbol) {
      console.warn("Missing amount or coin");
      return;
    }

    // ✅ Mock quote object (local replacement)
    const mockQuote = {
      status: true,
      coin: selectedCoin.coinSymbol,
      amount: addForexAmount,
      paymentMethod: selectedPaymentMethod || "N/A",
      path_id: forexPathId || null,
      message: "Quote generated locally",
      timestamp: Date.now(),
    };

    // ✅ Update state just like API success
    setForexQuote(mockQuote);
    setAddActionStep(3);
  };

  // =============== SERVICES STATES ===============
  const [allAdminServices, setAllAdminServices] = useState([]); // All services (for stats)
  const [filteredAdminServices, setFilteredAdminServices] = useState([]); // Filtered for display

  const getAdminServices = () => {
    setIsUserLoading(true);

    axios
      .get(`${BASE_URL}/api/services/admin?status=all`) // Always fetch ALL services
      .then(({ data }) => {
        if (data?.status) {
          setAllAdminServices(data.data || []); // Store ALL services
          setIsUserLoading(false);
        } else {
          setAllAdminServices([]);
          setFilteredAdminServices([]);
          setIsUserLoading(false);
        }
      })
      .catch((err) => {
        console.log("Admin API Error:", err);
        setAllAdminServices([]);
        setFilteredAdminServices([]);
        setIsUserLoading(false);
      });
  };

  // Filter services whenever serviceStatus changes
  useEffect(() => {
    if (serviceStatus === "all") {
      setFilteredAdminServices(allAdminServices);
    } else if (serviceStatus === "active") {
      setFilteredAdminServices(
        allAdminServices.filter((s) => s.status === "active")
      );
    } else if (serviceStatus === "inactive") {
      setFilteredAdminServices(
        allAdminServices.filter((s) => s.status === "inactive")
      );
    }
  }, [serviceStatus, allAdminServices]);

  useEffect(() => {
    getAdminServices();
  }, [serviceStatus]);

  const conditionalBilling = (item) => {
    if (item === "lifetime") {
      return "One Time";
    } else if (item === "monthly") {
      return "Monthly";
    } else if (item === "annual") {
      return "Annual";
    }
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
    overflow: "hidden",
    maxWidth: "calc(100vw - 220px)",
    width: "calc(100% - 20px)",
  }}
>


          
            <div style={{ height: "100%" }}>
              {/* 🔥 PROFILE ROUTE HANDLER */}
              {isProfilePage ? (
                <Outlet />
              ) : (
                <>
                  {accsideNav === "CRM" ? (
                    <>
                      {/* TOP SEARCH */}
                      <MenuNav
                        showDrop={showDrop}
                        setShowDrop={setShowDrop}
                        searchTerm={search}
                        setSearchterm={setSearch}
                        searchPlaceholder="Search Clients..."
                      />

                      {/* CRM TABS */}
                      <div className="crm-tabs">
                        <button
                          className={crmMenu === "Clients" ? "active" : ""}
                          onClick={() => {
                            setcrmMenu("Clients");
                            setCurrentPage(1);
                          }}
                        >
                        Users ({crmUserData?.length || 0})
                        </button>

                        <button
                          className={crmMenu === "Partners" ? "active" : ""}
                          onClick={() => {
                            setcrmMenu("Partners");
                            setCurrentPage(1);
                          }}
                        >
                          Partners ({partnerData?.length || 0})
                        </button>
                      </div>

                      {/* USERS TABLE */}
                      {crmMenu === "Clients" && (
                        <>
                          {/* TABLE HEADER */}
                          <div
                            className="crm-tab"
                            style={{ padding: "10px 35px" }}
                          >
                            <div
                              className="crm-each-col"
                              style={{ width: "20%" }}
                            >
                              Name
                            </div>
                            <div
                              className="crm-each-col"
                              style={{ width: "30%" }}
                            >
                              Email
                            </div>
                            <div
                              className="crm-each-col"
                              style={{ width: "15%" }}
                            >
                              Country
                            </div>
                            <div
                              className="crm-each-col"
                              style={{ width: "20%" }}
                            >
                              Phone
                            </div>
                            <div
                              className="crm-each-col"
                              style={{ width: "15%" }}
                            >
                              Profile Level
                            </div>
                          </div>

                          {/* TABLE BODY */}
                          <div className="users-alldata">
                            {isClientLoading ? (
                              Array(8)
                                .fill("")
                                .map((_, i) => (
                                  <div className="each-userData" key={i}>
                                    <Skeleton width={200} height={20} />
                                  </div>
                                ))
                            ) : safeUsers.length? (
                             safeUsers.map((u, i) => (
                                <div className="each-userData" key={i}>
                                  <div style={{ width: "20%" }}>
                                    {u?.name || "—"}
                                  </div>
                                  <div
                                    style={{
                                      width: "30%",
                                      textTransform: "none",
                                    }}
                                  >
                                    {u?.email}
                                  </div>
                                  <div style={{ width: "15%" }}>
                                    {u?.country || "—"}
                                  </div>
                                  <div style={{ width: "20%" }}>
                                    {u?.phoneNumber || "—"}
                                  </div>
                                  <div style={{ width: "15%" }}>
                                    {u?.user_level || "—"}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="no-data">No Users Found</div>
                            )}
                          </div>
                        </>
                      )}

                      {/* PARTNERS TABLE */}
                      {crmMenu === "Partners" && (
                        <>
                          {/* TABLE HEADER */}
                          <div
                            className="crm-tab"
                            style={{ padding: "10px 35px" }}
                          >
                            <div
                              className="crm-each-col"
                              style={{ width: "25%" }}
                            >
                              Business
                            </div>
                            <div
                              className="crm-each-col"
                              style={{ width: "30%" }}
                            >
                              Email
                            </div>
                            <div
                              className="crm-each-col"
                              style={{ width: "15%" }}
                            >
                              Country
                            </div>
                            <div
                              className="crm-each-col"
                              style={{ width: "15%" }}
                            >
                              Type
                            </div>
                            <div
                              className="crm-each-col"
                              style={{ width: "15%" }}
                            >
                              POC
                            </div>
                          </div>

                          {/* TABLE BODY */}
                          <div className="users-alldata">
                            {isPurchaseLoading ? (
                              Array(8)
                                .fill("")
                                .map((_, i) => (
                                  <div className="each-userData" key={i}>
                                    <Skeleton width={200} height={20} />
                                  </div>
                                ))
                            ) : partnerData.length ? (
                              partnerData.map((p, i) => (
                                <div className="each-userData" key={i}>
                                  <div
                                    style={{
                                      width: "25%",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <img
                                      src={p?.logo}
                                      alt=""
                                      style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        marginRight: 10,
                                      }}
                                    />
                                    {p?.businessName}
                                  </div>
                                  <div
                                    style={{
                                      width: "30%",
                                      textTransform: "none",
                                    }}
                                  >
                                    {p?.email}
                                  </div>
                                  <div style={{ width: "15%" }}>
                                    {p?.country || "—"}
                                  </div>
                                  <div style={{ width: "15%" }}>
                                    {p?.type || "—"}
                                  </div>
                                  <div style={{ width: "15%" }}>
                                    {p?.firstName} {p?.lastName}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="no-data">No Partners Found</div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  ) : accsideNav === "Services" ? (
                    <>
                      <MenuNav
                        showDrop={showDrop}
                        setShowDrop={setShowDrop}
                        searchTerm={search}
                        setSearchterm={setSearch}
                        searchPlaceholder="Search Services..."
                      />

                      {/* SERVICES HEADER TABS */}
                      <div className="crm-tabs">
                        <button
                          className={serviceStatus === "active" ? "active" : ""}
                          onClick={() => setServiceStatus("active")}
                        >
                          Active Services
                        </button>
                        <button
                          className={
                            serviceStatus === "inactive" ? "active" : ""
                          }
                          onClick={() => setServiceStatus("inactive")}
                        >
                          Inactive Services
                        </button>
                        <button
                          className={serviceStatus === "all" ? "active" : ""}
                          onClick={() => setServiceStatus("all")}
                        >
                          All Services
                        </button>
                      </div>

                      {/* SERVICES TABLE HEADER */}
                      <div className="services-table-header">
                        <div
                          className="service-header-col"
                          style={{ width: "35%" }}
                        >
                           Name
                        </div>
                        <div
                          className="service-header-col"
                          style={{ width: "15%" }}
                        >
                          Billing Frequency

                        </div>
                        <div
                          className="service-header-col"
                          style={{ width: "15%" }}
                        >
                          Billing Amount
                        </div>
                        <div
                          className="service-header-col"
                          style={{ width: "10%" }}
                        >
                          CURRENCY
                        </div>
                        {/* <div
                          className="service-header-col"
                          style={{ width: "10%" }}
                        >
                          STATUS
                        </div> */}
                        <div
                          className="service-header-col"
                          style={{ width: "15%" }}
                        >
                          PARTNER
                        </div>
                      </div>

                      {/* MAIN CONTENT AREA WITH STATIC FOOTER */}
                      <div className="services-content-wrapper">
                        {/* SCROLLABLE SERVICES LIST */}
                        <div className="services-alldata">
                          {isUserLoading ? (
                            Array(6)
                              .fill("")
                              .map((_, i) => (
                                <div className="each-service-skeleton" key={i}>
                                  <Skeleton width="100%" height={80} />
                                </div>
                              ))
                          ) : filteredAdminServices.length > 0 ? (
                            filteredAdminServices.map((service) => {
                              // Determine billing type and price
                              const billingCycle = service.billing_cycle || {};
                              let billingType = "One Time";
                              let price = 0;
                              let currency = "INR";

                              if (billingCycle.lifetime) {
                                billingType = "One Time";
                                price = billingCycle.lifetime.price || 0;
                                currency = billingCycle.lifetime.coin || "INR";
                              } else if (billingCycle.monthly) {
                                billingType = "Monthly";
                                price = billingCycle.monthly.price || 0;
                                currency = billingCycle.monthly.coin || "INR";
                              } else if (billingCycle.annual) {
                                billingType = "Annual";
                                price = billingCycle.annual.price || 0;
                                currency = billingCycle.annual.coin || "INR";
                              } else if (billingCycle.custom) {
                                billingType = "Custom";
                                price = billingCycle.custom.price || 0;
                                currency = billingCycle.custom.coin || "INR";
                              }

                              // Determine status
                              const isActive = service.status === "active";

                              return (
                                <div
  className="each-service-data"
  key={service._id || service.product_id}
  onClick={() => {
    setSelectedService(service);
    setServiceDrawerOpen(true);
    setServiceMode("actions");
  }}
  style={{ cursor: "pointer" }}
>

                                  {/* Service Name */}
                                  <div className="service-name-col">
                                    <div className="service-info">
                                      <div className="service-title">
                                        {service.product_name ||
                                          service.name ||
                                          "Unnamed Service"}
                                      </div>
                                      {service.sub_text && (
                                        <div className="service-subtext">
                                          {service.sub_text}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Billing Type */}
                                  <div className="service-billing-col">
                                    <div className="billing-type">
                                      {billingType}
                                    </div>
                                  </div>

                                  {/* Price */}
                                  <div className="service-price-col">
                                    <div className="price-value">
                                      {price === 0
                                        ? "0"
                                        : price.toLocaleString("en-IN")}
                                    </div>
                                  </div>

                                  {/* Currency */}
                                  <div className="service-currency-col">
                                    <div className="currency-value">
                                      {currency}
                                    </div>
                                  </div>

                                  {/* Status */}
                                  <div className="service-status-col">
                                    <div className="status-value">
                                      <span
                                        className={`status-indicator ${
                                          isActive
                                            ? "status-active"
                                            : "status-inactive"
                                        }`}
                                      ></span>
                                      {isActive ? "Active" : "Inactive"}
                                    </div>
                                  </div>

                                 
                                  {/* Partner */}
<div className="service-partner-col">
  <div className="partner-wrapper">
    <div className="partner-value">
      {service.revenue_account ||
        service.partner_email ||
        "N/A"}
    </div>

    
  </div>
</div>



                                </div>
                              );
                            })
                          ) : (
                            <div className="no-services-found">
                              {/* <div className="no-data-icon">📊</div> */}
                              <div className="no-data-title">
                                No Services Found
                              </div>
                              <div className="no-data-subtitle">
                                {serviceStatus === "active"
                                  ? "No active services available"
                                  : serviceStatus === "inactive"
                                  ? "No inactive services available"
                                  : "No services created yet"}
                              </div>
                              <button
                                className="create-service-btn"
                                onClick={() => setispopular(true)}
                              >
                                + Create New Service
                              </button>
                            </div>
                          )}
                        </div>

                        {/* STATIC STATS FOOTER - WON'T SCROLL */}
                        {allAdminServices.length > 0 && !isUserLoading && (
                          <div className="services-stats-static">
                            <div className="stat-card-static">
                              <div className="stat-value">
                                {allAdminServices.length}
                              </div>
                              <div className="stat-label">Total Services</div>
                            </div>
                            <div className="stat-card-static">
                              <div className="stat-value">
                                {
                                  allAdminServices.filter(
                                    (s) => s.status === "active"
                                  ).length
                                }
                              </div>
                              <div className="stat-label">Active</div>
                            </div>
                            <div className="stat-card-static">
                              <div className="stat-value">
                                {
                                  allAdminServices.filter(
                                    (s) => s.status === "inactive"
                                  ).length
                                }
                              </div>
                              <div className="stat-label">Inactive</div>
                            </div>
                            <div className="stat-card-static revenue">
                              <div className="stat-value">
                                ₹
                                {allAdminServices
                                  .reduce((sum, service) => {
                                    const billingCycle =
                                      service.billing_cycle || {};
                                    let price = 0;

                                    // Determine billing type and price
                                    if (billingCycle.lifetime) {
                                      price =
                                        parseFloat(
                                          billingCycle.lifetime?.price
                                        ) || 0;
                                    } else if (billingCycle.monthly) {
                                      price =
                                        parseFloat(
                                          billingCycle.monthly?.price
                                        ) || 0;
                                      // For monthly, assume 12 months (1 year) for revenue projection
                                      price = price * 12;
                                    } else if (billingCycle.annual) {
                                      price =
                                        parseFloat(
                                          billingCycle.annual?.price
                                        ) || 0;
                                    } else if (billingCycle.custom) {
                                      price =
                                        parseFloat(
                                          billingCycle.custom?.price
                                        ) || 0;
                                    }

                                    return sum + price;
                                  }, 0)
                                  .toLocaleString("en-IN")}
                              </div>
                              <div className="stat-label">
                                Total Revenue (Projected)
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : accsideNav === "Calendar" ? (
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
                  ) : accsideNav === "Wallet" ? (
                    <>
                      <MenuNav
                        showDrop={showDrop}
                        setShowDrop={setShowDrop}
                        searchTerm={search}
                        setSearchterm={setSearch}
                        searchPlaceholder="Search Wallet..."
                      />
                      {/* EXISTING WALLET CONTENT */}
                    </>
                  ) : accsideNav === "Tasks" ? (
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
                  ) : accsideNav === "Paths" ? (
                    <>
                      <MenuNav
                        showDrop={showDrop}
                        setShowDrop={setShowDrop}
                        searchTerm={search}
                        setSearchterm={setSearch}
                        searchPlaceholder="Search Paths..."
                      />
                      <MyPathsAdmin
                        search={search}
                        admin={true}
                        fetchAllServicesAgain={fetchAllServicesAgain}
                      />
                    </>
                  ) : accsideNav === "Universities" ? (
                    <>
                      <MenuNav
                        showDrop={showDrop}
                        setShowDrop={setShowDrop}
                        searchTerm={search}
                        setSearchterm={setSearch}
                        searchPlaceholder="Search Universities..."
                      />
                      {/* EXISTING UNIVERSITY CONTENT */}
                    </>
                  ) : accsideNav === "Steps" ? (
                    <>
                      <MenuNav
                        showDrop={showDrop}
                        setShowDrop={setShowDrop}
                        searchTerm={search}
                        setSearchterm={setSearch}
                        searchPlaceholder="Search Steps..."
                      />
                      <MyStepsAdmin
                        search={search}
                        admin={true}
                        fetchAllServicesAgain={fetchAllServicesAgain}
                        stepDataPage={true}
                      />
                    </>
                  ) : (
                    <>
                      <MenuNav
                        showDrop={showDrop}
                        setShowDrop={setShowDrop}
                        searchTerm={search}
                        searchPlaceholder="Search..."
                      />
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
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
{/* ================= SERVICE DRAWER ================= */}
{/* ================= SERVICE DRAWER ================= */}
{serviceDrawerOpen && selectedService && (
  <>
    {/* BACKDROP */}
    <div
      className="service-backdrop"
      onClick={() => setServiceDrawerOpen(false)}
    />

    {/* DRAWER */}
    <div className="service-drawer improved">

      {/* HEADER */}
      <div className="drawer-header">
        <h3>Service Actions</h3>
        <button
          className="drawer-close"
          onClick={() => setServiceDrawerOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* ACTION LIST */}
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
              await axios.delete(
                `/admin/services/delete/${selectedService._id}`
              );
              setServiceDrawerOpen(false);
              getAdminServices();
            }}
          >
            🗑 Delete Service
          </button>

        </div>
      )}

      {/* VIEW MODE */}
      {serviceMode === "view" && (
        <div className="drawer-content">
          <h4>{selectedService.name}</h4>
          <p>{selectedService.description || "No description"}</p>
        </div>
      )}

      {/* EDIT MODE */}
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
