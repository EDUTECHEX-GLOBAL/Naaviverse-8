const GMAIL_TYPOS = new Set([
  'gail.com', 'gamail.com', 'gamil.com', 'gmai.com', 'gmaill.com', 'gmal.com',
  'gmaik.com', 'gmeil.com', 'gmial.com', 'gmaild.com', 'gmaol.com',
  'gmaul.com', 'gamil.co', 'gamail.in', 'gmaill.in', 'gmai.in',
  'gimail.com', 'gemail.com', 'gmail.co', 'gmail.in', 'gmail.con',
  'gmail.cpm', 'gmail.ocm', 'gmail.comm', 'gmail.coom',
  'gmai.org', 'gmail.org', 'gmai.net', 'gmail.net'
]);

const YAHOO_TYPOS = new Set([
  'yaho.com', 'yahooo.com', 'yhaoo.com', 'yaho.in', 'yaho.co.in',
  'yahoo.con', 'yahoo.cpm', 'yahoo.ocm', 'yahoo.comm', 'yaho.co'
]);

const OUTLOOK_TYPOS = new Set([
  'outlok.com', 'outloo.com', 'hotmial.com', 'hotmaill.com', 'hotmali.com',
  'hotmai.com', 'outlook.con', 'hotmail.con'
]);

const REDIFF_TYPOS = new Set([
  'redifmail.com', 'rediffmai.com', 'redif.com', 'rediffmail.con'
]);

const TLD_TYPOS = {
  'con': '.com',
  'cpm': '.com',
  'ocm': '.com',
  'comm': '.com',
  'coom': '.com',
  'inn': '.in',
  'og': '.org',
  'orgg': '.org',
  'neet': '.net',
  'eduu': '.edu',
};

// Valid single-segment TLDs
const VALID_TLDS = new Set([
  'com', 'in', 'net', 'org', 'edu', 'gov', 'mil', 'co', 'io', 'ai', 'biz', 'info',
  'me', 'tech', 'dev', 'app', 'xyz', 'online', 'site', 'store', 'cloud', 'digital',
  'network', 'world', 'link', 'live', 'pro', 'ac', 'us', 'uk', 'ca', 'au', 'de',
  'fr', 'jp', 'eu', 'sg', 'ae', 'global', 'agency', 'space', 'club', 'design', 'art',
  'cc', 'tv', 'vc', 'gg', 'is', 'ch', 'nl', 'se', 'no', 'es', 'it', 'ie', 'nz',
  'za', 'br', 'mx', 'corp', 'inc', 'ltd', 'int', 'asia'
]);

// Valid multi-segment TLDs (e.g. .co.in, .org.in)
const VALID_COMPOUND_TLDS = new Set([
  'co.in', 'ac.in', 'edu.in', 'gov.in', 'net.in', 'org.in', 'res.in', 'gen.in',
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'me.uk', 'net.uk',
  'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au',
  'co.nz', 'org.nz', 'net.nz', 'ac.nz',
  'co.za', 'org.za', 'net.za', 'ac.za',
  'com.sg', 'edu.sg', 'gov.sg', 'net.sg', 'org.sg',
  'com.my', 'edu.my', 'gov.my', 'net.my', 'org.my',
  'co.jp', 'ac.jp', 'ne.jp', 'or.jp',
  'com.br', 'org.br', 'net.br', 'edu.br',
  'com.mx', 'org.mx', 'net.mx', 'edu.mx',
  'com.pk', 'org.pk', 'edu.pk',
  'com.ng', 'org.ng', 'edu.ng',
  'com.sa', 'org.sa', 'edu.sa',
  'com.ae', 'net.ae', 'org.ae', 'gov.ae', 'ac.ae'
]);

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Please enter your email address.' };
  }

  const trimmed = email.trim().toLowerCase();

  // Basic syntax check: local@domain.tld
  const generalRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+([a-zA-Z]{2,})$/;
  if (!generalRegex.test(trimmed)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address (e.g. name@gmail.com, .in, .org, .net).'
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, message: 'Please enter a valid email address.' };
  }

  const [localPart, domainPart] = parts;

  // Local part cannot start or end with a dot, and cannot have consecutive dots
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return { isValid: false, message: 'Please enter a valid email address.' };
  }

  // Check known typos of popular email providers
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

  if (REDIFF_TYPOS.has(domainPart)) {
    return {
      isValid: false,
      message: 'Did you mean @rediffmail.com? Please enter a valid email address.'
    };
  }

  // Provider-specific strict rules
  if (domainPart.startsWith('gmail.') && domainPart !== 'gmail.com') {
    return {
      isValid: false,
      message: 'Invalid domain. Gmail addresses must end with @gmail.com.'
    };
  }

  // Extract domain segments and TLDs
  const domainSegments = domainPart.split('.');
  const tld = domainSegments[domainSegments.length - 1];
  const secondLast = domainSegments.length > 2 ? domainSegments[domainSegments.length - 2] : '';
  const compoundTLD = secondLast ? `${secondLast}.${tld}` : '';

  // Check for common TLD typos (.con -> .com, .og -> .org, .inn -> .in)
  if (TLD_TYPOS[tld]) {
    return {
      isValid: false,
      message: `Did you mean ${TLD_TYPOS[tld]}? Please check your email extension.`
    };
  }

  // Verify that the top-level domain is recognized (.com, .in, .org, .net, etc.)
  if (!VALID_TLDS.has(tld) && !VALID_COMPOUND_TLDS.has(compoundTLD)) {
    return {
      isValid: false,
      message: 'Please enter an email with a valid domain (e.g. .com, .in, .org, .net, .edu).'
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

