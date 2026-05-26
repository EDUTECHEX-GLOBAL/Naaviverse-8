import React, { useMemo } from "react";
import { useState } from "react";
import { useContext } from "react";
import Skeleton from "react-loading-skeleton";
import NavBar from "./globalComponents/NavBar";
import { GlobalContex } from "./globalContext";
import WalletScanOverview from "./WalletScanOverview";
// import "../../../static/scss/list.scss";

// import DashboardApps from "./DashboardApps";
// import DashboardBrands from "./DashboardBrands";
// import DashboardFieldGroups from "./DashboardFieldGroups";
// import DashboardGroupFields from "./DashboardGroupFields";

const WalletScan = () => {
  const tabs = ["Overview"];

  const { setShowSubDraw } = useContext(GlobalContex);

  const [tabSelected, setTabSelected] = useState("Overview");

  const tabComponent = useMemo(() => {
    switch (tabSelected) {
      case "Overview":
        return <WalletScanOverview />;
      default:
        return null;
    }
  }, [
    tabSelected,
    // openCoinFilter, refetchApi
  ]);

  return (
    <div style={{height: '100%'}}>
      {/* <NavBar
        tabs={tabs}
        tabSelected={tabSelected}
        setTabSelected={setTabSelected}
        enabledFilters={[true, true, true, true, true, true, true]}
      /> */}

      {tabComponent}

      {/* <div style={{ width: "100%" }}>
        <div className="listGrid">
          <div>Asset</div>
          <div>Cost</div>
          <div>Length</div>
          <div>Daily Return</div>
          <div>Monthly Return</div>
        </div>
      </div> */}
      {/* <div
        style={{
          // display: "flex",
          fontWeight: 700,
          fontSize: "20px",
        }}
      >

        <Subdrawer />
      </div> */}
    </div>
  );
};

export default WalletScan;
