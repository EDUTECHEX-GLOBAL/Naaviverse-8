import axios from 'axios';
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
export function getVaultsCoin(
  email,
  coinType,
  setfunc,
  setloading,
  balanceToggle
) {
  setloading(true);
  // console.log('API calling');
  let obj = {
    app_code: 'naavi',
    email: email ? email : '',
    post_app_prices: true,
    with_balances: balanceToggle,
    orderby_dsc: true,
    type: coinType ? coinType : '',
  };

  axios
    .post('${BASE_URL}/api/vault/coins/<email>', obj)
    .then((response) => {
      // console.log(response?.data?.coins_data, 'getVaultsCoin response');
      setfunc(response?.data?.coins_data);
      setloading(false);
    })
    .catch((error) => {
      console.log(error?.message, 'getVaultsCoin error');
      setloading(false);
    });
}

export function getStakingEarningVaults(
  email,
  setfunc,
  setloading,
  balanceToggle
) {
  setloading(true);

  axios
    .get(
      `https://comms.globalxchange.io/coin/iced/interest/balances/get?email=${email}&with_balances=${balanceToggle}&orderby_dsc=true`
    )
    .then((response) => {
      let res = response?.data?.result;
      if (res?.length > 0) {
        // console.log(res[0]?.balances, 'getStakingEarningVaults ');
        setfunc(res[0]?.balances);
        setloading(false);
      }
    })
    .catch((error) => {
      console.log(error?.message, 'getStakingEarningVaults error');
      setloading(false);
    });
}

export function getMoneyMarketsVaults(
  email,
  setfunc,
  setloading,
  balanceToggle
) {
  setloading(true);

  axios
    .get(
      `https://comms.globalxchange.io/coin/vault/service/user/app/interest/balances/get?email=${email}&app_code=naavi&with_balances=${balanceToggle}&orderby_dsc=true`
    )
    .then((response) => {
      let res = response?.data?.result;
      if (res?.length > 0) {
        // console.log(
        //   res[0]?.balances[0]?.liquid_balances,
        //   'getMoneyMarketsVaults '
        // );
        setfunc(res[0]?.balances[0]?.liquid_balances);
        setloading(false);
      }
    })
    .catch((error) => {
      console.log(error?.message, 'getMoneyMarketsVaults error');
      setloading(false);
    });
}
