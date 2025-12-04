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

  const getCategories = () => {
    axios.get("http://localhost:4545/api/categories").then((res) => {
      if (res.data.status) {
        setCategories(res.data.categories);
      }
    });
  };

  useEffect(() => {
    getCategories();
  }, [refetchCategories]);

  // --------------------------------------------
  // CURRENCIES
  // --------------------------------------------
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [currencyLoading, setCurrencyLoading] = useState(false);

  const loadCurrencies = () => {
    setCurrencyLoading(true);
    axios
      .get("http://localhost:4545/api/currencies")
      .then((res) => {
        if (res.data.status) {
          const formatted = res.data.currencies.map((c) => ({
            coinName: c.code,
            coinSymbol: c.code,
            fullName: c.currency,
          }));
          setAllCurrencies(formatted);
        }
      })
      .finally(() => setCurrencyLoading(false));
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
      .get(`http://localhost:4545/api/vault/coins/${encodeURIComponent(email)}`)
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
  };

  return (
    <GlobalContex.Provider value={value}>
      {children}
    </GlobalContex.Provider>
  );
};
