import { create } from "zustand";

type Store = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  ismobnav: boolean;
  setmobnav: (mobnav: boolean) => void;
  mobMenuOpen: boolean;
  setmobMenuOpen: (menu: boolean) => void;
  selectedNav: string;
  setselectedNav: (nav: string) => void;
  mobsize: number;
  setmobsize: (mob: number) => void;
  scrollmenu: string;
  setscrollmenu: (smenu: string) => void;
  sideNav: string;
  setsideNav: (sidenav: string) => void;
  accsideNav: string;
  setaccsideNav: (accsidenav: string) => void;
  isLoading: boolean;
  setisLoading: (loading: boolean) => void;
  ispopular: boolean;
  setispopular: (popular: boolean) => void;
  planBAccountPicUploading: boolean;
  setplanBAccountPicUploading: (accountPicUpload: boolean) => void;
  selectedDropDown: boolean;
  setSelectedDropDown: (dropdown: boolean) => void;
  loginType: string;
  setLoginType: (login: string) => void;
  singleDirectory: any;
  setSingleDirectory: (eachDirectory: any) => void;
  index: number[];
  setIndex: (index: number[]) => void;
  buy: string;
  setBuy: (buy: string) => void;
  mallCoindata: number[];
  setMallCoinData: (mallCoindata: number[]) => void;
  filteredcoins: number[];
  setfilteredcoins: (filteredcoins: number[]) => void;
  mallselectedCoin: number[];
  setMallSeclectedCoin: (mallselectedCoin: number[]) => void;
  balanceToggle: boolean;
  setBalanceToggle: (balanceToggle: boolean) => void;
  coinType: string;
  setCoinType: (coinType: string) => void;
  check: boolean;
  setCheck: (check: boolean) => void;
  selectedCoin: any;
  setSelectedCoin: (coin: any) => void;
  allDirection: string;
  setAllDirection: (direction: string) => void;
  allTypes: string;
  setAllTypes: (type: string) => void;
};

export const useStore = create<Store>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
  ismobnav: false,
  setmobnav: (mobnav) => set({ ismobnav: mobnav }),
  mobMenuOpen: false,
  setmobMenuOpen: (menu) => set({ mobMenuOpen: menu }),
  selectedNav: "About Us",
  setselectedNav: (nav) => set({ selectedNav: nav }),
  mobsize: 0,
  setmobsize: (mob) => set({ mobsize: mob }),
  scrollmenu: "Individuals",
  setscrollmenu: (smenu) => set({ scrollmenu: smenu }),
  sideNav: "Paths",
  setsideNav: (sidenav) => set({ sideNav: sidenav }),
  accsideNav: "CRM",
  setaccsideNav: (accsidenav) => set({ accsideNav: accsidenav }),
  isLoading: false,
  setisLoading: (loading) => set({ isLoading: loading }),
  ispopular: false,
  setispopular: (popular) => set({ ispopular: popular }),
  planBAccountPicUploading: false,
  setplanBAccountPicUploading: (accountPicUpload) =>
    set({ planBAccountPicUploading: accountPicUpload }),
  selectedDropDown: false,
  setSelectedDropDown: (dropdown) => set({ selectedDropDown: dropdown }),
  loginType: "Users",
  setLoginType: (login) => set({ loginType: login }),
  singleDirectory: {},
  setSingleDirectory: (eachDirectory) =>
    set({ singleDirectory: eachDirectory }),
  index: [],
  setIndex: (data) => set({ index: data }),
  buy: "step1",
  setBuy: (step) => set({ buy: step }),
  mallCoindata: [],
  setMallCoinData: (coindata) => set({ mallCoindata: coindata }),
  filteredcoins: [],
  setfilteredcoins: (coins) => set({ filteredcoins: coins }),
  mallselectedCoin: [],
  setMallSeclectedCoin: (selectedcoin) =>
    set({ mallselectedCoin: selectedcoin }),
  balanceToggle: false,
  setBalanceToggle: (toggle) => set({ balanceToggle: toggle }),
  coinType: "fiat",
  setCoinType: (ctype) => set({ coinType: ctype }),
  check: false,
  setCheck: (chk) => set({ check: chk }),
  selectedCoin: {},
  setSelectedCoin: (coin) => set({ selectedCoin: coin }),
  allDirection: "All Directions",
  setAllDirection: (direction) => set({ allDirection: direction }),
  allTypes: "All Types",
  setAllTypes: (type) => set({ allTypes: type }),
}));
