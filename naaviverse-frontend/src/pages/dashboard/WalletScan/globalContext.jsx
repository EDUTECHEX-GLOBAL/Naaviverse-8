import axios from "axios";
import { useState, createContext, useEffect } from "react";

// Global Sidebar Logo Imports

import instaLegal from "./assets/images/globalSidebar/instaLegal.svg";
import capitalized from "./assets/images/globalSidebar/capitalized.svg";
import taxchains from "./assets/images/globalSidebar/taxchains.svg";
import contracts from "./assets/images/globalSidebar/contracts.svg";
import cabinets from "./assets/images/globalSidebar/cabinets.svg";
import logo3 from "./assets/images/globalSidebar/logo3.svg";
import logo4 from "./assets/images/globalSidebar/logo4.svg";
import logo5 from "./assets/images/globalSidebar/logo5.svg";

// Local Sidebar Full Logo Imports
import instaLegalFull from "./assets/images/globalSidebar/instaLegal_full.svg";
import capitalizedFull from "./assets/images/globalSidebar/capitalized_full.svg";
import taxchainsFull from "./assets/images/globalSidebar/taxchains_full.svg";
import contractsFull from "./assets/images/globalSidebar/contracts_full.svg";
import cabinetsFull from "./assets/images/globalSidebar/cabinets_full.svg";

export const GlobalContex = createContext();

export const GlobalContexProvider1 = ({ children }) => {
  const [selectedHomeMenu, setSelectedHomeMenu] = useState("How It Works");

  const [selectedApp, setSelectedApp] = useState(null);
  const [loginData, setLoginData] = useState(null);

  const [loading, setLoading] = useState(false);

  const [collapse, setCollapse] = useState(false);

  const [active, setActive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState(null);

  const [bankerEmail, setBankerEmail] = useState("");

  const [globalMenuAdd, setGlobalMenuAdd] = useState(false);

  const [filters, setFilters] = useState([]);

  const [selectedFilter1, setSelectedFilter1] = useState(null);
  const [selectedFilter2, setSelectedFilter2] = useState("");
  const [selectedFilter21, setSelectedFilter21] = useState("");
  const [filter1, setFilter1] = useState(false);
  const [filter2, setFilter2] = useState(false);
  const [customerEmailFilter, setCustomerEmailFilter] = useState(null);
  const [allCoins, setAllCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [openCoinFilter, setOpenCoinFilter] = useState(false);
  const [refetchApi, setRefetchApi] = useState(false);
  const [tabSelected, setTabSelected] = useState("");
  const [query, setQuery] = useState("");
  const [shareToken, setShareToken] = useState(null);

  const [allShareToken, setAllShareToken] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [globalFilter, setGlobalFilter] = useState(false);

  const [showSubDraw, setShowSubDraw] = useState(false);
  const [bondSelected, setBondSelected] = useState(null);
  const [contractsData, setContractsData] = useState("");

  //Bond Filters

  const [selectedAssetFilters, setSelectedAssetFilters] = useState([]);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState([
    "active",
  ]);
  const [selectedLengthFilter, setSelectedLengthFilter] = useState("");
  const [refetchBonds, setRefetchBonds] = useState(false);

  const [refetchTiers, setRefetchTiers] = useState(false);

  //Terminal Admin Panel
  const [selectedTerminal, setSelectedTerminal] = useState(null);
  const [selectedShareToken, setSelectedShareToken] = useState(
    localStorage.getItem("selectedShareCoin") || null
  );
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedAppData, setSelectedAppData] = useState("");
  const [reloadpage, setreloadpage] = useState(false);
  const [holderData, setHolderData] = useState("");
  const [theApp, setTheApp] = useState("");
  const [compData, setCompData] = useState("");
  const [DistribData, setDistribData] = useState("");

  const [DistributionData, setDistributionData] = useState([]);
  const [getBankerTag, setgetBankerTag] = useState([]);
  const [compLoader, setCompLoader] = useState(true);
  const [distLoader, setDistLoader] = useState(true);
  const [selectedSubs, setSelectedSubs] = useState("");
  const [licenseCheck, setLicenseCheck] = useState("");
  const [coinsCombinations, setCoinsCombinations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedMobileMenu, setSelectedMobileMenu] = useState("");
  const [selectedMobileSubmenu, setSelectedMobileSubmenu] = useState("");

  //dropdown
  const [dropDown, setdropDown] = useState(false);
  const [dropDownSelectedSub, setdropDownSelectedSub] =
    useState("How It Works");

  const globalMenu = [
    {
      appName: "InstaLegal",
      appLogo: instaLegal,
      appFullLogo: instaLegalFull,
      appColor: "#334480",
    },
    {
      appName: "TaxChains",
      appLogo: taxchains,
      appFullLogo: taxchainsFull,
      appColor: "#1F304F",
    },
    {
      appName: "CapitalizedApp",
      appLogo: capitalized,
      appFullLogo: capitalizedFull,
      appColor: "#78C92E",
    },
    {
      appName: "Contracts",
      appLogo: contracts,
      appFullLogo: contractsFull,
      appColor: "#295199",
    },
    {
      appName: "Cabinets",
      appLogo: cabinets,
      appFullLogo: cabinetsFull,
      appColor: "#5ABEA0",
    },
  ];

  useEffect(() => {
    if (localStorage.getItem("bankerEmailNew")) {
      setBankerEmail(localStorage.getItem("bankerEmailNew"));
    } else {
      setBankerEmail(loginData?.user?.email);
    }
    setSelectedApp(JSON.parse(localStorage.getItem("selectedApp")));
  }, []);

  useEffect(() => {
    if (localStorage.getItem("loginData")) {
      setLoginData(JSON.parse(localStorage.getItem("loginData")));
    }
  }, [localStorage.getItem("loginData")]);

  useEffect(() => {
    if (localStorage.getItem("selectedApp") && selectedApp === null) {
      setSelectedApp(JSON.parse(localStorage.getItem("selectedApp")));
    } else if (localStorage.getItem("selectedApp")) {
      localStorage.setItem("selectedApp", JSON.stringify(selectedApp));
    } else {
      localStorage.setItem("selectedApp", JSON.stringify(globalMenu[0]));
      setSelectedApp(globalMenu[0]);
    }
  }, [selectedApp]);

  const handleReplaceTab = (item) => {
    if (
      tabs.findIndex((o) => o.menuName === item.menuName) < 0 ||
      tabs.length < 1
    ) {
      const index = tabs.findIndex((o) => o.menuName === selectedTab.menuName);
      console.log(
        tabs.findIndex((o) => o.menuName === selectedTab.menuName),
        selectedTab,
        "jhwgjwhe"
      );
      tabs.splice(index, 1, item);
      setSelectedTab(tabs.length < 1 ? tabs[index] : item);
    } else {
      setSelectedTab(item);
    }
  };

  const convertCurrencySystem = (inputValue) => {
    // if (selectedCoin.coinSymbol === "INR") {
    //   return Math.abs(Number(inputValue)) >= 1.0e7
    //     ? (Math.abs(Number(inputValue)) / 1.0e7).toFixed(1)
    //     : // Six Zeroes for Millions
    //     Math.abs(Number(inputValue)) >= 1.0e5
    //     ? (Math.abs(Number(inputValue)) / 1.0e5).toFixed(1)
    //     : // Three Zeroes for Thousands
    //     Math.abs(Number(inputValue)) >= 1.0e3
    //     ? (Math.abs(Number(inputValue)) / 1.0e3).toFixed(1)
    //     : Math.abs(Number(inputValue));
    // } else {
    // Nine Zeroes for Billions
    return Math.abs(Number(inputValue)) >= 1.0e9
      ? (Math.abs(Number(inputValue)) / 1.0e9).toFixed(1)
      : // Six Zeroes for Millions
      Math.abs(Number(inputValue)) >= 1.0e6
        ? (Math.abs(Number(inputValue)) / 1.0e6).toFixed(1)
        : // Three Zeroes for Thousands
        Math.abs(Number(inputValue)) >= 1.0e3
          ? (Math.abs(Number(inputValue)) / 1.0e3).toFixed(1)
          : Math.abs(Number(inputValue));
    // }
  };

  const convertCurrencySystem1 = (inputValue) => {
    // if (selectedCoin.coinSymbol === "INR") {
    //   return Math.abs(Number(inputValue)) >= 1.0e7
    //     ? "Cr"
    //     : // Six Zeroes for Millions
    //     Math.abs(Number(inputValue)) >= 1.0e5
    //     ? "L"
    //     : // Three Zeroes for Thousands
    //     Math.abs(Number(inputValue)) >= 1.0e3
    //     ? "K"
    //     : "";
    // } else {
    // Nine Zeroes for Billions
    return Math.abs(Number(inputValue)) >= 1.0e9
      ? "B"
      : // Six Zeroes for Millions
      Math.abs(Number(inputValue)) >= 1.0e6
        ? "M"
        : // Three Zeroes for Thousands
        Math.abs(Number(inputValue)) >= 1.0e3
          ? "K"
          : "";
    // }
  };

  const FormatNumber = (value, prec) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: prec,
      minimumFractionDigits: prec,
    }).format(isNaN(value) ? 0 : value);
  };

  const FormatCurrency = (value = 0, coin = "USD") => {
    if (coin.toUpperCase() === "BTC" || coin.toUpperCase() === "ETH") {
      if (value < 10) {
        return FormatNumber(value, 4);
      } else {
        return FormatNumber(value, 3);
      }
    }
    return FormatNumber(value, 2);
  };

  const value = {
    selectedHomeMenu,
    setSelectedHomeMenu,
    setgetBankerTag,
    getBankerTag,
    tabSelected,
    setTabSelected,
    globalMenu,
    selectedApp,
    setSelectedApp,
    loading,
    setLoading,
    loginData,
    setLoginData,
    collapse,
    setCollapse,
    active,
    setActive,
    modalOpen,
    setModalOpen,
    tabs,
    setTabs,
    selectedTab,
    setSelectedTab,
    globalMenuAdd,
    setGlobalMenuAdd,
    bankerEmail,
    setBankerEmail,

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
    allCoins,
    setAllCoins,
    selectedCoin,
    setSelectedCoin,
    openCoinFilter,
    setOpenCoinFilter,
    refetchApi,
    setRefetchApi,
    query,
    setQuery,
    shareToken,
    setShareToken,
    allShareToken,
    setAllShareToken,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    FormatNumber,
    FormatCurrency,
    filters,
    setFilters,
    globalFilter,
    setGlobalFilter,
    showSubDraw,
    setShowSubDraw,
    bondSelected,
    setBondSelected,

    //Bond Filters
    selectedAssetFilters,
    setSelectedAssetFilters,
    selectedStatusFilters,
    setSelectedStatusFilters,
    selectedLengthFilter,
    setSelectedLengthFilter,
    refetchBonds,
    setRefetchBonds,

    //Terminals
    selectedTerminal,
    setSelectedTerminal,
    refetchTiers,
    setRefetchTiers,
    showMobileMenu,
    setShowMobileMenu,

    //Capitalized
    selectedShareToken,
    setSelectedShareToken,
    selectedAppData,
    setSelectedAppData,
    holderData,
    setHolderData,
    theApp,
    setTheApp,
    compData,
    setCompData,
    DistribData,
    setDistribData,
    DistributionData,
    setDistributionData,
    compLoader,
    setCompLoader,
    distLoader,
    setDistLoader,
    selectedSubs,
    setSelectedSubs,
    licenseCheck,
    setLicenseCheck,
    contractsData,
    setContractsData,
    coinsCombinations,
    setCoinsCombinations,
    searchTerm,
    setSearchTerm,
    //menus
    // bankerMenu,

    //Functions

    handleReplaceTab,
    convertCurrencySystem,
    convertCurrencySystem1,
    selectedMobileMenu,
    setSelectedMobileMenu,
    selectedMobileSubmenu,
    setSelectedMobileSubmenu,

    //dropdown
    dropDown,
    setdropDown,
    dropDownSelectedSub,
    setdropDownSelectedSub,
  };

  return (
    <GlobalContex.Provider value={value}>{children}</GlobalContex.Provider>
  );
};
