import { useState, useEffect, useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import DashboardLoginPage from "./pages/DashboardLoginPage";
import PostLoginPage from "./pages/PostLoginPage";
import RoutePage from "./pages/RoutePage/routepage";
import MapsPage from "./pages/MapsPage";
import { GlobalContex } from "./globalContext";

import Loginpage from "./pages/login/loginpage";
import Dashboard from "./pages/dashboard/dashboard";
import AccDashboard from "./pages/accDashbaoard/accDashboard";
import AccProfile from "./pages/accProfile/AccProfile";

import Directory from "./pages/Directory";
import SingleDirectory from "./pages/Directory/singleDirectory/SingleDirectory";

import MallProduct from "./pages/dashboard/MallProduct/MallProduct";

import FirstPage from "./pages/Registration/pages/FirstPage";
import RegistrationHomePage from "./pages/Registration/pages/HomePage";

import NodesPage from "./pages/NodesPage";
import UserProfile from "./pages/UserProfile";

import ServicePage from "./pages/ServicePage";
import SingleService from "./pages/ServicePage/SingleService";

import SingleProduct from "./pages/Directory/singleDirectory/SingleProduct";

import AdminLogin from "./pages/AdminLogin";
import AdminAccProfile from "./pages/AdminAccProfile";
import AdminAccDashbaoard from "./pages/AdminAccDashbaoard";

import NewHomePage from "./pages/Registration/Home";
import StepPage from "./pages/CurrentStep/StepPage";
import PathPage from "./components/Pathview/PathPage";

import JourneyPage from "./pages/JourneyPage";
import PurchaseSuccess from "./pages/PurchaseSuccess";

import MainMenuComponent from "./pages/dashboard/WalletScan/WalletScanOverview/ScanWallet/WalletDashboard/Portals/MainMenu/MainMenu";

function App() {
  const { loginData, selectedApp, setSelectedApp, MainMenuList } =
    useContext(GlobalContex);

  // ---------------------------
  // Load / initialize selectedApp
  // ---------------------------
  useEffect(() => {
    const stored = localStorage.getItem("selectedApp");

    if (stored && selectedApp === null) {
      setSelectedApp(JSON.parse(stored));
    } else if (stored && selectedApp !== null) {
      localStorage.setItem("selectedApp", JSON.stringify(selectedApp));
    } else {
      // first time default
      localStorage.setItem("selectedApp", JSON.stringify(MainMenuList[0]));
      setSelectedApp(MainMenuList[0]);
    }
  }, [selectedApp, setSelectedApp, MainMenuList]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/journey" element={<JourneyPage />} />

      <Route
        path="/register"
        element={
          window.innerWidth > 600 ? <NewHomePage /> : <DashboardLoginPage />
        }
      />

      <Route
        path="/register/affiliate"
        element={
          window.innerWidth > 600 ? <FirstPage /> : <DashboardLoginPage />
        }
      />

      <Route
        path="/register/affiliate/:id"
        element={
          window.innerWidth > 600 ? <FirstPage /> : <DashboardLoginPage />
        }
      />

      <Route path="/register/pre-registered" element={<FirstPage />} />
      <Route path="/register/pre-registered/:id" element={<FirstPage />} />

      <Route path="/register/by-myself" element={<FirstPage />} />
      <Route path="/register/by-myself/:id" element={<FirstPage />} />

      {/* Auth Protected Routes */}
      <Route
        path="/*"
        element={loginData ? <RoutePage /> : <Navigate to="/login" />}
      />

      <Route path="/maps" element={<MapsPage />} />
      <Route path="/login" element={<Loginpage />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard/profile" element={<AdminAccProfile />} />
      <Route path="/admin/dashboard/accountants" element={<AdminAccDashbaoard />} />

      {/* User Dashboard */}
      <Route path="/dashboard/users" element={<Dashboard />} />
      <Route path="/dashboard/users/profile" element={<UserProfile />} />
      <Route path="/dashboard/users/:id" element={<MallProduct />} />

      {/* Accountant Dashboard */}
      <Route path="/dashboard/accountants" element={<AccDashboard />} />
      <Route path="/dashboard/accountants/profile" element={<AccProfile />} />

      {/* Directories */}
      <Route path="/directory/nodes" element={<NodesPage />} />
      <Route path="/directory/nodes/:id" element={<SingleDirectory />} />
      <Route path="/directory/nodes/:id/:id" element={<SingleProduct />} />

      {/* Steps / Paths */}
      <Route path="dashboard/path/:id" element={<PathPage />} />
      <Route path="dashboard/step/:id" element={<StepPage />} />

      {/* Purchase */}
      <Route path="purchase/success" element={<PurchaseSuccess />} />
    </Routes>
  );
}

export default App;
