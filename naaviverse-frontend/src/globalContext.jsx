import { useState, useEffect, createContext, useRef } from "react";
import defaultImg from "./static/images/app_placeholder.png";
import publicationsFull from "./static/images/PublicationsFull.svg";
import { ReactComponent as Collapse_img } from "./static/images/collapse.svg";
import { ReactComponent as Collapse1_img } from "./static/images/collapse1.svg";
import axios from "axios";
import Lock from "./static/images/lock.svg";
import pubAdminIcon from "./static/images/pubAdminIcon.svg";
import NaaviMainImg from "./static/images/sidebarIcons/NaaviMainImg.svg";

export const GlobalContex = createContext();

export const GlobalContexProvider = ({ children }) => {
  const [loginData, setLoginData] = useState(null);
  const [login, setLogin] = useState(false);
  const [collapse, setCollapse] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState(null);
  const [banker, setBanker] = useState(null);
  const [bankerEmail, setBankerEmail] = useState("");
  const [bankerTag, setBankerTag] = useState("");
  const [allBankers, setAllBankers] = useState([]);
  const [allCoins, setAllCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [payoutDrawer, setPayoutDrawer] = useState(false);

  const [selectedFilter1, setSelectedFilter1] = useState(null);
  const [selectedFilter2, setSelectedFilter2] = useState("");
  const [selectedFilter21, setSelectedFilter21] = useState("");
  const [filter1, setFilter1] = useState(false);
  const [filter2, setFilter2] = useState(false);
  const [customerEmailFilter, setCustomerEmailFilter] = useState(null);
  const [openCoinFilter, setOpenCoinFilter] = useState(false);
  const [refetchPayout, setRefetchPayout] = useState(false);

  const [globalMenuAdd, setGlobalMenuAdd] = useState(true);
  const [refetchAuthors, setRefetchAuthors] = useState(false);
  const [refetchRequest, setRefetchRequest] = useState(false);
  const [selectedFilterRequest, setSelectedFilterRequest] = useState("pending");
  const [slider, setSlider] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [refetchCourses, setRefetchCourses] = useState(false);

  const [showDraw, setShowDraw] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedSplashCoin, setSelectedSplashCoin] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTemplateMenu, setSelectedTemplateMenu] = useState(null);

  const [selectedBrand, setSelectedBrand] = useState();
  const [selectedBrandApp, setSelectedBrandApp] = useState();
  const [allBrands, setAllBrands] = useState([]);
  const [allApps, setAllApps] = useState([]);
  const [mcbAdminLoading, setMcbAdminLoading] = useState(false);
  const [refetchCategory, setRefetchCategory] = useState(false);
  const [refetchNavbar, setRefetchNavbar] = useState(false);
  const [refetchVideos, setRefetchVideos] = useState(false);
  const [updatedSuccessful, setupdatedSuccessful] = useState(false);

  const [selectedMcbDashboardApp, setSelectedMcbDashboardApp] = useState(null);
  const [showSubDraw, setShowSubDraw] = useState(false);

  const [refetchAppData, setRefetchAppData] = useState(false);
  const [refreshStories, setRefreshStories] = useState(false);
  const [globalFilter, setGlobalFilter] = useState(false);
  const [selectedAssetFilters, setSelectedAssetFilters] = useState([]);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState([]);
  const [selectedLengthFilter, setSelectedLengthFilter] = useState("");
  const [requestsDrawer, setRequestsDrawer] = useState(false);

  const [allAppsForBrand, setAllAppsForBrand] = useState([]);

  const [refetchBrands, setRefetchBrands] = useState(false);
  const [refetchApps, setRefetchApps] = useState(false);

  const [selectedMcbDashboardBrand, setSelectedMcbDashboardBrand] =
    useState(null);
  const [refetchBrandData, setRefetchBrandData] = useState(false);

  const [selectedMcbAssetsCrypto, setSelectedMcbAssetsCrypto] = useState(null);
  const [selectedMcbAssetsForex, setSelectedMcbAssetsForex] = useState(null);

  const [refetchFieldGroupData, setRefetchFieldGroupData] = useState(false);

  const [selectedFieldGroup, setSelectedFieldGroup] = useState(false);
  const [allPublications, setAllPublications] = useState([]);
  const [selectedPublication, setSelectedPublication] = useState(null);

  const [isMobile, setIsMobile] = useState(false);
  const [wideDrawer, setWideDrawer] = useState(false);
  const [theCurrency, setTheCurrency] = useState("");
  const [refreshCall, setRefreshCall] = useState(false);
  const [coinIIRD, setCoinIIRD] = useState("");
  const [tabSelected, setTabSelected] = useState("");
  const [requestText, setRequestText] = useState("");
  const [theAsset, setTheAsset] = useState([]);
  const [crmUser, setCrmUser] = useState("");
  const [crmData, setCrmData] = useState([]);
  const [selectedSubs, setSelectedSubs] = useState("");
  const [licenseCheck, setLicenseCheck] = useState("");
  const [actionsSubDrawer, setActionsSubDrawer] = useState(false);
  const [videoActionsSubDrawer, setVideoActionsSubDrawer] = useState(false);
  const [StorySubDrawer, setStorySubDrawer] = useState(false);
  const [profileSubDrawer, setProfileSubDrawer] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedIndex, setSelectedIndex] = useState("");
  const [affiliateDrawer, setAffiliateDrawer] = useState(false);
  // const [contentTabSelected, setContentTabSelected] = useState("");
  const [refetchData, setRefetchData] = useState(false);
  const [refechProfile, setRefechProfile] = useState(false);
  const [coinList, setCoinList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDrawer, setFilterDrawer] = useState(false);

  const [gradeToggle, setGradeToggle] = useState(false);
  const [schoolToggle, setSchoolToggle] = useState(false);
  const [curriculumToggle, setCurriculumToggle] = useState(false);
  const [streamToggle, setStreamToggle] = useState(false);
  const [performanceToggle, setPerformanceToggle] = useState(false);
  const [financialToggle, setFinancialToggle] = useState(false);
  const [personalityToggle, setPersonalityToggle] = useState(false);
  const [refetchPaths, setRefetchPaths] = useState(false);

  const [coinSelect, setCoinSelect] = useState({
    coinImage:
      "https://apimachine-s3.s3.us-east-2.amazonaws.com/coinImages/dollar.png",
    coinName: "US Dollar",
    coinSymbol: "USD",
    symbol: "$",
    price: { USD: 1 },
  });
  const [coinLoading, setCoinLoading] = useState(false);
  const [coinListObject, setCoinListObject] = useState();
  
  // Add refs to track initial loads
  const initialLoadRef = useRef({
    coins: false,
    appList: false,
    publications: false,
    authorDetail: false
  });

  // Use a ref to prevent re-renders
  const bankerEmailRef = useRef(bankerEmail);

  useEffect(() => {
    bankerEmailRef.current = bankerEmail;
  }, [bankerEmail]);

  useEffect(() => {
  if (initialLoadRef.current.coins) return;

  // 🔒 Disable third-party API (mock minimal data)
  setCoinListObject({});
  initialLoadRef.current.coins = true;
}, []);


  useEffect(() => {
    if (tabSelected !== "Requests") {
      setFilterDrawer(false);
    }
  }, [tabSelected]);

  useEffect(() => {
    if (!bankerEmail || bankerEmail === "") return;
    
    // Prevent multiple calls for same email
    if (coinLoading) return;

    let isMounted = true;
    setCoinLoading(true);

    axios
      .get(`http://localhost:4545/api/vault/coins/${encodeURIComponent(bankerEmail)}`)
      .then((res) => {
        if (!isMounted) return;
        const { data } = res;
        if (data.status) {
          setCoinList(data.data);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.log("Vault error:", err.message);
      })
      .finally(() => {
        if (!isMounted) return;
        setCoinLoading(false);
      });
      
    return () => {
      isMounted = false;
    };
  }, [bankerEmail]);

  const [userType, setUserType] = useState(
    localStorage.getItem("userType") || "App Owner"
  );
  useEffect(() => {
    localStorage.setItem("userType", userType);
  }, [userType]);

  const [appList, setAppList] = useState([]);
  const [appLoading, setAppLoading] = useState(false);
  useEffect(() => {
    if (initialLoadRef.current.appList) return;
    
    let isMounted = true;
    setAppLoading(true);
    
    axios
      .get("https://comms.globalxchange.io/gxb/apps/get")
      .then((res) => {
        if (!isMounted) return;
        const { data } = res;
        if (data.status) {
          const { apps } = data;
          setAppList(apps);
          initialLoadRef.current.appList = true;
        }
      })
      .catch(() => {
        if (!isMounted) return;
      })
      .finally(() => {
        if (!isMounted) return;
        setAppLoading(false);
      });
      
    return () => {
      isMounted = false;
    };
  }, []);
  
  const [appListFinal, setAppListFinal] = useState([]);

  const [authorDetail, setAuthorDetail] = useState(null);
  const [refetchArticles, setRefetchArticles] = useState(false);

  const MainMenu = [
    {
      appName: "Admins",
      appLogo: NaaviMainImg,
      appFullLogo: NaaviMainImg,
      appColor: "#4B9DDC",
      appTextColor: "#212529",
      appData: "Don't Have A/Publications/Account?",
      DispName: "For Admins",
    },
  ];

  const globalMenu = [
    // {
    //   appName: "Publishers",
    //   appLogo: pubAdminIcon,
    //   appFullLogo: publicationsFull,
    //   appColor: "#4B9DDC",
    //   appTextColor: "#212529",
    //   appData: "Don't Have A/Publications/Account?",
    //   DispName: "For Publishers"
    // }
  ];

  const adminMenu = [
    {
      menuName: "Paths",
      menuIcon: pubAdminIcon,
      enabled: true,
    },
    {
      menuName: "CRM",
      menuIcon: pubAdminIcon,
      enabled: true,
    },
  ];

  const web3Menu = [
    {
      menuName: "Management",
      menuIcon: pubAdminIcon,
      enabled: true,
    },
    {
      menuName: "Rewards",
      menuIcon: pubAdminIcon,
      enabled: true,
    },
    {
      menuName: "Content",
      menuIcon: pubAdminIcon,
      enabled: true,
    },
    {
      menuName: "Hire",
      menuIcon: pubAdminIcon,
      enabled: true,
    },
  ];

  const [selectedCoinSplash, setSelectedCoinSplash] = useState({
    coinName: "US Dollar",
    coinSymbol: "USD",
    symbol: "$",
    coinImage:
      "https://apimachine-s3.s3.us-east-2.amazonaws.com/coinImages/dollar.png",
    type: "fiat",
  });

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const FormatNumber = (value, prec) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: prec,
      minimumFractionDigits: prec,
    }).format(isNaN(value) ? 0 : value);
  };

  const getOrdinalSuffix = (day) => {
    if (day >= 11 && day <= 13) {
      return "th";
    }

    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const getDisplayDate = (date) => {
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const suffix = getOrdinalSuffix(day);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    return formattedDate.replace(/\d+/, `${day}${suffix}`);
  };

  const NumberToText = (number) => {
    console.log(number + " number");
    const suffixes = [
      "th",
      "st",
      "nd",
      "rd",
      "th",
      "th",
      "th",
      "th",
      "th",
      "th",
    ];
    const specialCases = [11, 12, 13];

    let suffix;
    if (specialCases.includes(number % 100)) {
      suffix = suffixes[1];
    } else {
      suffix = suffixes[number % 10];
    }

    return <span>{number + suffix}</span>;
  };

  useEffect(() => {
    if (!bankerEmail || !selectedApp || bankerEmail === "") return;

    let isMounted = true;
    setLoading(true);

    const fetchPublications = async () => {
      try {
        let response;
        if (selectedApp?.appName === "Authors") {
          response = await axios.get(
            `https://publications.apimachine.com/application/publisher/detail/${bankerEmail}`
          );
        } else {
          response = await axios.get(
            `https://publications.apimachine.com/publication/email/${bankerEmail}`
          );
        }
        
        if (!isMounted) return;
        
        if (selectedApp?.appName === "Authors") {
          setAllPublications(response.data?.data || []);
          if (response.data?.data?.[0]?.PublicationDetails?.[0]?.PublicationDetail?.[0]) {
            setSelectedPublication(
              response.data.data[0].PublicationDetails[0].PublicationDetail[0]
            );
          }
        } else {
          setAllPublications(response.data.data || []);
          if (response.data.data?.[0]) {
            setSelectedPublication(response.data.data[0]);
          }
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching publications:", error);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchPublications();

    return () => {
      isMounted = false;
    };
  }, [bankerEmail, refetchData, selectedApp]);

  useEffect(() => {
    if (!bankerEmail || bankerEmail === "") return;

    let isMounted = true;
    
    axios
      .get(
        `https://publications.apimachine.com/application/publisher/detail/${bankerEmail}`
      )
      .then(({ data }) => {
        if (!isMounted) return;
        if (data.status) {
          setAuthorDetail(data.data[0]);
          localStorage.setItem("AuthorData", JSON.stringify(data.data));
        } else {
          setAuthorDetail(null);
          localStorage.setItem("AuthorData", null);
        }
      })
      .catch(() => {
        if (!isMounted) return;
      });
      
    return () => {
      isMounted = false;
    };
  }, [bankerEmail]);

  useEffect(() => {
    const stored = localStorage.getItem("selectedApp");
    
    // Only set if selectedApp is null and we have stored data
    if (stored && selectedApp === null) {
      try {
        const parsed = JSON.parse(stored);
        setSelectedApp(parsed);
      } catch (error) {
        console.error("Error parsing selectedApp from localStorage:", error);
        const defaultApp = MainMenu[0];
        setSelectedApp(defaultApp);
        localStorage.setItem("selectedApp", JSON.stringify(defaultApp));
      }
    } else if (!stored && selectedApp === null) {
      const defaultApp = MainMenu[0];
      setSelectedApp(defaultApp);
      localStorage.setItem("selectedApp", JSON.stringify(defaultApp));
    }
  }, [selectedApp]);

  useEffect(() => {
    const stored = localStorage.getItem("loginData");
    if (stored) {
      setLoginData(JSON.parse(stored));
    }
  }, []);

  // CRITICAL FIX: This effect was causing infinite loops
  useEffect(() => {
    const storedBankerEmail = localStorage.getItem("bankerEmailNew");
    const emailFromLogin = loginData?.user?.email;
    
    // Determine which email to use
    let newEmail = storedBankerEmail || emailFromLogin;
    
    // Only update if we have a new email AND it's different from current
    if (newEmail && newEmail !== "" && newEmail !== bankerEmail) {
      console.log("Setting bankerEmail to:", newEmail);
      setBankerEmail(newEmail);
    }
  }, [loginData]); // Remove bankerEmail from dependencies

 useEffect(() => {
  if (initialLoadRef.current.coins) return;

  // 🔒 Disable third-party API safely
  setAllCoins([]);
  setSelectedCoin({
    coinImage:
      "https://apimachine-s3.s3.us-east-2.amazonaws.com/coinImages/dollar.png",
    coinName: "US Dollar",
    coinSymbol: "USD",
    symbol: "$",
    type: "fiat",
    usd_price: 1,
  });

  initialLoadRef.current.coins = true;
}, []);


useEffect(() => {
  if (!bankerEmail || bankerEmail === "") return;

  // 🔒 Disable third-party operator API
  setAllBrands([]);
  setSelectedBrand(null);
  setMcbAdminLoading(false);
}, [bankerEmail]);


  useEffect(() => {
    if (!selectedBrand?.operator_id) return;

    let isMounted = true;
    setMcbAdminLoading(true);
    
    axios
      .get(
        `https://comms.globalxchange.io/gxb/apps/get?operator_id=${selectedBrand?.operator_id}`
      )
      .then((res1) => {
        if (!isMounted) return;
        setAllAppsForBrand(res1.data.apps);
        setMcbAdminLoading(false);
        if (localStorage.getItem("selectedBrandApp")) {
          const found = res1.data.apps.find(
            (o) =>
              o._id === JSON.parse(localStorage.getItem("selectedBrandApp"))._id
          );
          if (found !== null && found !== undefined) {
            setSelectedBrandApp(
              JSON.parse(localStorage.getItem("selectedBrandApp"))
            );
          } else {
            setSelectedBrandApp(res1.data.apps[0]);
          }
        } else {
          setSelectedBrandApp(res1.data.apps[0]);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setMcbAdminLoading(false);
      });
      
    return () => {
      isMounted = false;
    };
  }, [selectedBrand]);

  useEffect(() => {
    if (selectedBrand && allAppsForBrand.length > 0) {
      localStorage.setItem("selectedBrand", JSON.stringify(selectedBrand));
    }
  }, [selectedBrand, allAppsForBrand]);

  useEffect(() => {
    if (selectedBrandApp && allBrands.length > 0) {
      localStorage.setItem(
        "selectedBrandApp",
        JSON.stringify(selectedBrandApp)
      );
    }
  }, [selectedBrandApp, allBrands]);

  const handleResize = () => {
    if (window.innerWidth < 720) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (userType === "App Owner") {
      setAppListFinal(
        appList.filter(
          (app) =>
            app.created_by === bankerEmail ||
            bankerEmail === "shorupan@gmail.com"
        )
      );
    } else {
      setAppListFinal(appList);
    }
  }, [appList, bankerEmail, userType]);

  const value = {
    globalMenu,
    MainMenu,
    web3Menu,
    collapse,
    setCollapse,
    selectedApp,
    setSelectedApp,
    modalOpen,
    setModalOpen,
    tabs,
    setTabs,
    selectedTab,
    setSelectedTab,
    loginData,
    setLoginData,
    bankerTag,
    setBankerTag,
    banker,
    setBanker,
    login,
    setLogin,
    Lock,
    Collapse_img,
    Collapse1_img,
    defaultImg,
    allBankers,
    setAllBankers,
    bankerEmail,
    setBankerEmail,
    allCoins,
    setAllCoins,
    selectedCoin,
    setSelectedCoin,
    selectedFilter1,
    setSelectedFilter1,
    selectedFilter2,
    setSelectedFilter2,
    selectedFilter21,
    setSelectedFilter21,
    filter1,
    setFilter1,
    filter2,
    setFilter2,
    customerEmailFilter,
    setCustomerEmailFilter,
    openCoinFilter,
    setOpenCoinFilter,
    globalMenuAdd,
    setGlobalMenuAdd,
    FormatNumber,
    selectedCoinSplash,
    setSelectedCoinSplash,
    showDraw,
    setShowDraw,
    selectedMenu,
    setSelectedMenu,
    selectedSplashCoin,
    setSelectedSplashCoin,
    selectedTemplate,
    setSelectedTemplate,
    selectedTemplateMenu,
    setSelectedTemplateMenu,
    selectedBrand,
    setSelectedBrand,
    selectedBrandApp,
    setSelectedBrandApp,
    mcbAdminLoading,
    setMcbAdminLoading,
    allBrands,
    setAllBrands,
    allApps,
    setAllApps,
    selectedMcbDashboardApp,
    setSelectedMcbDashboardApp,

    showSubDraw,
    setShowSubDraw,
    refetchAppData,
    setRefetchAppData,
    globalFilter,
    setGlobalFilter,
    selectedAssetFilters,
    setSelectedAssetFilters,
    selectedStatusFilters,
    setSelectedStatusFilters,
    selectedLengthFilter,
    setSelectedLengthFilter,
    allAppsForBrand,
    setAllAppsForBrand,
    selectedMcbDashboardBrand,
    setSelectedMcbDashboardBrand,
    refetchBrandData,
    setRefetchBrandData,

    selectedMcbAssetsCrypto,
    setSelectedMcbAssetsCrypto,
    selectedMcbAssetsForex,
    setSelectedMcbAssetsForex,
    showMobileMenu,
    setShowMobileMenu,

    refetchCategory,
    setRefetchCategory,

    refetchFieldGroupData,
    setRefetchFieldGroupData,
    selectedFieldGroup,
    setSelectedFieldGroup,
    isMobile,
    setIsMobile,
    theCurrency,
    setTheCurrency,
    refreshCall,
    setRefreshCall,
    coinIIRD,
    setCoinIIRD,
    tabSelected,
    setTabSelected,
    theAsset,
    setTheAsset,
    crmUser,
    setCrmUser,
    crmData,
    setCrmData,
    selectedSubs,
    coinList,
    appList: appListFinal,
    appLoading,
    setSelectedSubs,
    licenseCheck,
    coinLoading,
    setLicenseCheck,
    userType,
    setUserType,
    coinListObject,
    coinSelect,
    setCoinSelect,
    wideDrawer,
    setWideDrawer,
    refetchData,
    setRefetchData,
    allPublications,
    setAllPublications,
    selectedPublication,
    setSelectedPublication,

    actionsSubDrawer,
    setActionsSubDrawer,
    StorySubDrawer,
    setStorySubDrawer,
    videoActionsSubDrawer,
    setVideoActionsSubDrawer,

    profileSubDrawer,
    setProfileSubDrawer,

    refetchVideos,
    setRefetchVideos,

    refreshStories,
    setRefreshStories,
    authorDetail,
    setAuthorDetail,
    loading,
    setLoading,
    refetchArticles,
    setRefetchArticles,
    refetchNavbar,
    setRefetchNavbar,

    globalSearch,
    setGlobalSearch,
    showSearch,
    setShowSearch,

    selectedLevel,
    setSelectedLevel,
    selectedIndex,
    setSelectedIndex,
    affiliateDrawer,
    setAffiliateDrawer,

    payoutDrawer,
    setPayoutDrawer,

    refetchPayout,
    setRefetchPayout,

    refechProfile,
    setRefechProfile,
    refetchAuthors,
    setRefetchAuthors,

    updatedSuccessful,
    setupdatedSuccessful,

    requestsDrawer,
    setRequestsDrawer,

    refetchRequest,
    setRefetchRequest,

    requestText,
    setRequestText,

    filterDrawer,
    setFilterDrawer,

    selectedFilterRequest,
    setSelectedFilterRequest,

    slider,
    setSlider,
    NumberToText,

    selectedAuthor,
    setSelectedAuthor,

    refetchCourses,
    setRefetchCourses,
    adminMenu,

    getDisplayDate,

    gradeToggle,
    setGradeToggle,
    schoolToggle,
    setSchoolToggle,
    curriculumToggle,
    setCurriculumToggle,
    streamToggle,
    setStreamToggle,
    performanceToggle,
    setPerformanceToggle,
    financialToggle,
    setFinancialToggle,
    personalityToggle,
    setPersonalityToggle,
    refetchPaths,
    setRefetchPaths,
  };

  return (
    <GlobalContex.Provider value={value}>{children}</GlobalContex.Provider>
  );
};