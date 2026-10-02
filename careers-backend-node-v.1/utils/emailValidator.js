const GMAIL_TYPOS = new Set([
  'gamail.com', 'gamil.com', 'gmai.com', 'gmaill.com', 'gmal.com',
  'gmaik.com', 'gmeil.com', 'gmial.com', 'gmaild.com', 'gmaol.com',
  'gmaul.com', 'gamil.co', 'gamail.in', 'gmaill.in'
]);

const YAHOO_TYPOS = new Set([
  'yaho.com', 'yahooo.com', 'yhaoo.com', 'yaho.in', 'yaho.co.in'
]);

const OUTLOOK_TYPOS = new Set([
  'outlok.com', 'outloo.com', 'hotmial.com', 'hotmaill.com', 'hotmali.com'
]);

const VALID_TLDS = new Set([
  'com', 'in', 'net', 'org', 'edu', 'gov', 'mil', 'co', 'io', 'ai', 'biz', 'info',
  'me', 'tech', 'dev', 'app', 'xyz', 'online', 'site', 'store', 'cloud', 'digital',
  'network', 'world', 'link', 'live', 'pro', 'ac', 'us', 'uk', 'ca', 'au', 'de',
  'fr', 'jp', 'eu', 'sg', 'ae', 'global', 'agency'
]);

const VALID_COMPOUND_TLDS = new Set([
  'co.in', 'ac.in', 'edu.in', 'gov.in', 'net.in', 'org.in', 'res.in',
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk',
  'com.au', 'net.au', 'org.au', 'edu.au',
  'co.nz', 'org.nz', 'co.za', 'com.sg'
]);

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Please enter your email address.' };
  }

  const trimmed = email.trim().toLowerCase();

  const generalRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+([a-zA-Z]{2,})$/;
  if (!generalRegex.test(trimmed)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address (e.g. name@gmail.com, .in, .net, .org, .edu).'
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, message: 'Please enter a valid email address.' };
  }

  const [localPart, domainPart] = parts;

  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return { isValid: false, message: 'Please enter a valid email address.' };
  }

  if (GMAIL_TYPOS.has(domainPart)) {
    return {
      isValid: false,
      message: 'Did you mean @gmail.com? Please enter a valid email address.'
    };
  }

  if (YAHOO_TYPOS.has(domainPart)) {
    return {
      isValid: false,
      message: 'Did you mean @yahoo.com? Please enter a valid email address.'
    };
  }

  if (OUTLOOK_TYPOS.has(domainPart)) {
    return {
      isValid: false,
      message: 'Did you mean @outlook.com or @hotmail.com? Please enter a valid email address.'
    };
  }

  if (domainPart.startsWith('gmail.') && domainPart !== 'gmail.com') {
    return {
      isValid: false,
      message: 'Invalid domain. Gmail addresses must end with @gmail.com.'
    };
  }

  const domainSegments = domainPart.split('.');
  const tld = domainSegments[domainSegments.length - 1];
  const secondLast = domainSegments.length > 2 ? domainSegments[domainSegments.length - 2] : '';
  const compoundTLD = secondLast ? `${secondLast}.${tld}` : '';

  if (!VALID_TLDS.has(tld) && !VALID_COMPOUND_TLDS.has(compoundTLD)) {
    return {
      isValid: false,
      message: 'Please enter an email with a valid domain (e.g. .com, .in, .net, .org, .edu).'
    };
  }

  return { isValid: true, cleanEmail: trimmed };
};

const validatePersonName = (name, fieldLabel = "Full name") => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { isValid: false, message: `${fieldLabel} is required.` };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { isValid: false, message: `${fieldLabel} must be at least 2 characters long.` };
  }

  // Letters only, including valid spaces between names. Rejects numbers and special characters.
  const nameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
  if (!nameRegex.test(trimmed)) {
    if (/[0-9]/.test(trimmed)) {
      return { isValid: false, message: `${fieldLabel} cannot contain numbers. Only letters and spaces are allowed.` };
    }
    if (/[^a-zA-Z\s]/.test(trimmed)) {
      return { isValid: false, message: `${fieldLabel} cannot contain special characters. Only letters and spaces are allowed.` };
    }
    return { isValid: false, message: `${fieldLabel} can only contain letters and a single space between names.` };
  }

  return { isValid: true, cleanName: trimmed };
};

module.exports = { validateEmail, validatePersonName };

