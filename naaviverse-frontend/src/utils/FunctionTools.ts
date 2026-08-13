import moment from "moment";
import TimeAgo from "javascript-time-ago";

export function FormatNumber(val: number, prec?: number, def?: number) {
  if (def) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: def,
      minimumFractionDigits: def,
    }).format(val ? 0 : val);
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: prec,
    minimumFractionDigits: prec,
  }).format(val);
}

export function FormatCurrency(value = 0, coin = "USD", def?: number) {
  if (def && !isNaN(def)) {
    return FormatNumber(value, def);
  }
  if (
    typeof coin === "string" &&
    (coin?.toUpperCase() === "BTC" || coin?.toUpperCase() === "ETH")
  ) {
    if (value < 10) {
      return FormatNumber(value, 4);
    } else {
      return FormatNumber(value, 3);
    }
  }
  return FormatNumber(value, 2);
}

export function YesterdayToday(timestamp: number, format = "MMMM Do YYYY") {
  if (moment(timestamp).format("MMDDYYYY") === moment().format("MMDDYYYY")) {
    return "Today";
  } else if (
    moment(timestamp).format("MMDDYYYY") ===
    moment().add(-1, "day").format("MMDDYYYY")
  ) {
    return "Yesterday";
  } else {
    return moment(timestamp).format(format);
  }
}
export function IsValidURL(str: string) {
  const urlRegex = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return urlRegex.test(str) ? str : false;
}

export const timeAgoFormatter = (timestamp: number) => {
  let text: any = "";

  try {
    const timeAgo = new TimeAgo("en-US");
    text = timeAgo.format(timestamp);
  } catch (error) {}

  return text;
};

export function GetSortOrder(prop: string) {
  return function (a: any, b: any) {
    if (a[prop] < b[prop]) {
      return -1;
    } else if (a[prop] > b[prop]) {
      return 1;
    }
    return 0;
  };
}

export const validateEmail = (email: string) => {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );
};

const capRegex = new RegExp(/^.*[A-Z].*/);
const numRegex = new RegExp(/^.*[0-9].*/);
const speRegex = new RegExp(/^.*[!@#$%^&*()+=].*/);

export const validatePassword = (password: string) => {
  return (
    capRegex.test(password) &&
    numRegex.test(password) &&
    speRegex.test(password) &&
    password.length >= 8
  );
};
