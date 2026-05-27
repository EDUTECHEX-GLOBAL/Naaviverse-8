import { memo, useEffect, useMemo, useState } from "react";
import { motion, transform } from "framer-motion";
import classNames from "./globalNewSidebar.module.scss";
import backWhite from "../../static/images/icons/backWhite.svg";
import closeWhite from "../../static/images/icons/closeWhite.svg";
import bondTier from "../../static/images/icons/bondTier.svg";
import offerings from "../../static/images/sidebarIcons/offerings.svg";
import shares from "../../static/images/sidebarIcons/shares.svg";
import bonds from "../../static/images/sidebarIcons/bonds.svg";

import mcbBrand from "../../static/images/globaldrawer/mcb_brand.svg";
import mcbApp from "../../static/images/globaldrawer/mcb_app.svg";
import mcbConglomerate from "../../static/images/globaldrawer/mcb_conglomerate.svg";
import mcbApplite from "../../static/images/globaldrawer/mcb_applite.svg";
import mcbOtcdesks from "../../static/images/globaldrawer/mcb_otcdesks.svg";
import revenue from "../../static/images/sidebarIcons/revenue.svg";
import Asset from "../../static/images/sidebarIcons/assetimg.svg";

import publication from "../../static/images/addNewIcons/publication.svg";
import user from "../../static/images/addNewIcons/user.svg";
import author from "../../static/images/addNewIcons/author.svg";
import article from "../../static/images/addNewIcons/article.svg";
import video from "../../static/images/addNewIcons/video.svg";
import category from "../../static/images/addNewIcons/category.svg";
import navBar from "../../static/images/addNewIcons/navBar.svg";
import webStory from "../../static/images/addNewIcons/webstory.svg";
import company from "../../static/images/addNewIcons/company.svg";
import WappIco from "../../static/images/addNewIcons/WappIco.svg";
import CourseIcon from "../../static/images/newCourseIco.svg"

// import NewShareToken from "./NewShareToken";
// import NewBondTier from "./NewBondTier";
// import Eternal from "./NewEternal";
import { GlobalContex } from "../../globalContext";
import { useContext } from "react";
// import NewMcbApp from "./NewMcbApp";
// import NewMcbBrand from "./NewMcbBrand";
// import NewAppData from "./NewAppData";
// import NewWithdrawal from "./NewWithdrawal";
// import NewAsset from "./NewAsset";
import NewPublication from "./NewPublication";
import NewAuthor from "./NewAuthor";
import NewArticle from "./NewArticle";
import NewNavBar from "./NewNavBar";
import NewCategory from "./NewCategory";
import NewVideo from "./NewVideo";
import NewWebStory from "./NewWebStory";
import NewCompany from "./NewCompany";
import NewCaseStudy from "./NewCaseStudy";
import NewReport from "./NewReport";
import NewDocumentary from "./NewDocumentary";
import NewCourse from "./NewCourse";
import NewStep from "./NewStep";
// import NewBond from "./NewBond";

function GlobalDrawer({ onClose, pathname }) {
  const {
    globalMenuAdd,
    setGlobalMenuAdd,
    licenseCheck,
    setLicenseCheck,
    wideDrawer,
    setWideDrawer,
    selectedPublication,
    slider,
    setSlider
  } = useContext(GlobalContex);

  const [search, setSearch] = useState("");
  const [mainMenu, setMainMenu] = useState("");
  const [subMenu, setSubMenu] = useState("");
  const [step, setStep] = useState("");
  const [loading, setLoading] = useState(false);

  const [menuList, setMenuList] = useState([]);
  const [drawerTitle, setDrawerTitle] = useState("");

  useEffect(() => {
    console.log(pathname, "jbdkjwqed");
    if (!slider) {
      setMainMenu("");
      setSubMenu("");
      setStep("");
    }
    if (pathname === "/Publishers") {
      setMenuList([
        {
          name: "Publication",
          icon: publication,
          enabled: true,
        },
        {
          name: "User",
          icon: user,
          enabled: true,
        },
        {
          name: "Author",
          icon: author,
          enabled: true,
          // enabled: licenseCheck === "active" ? true : false,
        },
        {
          name: "Article",
          icon: article,
          enabled: true,
          // enabled: licenseCheck === "active" ? true : false,
        },
        {
          name: "Video",
          icon: video,
          enabled: true,
          // enabled: licenseCheck === "active" ? true : false,
        },
        {
          name: "Category",
          icon: category,
          enabled: true,
          // enabled: licenseCheck === "active" ? true : false,
        },
        {
          name: "Navbar",
          icon: navBar,
          enabled: true,
          // enabled: licenseCheck === "active" ? true : false,
        },
        {
          name: "Web Story Template",
          icon: webStory,
          enabled: true,
        },
        {
          name: "Company",
          icon: company,
          enabled: true,
        },
        // {
        //   name: "CaseStudy",
        //   icon: company,
        //   enabled: true,
        // },
        // {
        //   name: "Report",
        //   icon: company,
        //   enabled: true,
        // },
        // {
        //   name: "Documentary",
        //   icon: company,
        //   enabled: true,
        // }
      ]);
    }
    if (pathname === "/Authors") {
      setMenuList([
        // {
        //   name: "Publication",
        //   icon: publication,
        //   enabled: true,
        // },
        // {
        //   name: "User",
        //   icon: user,
        //   enabled: true,
        // },
        // {
        //   name: "Author",
        //   icon: author,
        //   enabled: true,
        //   // enabled: licenseCheck === "active" ? true : false,
        // },
        {
          name: "Article",
          icon: article,
          enabled: true,
          // enabled: licenseCheck === "active" ? true : false,
        },
        {
          name: "Video",
          icon: video,
          enabled: true,
          // enabled: licenseCheck === "active" ? true : false,
        },
        {
          name: "Web Story Template",
          icon: webStory,
          enabled: true,
        },
        {
          name: "Company",
          icon: company,
          enabled: true,
        }
        // {
        //   name: "CaseStudy",
        //   icon: company,
        //   enabled: true,
        // },
        // {
        //   name: "Report",
        //   icon: company,
        //   enabled: true,
        // },
        // {
        //   name: "Documentary",
        //   icon: company,
        //   enabled: true,
        // }
      ]);
    }
    if (pathname === "/Classrooms") {
      setMenuList([
        {
          name: "Course",
          icon: CourseIcon,
          enabled: true,
          // enabled: licenseCheck === "active" ? true : false,
        },
      ]);
    }
    if (pathname === "/Admins") {
      setMenuList([
        {
          name: "Step",
          icon: CourseIcon,
          enabled: true,
          // enabled: licenseCheck === "active" ? true : false,
        },
        {
          name: "Path",
          icon: CourseIcon,
          enabled: true,
          // enabled: licenseCheck === "active" ? true : false,
        },
        {
          name: "Vendor",
          icon: CourseIcon,
          enabled: true,
          // enabled: licenseCheck === "active" ? true : false,
        },
        {
          name: "Mentor",
          icon: CourseIcon,
          enabled: true,
          // enabled: licenseCheck === "active" ? true : false,
        },
      ]);
    }
  }, [slider]);

  useEffect(() => {
    switch (pathname) {
      case "/Funds":
        setDrawerTitle("New FundCoins");
        break;

      case "/Banker":
        setDrawerTitle("New");
        break;
      default:
        setDrawerTitle("New Item");
        break;
    }
  }, []);

  const content = useMemo(() => {
    switch (mainMenu) {
      // case "App":
      //   return (
      //     <NewMcbApp
      //       step={step}
      //       setStep={setStep}
      //       setMainMenu={setMainMenu}
      //       loading={loading}
      //       setLoading={setLoading}
      //     />
      //   );

      // case "Brand":
      //   return (
      //     <NewMcbBrand
      //       step={step}
      //       setStep={setStep}
      //       setMainMenu={setMainMenu}
      //       loading={loading}
      //       setLoading={setLoading}
      //     />
      //   );

      // case "App Data":
      //   return (
      //     <NewAppData
      //       step={step}
      //       setStep={setStep}
      //       setMainMenu={setMainMenu}
      //       loading={loading}
      //       setLoading={setLoading}
      //     />
      //   );

      // case "Withdrawal":
      //   return (
      //     <NewWithdrawal
      //       step={step}
      //       setStep={setStep}
      //       setMainMenu={setMainMenu}
      //       loading={loading}
      //       setLoading={setLoading}
      //     />
      //   );

      // case "Asset":
      //   return (
      //     <NewAsset
      //       step={step}
      //       setStep={setStep}
      //       setMainMenu={setMainMenu}
      //       loading={loading}
      //       setLoading={setLoading}
      //     />
      //   );

      case "Publication":
        return (
          <NewPublication
            step={step}
            setStep={setStep}
            setMainMenu={setMainMenu}
            loading={loading}
            setLoading={setLoading}
          />
        );

      case "Author":
        return (
          <NewAuthor
            step={step}
            setStep={setStep}
            setMainMenu={setMainMenu}
            loading={loading}
            setLoading={setLoading}
          />
        );

      case "Article":
        return (
          <NewArticle
            step={step}
            setStep={setStep}
            setMainMenu={setMainMenu}
            loading={loading}
            setLoading={setLoading}
          />
        );

      case "Navbar":
        return (
          <NewNavBar
            step={step}
            setStep={setStep}
            setMainMenu={setMainMenu}
            loading={loading}
            setLoading={setLoading}
          />
        );

      case "Category":
        return (
          <NewCategory
            step={step}
            setStep={setStep}
            setMainMenu={setMainMenu}
            loading={loading}
            setLoading={setLoading}
          />
        );

      case "Video":
        return (
          <NewVideo
            step={step}
            setStep={setStep}
            setMainMenu={setMainMenu}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case "Web Story Template":
        return (
          <NewWebStory
            step={step}
            setStep={setStep}
            setMainMenu={setMainMenu}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case "Company":
        return (
          <NewCompany
            step={step}
            setStep={setStep}
            setMainMenu={setMainMenu}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case "CaseStudy":
        return (
          <NewCaseStudy
            step={step}
            setStep={setStep}
            setMainMenu={setMainMenu}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case "Report":
        return (
          <NewReport
            step={step}
            setStep={setStep}
            setMainMenu={setMainMenu}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case "Documentary":
        return (
          <NewDocumentary
            step={step}
            setStep={setStep}
            setMainMenu={setMainMenu}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case "Course":
        return (
          <NewCourse
            step={step}
            setStep={setStep}
            setMainMenu={setMainMenu}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case "Step":
        return (
          <NewStep
            step={step}
            setStep={setStep}
            setMainMenu={setMainMenu}
            loading={loading}
            setLoading={setLoading}
          />
        );

      // case "Bond Tier":
      //   return <NewBondTier step={step} setStep={setStep} />;

      // case "Bond":
      //   return <NewBond step={step} setStep={setStep} />;

      default:
        return (
          <>
            {/* <label className={classNames.searchBox}> */}
            {/* <input
                type="text"
                placeholder="Search For New Item To Add.."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              /> */}
            {/* </label> */}
            <div className="text" style={{ marginLeft: "35px" }}>What item would you like to add? </div>
            <div
              className={classNames.verticalScrollBox}
            // style={{ display: "flex", justifyContent: "space-between" }}
            >
              {menuList.map(({ name, icon, enabled }) => (
                <div className="menuItems" onClick={() => setMainMenu(name)}>
                  <div className="text" >{name}</div>
                </div>
              ))}
              {/* {menuList
                ?.filter((o) =>
                  o?.name?.toLowerCase().includes(search?.toLowerCase())
                )
                .map(({ name, icon, enabled }) => (
                  <ItemBox
                    name={name}
                    icon={icon}
                    enabled={enabled}
                    onClick={
                      name === "Brand" ||
                        name === "Step" ||
                        name === "App" ||
                        name === "Publication" ||
                        name === "Author"
                        ? () => setMainMenu(name)
                        : selectedPublication
                          ? () => setMainMenu(name)
                          : ""
                    }
                  />
                ))} */}
            </div>
          </>
        );
    }
  }, [mainMenu, step, setStep, menuList, loading, setLoading, search]);

  return (
    <div className={classNames.GlobalDrawer} style={{ transform: slider ? "TranslateX(0%)" : "TranslateX(100%)" }}>
      <div
        // className={classNames.overlay}
        onClick={() => {
          try {
            // onClose();
            setStep("");
            setMainMenu("");
            setSlider(false);

          } catch (error) { }
        }}
      />

      <div
        // initial={{ x: "32%", opacity: 0 }}
        // animate={{ x: 0, opacity: 1 }}
        // exit={{ x: "32%", opacity: 0 }}
        className={classNames.sidebar}
        style={{ width: wideDrawer ? "750px" : "450px" }}
      // style={{ width: "300px", position: "fixed", right: 0 }}
      >
        {loading || step === "success" || step === "Token Expired" ? (
          ""
        ) : (
          <div className={classNames.header}>
            <div className={classNames.content}>
              <div className={classNames.title}>
                {mainMenu ? "Add New" + " " + mainMenu : "New Item"}
              </div>
              <div className={classNames.breadCrumbs}>
                <span
                  onClick={() => {
                    setMainMenu("");
                    setWideDrawer(false);
                  }}
                >
                  Add New
                </span>
                {mainMenu && (
                  <>
                    -&gt;&nbsp;
                    <span
                      onClick={() => {
                        setStep("");
                        setWideDrawer(false);
                      }}
                    >
                      {mainMenu}
                    </span>
                  </>
                )}
                {step && (
                  <>
                    -&gt;&nbsp;
                    <span>{step}</span>
                  </>
                )}
              </div>
            </div>
            {/* <div
              className={classNames.backBtn}
              onClick={(e) => {
                if (step !== "") {
                  setStep("");
                  setWideDrawer(false);
                } else {
                  setMainMenu("");
                  setWideDrawer(false);
                }
              }}
            >
              <img src={backWhite} alt="" />
            </div> */}
            <div
              className={classNames.closeBtn}
              onClick={() => {
                try {
                  // setSlider(false);

                  setSlider(false);
                  setStep("");
                  setMainMenu("");
                } catch (error) { }
              }}
            >
              <img src={closeWhite} alt="" />
            </div>
          </div>
        )}

        {content}
      </div>
    </div>
  );
}

function ItemBox({ name, icon, enabled, onClick }) {
  return (
    <div
      style={{
        visibility: name ? "unset" : "hidden",
        opacity: enabled ? 1 : 0.3,
      }}
      className={classNames.itemBox}
    >
      <div
        className={classNames.globalDrawerImg}
        // style={{
        //   borderRadius: "15px",
        //   border: "2px solid #e7e7e780",
        //   height: "110px",
        //   width: "110px",
        //   display: "flex",
        //   justifyContent: "center",
        //   alignItems: "center",
        // }}
        onClick={onClick}
      >
        <img src={icon} alt="" />
      </div>
      <div
        className={classNames.label}
        style={{ paddingTop: "10px", wordWrap: "break-word" }}
      >
        {name}
      </div>
    </div>
  );
}

export default memo(GlobalDrawer);
