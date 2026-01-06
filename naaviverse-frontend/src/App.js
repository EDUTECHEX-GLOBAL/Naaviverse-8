import { useEffect, useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

/* ========== PUBLIC ========== */
import HomePage from "./pages/HomePage";
import Loginpage from "./pages/login/loginpage";
import MapsPage from "./pages/MapsPage";

/* ========== USER ========== */
import Dashboard from "./pages/dashboard/dashboard";
import UserProfile from "./pages/UserProfile";
import StepPage from "./pages/CurrentStep/StepPage";
import MallProduct from "./pages/dashboard/MallProduct/MallProduct";

/* ========== ACCOUNTANT ========== */
import AccDashboard from "./pages/accDashbaoard/accDashboard";
import AccProfile from "./pages/accProfile/AccProfile";

/* ========== DIRECTORY ========== */
import NodesPage from "./pages/NodesPage";
import SingleDirectory from "./pages/Directory/singleDirectory/SingleDirectory";
import SingleProduct from "./pages/Directory/singleDirectory/SingleProduct";

/* ========== ADMIN ========== */
import AdminLogin from "./pages/AdminLogin";
import AdminAccDashbaoard from "./pages/AdminAccDashbaoard";
import AdminProfilePage from "./pages/AdminAccDashbaoard/Profile/profile_page";

/* ========== PATH / FLOW ========== */
import RoutePage from "./pages/RoutePage/routepage";
import PathPage from "./components/Pathview/PathPage";
import PurchaseSuccess from "./pages/PurchaseSuccess";

/* ========== GLOBAL CONTEXT ========== */
import { GlobalContex } from "./globalContext";

function App() {
  const { loginData, selectedApp, setSelectedApp, MainMenuList } =
    useContext(GlobalContex);

  useEffect(() => {
    const stored = localStorage.getItem("selectedApp");
    if (stored && !selectedApp) {
      setSelectedApp(JSON.parse(stored));
    } else if (!stored && MainMenuList?.length) {
      localStorage.setItem("selectedApp", JSON.stringify(MainMenuList[0]));
      setSelectedApp(MainMenuList[0]);
    }
  }, [selectedApp, setSelectedApp, MainMenuList]);

  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Loginpage />} />
      <Route path="/maps" element={<MapsPage />} />

      {/* ================= USER DASHBOARD ================= */}
      <Route path="/dashboard/users" element={<Dashboard />} />
      <Route path="/dashboard/users/profile" element={<UserProfile />} />
      <Route path="/dashboard/users/my-journey" element={<Dashboard />} />
      <Route path="/dashboard/users/current-step" element={<Dashboard />} />
      <Route path="/dashboard/users/:id" element={<MallProduct />} />

      {/* ================= ACCOUNTANT ================= */}
      <Route path="/dashboard/accountants" element={<AccDashboard />} />
      <Route path="/dashboard/accountants/profile" element={<AccProfile />} />

      {/* ================= ADMIN ================= */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard/profile" element={<AdminProfilePage />} />

      <Route
        path="/admin/dashboard/accountants"
        element={<AdminAccDashbaoard />}
      />

      {/* ================= DIRECTORIES ================= */}
      <Route path="/directory/nodes" element={<NodesPage />} />
      <Route path="/directory/nodes/:id" element={<SingleDirectory />} />
      <Route path="/directory/nodes/:id/:id" element={<SingleProduct />} />

      {/* ================= PATH / STEP ================= */}
      <Route path="/dashboard/path/:id" element={<PathPage />} />
      <Route path="/dashboard/step/:id" element={<StepPage />} />

      {/* ================= PURCHASE ================= */}
      <Route path="/purchase/success" element={<PurchaseSuccess />} />

      {/* ================= AUTH FALLBACK ================= */}
      <Route
        path="/*"
        element={loginData ? <RoutePage /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
