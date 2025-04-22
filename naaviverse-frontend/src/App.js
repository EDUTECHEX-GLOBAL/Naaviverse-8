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

function App() {
  const { loginData, selectedApp, setSelectedApp, globalMenu, MainMenu } =
    useContext(GlobalContex);

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
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/journey" component={JourneyPage} />
      {/* <Route path="/dashboard" element={<DashboardLoginPage />} /> */}
      <Route exact path="/register" element={<NewHomePage />} />
      <Route
        exact
        path="/register/affiliate"
        element={
          window.innerWidth > 600 ? <FirstPage /> : <DashboardLoginPage />
        }
      />
      <Route
        exact
        path="/register/affiliate/:id"
        element={
          window.innerWidth > 600 ? <FirstPage /> : <DashboardLoginPage />
        }
      />
      <Route exact path="/register/pre-registered" element={<FirstPage />} />
      <Route
        exact
        path="/register/pre-registered/:id"
        element={<FirstPage />}
      />
      <Route exact path="/register/by-myself" element={<FirstPage />} />
      <Route exact path="/register/by-myself/:id" element={<FirstPage />} />
      {/* <Route
        path="/example"
        element={
          loginData !== null ? (
            <Navigate to={`/${selectedApp?.appName}`} />
          ) : (
            <Loginpage />
          )
        }
      /> */}
      {/* <Route
        path="/login"
        element={
          loginData !== null ? (
            <Navigate to={`/${selectedApp?.appName}`} />
          ) : (
            <Loginpage />
          )
        }
      /> */}
      <Route
        path="/*"
        element={loginData !== null ? <RoutePage /> : <Navigate to="/login" />}
      />
      {/* <Route path="/postLogin" element={<PostLoginPage />} /> */}
      <Route path="/maps" element={<MapsPage />} />
      <Route path="/login" element={<Loginpage />} />
      {/* Admin Routed */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard/profile" element={<AdminAccProfile />} />
      <Route path="/admin/dashboard/accountants" element={<AdminAccDashbaoard />} />

      <Route path="/dashboard/users" element={<Dashboard />} />
      <Route path="/dashboard/accountants" element={<AccDashboard />} />
      <Route path="/dashboard/accountants/profile" element={<AccProfile />} />
      <Route path="/dashboard/users/profile" element={<UserProfile />} />
      <Route path="/directory/nodes" element={<NodesPage />} />
      <Route path="/directory/nodes/:id" element={<SingleDirectory />} />
      <Route path="/dashboard/users/:id" element={<MallProduct />} />
      <Route path="/services" element={<ServicePage />} />
      <Route path="/services/:id" element={<SingleService />} />
      <Route path="/directory/nodes/:id/:id" element={<SingleProduct />} />
      <Route exact path="dashboard/path/:id" element={<PathPage/>}/>
      <Route exact path="dashboard/step/:id" element={<StepPage/>}/>
      <Route path="purchase/success" element={<PurchaseSuccess/>}/>
    </Routes>
  );
}

export default App;
