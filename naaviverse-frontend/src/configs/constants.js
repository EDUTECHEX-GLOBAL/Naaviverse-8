import bondDebuntures from './assetClasses/bondDebuntures.svg';
import cryptoCurrencies from './assetClasses/cryptoCurrencies.svg';
import forexCurrencies from './assetClasses/forexCurrencies.svg';
import moneyMarkets from './assetClasses/moneyMarkets.svg';
import sharesOffering from './assetClasses/sharesOffering.svg';

export const ASSET_CLASSES = [
  {
    name: 'crypto',
    icon: cryptoCurrencies,
    label: 'Cryprocurrency',
    marketOrder: 0,
    marketEnable: true,
    aboutOrder: 1,
  },
  {
    name: 'fiat',
    icon: forexCurrencies,
    label: 'Fiat Currency',
    marketOrder: 6,
    marketEnable: true,
    aboutOrder: 2,
  },
  {
    name: 'moneyMarkets',
    icon: moneyMarkets,
    label: 'MoneyMarkets',
    marketOrder: 2,
    marketEnable: true,
    aboutOrder: 5,
  },
  {
    name: 'bonds',
    icon: bondDebuntures,
    label: 'Bonds',
    marketOrder: 3,
    marketEnable: true,
    aboutOrder: 6,
  },
  {
    name: 'shares',
    icon: sharesOffering,
    label: 'Shares',
    marketOrder: 1,
    marketEnable: true,
    aboutOrder: 7,
  },
];

// export const MARKET_ASSET_CLASSES = [
//   {
//     name: 'shares',
//     icon: sharesOffering,
//     label: 'ShareTokens',
//     marketOrder: 1,
//     marketEnable: true,
//     aboutOrder: 7,
//     miniLogo: sharesMiniLogo,
//   },
//   {
//     name: 'SafeTokens',
//     icon: safetoken,
//     label: 'SafeTokens',
//     marketOrder: 1,
//     marketEnable: true,
//     aboutOrder: 7,
//     miniLogo: safetoken,
//   },
//   {
//     name: 'CSOP’s',
//     icon: cos,
//     label: 'CSOP’s',
//     marketOrder: 1,
//     marketEnable: true,
//     aboutOrder: 7,
//     miniLogo: cos,
//   },
//   {
//     name: 'ESOP’s',
//     icon: eos,
//     label: 'ESOP’s',
//     marketOrder: 1,
//     marketEnable: true,
//     aboutOrder: 7,
//     miniLogo: eos,
//   },

  
  
//   {
//     name: 'bonds',
//     icon: bondDebuntures,
//     label: 'Bonds',
//     marketOrder: 2,
//     marketEnable: true,
//     aboutOrder: 6,
//     miniLogo: bonds,
//   },

//   // {
//   //   name: 'crypto',
//   //   icon: cryptoCurrencies,
//   //   label: 'Cryprocurrency',
//   //   marketOrder: 0,
//   //   marketEnable: true,
//   //   aboutOrder: 1,
//   // },
//   // {
//   //   name: 'fiat',
//   //   icon: forexCurrencies,
//   //   label: 'Fiat Currency',
//   //   marketOrder: 6,
//   //   marketEnable: true,
//   //   aboutOrder: 2,
//   // },
//   // {
//   //   name: 'bonds',
//   //   icon: bondMarkets,
//   //   label: 'Bonds',
//   //   marketOrder: 1,
//   //   marketEnable: true,
//   //   aboutOrder: 6,
//   //   newName: 'Staking Contracts',
//   // },
//   // {
//   //   name: 'moneyMarkets',
//   //   icon: moneyMarkets,
//   //   label: 'MoneyMarkets',
//   //   marketOrder: 2,
//   //   marketEnable: true,
//   //   aboutOrder: 5,
//   //   newName: 'MoneyMarkets',
//   // },
//   // {
//   //   name: 'Defi Markets',
//   //   marketOrder: 3,
//   //   marketEnable: false,
//   //   newName: 'Defi Markets'
//   // },
//   // {
//   //   name: 'Defi Routing',
//   //   marketOrder: 4,
//   //   marketEnable: false,
//   //   newName: 'Defi Routing'
//   // },
//   // {
//   //   name: 'myContracts',
//   //   marketOrder: 3,
//   //   marketEnable: true,
//   //   newName: 'My Contracts',
//   // },
//   // {
//   //   name: 'stakingVaults',
//   //   icon: stakingVaults,
//   //   label: 'StakingVaults',
//   //   marketOrder: 4,
//   //   marketEnable: false,
//   //   aboutOrder: 5,
//   //   newName: 'Build Your Bond'
//   // },
//   // {
//   //   name: 'shares',
//   //   icon: sharesOffering,
//   //   label: 'Shares',
//   //   marketOrder: 1,
//   //   marketEnable: true,
//   //   aboutOrder: 7,
//   // },
// ];

// export const MARKET_ASSET_CLASSES1 = [
//   {
//     name: 'bonds',
//     icon: bondMarkets,
//     label: 'Bonds',
//     marketOrder: 1,
//     marketEnable: true,
//     aboutOrder: 6,
//     newName: 'Staking Contracts',
//   },
//   {
//     name: 'myContracts',
//     marketOrder: 3,
//     marketEnable: true,
//     newName: 'My Contracts',
//   },
// ];

// export const SWAP_ASSET_CLASSES = [
//   {
//     name: 'crypto',
//     icon: cryptoCurrencies,
//     label: 'Cryprocurrency',
//     marketOrder: 0,
//     marketEnable: true,
//     aboutOrder: 1,
//   },
//   {
//     name: 'fiat',
//     icon: forexCurrencies,
//     label: 'Fiat Currency',
//     marketOrder: 1,
//     marketEnable: true,
//     aboutOrder: 2,
//   },
// ];

// export const SIDEBAR_FOOTERS = [
//   {
//     icon: trending,
//     label: 'Trending',
//     fullLogo: investorSocialFull,
//   },
//   {
//     icon: marketWatchers,
//     label: 'MarketWatchers',
//     fullLogo: marketWatchersFull,
//   },
//   {
//     icon: bonds,
//     label: 'Bonds',
//     fullLogo: bondDebuntures,
//   },
//   {
//     icon: terminals,
//     label: 'Terminals',
//     fullLogo: terminalsFull,
//   },
//   {
//     icon: stream,
//     label: 'Stream',
//     fullLogo: tradeStreamFull,
//   },
// ];

// export function updateScroll() {
//   var element = document.getElementById('preventScroll');
//   element.scrollTop = 0;
// }
