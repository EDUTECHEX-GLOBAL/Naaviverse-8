import React, { useContext, useEffect, useMemo, useState } from "react";
import { useStore } from "../../components/store/store.ts";

//css
import classNames from "./vaults.module.scss";

//context
import VaultsContent from "./components/VaultsContent";
import {
  getMoneyMarketsVaults,
  getStakingEarningVaults,
  getVaultsCoin,
} from "./assets/api";
import VaultsContentLoading from "./components/VaultsContentLoading";

const Vaults = ({ searchedValue }) => {
  const userDetails = JSON.parse(localStorage.getItem("user"));
  const { balanceToggle, coinType } = useStore();
  const [vaultsContent, setVaultsContent] = useState([]);
  const [vaultsLoading, setVaultsLoading] = useState(false);

  useEffect(() => {
    setVaultsContent([]);
    let email = userDetails?.user?.email;
    if (coinType == "bonds") {
      getStakingEarningVaults(
        email,
        setVaultsContent,
        setVaultsLoading,
        balanceToggle
      );
    } else if (coinType == "moneyMarkets") {
      getMoneyMarketsVaults(
        email,
        setVaultsContent,
        setVaultsLoading,
        balanceToggle
      );
    } else {
      if (coinType === "crypto" || coinType === "fiat") {
        getVaultsCoin(
          email,
          coinType,
          setVaultsContent,
          setVaultsLoading,
          balanceToggle
        );
      }
    }
  }, [coinType, balanceToggle]);

  const filteredData = (item) =>
    item
      ? Object.values(item)
          ?.join(" ")
          ?.toLowerCase()
          ?.includes(searchedValue?.toLowerCase())
      : [];

  return (
    <div className={classNames.vaultsMain} style={{height: 'calc(100% - 63px)'}}>
      <div className={classNames.headTab}>
        <div>Asset</div>
        <div>Balance</div>
        <div>Value</div>
      </div>
      <div className={classNames.bodyContainer}>
        {vaultsLoading || vaultsContent?.length < 1
          ? Array.from({ length: 4 }).map((_, index) => {
              return <VaultsContentLoading key={"vaults loading " + index} />;
            })
          : vaultsContent
              ?.filter((coinItem) => filteredData(coinItem))
              ?.map((eachItem, index) => {
                return (
                  <VaultsContent
                    key={"vaults content " + index}
                    // {...eachItem}
                    each={eachItem}
                  />
                );
              })}
      </div>
    </div>
  );
};

export default Vaults;
