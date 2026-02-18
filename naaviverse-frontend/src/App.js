// import { useEffect, useContext } from "react";
// import { Route, Routes, Navigate } from "react-router-dom";

// /* ========== PUBLIC ========== */
// import UserAnalysis from "./views/home-pages/UserAnalysis";

// import Loginpage from "./pages/login/loginpage";
// import MapsPage from "./pages/MapsPage";
// import NewHomePage from "./pages/Registration/Home";


// /* ========== USER ========== */
// import Dashboard from "./pages/dashboard/dashboard";
// import UserProfile from "./pages/UserProfile";
// import StepPage from "./pages/CurrentStep/StepPage";
// import MallProduct from "./pages/dashboard/MallProduct/MallProduct";

// /* ========== ACCOUNTANT ========== */
// import AccDashboard from "./pages/accDashbaoard/accDashboard";
// import AccProfile from "./pages/accProfile/AccProfile";
// import MyPaths from "./pages/MyPaths/index.jsx";
// import MyStepsAcc from "./pages/accDashbaoard/MyStepsAcc/index.jsx";


// /* ========== DIRECTORY ========== */
// import NodesPage from "./pages/NodesPage";
// import SingleDirectory from "./pages/Directory/singleDirectory/SingleDirectory";
// import SingleProduct from "./pages/Directory/singleDirectory/SingleProduct";

// /* ========== ADMIN ========== */
// import AdminLogin from "./pages/AdminLogin";
// import AdminAccDashbaoard from "./pages/AdminAccDashbaoard";
// import AdminProfilePage from "./pages/AdminAccDashbaoard/Profile/profile_page";

// /* ========== PATH / FLOW ========== */
// import RoutePage from "./pages/RoutePage/routepage";
// import PathPage from "./components/Pathview/PathPage";
// import PurchaseSuccess from "./pages/PurchaseSuccess";

// /* ========== GLOBAL CONTEXT ========== */
// import { GlobalContex } from "./globalContext";

// function App() {
//   const { loginData, selectedApp, setSelectedApp, MainMenuList } =
//     useContext(GlobalContex);

//   useEffect(() => {
//     const stored = localStorage.getItem("selectedApp");
//     if (stored && !selectedApp) {
//       setSelectedApp(JSON.parse(stored));
//     } else if (!stored && MainMenuList?.length) {
//       localStorage.setItem("selectedApp", JSON.stringify(MainMenuList[0]));
//       setSelectedApp(MainMenuList[0]);
//     }
//   }, [selectedApp, setSelectedApp, MainMenuList]);

//   return (
//     <Routes>
//       {/* ================= PUBLIC ================= */}
//       <Route path="/" element={<UserAnalysis />} />
//       <Route path="/login" element={<Loginpage />} />
//       <Route path="/register" element={<NewHomePage />} /> 
//       <Route path="/maps" element={<MapsPage />} />

//       {/* ================= USER DASHBOARD ================= */}
//       <Route path="/dashboard/users" element={<Dashboard />} />
//       <Route path="/dashboard/users/profile" element={<UserProfile />} />
//       <Route path="/dashboard/users/my-journey" element={<Dashboard />} />
//       <Route path="/dashboard/users/current-step" element={<Dashboard />} />
//       <Route path="/dashboard/users/:id" element={<MallProduct />} />

//       {/* ================= ACCOUNTANT ================= */}
//      <Route path="/dashboard/accountants" element={<AccDashboard />}>
//   <Route index element={<Dashboard />} />
//   <Route path="paths" element={<MyPaths />} />
//   <Route path="steps" element={<MyStepsAcc />} />
//   <Route path="services" element={<Dashboard/>} />
// <Route path="path/:id" element={<PathPage />} />
// </Route>


//       <Route path="/dashboard/accountants/profile" element={<AccProfile />} />

//       {/* ================= ADMIN ================= */}
//       <Route path="/admin/login" element={<AdminLogin />} />
//       <Route path="/admin/dashboard/profile" element={<AdminProfilePage />} />

//       <Route
//         path="/admin/dashboard/accountants"
//         element={<AdminAccDashbaoard />}
//       />

//       {/* ================= DIRECTORIES ================= */}
//       <Route path="/directory/nodes" element={<NodesPage />} />
//       <Route path="/directory/nodes/:id" element={<SingleDirectory />} />
//       <Route path="/directory/nodes/:id/:id" element={<SingleProduct />} />

//       {/* ================= PATH / STEP ================= */}
//       <Route path="/dashboard/path/:id" element={<PathPage />} />
//       <Route path="/dashboard/step/:id" element={<StepPage />} />

//       {/* ================= PURCHASE ================= */}
//       <Route path="/purchase/success" element={<PurchaseSuccess />} />

//       {/* ================= AUTH FALLBACK ================= */}
//      <Route path="/*" element={<RoutePage />} />

//     </Routes>
//   );
// }

// export default App;


// ✅ NEW / CORRECT App.js (Shell)
import React, { Fragment, useEffect } from "react";
import { Helmet } from "react-helmet";
import AOS from "aos";
import "aos/dist/aos.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import ScrollToTop from "./components/ScrollToTop";

/* ================= TEMPLATE ROUTER ================= */
import AppRouter from "./router/AppRouter";

/* ================= PUBLIC ================= */
import MapsPage from "./pages/MapsPage";
import Loginpage from "./pages/login/loginpage";
import NewHomePage from "./pages/Registration/Home";

/* ================= USER ================= */
import Dashboard from "./pages/dashboard/dashboard";
import UserProfile from "./pages/UserProfile";
import StepPage from "./pages/CurrentStep/StepPage";
import MallProduct from "./pages/dashboard/MallProduct/MallProduct";

/* ================= ACCOUNTANT ================= */
import AccDashboard from "./pages/accDashbaoard/accDashboard";
import AccProfile from "./pages/accProfile/AccProfile";
import MyPaths from "./pages/MyPaths";
import NewStep1 from "./globalComponents/GlobalDrawer/NewStep1"
import MyStepsAcc from "./pages/accDashbaoard/MyStepsAcc";
import PathPage from "./components/Pathview/PathPage";

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

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
    });
  }, []);

  useEffect(() => {
    axios
      .post("http://localhost:4545/api/admin-visitors/admin-visitor")
      .catch(() => {});
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
          <Route path="/*" element={<AppRouter />} />

          {/* ================= PUBLIC ================= */}
          <Route path="/login" element={<Loginpage />} />
          <Route path="/register" element={<NewHomePage />} />
          <Route path="/maps" element={<MapsPage />} />

         
      {/* ================= USER DASHBOARD ================= */}
      <Route path="/dashboard/users" element={<Dashboard />} />
      <Route path="/dashboard/users/profile" element={<UserProfile />} />
      <Route path="/dashboard/users/my-journey" element={<Dashboard />} />
      <Route path="/dashboard/users/current-step" element={<Dashboard />} />
      <Route path="/dashboard/users/:id" element={<MallProduct />} />

             {/* ================= PATH / STEP ================= */}
          <Route path="/dashboard/path/:id" element={<PathPage />} />
          <Route path="/dashboard/step/:id" element={<StepPage />} />

          {/* ================= ACCOUNTANT ================= */}
          <Route path="/dashboard/accountants" element={<AccDashboard />}>
            <Route index element={<Dashboard />} />
            <Route path="paths" element={<MyPaths />} />
            <Route path="steps" element={<MyStepsAcc />} />
            <Route path="path/:id/create-step" element={<NewStep1 />} />

            <Route path="path/:id" element={<PathPage />} />
             <Route path="services" element={<Dashboard/>} />
          </Route>

          <Route
            path="/dashboard/accountants/profile"
            element={<AccProfile />}
          />



    {/* ================= ADMIN ================= */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard/profile" element={<AdminProfilePage />} />

       <Route
        path="/admin/dashboard/accountants"
         element={<AdminAccDashbaoard />}/>
      
         {/* ================= SUPER ADMIN ================= */}
<Route path="/admin-login" element={<SuperAdminLogin />} />

<Route path="/admin-dashboard" element={<AdminDashboard  />}>
  {/* <Route element={<AdminDashboard />}> */}
    <Route path="admin-home" element={<HomeDashboard />} />
    <Route path="admin-contact" element={<ContactList />} />
    <Route path="admin-subscribe" element={<SubscriptionList />} />
    <Route path="admin-visitors" element={<VisitorsList />} />
  </Route>


   
          {/* ================= PURCHASE ================= */}
          <Route path="/purchase/success" element={<PurchaseSuccess />} />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<RoutePage />} />
        </Routes>
      </BrowserRouter>
    </Fragment>
  );
}

export default App;