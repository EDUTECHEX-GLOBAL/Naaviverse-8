import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ASSET_CLASSES } from "../configs/constants";
import {
  useUserVaults,
  useVaultTxns,
} from "../pages/Transactions/VaultComponent/queryHooks";
import { useCoinContextData } from "./CoinContext";
import { MainContext } from "./Context";

export const VaultPageContext = createContext();
function VaultPageContextProvider({ children }) {
  const { email } = useContext(MainContext);
  const [appSelected, setAppSelected] = useState();
  const [vaultSelected, setVaultSelected] = useState();
  const [assetClass, setAssetClass] = useState(ASSET_CLASSES[0]);
  const [cpanelOpen, setCpanelOpen] = useState(false);
  const { assetClassParam } = useParams();
  const { updateVaultData, trackerType } = useCoinContextData();
  const appCurrencyName = "USD";

  //stacking rewards (bonds)
  const [bondsPagination, setBondsPagination] = useState(0);
  const [bondsTxnsPerPage, setBondsTxnsPerPage] = useState(25);

  //tracker data
  const [trackerData, settrackerData] = useState("");
  const [trackerDataLoading, settrackerDataLoading] = useState(false);
  const [trackerDataDeposit, settrackerDataDeposit] = useState("");
  const [assetDropdown, setassetDropdown] = useState(false);
  const [statusDropdown, setstatusDropdown] = useState(false);
  const [assetDropdownItems, setassetDropdownItems] = useState("");
  const [assetDropdownSelected, setassetDropdownSelected] = useState("");
  const [statusDropdownSelected, setstatusDropdownSelected] = useState("");
  const [trackerImageOpen, settrackerImageOpen] = useState("");
  const [trackingImage, setTrackingImage] = useState("");
  const [trackingImageResponse, setTrackingImageResponse] = useState("");
  const [uploadedImageTracker, setuploadedImageTracker] = useState("");
  const [uploadedDescTracker, setuploadedDescTracker] = useState("");
  const [transactionDetailSelected, setTransactionDetailSelected] =
    useState("");
  const [transactionId, settransactionId] = useState("");
  const [transactionDetail, setTransactionDetail] = useState("");
  const [transactionDetailSteps, setTransactionDetailSteps] = useState("");
  const [transactionDetailStepsLoading, setTransactionDetailStepsLoading] =
    useState(false);
  const [imagesBtnLoading, setimagesBtnLoading] = useState(false);

  //reset pagination vaults
  useEffect(() => {
    setBondsPagination(0);
    setBondsTxnsPerPage(25);
  }, [assetClass]);

  useEffect(() => {
    setstatusDropdown(false);
    setassetDropdown(false);
    // console.log(trackerType, "trackerType vault context useffect");
    if (trackerType == "withdraw") {
      getTracketData(
        `https://comms.globalxchange.io/coin/vault/service/path/withdraw/txn/get?app_code=naavi&email=${email}`
      );
    } else if (assetDropdownSelected && statusDropdownSelected) {
      getTracketData(
        `https://comms.globalxchange.io/coin/vault/service/path/deposit/txn/get?email=${email}&status=${statusDropdownSelected}&app_code=naavi&coin=${assetDropdownSelected}`
      );
    } else if (assetDropdownSelected) {
      getTracketData(
        `https://comms.globalxchange.io/coin/vault/service/path/deposit/txn/get?email=${email}&app_code=naavi&coin=${assetDropdownSelected}`
      );
    } else if (statusDropdownSelected) {
      getTracketData(
        `https://comms.globalxchange.io/coin/vault/service/path/deposit/txn/get?email=${email}&status=${statusDropdownSelected}&app_code=naavi`
      );
    } else {
      getTracketData(
        `https://comms.globalxchange.io/coin/vault/service/path/deposit/txn/get?email=${email}&app_code=naavi`
      );
    }

    assetDropdownDeposit();
  }, [statusDropdownSelected, assetDropdownSelected, trackerType]);

  function getTracketData(API) {
    settrackerDataLoading(true);
    // console.log(trackerType, 'trackerType vault context');
    axios
      .get(API)
      .then((response) => {
        settrackerData(response?.data);
        if (response?.data?.perAppCode?.length > 0) {
          settrackerDataDeposit(response?.data?.perAppCode[0]?.count);
        }
        settrackerDataLoading(false);
      })
      .catch((error) => {
        console.log("error on tracker data", error?.message);
        settrackerDataLoading(false);
      });
  }
  function assetDropdownDeposit() {
    // console.log('assetDropdownDeposit');
    axios
      .get(
        `https://comms.globalxchange.io/coin/vault/service/path/deposit/txn/get?email=${email}&app_code=naavi`
      )
      .then((response) => {
        // console.log('assetDropdownDeposit', response?.data);
        setassetDropdownItems(response?.data);
      })
      .catch((error) => {
        console.log("error on assetDropdownDeposit", error?.message);
      });
  }
  // function statusDropdownDeposit() {
  //   console.log('statusDropdownDeposit');
  //   axios
  //     .get(
  //       `https://comms.globalxchange.io/coin/vault/service/path/deposit/txn/get?email=${email}&app_code=naavi`
  //     )
  //     .then((response) => {
  //       console.log('statusDropdownDeposit', response?.data);
  //     })
  //     .catch((error) => {
  //       console.log('error on statusDropdownDeposit', error?.message);
  //     });
  // }

  useEffect(() => {
    const assetCls = ASSET_CLASSES.filter(
      (assetClass) => assetClass.name === assetClassParam
    )[0];
    if (assetCls) setAssetClass(assetCls);
  }, [assetClassParam]);

  const {
    data: vaultsListFxCrypto = [],
    isLoading: vaultsListFxCryptoLoading,
    refetch: refetchVaultsListFxCrypto,
  } = useUserVaults(
    email,
    assetClass?.name,
    appSelected?.app_code,
    undefined,
    undefined,
    appCurrencyName
  );

  const [allDirection, setAllDirection] = useState("All Directions");
  const [allTypes, setAllTypes] = useState("All Types");

  const {
    data: txnListFxCrypto,
    isLoading: txnListLoadingFxCrypto = true,
    refetch: refetchTxnListFxCrypto,
  } = useVaultTxns(
    email,
    'naavi',
    vaultSelected?.coinSymbol,
    undefined,
    updateVaultData,
    appCurrencyName,
    allDirection,
    allTypes
  );

  // const {
  //   data: vaultsListBonds,
  //   isLoading: vaultsListBondsLoading,
  //   refetch: refetchVaultsListBonds,
  // } = useUserBondsList(email, appCurrencyName);

  // const {
  //   data: txnListBonds,
  //   isLoading: txnListLoadingBonds = true,
  //   refetch: refetchTxnListBonds,
  // } = useUserBondsTxns(
  //   email,
  //   vaultSelected?.coinSymbol,
  //   bondsPagination,
  //   bondsTxnsPerPage
  // );

  // const {
  //   data: vaultsListMM,
  //   isLoading: vaultsListLoadingMM,
  //   refetch: refetchVaultsListMM,
  // } = useUserMoneMarketsList(email, appSelected?.app_code, appCurrencyName);

  // const {
  //   data: txnListMM,
  //   isLoading: txnListLoadingMM = true,
  //   refetch: refetchtxnListMM,
  // } = useUserMoneyMarketsTxns(
  //   email,
  //   vaultSelected?.coinSymbol,
  //   appSelected?.app_code
  // );

  // const {
  //   data: vaultsListShares,
  //   isLoading: vaultsListLoadingShares,
  //   refetch: refetchVaultsListShares,
  // } = useShareTokensVaultsList(email, appSelected?.app_code);

  // const {
  //   data: txnListShares,
  //   isLoading: txnListLoadingShares = true,
  //   refetch: refetchtxnListShares,
  // } = useVaultTxns(
  //   email,
  //   vaultSelected?.app_code,
  //   vaultSelected?.tokens &&
  //     vaultSelected?.tokens[0]?.token_profile_data?.coinSymbol,
  //   vaultSelected?.profile_id,
  //   updateVaultData,
  //   appCurrencyName
  // );

  function refetchData() {
    refetchVaultsListFxCrypto();
    refetchTxnListFxCrypto();
    // refetchVaultsListBonds();
    // refetchTxnListBonds();
    // refetchVaultsListMM();
    // refetchtxnListMM();
    // refetchVaultsListShares();
    // refetchtxnListShares();
  }

  // useEffect(() => {
  //   console.log(allDirection, 'allDirection');
  //   console.log(allTypes, 'allTypes');
  //   refetchData();
  // }, [allDirection, allTypes]);

  useEffect(() => {
    setimagesBtnLoading(true);
    axios
      .get(
        `https://comms.globalxchange.io/coin/vault/service/get/user/file/uploads?id=${trackingImage}`
      )
      .then((response) => {
        // console.log(response?.data?.result, 'responsee from image traking');
        setTrackingImageResponse(response?.data?.result);
        setimagesBtnLoading(false);
      })
      .catch((error) => {
        console.log(error, "errorrr from traking");
        setimagesBtnLoading(false);
      });
  }, [trackingImage, trackerImageOpen]);

  useEffect(() => {
    setTransactionDetail("");
    if (trackerData?.txns?.length > 0) {
      let filteredItem = trackerData?.txns?.filter((eachTxns) => {
        return eachTxns?._id == transactionId;
      });
      setTransactionDetail(filteredItem[0]);
    }
  }, [transactionId]);

  useEffect(() => {
    setTransactionDetailStepsLoading(true);
    if (transactionDetailSelected) {
      axios
        .get(
          `https://comms.globalxchange.io/coin/vault/service/payment/paths/get?path_id=${transactionDetailSelected}`
        )
        .then((response) => {
          let res;
          if (response?.data?.paths?.length > 0) {
            res = response?.data?.paths[0]?.total_steps;
          }
          // console.log(res, 'transactionDetailSelected 1');
          let arr = Object.keys(res).map((key) => {
            return { id: key, ...res[key] };
          });
          // console.log(arr, 'transactionDetailSelected 2');
          setTransactionDetailSteps(arr);
          setTransactionDetailStepsLoading(false);
        })
        .catch((error) => {
          console.log(error?.message, "steps detail");
          setTransactionDetailStepsLoading(false);
        });
    } else {
      // console.log(transactionDetailSelected, 'transactionDetailSelected path');
      setTransactionDetailStepsLoading(false);
    }
  }, [transactionDetailSelected, transactionId]);

  return (
    <VaultPageContext.Provider
      value={{
        assetClass,
        setAssetClass,
        appSelected,
        setAppSelected,
        vaultSelected,
        setVaultSelected,
        cpanelOpen,
        setCpanelOpen,
        vaultsListFxCrypto,
        vaultsListFxCryptoLoading,
        // vaultsListBonds,
        // vaultsListBondsLoading,
        // vaultsListMM,
        // vaultsListLoadingMM,
        // txnListBonds,
        // txnListLoadingBonds,
        // txnListMM,
        // txnListLoadingMM,
        txnListFxCrypto,
        txnListLoadingFxCrypto,
        // vaultsListShares: vaultsListShares?.vaultsData,
        // vaultsListLoadingShares,
        // txnListShares,
        // txnListLoadingShares,
        refetchData,
        trackerData,
        trackerDataLoading,
        trackerDataDeposit,
        statusDropdown,
        setstatusDropdown,
        assetDropdown,
        setassetDropdown,
        assetDropdownItems,
        setassetDropdownItems,
        assetDropdownSelected,
        setassetDropdownSelected,
        statusDropdownSelected,
        setstatusDropdownSelected,
        trackerImageOpen,
        settrackerImageOpen,
        trackingImage,
        setTrackingImage,
        trackingImageResponse,
        setTrackingImageResponse,
        uploadedImageTracker,
        setuploadedImageTracker,
        uploadedDescTracker,
        setuploadedDescTracker,
        transactionDetailSelected,
        setTransactionDetailSelected,
        transactionId,
        settransactionId,
        transactionDetail,
        setTransactionDetail,
        transactionDetailSteps,
        setTransactionDetailSteps,
        transactionDetailStepsLoading,
        setTransactionDetailStepsLoading,
        imagesBtnLoading,
        setimagesBtnLoading,

        // bankAccountIdValue,
        // setBankAccountIdValue,
        // bankInfoValues,
        // setbankInfoValues,

        //staking rewards (bonds)
        bondsPagination,
        setBondsPagination,
        bondsTxnsPerPage,
        setBondsTxnsPerPage,
        allDirection,
        setAllDirection,
        allTypes,
        setAllTypes,
      }}
    >
      {children}
    </VaultPageContext.Provider>
  );
}

export default VaultPageContextProvider;
