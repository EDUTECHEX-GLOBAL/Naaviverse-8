// ✅ CORRECTED App.js
import React, { Fragment, useEffect } from "react";
import { Helmet } from "react-helmet";
import AOS from "aos";
import "aos/dist/aos.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import ScrollToTop from "./components/ScrollToTop";
import MyStepsAdmin from "./pages/AdminAccDashbaoard/MyStepsAdmin";
/* ================= TEMPLATE ROUTER ================= */
import AppRouter from "./router/AppRouter";

/* ================= PUBLIC ================= */
import MapsPage from "./pages/MapsPage";
import Loginpage from "./pages/login/loginpage";
import NewHomePage from "./pages/Registration/Home";

/* ================= USER ================= */
import Dashboard from "./pages/dashboard/dashboard";
import UserProfile from "./pages/UserProfile";
import Wallet from "./pages/Wallet";
import StepPage from "./pages/CurrentStep/StepPage";
import MallProduct from "./pages/dashboard/MallProduct/MallProduct";

/* ================= ACCOUNTANT ================= */
import AccDashboard from "./pages/accDashbaoard/accDashboard";
import AccProfile from "./pages/accProfile/AccProfile";
import MyPaths from "./pages/MyPaths";
import NewStep1 from "./globalComponents/GlobalDrawer/NewStep1"
import CreateNewStep from "./pages/accDashbaoard/CreateNewStep";
import MyStepsAcc from "./pages/accDashbaoard/MyStepsAcc";
import PathPage from "./components/Pathview/PathPage";
import StepsListPage from "./pages/accDashbaoard/StepsListPage";
import ServicesListPage from "./pages/accDashbaoard/ServicesListPage";

/* ========== ADMIN ========== */
import AdminLogin from "./pages/AdminLogin";
import AdminAccDashbaoard from "./pages/AdminAccDashbaoard";
import AdminProfilePage from "./pages/AdminAccDashbaoard/Profile/profile_page";

/* ================= SUPER ADMIN ================= */
import SuperAdminLogin from "./AdminDashboard/pages/SuperAdminLogin";
import AdminDashboard from "./AdminDashboard/pages/AdminDashboard";
import PrivateRoute from "./AdminDashboard/components/PrivateRoute";
import HomeDashboard from "./AdminDashboard/components/Home";
import ContactList from "./AdminDashboard/components/ContactList";
import SubscriptionList from "./AdminDashboard/components/SubscriptionList";
import VisitorsList from "./AdminDashboard/components/VisitorsList";

/* ================= OTHER ================= */
import PurchaseSuccess from "./pages/PurchaseSuccess";
import RoutePage from "./pages/RoutePage/routepage";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
    });
  }, []);

  useEffect(() => {
    axios
      .post(`${BASE_URL}/api/admin-visitors/admin-visitor`)
      .catch(() => { });
  }, []);

  return (
    <Fragment>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>

      <BrowserRouter>
        <ScrollToTop />

        <Routes>
          {/* ================= SINCO TEMPLATE (LANDING + INNER PAGES) ================= */}
          <Route path="/" element={<AppRouter />} />

          {/* ================= PUBLIC ================= */}
          <Route path="/login" element={<Loginpage />} />
          <Route path="/register" element={<NewHomePage />} />
          <Route path="/maps" element={<MapsPage />} />

          {/* ================= USER DASHBOARD ================= */}
          <Route path="/dashboard/users" element={<Dashboard />} />
          <Route path="/dashboard/users/profile" element={<UserProfile />} />
          <Route path="/dashboard/users/paths" element={<Dashboard />} />
          <Route path="/dashboard/users/my-journey" element={<Dashboard />} />
          <Route path="/dashboard/users/current-step" element={<Dashboard />} />
          <Route path="/dashboard/users/transactions" element={<Dashboard />} />
          <Route path="/dashboard/users/wallet" element={<Wallet />} />

          {/* ✅ MUST be before /:id wildcard so it doesn't get caught by MallProduct */}
          <Route path="/dashboard/users/Marketplace" element={<Dashboard />} />

          {/* This wildcard catches everything else like /dashboard/users/some-product-code */}
          <Route path="/dashboard/users/:id" element={<MallProduct />} />

          {/* ================= PATH / STEP ================= */}
          <Route path="/dashboard/path/:id" element={<PathPage />} />
          <Route path="/dashboard/step/:id" element={<StepPage />} />
          <Route path="/paths/:pathId/steps" element={<StepsListPage />} />

          {/* ================= SERVICES ROUTES ================= */}
          <Route path="/services/all" element={<ServicesListPage />} />

          {/* ================= ACCOUNTANT ================= */}
          <Route path="/dashboard/accountants" element={<AccDashboard />}>
            <Route index element={<AccDashboard />} />
            <Route path="home" element={<AccDashboard />} />
            <Route path="crm" element={<AccDashboard />} />
            <Route path="paths" element={<AccDashboard />} />
            <Route path="steps" element={<AccDashboard />} />
            <Route path="marketplace" element={<AccDashboard />} />
            <Route path="path/:id/create-step" element={<NewStep1 />} />
            <Route path="path/:id" element={<PathPage />} />
          </Route>

          <Route path="/dashboard/accountants/profile" element={<AccProfile />} />

          {/* ================= ADMIN ================= */}
          {/* ================= ADMIN ================= */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard/profile" element={<AdminProfilePage />} />

          {/* ✅ Replace single route with nested sub-routes */}
          <Route path="/admin/dashboard/accountants" element={<AdminAccDashbaoard />} />
          <Route path="/admin/dashboard/crm" element={<AdminAccDashbaoard />} />
          <Route path="/admin/dashboard/paths" element={<AdminAccDashbaoard />} />
          <Route path="/admin/dashboard/steps" element={<AdminAccDashbaoard />} />
          <Route path="/admin/dashboard/marketplace" element={<AdminAccDashbaoard />} />

          {/* ================= SUPER ADMIN ================= */}
          <Route path="/admin-login" element={<SuperAdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />}>
            <Route path="admin-home" element={<HomeDashboard />} />
            <Route path="admin-contact" element={<ContactList />} />
            <Route path="admin-subscribe" element={<SubscriptionList />} />
            <Route path="admin-visitors" element={<VisitorsList />} />
          </Route>

          {/* ================= PURCHASE ================= */}
          <Route path="/purchase/success" element={<PurchaseSuccess />} />

          {/* ================= FALLBACK ================= */}
          <Route path="/*" element={<AppRouter />} />
          <Route path="*" element={<RoutePage />} />


        </Routes>
      </BrowserRouter>
    </Fragment>
  );
}

export default App;