import React, { useContext } from "react";
import { useStore } from "../../../components/store/store.ts";

//scss
import classNames from "./vaultscomponents.module.scss";

//assets
import bitcoinIcon from "../temp/bitcoin.svg";

//context
import { useCoinContextData } from "../../../context/CoinContext";

import { useNavigate } from "react-router-dom";
import { VaultPageContext } from "../../../context/VaultPageContext";

const VaultsContent = ({ each }) => {
  const navigate = useNavigate();

  let { coinName, coinImage, coinValue, coinValue_DC, coinValueUSD } = each;
  const { setVaultSelected } = useContext(VaultPageContext);

  const appCode = "naavi";

  const { coinType } = useStore();

  const {
    setCoinActionEnabled,
    setSelectedCoin,
    setCoinAction,
    setAddActionStep,
    setStep: setWithdrawActionStep,
    setTransferActionStep,
    setFundingCurrency,
    setPayMethod,
    setOtcDesk,
    setEnterAmount,
    setCurrentStep,
    setSelectedTab,
    setAddApiValue,
    setToCurrencyApiValue,
    setCountryApiValue,
    setPayMethodApiValue,
    setOtcApiValue,
    setEachCardShowValue,
    newWholeValue,
    setNewWholeValue,
    setWithdrawForexEnteredAmount,
    setWithdrawForexStep,
    setWithdrawForexCurrency,
    setWithdrawForexCountry,
    setWithdrawForexPaymentMethod,
    setWithdrawForexOtcDesk,
    setWithdrawForexAccountId,
    setWithdrawForexAccountName,
    setAllApiData,
    setForexQuote,
    setCheckedOneForex,
    setOtpForex,
    setUpdatedForexBalance,
    setAddressTerm,
    setFromTerm,
    setToTerm,
    transactionSelected,
    setTransactionSelected,
  } = useCoinContextData();

  return (
    <div className={classNames.vaultsContent}>
      <div>
        {coinImage && <img src={coinImage} alt={coinName} />}
        <span>{coinName ? coinName : ""}</span>
      </div>
      <div>{coinValue ? coinValue?.toFixed(4) : "0.0000"}</div>
      <div>
        {(coinType == "bonds" || coinType == "moneyMarkets") && coinValueUSD
          ? "$" + coinValueUSD?.toFixed(4)
          : coinValue_DC
          ? "$" + coinValue_DC?.toFixed(2)
          : "$0.00"}
      </div>
      <div>
        {coinType === "crypto" || coinType === "fiat" ? (
          <div
          onClick={(e) => {
            e.stopPropagation();
            setCoinActionEnabled(true);
            setSelectedCoin(each);
          }}
          >
            Actions
          </div>
        ) : (
          <div
          // onClick={(e) => {
          //   e.stopPropagation();
          //   setCoinActionEnabled(true);
          //   setSelectedCoin(each);
          //   setCoinAction(['Transfer']);
          //   setAddActionStep(1);
          //   setWithdrawActionStep(1);
          //   setTransferActionStep(3);
          // }}
          >
            Withdraw
          </div>
        )}
        <div
          onClick={() => {
            setSelectedCoin(each);
            setVaultSelected(each?.coinSymbol);
            // navigate(`/vault/${coinType}/${appCode}/${each?.coinSymbol}`);
            // console.log(each, "eachhh");
            setTransactionSelected(true);
          }}
        >
          Transactions
        </div>
      </div>
    </div>
  );
};

export default VaultsContent;
