import moment from 'moment';
import TimeAgo from 'javascript-time-ago';

export function FormatNumber(val, prec, def) {
  if (!isNaN(def)) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: def,
      minimumFractionDigits: def,
    }).format(isNaN(val) ? 0 : val);
  }
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: prec,
    minimumFractionDigits: prec,
  }).format(isNaN(val) || val);
}

export const roundHelper = (value, currency) => {
  if (!currency) {
    return fiatFormatter(value);
  }

  if (cryptoList.includes(currency.toUpperCase())) {
    return cryptoFormatter(value);
  }

  return fiatFormatter(value);
};

export const fiatFormatter = (value) => {
  const parsedFloatValue = parseFloat(value);

  return parsedFloatValue.toFixed(2);
};

export const cryptoList = ['ETH', 'BTC', 'LTC'];

export const formatterHelper = (value, currency) => {
  if (!currency) {
    return usdValueFormatterWithoutSign.format(value);
  }

  if (currency === 'USD') {
    return usdValueFormatter.format(value);
  }

  if (cryptoList.includes(currency.toUpperCase())) {
    return cryptoFormatter(value);
  }

  return usdValueFormatterWithoutSign.format(value);
};

export const cryptoFormatter = (value) => {
  const parsedFloatValue = parseFloat(value);
  const parsedIntValue = parseInt(value);

  const numberOfdigitsBeforDecimel = parsedIntValue.toString().length;

  const delta = 5 - numberOfdigitsBeforDecimel;

  return parsedFloatValue.toFixed(delta < 0 ? 0 : delta);
};

export const usdValueFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const usdValueFormatterWithoutSign = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function FormatCurrency(value = 0, coin = 'USD', def) {
  if (def && !isNaN(def)) {
    return FormatNumber(value, def);
  }
  if (value < 1) {
    return FormatNumber(value, 7);
  }
  if (
    typeof coin === 'string' &&
    (coin?.toUpperCase() === 'BTC' || coin?.toUpperCase() === 'ETH')
  ) {
    if (value < 10) {
      return FormatNumber(value, 4);
    } else {
      return FormatNumber(value, 3);
    }
  }
  return FormatNumber(value, 2);
}

export function YesterdayToday(timestamp, format = 'MMMM Do YYYY') {
  if (moment(timestamp).format('MMDDYYYY') === moment().format('MMDDYYYY')) {
    return 'Today';
  } else if (
    moment(timestamp).format('MMDDYYYY') ===
    moment().add(-1, 'day').format('MMDDYYYY')
  ) {
    return 'Yesterday';
  } else {
    return moment(timestamp).format(format);
  }
}
export function IsValidURL(str) {
  const urlRegex = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return urlRegex.test(str) ? str : false;
}

export const timeAgoFormatter = (timestamp) => {
  let text = '';

  try {
    const timeAgo = new TimeAgo('en-US');
    text = timeAgo.format(timestamp);
  } catch (error) {}

  return text;
};

export function GetSortOrder(prop, order = 1) {
  return function (a, b) {
    if (a[prop] < b[prop]) {
      return -1 * order;
    } else if (a[prop] > b[prop]) {
      return 1 * order;
    }
    return 0 * order;
  };
}

export const validateEmail = (email) => {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );
};

const capRegex = new RegExp(/^.*[A-Z].*/);
const numRegex = new RegExp(/^.*[0-9].*/);
const speRegex = new RegExp(/^.*[!@#$%^&*()+=].*/);

export const validatePassword = (password) => {
  return (
    capRegex.test(password) &&
    numRegex.test(password) &&
    speRegex.test(password) &&
    password.length >= 8
  );
};

export const getDateTime = (val) => {
  let timestamp = val;
  let date = new Date(timestamp);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  let strTime = hours + ':' + minutes + ' ' + ampm;
  return date.toString().substring(4, 15) + ' At ' + strTime + ' EST';
};

export const getTime = (val) => {
  let timestamp = val;
  let date = new Date(timestamp);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  let strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime + ' EST';
};

export const getTimeFull = (val) => {
  let timestamp = val;
  let date = new Date(timestamp);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  hours = hours % 24;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  let strTime = hours + ':' + minutes + ' ';
  return strTime + ' EST';
};

export const getYear = (val) => {
  let timestamp = val;
  let date = new Date(timestamp);
  let monthNameLong = date.toLocaleString('en-US', { month: 'long' });
  return monthNameLong + ' ' + date.toString().substring(8, 15);
};

export function pasteSelected(setValue) {
  navigator.clipboard.readText().then(
    (cliptext) => {
      document.getElementById('clipboard').value = cliptext;
      setValue(cliptext);
    },
    (err) => console.log(err)
  );
}

export const handleDecimal = (num) => {
  num = num?.toString();
  num = num?.slice(0, num?.indexOf('.') + 5);
  return Number(num);
};

export const onPaste = async (callback) => {
  if (callback) {
    const copiedText = await navigator.clipboard.readText();

    callback(copiedText.trim());
  }
};
