import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

export const CoinContext = createContext();

export const CoinContextProvider = ({ children }) => {
  const [coinActionEnabled, setCoinActionEnabled] = useState(false);
  const [addBankingEnabled, setAddBankingEnabled] = useState(false);
  const [coinType, setCoinType] = useState("crypto");
  const [trackerType, setTrackerType] = useState("deposit");
  const [coinAction, setCoinAction] = useState(["Menu"]);
  const [swapMenu, setSwapMenu] = useState(false);
  const [placeholder, setPlaceholder] = useState("Search Crypto Vaults");
  const [senbtnClicked, setSendBtnClicked] = useState("");
  const [selectedCoin, setSelectedCoin] = useState({});
  const [swapActionStep, setSwapActionStep] = useState("step1");
  const [selectedSwapAction, setSelectedSwapAction] = useState("");
  const [enteredSwapValue, setEnteredSwapValue] = useState();
  const [buyResult, setBuyResult] = useState([]);
  const [sellResult, setSellResult] = useState([]);
  const [buyQuote, setBuyQuote] = useState([]);
  const [sellQuote, setSellQuote] = useState([]);

  const [fromAsset, setFromAsset] = useState({});
  const [assetName, setAssetName] = useState("");
  const [selectAsset, setSelectAsset] = useState(false);
  const [updateAfterTrade, setUpdateAfterTrade] = useState(false);

  // Withdraw Action states
  const [step, setStep] = useState(1);
  const [addressTerm, setAddressTerm] = useState("");
  const [fromTerm, setFromTerm] = useState("");
  const [toTerm, setToTerm] = useState("");
  const [checkedOne, setCheckedOne] = useState(false);
  const [checkedTwo, setCheckedTwo] = useState(false);
  const [initiateWithdraw, setInitiateWithdraw] = useState(false);
  const [isWithdrawConfirmed, setIsWithdrawConfirmed] = useState(false);
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  // Forex Currency Action
  const [addApiValue, setAddApiValue] = useState();
  const [addApiValueCoin, setAddApiValueCoin] = useState();
  const [toCurrencyApiValue, setToCurrencyApiValue] = useState();
  const [countryApiValue, setCountryApiValue] = useState();

  const [payMethodApiValue, setPayMethodApiValue] = useState();
  const [eachCardShowValue, setEachCardShowValue] = useState();
  const [fundingCurrency, setFundingCurrency] = useState(false);
  const [payMethod, setPayMethod] = useState(false);
  const [otcDesk, setOtcDesk] = useState(false);
  const [currentStep, setCurrentStep] = useState("step1");
  const [newWholeValue, setNewWholeValue] = useState({
    step1: "",
    step2: "",
    step3: "",
    step4: "",
  });
  const [fromCurrencyData, setFromCurrencyData] = useState({
    step1: "",
    step2: "",
    step3: "",
    step4: "",
  });
  const [bankerId, setBankerId] = useState("");
  const [enterAmount, setEnterAmount] = useState(false);
  const [otcApiValue, setOtcApiValue] = useState();
  const [selectedTab, setSelectedTab] = useState("sendingCurrency");
  const [isCoinLoadingInAddAction, setCoinLoadingInAddAction] = useState(false);
  const [updateVaultData, setUpdateVaultData] = useState(true);
  const [updateBondVaultData, setUpdateBondVaultData] = useState(true);
  const [updateMMVaultData, setUpdateMMVaultData] = useState(true);
  const [updateBankAccounts, setUpdateBankAccounts] = useState(true);
  const [finalToAmountValue, setFinalToAmountValue] = useState();
  const [pathData, setPathData] = useState();

  const [sendVerificationMail, setSendVerificationMail] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmAmount, setConfirmAmount] = useState(false);
  const [confirmQuote, setConfirmQuote] = useState(false);

  const [addActionStep, setAddActionStep] = useState(1);
  const [hashText, setHashText] = useState("");
  const [submitHashEnabled, setSubmitHashEnabled] = useState(false);

  const [transferActionStep, setTransferActionStep] = useState(1);
  const [transferAmount, setTransferAmount] = useState();
  const [transferMethod, setTransferMethod] = useState("bonds");

  const [addForexCurrencyValue, setAddForexCurrencyValue] = useState();
  const [bankAccountId, setBankAccountId] = useState("");

  const [isAddingForexLoading, setIsAddingForexLoading] = useState(false);

  const [withdrawForexStep, setWithdrawForexStep] = useState("1");
  const [withdrawForexCurrency, setWithdrawForexCurrency] = useState();
  const [withdrawForexCountry, setWithdrawForexCountry] = useState();
  const [withdrawForexPaymentMethod, setWithdrawForexPaymentMethod] =
    useState();
  const [withdrawForexOtcDesk, setWithdrawForexOtcDesk] = useState();
  const [withdrawForexAccountId, setWithdrawForexAccountId] = useState();
  const [withdrawForexAccountName, setWithdrawForexAccountName] = useState();
  const [withdrawForexEnteredAmount, setWithdrawForexEnteredAmount] =
    useState("");

  const [addBankAccountStep, setAddBankAccountStep] = useState(1);
  const [addAccountStepName, setAddAccountStepName] = useState("");
  const [bankingPaymentMethod, setBankingPaymentMethod] = useState();
  const [instituteName, setInstituteName] = useState();
  const [instituteId, setInstituteId] = useState();

  const [enableAccountCreation, setEnableAccountCreation] = useState(false);
  const [addBankAccountLoading, setAddBankAccountLoading] = useState(false);

  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [selectedBankType, setSelectedBankType] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [nameOnBankAccount, setNameOnBankAccount] = useState("");
  const [bankingPhoneNumber, setBankingPhoneNumber] = useState("");
  const [beneficiaryAddress, setBeneficiaryAddress] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiPhoneNumber, setUpiPhoneNumber] = useState("");

  const [backToMenu, setBackToMenu] = useState(false);
  const [checkedOneForex, setCheckedOneForex] = useState(false);
  const [allApiData, setAllApiData] = useState([]);
  const [forexPathId, setForexPathId] = useState("");
  const [forexQuote, setForexQuote] = useState([]);
  const [otpForex, setOtpForex] = useState("");
  const [updatedForexBalance, setUpdatedForexBalance] = useState([]);

  //sidebar
  const [isClose, setIsClose] = useState(false);

  //toggle balance when vaults type change
  const [check, setCheck] = useState(false);

  //onhold admin change
  const [onhold, setOnHold] = useState("");

  //Google map
  const [directions, setDirections] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showDirections, setShowDirections] = useState(true);

  const [searchTerm, setSearchterm] = useState("");
  const [pathItemSelected, setPathItemSelected] = useState(false);
  const [pathItemStep, setPathItemStep] = useState(1);
  const [selectedPathItem, setSelectedPathItem] = useState([]);
  const [allSteps, setAllSteps] = useState([]);
  const [stepsToggle, setStepsToggle] = useState(false);

  //add path form
  const [pathSteps, setPathSteps] = useState({
    email: "",
    nameOfPath: "",
    description: "",
    length: "",
    path_type: "",
    step_ids: [],
    destination_institution: "",
  });
  const [selectedSteps, setSelectedSteps] = useState([]);
  const [creatingPath, setCreatingPath] = useState(false);
  const [mypathsMenu, setMypathsMenu] = useState("Active Steps");
  const [currentStepData, setCurrentStepData] = useState("");
  const [currentStepdataPathId, setCurrentStepDataPathId] = useState("");
  const [currentStepDataLength, setCurrentStepDataLength] = useState();
  const [showPathDetails, setShowPathDetails] = useState(false);
  const [preLoginMenu, setPreLoginMenu] = useState("About Us");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [programSearch, setProgramSearch] = useState("");
  const [showDdown, setShowDdown] = useState("");
  const [preLoginPathViewData, setPreLoginPathViewData] = useState([]);
  const [showPreLoginModal, setShowPreLoginModal] = useState(false);
  const [checkForHistory, setCheckForHistory] = useState(false);
  const [preLoginHistoryData, setPreLoginHistoryData] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [servicesToggle, setServicesToggle] = useState(false);

  // transaction page
  const [transactionSelected, setTransactionSelected] = useState(false);
  const [transactionData, setTransactionData] = useState([]);

  // Forex Currency Add Action
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [addForexAmount, setAddForexAmount] = useState();

  //mob single directory product page
  const [selectedDirectoryProduct, setSelectedDirectoryProduct] = useState([]);

  //mob single service product page
  const [selecteServiceProduct, setSelectedSingleProduct] = useState([]);

  const [stepServices, setStepServices] = useState([])

  useEffect(() => {
    if (coinType == "bonds" || coinType == "moneyMarkets") {
      // console.log('bonds');
      setCheck(true);
    } else {
      // console.log('others');
      setCheck(false);
    }
  }, [coinType]);

useEffect(() => {
  const fetchCountries = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/countries`);
      console.log("✅ Countries fetched:", res.data);
      setCountryApiValue(res.data);
    } catch (err) {
      console.error("❌ Error fetching countries:", err);
    }
  };

  fetchCountries();
}, []);
  //   axios
  //     .get("https://restcountries.com/v3.1/all")
  //     .then(({ data }) => {
  //       // Sort countries alphabetically by common name
  //       const sortedCountries = data.sort((a, b) =>
  //         a.name.common.localeCompare(b.name.common)
  //       );
  //       setCountryApiValue(sortedCountries);
  //     })
  //     .catch((error) => console.error("Error fetching countries:", error));
  // }, []);

  return (
    <CoinContext.Provider
      value={{
        coinActionEnabled,
        setCoinActionEnabled,
        addBankingEnabled,
        setAddBankingEnabled,
        coinAction,
        setCoinAction,
        swapMenu,
        setSwapMenu,
        coinType,
        setCoinType,
        trackerType,
        setTrackerType,
        placeholder,
        setPlaceholder,
        selectedCoin,
        setSelectedCoin,
        swapActionStep,
        setSwapActionStep,
        selectedSwapAction,
        setSelectedSwapAction,
        enteredSwapValue,
        setEnteredSwapValue,
        buyResult,
        setBuyResult,
        sellResult,
        setSellResult,
        buyQuote,
        setBuyQuote,
        sellQuote,
        setSellQuote,
        fromAsset,
        setFromAsset,
        assetName,
        setAssetName,
        selectAsset,
        setSelectAsset,
        updateAfterTrade,
        setUpdateAfterTrade,
        senbtnClicked,
        setSendBtnClicked,

        // Withdraw Action
        step,
        setStep,
        addressTerm,
        setAddressTerm,
        fromTerm,
        setFromTerm,
        toTerm,
        setToTerm,
        checkedOne,
        setCheckedOne,
        checkedTwo,
        setCheckedTwo,
        initiateWithdraw,
        setInitiateWithdraw,
        isWithdrawConfirmed,
        setIsWithdrawConfirmed,

        // Forex Currency Action
        addApiValue,
        setAddApiValue,
        addApiValueCoin,
        setAddApiValueCoin,
        toCurrencyApiValue,
        setToCurrencyApiValue,
        countryApiValue,
        setCountryApiValue,
        payMethodApiValue,
        setPayMethodApiValue,
        eachCardShowValue,
        setEachCardShowValue,
        fundingCurrency,
        setFundingCurrency,
        payMethod,
        setPayMethod,
        otcDesk,
        setOtcDesk,
        currentStep,
        setCurrentStep,
        newWholeValue,
        setNewWholeValue,
        fromCurrencyData,
        setFromCurrencyData,
        enterAmount,
        setEnterAmount,
        otcApiValue,
        setOtcApiValue,
        selectedTab,
        setSelectedTab,
        confirmAmount,
        setConfirmAmount,
        bankerId,
        setBankerId,
        isCoinLoadingInAddAction,
        setCoinLoadingInAddAction,

        updateVaultData,
        setUpdateVaultData,
        updateBondVaultData,
        setUpdateBondVaultData,
        updateMMVaultData,
        setUpdateMMVaultData,

        sendVerificationMail,
        setSendVerificationMail,
        otp,
        setOtp,

        addActionStep,
        setAddActionStep,
        hashText,
        setHashText,
        submitHashEnabled,
        setSubmitHashEnabled,

        addForexCurrencyValue,
        setAddForexCurrencyValue,
        confirmQuote,
        setConfirmQuote,
        isAddingForexLoading,
        setIsAddingForexLoading,
        bankAccountId,
        setBankAccountId,

        transferActionStep,
        setTransferActionStep,
        transferAmount,
        setTransferAmount,
        transferMethod,
        setTransferMethod,

        withdrawForexStep,
        setWithdrawForexStep,
        withdrawForexCurrency,
        setWithdrawForexCurrency,
        withdrawForexCountry,
        setWithdrawForexCountry,
        withdrawForexPaymentMethod,
        setWithdrawForexPaymentMethod,
        withdrawForexOtcDesk,
        setWithdrawForexOtcDesk,
        withdrawForexAccountId,
        setWithdrawForexAccountId,
        withdrawForexAccountName,
        setWithdrawForexAccountName,
        withdrawForexEnteredAmount,
        setWithdrawForexEnteredAmount,
        checkedOneForex,
        setCheckedOneForex,
        allApiData,
        setAllApiData,
        forexPathId,
        setForexPathId,
        forexQuote,
        setForexQuote,
        otpForex,
        setOtpForex,
        updatedForexBalance,
        setUpdatedForexBalance,

        addBankAccountStep,
        setAddBankAccountStep,

        bankingPaymentMethod,
        setBankingPaymentMethod,
        instituteName,
        setInstituteName,
        instituteId,
        setInstituteId,
        nameOnBankAccount,
        setNameOnBankAccount,
        bankingPhoneNumber,
        setBankingPhoneNumber,
        beneficiaryAddress,
        setBeneficiaryAddress,
        upiId,
        setUpiId,
        upiPhoneNumber,
        setUpiPhoneNumber,
        enableAccountCreation,
        setEnableAccountCreation,
        addBankAccountLoading,
        setAddBankAccountLoading,
        updateBankAccounts,
        setUpdateBankAccounts,
        finalToAmountValue,
        setFinalToAmountValue,
        pathData,
        setPathData,

        //Add Account States
        addAccountStepName,
        setAddAccountStepName,
        selectedPaymentType,
        setSelectedPaymentType,
        selectedBankType,
        setSelectedBankType,
        selectedCountry,
        setSelectedCountry,
        backToMenu,
        setBackToMenu,

        //sidebar
        isClose,
        setIsClose,

        //toggle
        check,
        setCheck,

        //onhold admin change
        onhold,
        setOnHold,

        //Google maps
        directions,
        setDirections,
        selectedLocation,
        setSelectedLocation,
        showDirections,
        setShowDirections,

        searchTerm,
        setSearchterm,
        pathItemSelected,
        setPathItemSelected,
        pathItemStep,
        setPathItemStep,
        selectedPathItem,
        setSelectedPathItem,
        allSteps,
        setAllSteps,
        stepsToggle,
        setStepsToggle,

        //add path form
        pathSteps,
        setPathSteps,
        selectedSteps,
        setSelectedSteps,
        creatingPath,
        setCreatingPath,
        mypathsMenu,
        setMypathsMenu,
        currentStepData,
        setCurrentStepData,
        currentStepdataPathId,
        setCurrentStepDataPathId,
        currentStepDataLength,
        setCurrentStepDataLength,
        showPathDetails,
        setShowPathDetails,
        preLoginMenu,
        setPreLoginMenu,
        schoolSearch,
        setSchoolSearch,
        programSearch,
        setProgramSearch,
        showDdown,
        setShowDdown,
        preLoginPathViewData,
        setPreLoginPathViewData,
        showPreLoginModal,
        setShowPreLoginModal,
        checkForHistory,
        setCheckForHistory,
        preLoginHistoryData,
        setPreLoginHistoryData,
        allServices,
        setAllServices,
        servicesToggle,
        setServicesToggle,

        // transaction page
        transactionSelected,
        setTransactionSelected,
        transactionData,
        setTransactionData,

        // Forex Currency Add Action
        paymentMethodData,
        setPaymentMethodData,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        addForexAmount,
        setAddForexAmount,

        //mob single directory product page
        selectedDirectoryProduct,
        setSelectedDirectoryProduct,

        //mob single service product page
        selecteServiceProduct,
        setSelectedSingleProduct,
        stepServices,
        setStepServices
      }}
    >
      {children}
    </CoinContext.Provider>
  );
};

export const useCoinContextData = () => useContext(CoinContext);
