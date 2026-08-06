import React from "react";
import { useState, useContext } from "react";
import FilterType from "../Filters/FilterType";
import UserFilter from "../Filters/UserFilter";
import CoinFilter from "../Filters/CoinFilter";
// import RightButton from "../RightButton";
import "./nav.scss";
import { GlobalContex } from "../../globalContext";
import { useEffect } from "react";

import userIcon from "../../assets/images/icons/user.svg";
import affilIcon from "../../assets/images/icons/affiliate.svg";
import bondIcon from "../../assets/images/icons/bondIcon.svg";
import appIcon from "../../assets/images/icons/app.svg";
import calendar from "../../assets/images/icons/calendar.svg";

import filterIcon from "../../assets/images/filter.svg";
import GlobalFilterDrawer from "../GlobalFilterDrawer";

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
    setShowSubDraw,
    filters,
    setFilters,
    globalFilter,
    setGlobalFilter,
  } = useContext(GlobalContex);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setShowSubDraw(false);
  }, [tabSelected]);

  useEffect(() => {
    // console.log(tabSelected, "kwbdkjwed");
    switch (tabSelected) {
      case "Earnings Per Customer":
        setFilters([
          {
            name: "User",
            icon: userIcon,
          },
          {
            name: "Date",
            icon: calendar,
          },
        ]);
        break;
      default:
        setFilters([
          {
            name: "User",
            icon: userIcon,
          },
          {
            name: "Affiliate",
            icon: affilIcon,
          },
          {
            name: "Bond Offering",
            icon: bondIcon,
          },
          {
            name: "Bond Contract",
            icon: bondIcon,
          },
          {
            name: "Bond",
            icon: bondIcon,
          },
          {
            name: "App",
            icon: appIcon,
          },
        ]);
        break;
    }
  }, [tabSelected]);

  useEffect(() => {
    setSelectedFilter1(filters[0]);
  }, [filters]);

  return (
    <>
      <div className="desktopWrapper">
        <div style={{ borderBottom: "#e7e7e780 solid 1.5px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
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
            <div style={{ display: "flex" }}>
              {customFilters ? customFilters : ""}
              <div
                className={
                  enabledFilters[0] ? "coin-button nav-user" : "nav-user"
                }
                onClick={(e) => setGlobalFilter(!globalFilter)}
              >
                <img
                  style={{ opacity: enabledFilters[0] ? 1 : 0.3 }}
                  src={filterIcon}
                  alt=""
                  width="20px"
                />
              </div>
              <div
                onClick={(e) => setGlobalFilter(!globalFilter)}
                className={
                  enabledFilters[4] ? "coin-button nav-user" : "nav-user"
                }
              >
                <img
                  style={{ opacity: enabledFilters[4] ? 1 : 0.3 }}
                  src={require("../../assets/images/icons/usaicon.svg").default}
                  alt=""
                />
              </div>
              <div
                onClick={(e) => setGlobalFilter(!globalFilter)}
                className={
                  enabledFilters[4] ? "coin-button nav-user" : "nav-user"
                }
              >
                <img
                  style={{ opacity: enabledFilters[5] ? 1 : 0.3 }}
                  src={require("../../assets/images/icons/refresh.svg").default}
                  alt=""
                />
              </div>
              <div
                className={
                  enabledFilters[5] ? "coin-button nav-user" : "nav-user"
                }
              >
                <img
                  style={{ opacity: enabledFilters[6] ? 1 : 0.3 }}
                  src={require("../../assets/images/icons/search.svg").default}
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mobileWrapper" style={{ display: "none" }}>
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
      </div>
      {globalFilter ? <GlobalFilterDrawer /> : ""}
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
