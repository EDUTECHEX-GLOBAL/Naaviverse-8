import { useEffect, useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import DashboardLoginPage from "./pages/DashboardLoginPage";
import RoutePage from "./pages/RoutePage/routepage";
import MapsPage from "./pages/MapsPage";
import { GlobalContex } from "./globalContext";
import Loginpage from "./pages/login/loginpage";

import Dashboard from "./pages/dashboard/dashboard";
import AccDashboard from "./pages/accDashbaoard/accDashboard";
import AccProfile from "./pages/accProfile/AccProfile";

import SingleDirectory from "./pages/Directory/singleDirectory/SingleDirectory";
import MallProduct from "./pages/dashboard/MallProduct/MallProduct";

import FirstPage from "./pages/Registration/pages/FirstPage";
import NodesPage from "./pages/NodesPage";
import UserProfile from "./pages/UserProfile";
import ServicePage from "./pages/ServicePage";
import SingleService from "./pages/ServicePage/SingleService";
import SingleProduct from "./pages/Directory/singleDirectory/SingleProduct";

import AdminLogin from "./pages/AdminLogin";
import AdminAccDashbaoard from "./pages/AdminAccDashbaoard";
import AdminProfilePage from "./pages/AdminAccDashbaoard/Profile/profile_page";

import NewHomePage from "./pages/Registration/Home";
import StepPage from "./pages/CurrentStep/StepPage";
import PathPage from "./components/Pathview/PathPage";
import JourneyPage from "./pages/JourneyPage";
import PurchaseSuccess from "./pages/PurchaseSuccess";

function App() {
  const { loginData, selectedApp, setSelectedApp, MainMenu } =
    useContext(GlobalContex);

  useEffect(() => {
    const stored = localStorage.getItem("selectedApp");
    if (selectedApp === null) {
      if (stored) {
        setSelectedApp(JSON.parse(stored));
      } else {
        setSelectedApp(MainMenu[0]);
        localStorage.setItem("selectedApp", JSON.stringify(MainMenu[0]));
      }
    }
  }, []); // run once

  useEffect(() => {
    if (selectedApp !== null) {
      localStorage.setItem("selectedApp", JSON.stringify(selectedApp));
    }
  }, [selectedApp]);

  return (
    <Routes>
      {/* ================= ADMIN ROUTES ================= */}
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route path="/admin/dashboard" element={<AdminAccDashbaoard />}>
        {/* Admin Profile Page */}
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/" element={<HomePage />} />
      <Route path="/journey" element={<JourneyPage />} />
      <Route path="/maps" element={<MapsPage />} />
      <Route path="/login" element={<Loginpage />} />

      <Route
        path="/register"
        element={
          window.innerWidth > 600 ? (
            <NewHomePage />
          ) : (
            <DashboardLoginPage />
          )
        }
      />

      <Route path="/register/affiliate" element={<FirstPage />} />
      <Route path="/register/affiliate/:id" element={<FirstPage />} />
      <Route path="/register/pre-registered" element={<FirstPage />} />
      <Route path="/register/pre-registered/:id" element={<FirstPage />} />
      <Route path="/register/by-myself" element={<FirstPage />} />
      <Route path="/register/by-myself/:id" element={<FirstPage />} />

      {/* ================= USER DASHBOARD ================= */}
      <Route path="/dashboard/users" element={<Dashboard />} />
      <Route path="/dashboard/users/profile" element={<UserProfile />} />

      <Route path="/dashboard/accountants" element={<AccDashboard />} />
      <Route
        path="/dashboard/accountants/profile"
        element={<AccProfile />}
      />

      {/* ================= OTHER ROUTES ================= */}
      <Route path="/directory/nodes" element={<NodesPage />} />
      <Route path="/directory/nodes/:id" element={<SingleDirectory />} />
      <Route path="/dashboard/users/:id" element={<MallProduct />} />
      <Route path="/services" element={<ServicePage />} />
      <Route path="/services/:id" element={<SingleService />} />
      <Route path="/directory/nodes/:id/:id" element={<SingleProduct />} />
      <Route path="/dashboard/path/:id" element={<PathPage />} />
      <Route path="/dashboard/step/:id" element={<StepPage />} />
      <Route path="/purchase/success" element={<PurchaseSuccess />} />

      {/* ================= CATCH ALL (LAST) ================= */}
  <Route
  path="/*"
  element={
    window.location.pathname.startsWith("/admin")
      ? (
          JSON.parse(localStorage.getItem("adminuser"))?.email
            ? <Navigate to="/admin/dashboard" />
            : <Navigate to="/admin/login" />
        )
      : loginData !== null
        ? <RoutePage />
        : <Navigate to="/login" />
  }
/>

    </Routes>
  );
}

export default App;
