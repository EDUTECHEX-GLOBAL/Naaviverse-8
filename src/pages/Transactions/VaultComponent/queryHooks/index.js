import axios from "axios";
import { useQuery } from "react-query";
// import CryptoJS from 'crypto-js';
import { useAppContextDetails } from "../../../../context/AppContext";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const getAppByCode = async (app_code) => {
  const { data } = await axios.get(
    `https://comms.globalxchange.io/gxb/apps/get?app_code=${app_code}`
  );
  return data.apps[0];
};

export const useLoadAppDetails = (app_code) => {
  const { data: appByCode, isLoading: appByCodeLoading } = useQuery(
    ["getAppLoginByCode", app_code],
    () => getAppByCode(app_code),
    { enabled: Boolean(app_code) }
  );
  return { appByCode, appByCodeLoading };
};

const getUserApps = async ({ queryKey }) => {
  const [_key, email] = queryKey;
  const { data } = await axios.get(
    `https://comms.globalxchange.io/gxb/apps/registered/user?email=${email}`
  );
  return data.userApps;
};

export const useUserApps = (email) => {
  const query = useQuery(["userApps", email], getUserApps);
  return query;
};

// ------------------------
// NEW: Load user currencies from YOUR backend
// ------------------------
const getUserVaults = async ({ queryKey }) => {
  const [_key, { email }] = queryKey;

  const { data } = await axios.get(
    `${BASE_URL}/api/vault/coins/${email}`
  );

  return data?.data || [];
};

export const useUserVaults = (email) => {
  return useQuery(
    ["userVaults", { email }],
    getUserVaults,
    { enabled: Boolean(email) }
  );
};



const getVaultTxns = async ({ queryKey }) => {
  const [
    _key,
    {
      email,
      coin,
      allDirection,
      allTypes,
    },
  ] = queryKey;

  if (!email || !coin) return [];

  // Build query params (NOT body)
  const params = {
    email,
    coin,
  };

  if (allDirection && allDirection !== "All Directions") {
    params.direction = allDirection;
  }

  if (allTypes && allTypes !== "All Types") {
    params.type = allTypes;
  }

  const { data } = await axios.get(
    `${BASE_URL}/api/vault/txns`,
    { params }
  );

  return data?.txns || [];
};


export const useVaultTxns = (
  email,
  appCode,
  coin,
  profileId,
  updateVaultData,
  appCurrencyName,
  allDirection,
  allTypes
) => {
  const query = useQuery(
    [
      "vaultTxns",
      {
        email,
        appCode,
        coin,
        profileId,
        updateVaultData,
        appCurrencyName,
        allDirection,
        allTypes,
      },
    ],
    getVaultTxns
  );
  return query;
};

const getVaultTxnsDetail = async ({ queryKey }) => {
  const [_key, { identifier, email, deposit }] = queryKey;
  const { data } = await axios.get(
    `https://comms.globalxchange.io/coin/vault/service/get/complete/txn?identifier=${identifier}`
  );
  const temp = data.txns.filter(
    (txn) => txn[deposit ? "toUser" : "fromUser"]?.email === email
  );

  return temp[0] || data.txns[0];
};

export const useVaultTxnDetails = (identifier, email, deposit) => {
  const query = useQuery(
    ["vaultTxnsDetail", { identifier, email, deposit }],
    getVaultTxnsDetail
  );
  return query;
};

// const getUserDetails = async ({ queryKey }) => {
//   const [_key, email] = queryKey;
//   const { data } = await axios.post(
//     'https://comms.globalxchange.io/get_affiliate_data_no_logs',
//     {
//       email: email,
//     }
//   );
//   return data?.[0];
// };

// export const useUserDetails = (email) => {
//   const query = useQuery(['getUserDetails', email], getUserDetails);
//   return query;
// };

const getUserBondsList = async ({ queryKey }) => {
  const [_key, { email, appCurrencyName }] = queryKey;
  const { data } = await axios.get(
    `https://comms.globalxchange.io/coin/iced/interest/balances/get?app_code=ice&displayCurrency=${
      appCurrencyName ? appCurrencyName : "USD"
    }&email=${email}&with_balances=true`
  );
  // console.log(data?.result[0], 'bonds value');
  return data?.result[0];
};

export const useUserBondsList = (email, appCurrencyName) => {
  const query = useQuery(
    ["getUserBondsList", { email, appCurrencyName }],
    getUserBondsList
  );
  return query;
};

const getUserBondsTxns = async ({ queryKey }) => {
  const [_key, { email, coin, bondsPagination, bondsTxnsPerPage }] = queryKey;
  const { data } = await axios.get(
    `https://comms.globalxchange.io/coin/iced/interest/logs/get?email=${email}&coin=${coin}&skip=${
      bondsPagination ? bondsPagination : ""
    }&limit=${bondsTxnsPerPage ? bondsTxnsPerPage : ""}`
  );

  return data?.interestLogs;
};

export const useUserBondsTxns = (
  email,
  coin,
  bondsPagination,
  bondsTxnsPerPage
) => {
  const query = useQuery(
    ["getUserBondsTxns", { email, coin, bondsPagination, bondsTxnsPerPage }],
    getUserBondsTxns
  );
  return query;
};

const getUserMoneMarketsList = async ({ queryKey }) => {
  const [_key, { email, appCode, appCurrencyName, setMMEarningsVault }] =
    queryKey;
  const { data } = await axios.get(
    `https://comms.globalxchange.io/coin/vault/service/user/app/interest/balances/get?app_code=${appCode}&email=${email}&with_balances=true`
  );
  setMMEarningsVault(data?.totalBalanceUSD?.toFixed(2));
  return data?.result[0]?.balances[0]?.liquid_balances;
};

export const useUserMoneMarketsList = (email, appCode, appCurrencyName) => {
  const { setMMEarningsVault } = useAppContextDetails();
  const query = useQuery(
    [
      "getUserMoneMarketsList",
      { email, appCode, appCurrencyName, setMMEarningsVault },
    ],
    getUserMoneMarketsList
  );
  return query;
};

const getUserMoneyMarketsTxns = async ({ queryKey }) => {
  const [_key, { email, coin, appCode }] = queryKey;
  const { data } = await axios.get(
    `https://comms.globalxchange.io/coin/vault/service/user/app/interest/logs/get?email=${email}&app_code=${appCode}&coin=${coin}`
  );
  return data?.logs[0]?.logs;
};

export const useUserMoneyMarketsTxns = (email, coin, appCode) => {
  const query = useQuery(
    ["getUserMoneyMarketsTxns", { email, coin, appCode }],
    getUserMoneyMarketsTxns
  );
  return query;
};

// const getMarketCoinsList = async ({ queryKey }) => {
//   const [_key, { appCode, type, appCurrencyName }] = queryKey;
//   const { data } = await axios.post(
//     '${BASE_URL}/api/vault/coins/<email>',
//     {
//       app_code: appCode,
//       type,
//       displayCurrency: appCurrencyName,
//     }
//   );
//   return data?.coins_data;
// };

// export const useMarketCoinsList = (appCode, type, appCurrencyName) => {
//   const query = useQuery(
//     ['getMarketCoinsList', { appCode, type, appCurrencyName }],
//     getMarketCoinsList
//   );
//   return query;
// };

// const getShareTokensList = async () => {
//   const { data } = await axios.get(
//     `https://comms.globalxchange.io/coin/investment/path/get?investmentType=EQT`
//   );
//   return data?.paths;
// };

// export const useShareTokensList = () => {
//   const query = useQuery(['getShareTokens'], getShareTokensList);
//   return query;
// };

// const getShareTokensDetail = async ({ queryKey }) => {
//   const [_key, symbol] = queryKey;
//   const { data } = await axios.get(
//     `https://comms.globalxchange.io/coin/investment/path/get?token=${symbol}`
//   );
//   return data.paths[0];
// };

// export const useShareTokensDetail = (symbol) => {
//   const query = useQuery(
//     ['getShareTokensDetail', symbol],
//     getShareTokensDetail
//   );
//   return query;
// };

// const getAppDetail = async ({ queryKey }) => {
//   const [_key, appCode] = queryKey;
//   const { data } = await axios.get(
//     `https://comms.globalxchange.io/gxb/apps/get?app_code=${appCode}`
//   );
//   return data.apps[0];
// };

// export const useAppDetail = (appCode) => {
//   const query = useQuery(['getAppDetail', appCode], getAppDetail);
//   return query;
// };

// const getTokenDetailByStatus = async ({ queryKey }) => {
//   const [_key, { coin, status, type }] = queryKey;
//   const { data } = await axios.get(
//     `https://comms.globalxchange.io/coin/investment/path/tokens/resale/order/get?token=${coin}&status=${status}${
//       type ? '&type=' + type : ''
//     }`
//   );
//   return data;
// };

// export const useTokenDetailByStatus = (coin, status, type) => {
//   const query = useQuery(
//     ['getTokenDetailByStatus', { coin, status, type }],
//     getTokenDetailByStatus
//   );
//   return query;
// };

// const getSingleCoinBalance = async ({ queryKey }) => {
//   const [_key, { appCode, email, investmentCoin, coin, appCurrencyName }] =
//     queryKey;
//   const { data } = await axios.post(
//     '${BASE_URL}/api/vault/coins/<email>',
//     {
//       app_code: appCode,
//       email: email,
//       investmentCoin: investmentCoin,
//       include_coins: [coin],
//       displayCurrency: appCurrencyName,
//     }
//   );

//   return data?.coins_data && data?.coins_data[0];
// };

// export const useSingleCoinBalance = (
//   appCode,
//   email,
//   investmentCoin,
//   coin,
//   appCurrencyName
// ) => {
//   const query = useQuery(
//     [
//       'getSingleCoinBalance',
//       { appCode, email, investmentCoin, coin, appCurrencyName },
//     ],
//     getSingleCoinBalance
//   );
//   return query;
// };

// const getCustomBondsList = async ({ queryKey }) => {
//   const [_key, { user_email, email }] = queryKey;
//   const { data } = await axios.get(
//     `https://comms.globalxchange.io/coin/iced/banker/custom/bond/list/data/get?user_email=${user_email}`
//   );

//   return data;
// };

// export const useCustomBondsList = (user_email, email) => {
//   const query = useQuery(
//     ['getCustomBondsList', { user_email, email }],
//     getCustomBondsList
//   );
//   return query;
// };

// export const getBondContracts = async (body) => {
//   try {
//     const data = axios.get(
//       `https://comms.globalxchange.io/coin/iced/contract/get?`,
//       { params: body }
//     );
//     return data;
//   } catch (err) {
//     console.error(err);
//   }
// };

// export const useLoadBondContracts = (email, ownerEmail) => {
//   const query = useQuery(['loadBondContracts', { email, ownerEmail }], () =>
//     getBondContracts({ email, banker_email: ownerEmail })
//   );
//   return query;
// };

// const getBankerList = async () => {
//   const { data } = await axios.get(
//     'https://teller2.apimachine.com/admin/allBankers'
//   );

//   return data?.data;
// };

// export const useBankerList = () => {
//   const query = useQuery(['getBankerList'], getBankerList);
//   return query;
// };

const getShareTokensVaultsList = async ({ queryKey }) => {
  const [_key, { email, appCode }] = queryKey;
  if (email) {
    const { data } = await axios.get(
      `https://comms.globalxchange.io/coin/investment/path/user/vault/balances/get?email=${email}&investmentType=EQT${
        appCode ? "&app_code=" + appCode : ""
      }`
    );
    return data;
  }
};

export const useShareTokensVaultsList = (email, appCode) => {
  const query = useQuery(
    ["getShareTokensVaultsList", { email, appCode }],
    getShareTokensVaultsList
  );
  return query;
};

const getFXSendMethods = async ({ queryKey }) => {
  const [_key, { toCoin, fromCoin, type, paymentMethod }] = queryKey;
  const { data } = await axios.get(
    `https://comms.globalxchange.io/coin/vault/service/payment/stats/get?select_type=${type}&to_currency=${toCoin}&from_currency=${fromCoin}&banker=shorupan@indianotc.com${
      paymentMethod ? '&paymentMethod=' + paymentMethod : ''
    }`
  );
  return data?.pathData;
};

export const useFXSendMethods = (
  toCoin,
  fromCoin,
  type = 'fund',
  paymentMethod
) => {
  const query = useQuery(
    ['getFXSendMethods', { toCoin, fromCoin, type, paymentMethod }],
    getFXSendMethods
  );
  return query;
};

// const getRegisterdUsers = async () => {
//   const { data } = await axios.get(
//     'https://comms.globalxchange.io/listUsernames'
//   );
//   if (data.status) {
//     let bytes = CryptoJS.Rabbit.decrypt(data.payload, 'gmBuuQ6Er8XqYBd');
//     let jsonString = bytes.toString(CryptoJS.enc.Utf8);
//     let result_obj = JSON.parse(jsonString);
//     return result_obj;
//   }
// };

// export const useRegisterdUsers = () =>
//   useQuery(['getRegisterdUsers'], getRegisterdUsers);

// const getMMList = async (appCode, appCurrencyName) => {
//   const { data } = await axios.get(
//     `https://comms.globalxchange.io/coin/iced/get/liquid/interest?app_code=${appCode}&getChangeData=true&displayCurrency=${appCurrencyName}`
//   );

//   return data?.interest_rates;
// };

// export const useMMList = () => {
//   const { appCode, appCurrencyName } = useAppContextDetails();
//   const query = useQuery(['getMMList'], () =>
//     getMMList(appCode, appCurrencyName)
//   );
//   return query;
// };

// const getCustomBondsList1 = async ({ queryKey }) => {
//   const [_key, { user_email, email }] = queryKey;
//   const { data } = await axios.get(
//     `https://comms.globalxchange.io/coin/iced/banker/custom/bond/list/data/get?user_email=${user_email}`
//   );

//   return data;
// };

// export const useCustomBondsList1 = (user_email, email) => {
//   const query = useQuery(
//     ['getCustomBondsList', { user_email, email }],
//     getCustomBondsList1
//   );
//   return query;
// };
