// ===============================================
//  🌍 Naaviverse Global Context (CLEAN VERSION)
//  Provides: Auth, UI, Vault, Categories, Currencies, Menu List
// ===============================================

import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { MainMenuList } from "./pages/dashboard/WalletScan/WalletScanOverview/ScanWallet/WalletDashboard/Portals/MainMenu/MainMenu";

export const GlobalContex = createContext();
     
export const GlobalContexProvider = ({ children }) => {
  // --------------------------------------------
  // AUTH & SESSION
  // --------------------------------------------
  const [loginData, setLoginData] = useState(
    JSON.parse(localStorage.getItem("loginData")) || null
  );
  const [login, setLogin] = useState(false);

  const [userType, setUserType] = useState(
    localStorage.getItem("userType") || "App Owner"
  );

  useEffect(() => {
    localStorage.setItem("userType", userType);
  }, [userType]);

  // --------------------------------------------
  // UI STATE
  // --------------------------------------------
  const [collapse, setCollapse] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // --------------------------------------------
  // SERVICES / CATEGORIES (LOCAL API)
  // --------------------------------------------
  const [categories, setCategories] = useState([]);
  const [refetchCategories, setRefetchCategories] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const getCategories = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/categories`);

    if (!res?.data?.status || !Array.isArray(res.data.categories)) {
      setCategories([]);
      return;
    }

    setCategories(res.data.categories);
  } catch (err) {
    console.error("Categories API error:", err);
    setCategories([]);
  }
};


  useEffect(() => {
    getCategories();
  }, [refetchCategories]);

  // --------------------------------------------
  // CURRENCIES
  // --------------------------------------------
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [currencyLoading, setCurrencyLoading] = useState(false);

const loadCurrencies = async () => {
  setCurrencyLoading(true);

  try {
    const res = await axios.get(`${BASE_URL}/api/currencies`);

    if (!res?.data?.status || !Array.isArray(res.data.currencies)) {
      setAllCurrencies([]);
      return;
    }

    const formatted = res.data.currencies.map((c) => ({
      coinName: c.code,
      coinSymbol: c.code,
      fullName: c.currency,
    }));

    setAllCurrencies(formatted);
  } catch (err) {
    console.error("Currencies API error:", err);
    setAllCurrencies([]);
  } finally {
    setCurrencyLoading(false);
  }
};

  useEffect(() => {
    loadCurrencies();
  }, []);

  // --------------------------------------------
  // VAULT COINS
  // --------------------------------------------
  const [vaultCoins, setVaultCoins] = useState([]);
  const [coinLoading, setCoinLoading] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);

  const loadVaultCoins = (email) => {
    if (!email) return;

    setCoinLoading(true);
    axios
      .get(`${BASE_URL}/api/vault/coins/${encodeURIComponent(email)}`)
      .then((res) => {
        if (res.data.status) {
          setVaultCoins(res.data.data);
        }
      })
      .finally(() => {
        setCoinLoading(false);
      });
  };

  useEffect(() => {
    if (loginData?.user?.email) {
      loadVaultCoins(loginData.user.email);
    }
  }, [loginData]);


  // --------------------------------------------
// PATH FILTER TOGGLES
// --------------------------------------------
const [gradeToggle, setGradeToggle] = useState(false);
const [schoolToggle, setSchoolToggle] = useState(false);
const [curriculumToggle, setCurriculumToggle] = useState(false);
const [streamToggle, setStreamToggle] = useState(false);
const [performanceToggle, setPerformanceToggle] = useState(false);
const [financialToggle, setFinancialToggle] = useState(false);
const [personalityToggle, setPersonalityToggle] = useState(false);

const [refetchPaths, setRefetchPaths] = useState(false);

  // --------------------------------------------
  // PROVIDER VALUE
  // --------------------------------------------
const value = {
  // session
  loginData,
  setLoginData,
  login,
  setLogin,
  userType,
  setUserType,

  // ui
  collapse,
  setCollapse,
  selectedApp,
  setSelectedApp,

  // menu list
  MainMenuList,

  // categories
  categories,
  refetchCategories,
  setRefetchCategories,

  // currencies
  allCurrencies,
  currencyLoading,
  loadCurrencies,

  // vault
  vaultCoins,
  selectedCoin,
  setSelectedCoin,
  coinLoading,
  loadVaultCoins,

  // --------------------------------------------
  // PATH FILTER STATES (FIX FOR YOUR ERROR)
  // --------------------------------------------
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
    <GlobalContex.Provider value={value}>
      {children}
    </GlobalContex.Provider>
  );
};