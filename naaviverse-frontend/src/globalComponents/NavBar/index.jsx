import React from "react";
import { useState, useContext, useRef } from "react";
import FilterType from "../Filters/FilterType";
import UserFilter from "../Filters/UserFilter";
import CoinFilter from "../Filters/CoinFilter";
// import RightButton from "../RightButton";
import "./nav.scss";
import { GlobalContex } from "../../globalContext";
import { useEffect } from "react";
import GlobalFilterDrawer from "../GlobalFilterDrawer";
// import CoinSelectModal from "../../Apps/MyCryptoBrand/McbTokenHash/McbTokenWithdrawals/CoinSelectModal/CoinSelectModal";
import styles from "./searchAndFilter.module.scss";
import { ReactComponent as SettingsIcon } from "../../static/images/clipIcons/settings.svg";
import { ReactComponent as CloseIcon } from "../../static/images/clipIcons/close.svg";
import { ReactComponent as SearchIcon } from "../../static/images/clipIcons/search.svg";
import { ReactComponent as BackIcon } from "../../static/images/clipIcons/back.svg";
import searchIcon from "../../static/images/icons/search.svg";
import greySearch from "../../static/images/greySearch.svg";
import greyClose from "../../static/images/greyClose.svg";
import ActionIndex from "../GlobalSubSidebar/ActionIndex";


import filterIcon from "../../static/images/filter.svg";
const NavBar = ({
  logo,
  name,
  tabs,
  tabSelected,
  setTabSelected,
  enabledFilters,
  customFilters,

}) => {
  //   const [tabSelected, setTabSelected] = useState(null);
  const {
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
    refetchVideos,
    setRefetchVideos,
    globalFilter,
    setGlobalFilter,
    coinSelect, setCoinSelect,
    selectedApp,
    refetchArticles,
    setRefetchArticles,
    refreshStories,
    setRefreshStories,
    refechProfile,
    setRefechProfile,
    refetchAppData,
    setRefetchAppData,
    refetchData,
    setRefetchData,
    refetchAuthors,
    setRefetchAuthors,
    showSearch,
    setShowSearch,
    refetchPayout,
    setRefetchPayout,
    updatedSuccessful,
    setupdatedSuccessful,
    filterDrawer,
    setFilterDrawer,
    refetchRequest,
    setRefetchRequest,
  } = useContext(GlobalContex);
  const [query, setQuery] = useState("");
  const [modalCoin, setModalCoin] = useState(false);
  const [searchOn, setSearchOn] = useState(false);
  const ref = useRef();
  useEffect(() => {
    setTimeout(() => {
      ref?.current && ref.current.focus();
    }, 200);
  }, []);
  const [settings, setSettings] = useState(false);
  const [step, setStep] = useState(0);


  // useEffect(() => {
  //   setTabSelected([tabs[0]]);
  // }, [tabs]);

  function getContent() {
    switch (step) {
      case 1:
        return (
            <div className={styles.filterView}>
            {/* {filterList?.map((item) => (
              <div key={item.key} className={styles.listItem}>
                <span className={styles.label}>{item.label}</span>
                <div className={styles.switchGroup}>
                  <div
                    className={`${styles.switch} ${item.switch && styles.on}`}
                    onClick={() => {
                      try {
                        item.switchClick();
                      } catch (error) {}
                    }}
                  >
                    <div className={styles.switchBall} />
                  </div>
                  <div className={styles.switchLabel}>{item.switchLabel}</div>
                </div>
              </div>
            ))} */}
          </div>
        );

      default:
        return (
          <div className={styles.filterView}>
            {/* {mainList?.map((item) => (
              <div key={item.key} className={styles.listItem}>
                <span className={styles.label}>{item.label}</span>
                <div className={styles.switchGroup}>
                  <div
                    className={`${styles.switch} ${item.switch && styles.on}`}
                    onClick={() => {
                      try {
                        item.switchClick();
                      } catch (error) {}
                    }}
                  >
                    <div className={styles.switchBall} />
                  </div>
                  <div className={styles.switchLabel}>{item.switchLabel}</div>
                </div>
              </div>
            ))} */}
            <div className={styles.listItem} onClick={() => setStep(1)}>
              <span className={styles.label}>Filter By</span>
              {/* <span className={styles.value}>{filterBy}</span> */}
            </div>
          </div>
        );
    }
  }

  const refreshPage = () => {
    console.log(tabSelected, "tabSelected");
    if (tabSelected === "Articles" || tabSelected === "Authors") {
      setRefetchArticles(!refetchArticles);
    } else if (tabSelected === "Videos") {
      setRefetchVideos(!refetchVideos);
    } else if (tabSelected === "Web Stories") {
      setRefreshStories(!refreshStories);
    } else if (tabSelected === "My Profile") {
      setRefechProfile(!refechProfile);
    } else if (tabSelected === "Publications" || tabSelected === "Users") {
      setRefetchData(!refetchData);
    } else if (tabSelected === "Authors" || tabSelected === "Case Study" || tabSelected === "Reports" || tabSelected === "Documentary") {
      setRefetchAuthors(!refetchAuthors);
    } else if (tabSelected === "Categories" || tabSelected === "Navbars" || tabSelected === "Affiliates" || tabSelected === "Authors") {
      setRefetchAppData(!refetchAppData);
    } else if (tabSelected === "Configurations") {
      setupdatedSuccessful(!updatedSuccessful)
    } else if (tabSelected === "Payouts") {
      setRefetchPayout(!refetchPayout)
    } else if (tabSelected === "Requests") {
      setRefetchRequest(!refetchRequest)
    }
  }

  return (
    <>
      {searchOn ? (
        <div className={styles.searchAndFilter}>
          <input
            className={styles.serchInp}
            ref={ref}
            type="text"
          // placeholder={placeholder}
          // value={search}
          // onChange={(e) => setSearch(e.target.value)}
          />
          {step === 1 && (
            <div
              key="back"
              className={styles.moreFilter}
              onClick={() => setStep(0)}
            >
              <BackIcon />
            </div>
          )}
          <div
            className={styles.moreFilter}
            key="settinClose"
            onClick={() => {
              setSettings(!settings);
              setStep(0);
            }}
          >
            {settings ? <CloseIcon /> : <SettingsIcon />}
            <div className={styles.label}>Search Settings</div>
          </div>
          <div
            key="searchClose"
            className={styles.moreFilter}
            onClick={() => {
              setSearchOn(false);
            }}
          >
            <CloseIcon />
            <div className={styles.label}>Close Search</div>
          </div>
          {settings && getContent()}
        </div>
      ) : (
        <>
          <div className="desktopWrapper">
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(231, 231, 231, 0.5019607843)",
                  // alignItems: "center",
                }}
              >
                <div className="tab">
                  {tabs.map((tabItm) => (
                    <div
                      key={tabItm}
                      className={
                        "tabitm" + " " + (tabSelected === tabItm ? "true" : "")
                      }
                      style={{ color: selectedApp?.appTextColor }}
                      // data-content = {selectedApp?.appTextColor}
                      onClick={() => {
                        setTabSelected(tabItm);
                        console.log(tabItm, "jhwdjwed");
                        //   tabClick();
                      }}
                    >
                      <h6 style={{ flexWrap: "nowrap", color: selectedApp?.appTextColor }}>{tabItm}</h6>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex" }}>
                  {customFilters ? customFilters : ""}
                  <div
                    className={
                      enabledFilters[0] ? "coin-button nav-user" : "nav-user"
                    }
                    onClick={(e) => tabSelected === "Requests" ? setFilterDrawer(!filterDrawer) : setFilterDrawer(false)}
                  >
                    {/* <img
                      style={{ opacity: enabledFilters[0] ? 1 : 0.3 }}
                      src={filterIcon}
                      alt=""
                      width="20px"
                    /> */}
                    <img
                      src={filterIcon}
                      alt=""
                      width="20px"
                    />
                  </div>
                  {/* <div className={
                    enabledFilters[1] ? "coin nav-user" : "nav-user"
                  } onClick={() => setModalCoin(true)}>
                    <img src={coinSelect?.coinImage} alt="" width="20px" />
                  </div> */}
                  {/* {modalCoin && (
                    <CoinSelectModal
                      setCoin={setCoinSelect}
                      onClose={() => setModalCoin(false)}
                    />
                  )} */}
                  <div
                    // onClick={(e) => setGlobalFilter(!globalFilter)}
                    onClick={refreshPage}
                    className={
                      enabledFilters[4] ? "coin-button nav-user refreshBtn" : "nav-user refreshBtn"
                    }
                  >
                    <img

                      src={require("../../static/images/icons/refresh.svg").default}
                      alt=""
                    />
                  </div>
                  {/* <div
                    className={enabledFilters[5] ? "coin-button nav-user" : "nav-user"}
                    onClick={() => setShowSearch(!showSearch)}
                  >
                    <img
                      style={{ opacity: enabledFilters[5] ? 1 : 0.3 }}

                      src={showSearch ? greyClose : greySearch}
                      alt=""
                    />
                  </div> */}
                </div>
              </div>
            </div>
          </div>
          {/* <div className="mobileWrapper">
            <div style={{ borderBottom: "#e7e7e780 solid 1.5px" }}>
              <div
                style={{
                  display: "flex",
                  // justifyContent: "space-between",
                  // alignItems: "center",
                }}
              >
                <div className="tab" style={{ overflowX: "scroll" }}>
                  {tabs.map((tabItm) => (
                    <div
                      key={tabItm}
                      className={
                        "tabitm" + " " + (tabSelected === tabItm ? "true" : "")
                      }
                      onClick={() => {
                        setTabSelected(tabItm);
                        console.log(tabItm, "jhwdjwed");
                        //   tabClick();
                      }}
                    >
                      <h6 style={{ flexWrap: "nowrap" }}>{tabItm}</h6>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div> */}
        </>
      )}
      {globalFilter ? <GlobalFilterDrawer /> : ""}
      <ActionIndex />
      {filter1 ? (
        <FilterType
          onClose={() => setFilter1(false)}
          onSuccess={() => setFilter1(false)}
          allCoins={allCoins}
          filter1={filter1}
          setFilter1={setFilter1}
          selectedCoin={selectedCoin}
          setSelectedCoin={setSelectedCoin}
          selectedFilter1={selectedFilter1}
          setSelectedFilter1={setSelectedFilter1}
          tabSelected={tabSelected}
          setSelectedFilter21={setSelectedFilter21}
          selectedFilter21={selectedFilter21}
        />
      ) : (
        ""
      )}
      {filter2 ? (
        <UserFilter
          onClose={() => setFilter2(false)}
          onSuccess={() => setFilter2(false)}
          allCoins={allCoins}
          filter2={filter2}
          setFilter2={setFilter2}
          selectedCoin={selectedCoin}
          setSelectedCoin={setSelectedCoin}
          selectedFilter2={selectedFilter2}
          setSelectedFilter2={setSelectedFilter2}
          selectedFilter21={selectedFilter21}
          setSelectedFilter21={setSelectedFilter21}
          customerEmailFilter={customerEmailFilter}
          setCustomerEmailFilter={setCustomerEmailFilter}
          refetchApi={refetchApi}
          setRefetchApi={setRefetchApi}
          query={query}
          setQuery={setQuery}
          tabSelected={tabSelected}
        />
      ) : (
        ""
      )}

      {openCoinFilter ? (
        <CoinFilter
          onClose={() => setOpenCoinFilter(false)}
          onSuccess={() => setOpenCoinFilter(false)}
          allCoins={allCoins}
          openCoinFilter={openCoinFilter}
          setOpenCoinFilter={setOpenCoinFilter}
          selectedCoin={selectedCoin}
          setSelectedCoin={setSelectedCoin}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default NavBar;
