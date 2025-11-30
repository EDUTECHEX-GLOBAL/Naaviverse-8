import { useState, useEffect, createContext } from "react";
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
  useEffect(() => {
    axios

      .get("https://comms.globalxchange.io/coin/vault/get/all/coins")
      .then(({ data }) => {
        if (data.status) {
          let obj = {};
          data.coins.forEach((coin) => {
            obj[coin.coinSymbol] = coin;
          });
          setCoinListObject(obj);
        }
      });
  }, []);

  useEffect(() => {
    if (tabSelected !== "Requests") {
      setFilterDrawer(false);
    }
  }, [tabSelected]);

useEffect(() => {
  if (!bankerEmail) return;

  setCoinLoading(true);

  axios
    .get(`http://localhost:4545/api/vault/coins/${encodeURIComponent(bankerEmail)}`)
    .then((res) => {
      const { data } = res;
      if (data.status) {
        setCoinList(data.data);
      }
    })
    .catch((err) => console.log("Vault error:", err.message))
    .finally(() => setCoinLoading(false));
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
    setAppLoading(true);
    axios
      .get("https://comms.globalxchange.io/gxb/apps/get")
      .then((res) => {
        const { data } = res;
        if (data.status) {
          const { apps } = data;
          setAppList(apps);
        }
      })
      .finally(() => setAppLoading(false));
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
      appData: "Don’t Have A/Publications/Account?",
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
    //   appData: "Don’t Have A/Publications/Account?",
    //   DispName: "For Publishers"
    // }
  ];

  // const { pathname } = useLocation();
  // console.log(pathname + " pathname")

  const adminMenu = [
    {
      menuName: "Paths",
      menuIcon: pubAdminIcon,
      enabled: true,
    },
    // {
    //   menuName: "Vendors",
    //   menuIcon: pubAdminIcon,
    //   enabled: true,
    // },
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

  // useEffect(() => {
  //   setSelectedApp(globalMenu[0]);
  // }, []);

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
    // if (!Number.isInteger(number) || number < 0) {
    //   throw new Error("Input must be a positive integer");
    // }

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

  // useEffect(() => {
  //   setSelectedApp(globalMenu[0]);
  // }, []);

  useEffect(() => {
    if (bankerEmail) {
      setLoading(true);

      if (selectedApp) {
        if (selectedApp?.appName === "Authors") {
          axios
            .get(
              `https://publications.apimachine.com/application/publisher/detail/${bankerEmail}`
            )
            .then(({ data }) => {
              setAllPublications(data?.data);
              setSelectedPublication(
                data?.data[0]?.PublicationDetails[0]?.PublicationDetail[0]
              );

              setLoading(false);
            });
        } else {
          axios
            .get(
              `https://publications.apimachine.com/publication/email/${bankerEmail}`
            )
            .then(({ data }) => {
              setAllPublications(data.data);
              setSelectedPublication(data.data[0]);
              setLoading(false);
            });
        }
      }
    }
  }, [bankerEmail, refetchData, selectedApp]);

  // useEffect(() => {
  //   axios
  //     .get(
  //       `https://publications.apimachine.com/application/publisher/detail/${bankerEmail}`
  //     )
  //     .then(({ data }) => {});
  // }, []);

  useEffect(() => {
    if (bankerEmail) {
      axios
        .get(
          `https://publications.apimachine.com/application/publisher/detail/${bankerEmail}`
          // `https://publications.apimachine.com/publisher?email=${bankerEmail}`
        )
        .then(({ data }) => {
          if (data.status) {
            setAuthorDetail(data.data[0]);
            localStorage.setItem("AuthorData", JSON.stringify(data.data));
          } else {
            setAuthorDetail(null);
            localStorage.setItem("AuthorData", null);
          }
        });
    }
  }, [bankerEmail]);

  useEffect(() => {}, []);

  useEffect(() => {
    if (localStorage.getItem("selectedApp") && selectedApp === null) {
      setSelectedApp(JSON.parse(localStorage.getItem("selectedApp")));
    } else if (localStorage.getItem("selectedApp")) {
      localStorage.setItem("selectedApp", JSON.stringify(selectedApp));
    } else {
      localStorage.setItem("selectedApp", JSON.stringify(MainMenu[0]));
      setSelectedApp(MainMenu[0]);
    }
  }, [selectedApp]);

  useEffect(() => {
    if (localStorage.getItem("loginData")) {
      setLoginData(JSON.parse(localStorage.getItem("loginData")));
    }
  }, [localStorage.getItem("loginData")]);

// --- SET BANKER EMAIL AFTER LOGIN DATA LOADS ---
useEffect(() => {
  let stored = localStorage.getItem("bankerEmailNew");

  if (stored) {
    setBankerEmail(stored);
  } else if (loginData?.user?.email) {
    setBankerEmail(loginData.user.email);
  }
}, [loginData]);


  useEffect(() => {
    axios
      .get(`https://comms.globalxchange.io/coin/vault/get/all/coins`)
      .then((res) => {
        if (res.data.status) {
          setAllCoins(res.data.coins);
          setSelectedCoin({
            coinImage:
              "https://apimachine-s3.s3.us-east-2.amazonaws.com/coinImages/dollar.png",
            coinName: "US Dollar",
            coinSymbol: "USD",
            market_cap: 0,
            symbol: "$",
            type: "fiat",
            usd_price: 1,
            volume_24hr: 0,
            _24hrchange: 0,
            _id: "5f21042d0562332558c93180",
          });
        }
      });
  }, []);

  //MyCryptoBrand Admin Modal Functions

  useEffect(() => {
    setMcbAdminLoading(true);
    if (bankerEmail) {
      axios
        .get(
          `https://comms.globalxchange.io/gxb/app/gxlive/user/operator/get?email=${bankerEmail}&show_apps=true`
        )
        .then((res) => {
          if (res.data.operators.length > 0) {
            setAllBrands(res.data.operators);
            setMcbAdminLoading(false);

            if (localStorage.getItem("selectedBrand")) {
              const found = res.data.operators.find(
                (o) =>
                  o._id ===
                  JSON.parse(localStorage.getItem("selectedBrand"))._id
              );

              if (found !== null && found !== undefined) {
                setSelectedBrand(
                  JSON.parse(localStorage.getItem("selectedBrand"))
                );
              } else {
                setSelectedBrand(res.data.operators[0]);
                // localStorage.setItem(
                //   "selectedBrand",
                //   JSON.stringify(res.data.operators[0])
                // );
              }
            } else {
              setSelectedBrand(res.data.operators[0]);
              // localStorage.setItem(
              //   "selectedBrand",
              //   JSON.stringify(res.data.operators[0])
              // );
            }
          }
        });
    }
  }, [bankerEmail]);

  useEffect(() => {
    setMcbAdminLoading(true);
    axios
      .get(
        `https://comms.globalxchange.io/gxb/apps/get?operator_id=${selectedBrand?.operator_id}`
      )
      .then((res1) => {
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
            // localStorage.setItem(
            //   "selectedBrandApp",
            //   JSON.stringify(res1.data.operators[0])
            // );
          }
        } else {
          setSelectedBrandApp(res1.data.apps[0]);
          // localStorage.setItem(
          //   "selectedBrandApp",
          //   JSON.stringify(res1.data.operators[0])
          // );
        }
      });
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
    // console.log(window.innerWidth);
    if (window.innerWidth < 720) {
      setIsMobile(true);
      console.log(window.innerWidth);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
  });

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
