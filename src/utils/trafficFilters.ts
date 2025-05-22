import axios from 'axios';

// Interface for the risk score result
export interface RiskScoreResult {
  score: number;
  details: {
    country: boolean;
    mobile: boolean;
    language: boolean;
    spyTools: boolean;
    vpn: boolean;
    suspiciousUA: boolean;
    datacenter: boolean;
    emulator: boolean;
    visitCount: boolean;
  };
}

// Get user's country from IP
const getCountry = async (): Promise<string> => {
  try {
    const response = await axios.get('https://ipapi.co/country');
    return response.data;
  } catch (error) {
    console.error('Error fetching country:', error);
    return 'BR'; // Default to BR on error to avoid false positives
  }
};

// Check for VPN/proxy usage
const isVPNDetected = async (): Promise<boolean> => {
  try {
    const response = await axios.get('https://ipapi.co/proxy');
    return response.data === 'true';
  } catch (error) {
    console.error('Error checking VPN:', error);
    return false; // Default to false on error to avoid false positives
  }
};

// Check for datacenter IP
const isDatacenterIP = async (): Promise<boolean> => {
  try {
    const response = await axios.get('https://ipapi.co/org');
    const org = response.data.toLowerCase();
    const datacenterKeywords = ['aws', 'amazon', 'google', 'microsoft', 'azure', 'digitalocean', 'linode', 'vultr', 'ovh', 'hetzner'];
    return datacenterKeywords.some(keyword => org.includes(keyword));
  } catch (error) {
    console.error('Error checking datacenter IP:', error);
    return false; // Default to false on error to avoid false positives
  }
};

// Check for suspicious user agent
const isSuspiciousUserAgent = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  const suspiciousPatterns = [
    'headless', 'phantom', 'nightmare', 'selenium',
    'webdriver', 'cypress', 'puppeteer', 'playwright'
  ];
  return suspiciousPatterns.some(pattern => ua.includes(pattern));
};

// Check for emulator
const isEmulatorDetected = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  const emulatorPatterns = [
    'android emulator', 'sdk_gphone', 'droid4x',
    'nox', 'bluestacks', 'genymotion'
  ];
  return emulatorPatterns.some(pattern => ua.includes(pattern));
};

// Get visit count for IP (using localStorage as a simple implementation)
const getVisitCountForIP = (): number => {
  const visitKey = 'visit_count';
  const currentCount = parseInt(localStorage.getItem(visitKey) || '0');
  localStorage.setItem(visitKey, (currentCount + 1).toString());
  return currentCount;
};

// Mobile device detection patterns
const mobilePatterns = [
  /Android/i,
  /webOS/i,
  /iPhone/i,
  /iPad/i,
  /iPod/i,
  /BlackBerry/i,
  /Windows Phone/i,
  /Opera Mini/i,
  /IEMobile/i,
  /Mobile/i,
  /Tablet/i
];

// Meta moderator detection patterns
const metaModeratorPatterns = [
  /fb_internal/i,
  /meta-moderator/i,
  /facebook-integrity/i,
  /meta-policy/i,
  /fb-policy/i,
  /meta-ads-review/i,
  /fb-ads-review/i,
  /meta-business-integrity/i,
  /facebook-business-integrity/i
];

// Check if device is a real mobile device
export const isRealMobile = (): boolean => {
  const userAgent = navigator.userAgent;
  const isMobileUA = mobilePatterns.some(pattern => pattern.test(userAgent));
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileScreen = window.innerWidth <= 1024;
  
  return isMobileUA && hasTouch && isMobileScreen;
};

// Check if user is a Meta moderator
export const isMetaModerator = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const referrer = document.referrer.toLowerCase();
  
  return metaModeratorPatterns.some(pattern => pattern.test(userAgent)) ||
         referrer.includes('facebook.com/ads') ||
         referrer.includes('business.facebook.com') ||
         referrer.includes('meta.com');
};

// Check if language is valid (pt-BR or pt)
export const isValidLanguage = (): boolean => {
  const language = navigator.language.toLowerCase();
  const languages = navigator.languages?.map(l => l.toLowerCase()) || [];
  
  return language.startsWith('pt') || 
         languages.some(l => l.startsWith('pt'));
};

// Detect spy tools, crawlers, and bots
export const spyToolsDetection = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const referrer = document.referrer.toLowerCase();
  
  const spyAgents = [
    'gurukiller', 'adsparo', 'espiaads', 'espionageads',
    'adspy', 'bigspy', 'poweradspy', 'socialpeta', 'adplexity',
    'spyfu', 'semrush', 'ahrefs', 'similarweb', 'buzzsumo',
    'facebook ad library', 'fb ad library', 'metaadlibrary',
    'adblock', 'ublock', 'ghostery', 'disconnect',
    'postman', 'insomnia', 'selenium', 'webdriver',
    'puppeteer', 'playwright', 'cypress', 'headlesschrome',
    'spider', 'crawler', 'scraper', 'bot', 'curl', 'wget',
    'python', 'php', 'java', 'golang', 'nodejs'
  ];
  
  const spyReferrers = [
    'adspy.com', 'bigspy.com', 'poweradspy.com', 'socialpeta.com',
    'adplexity.com', 'facebook.com/ads/library', 'gurukiller.com',
    'adsparo.com', 'spyfu.com', 'semrush.com', 'ahrefs.com'
  ];
  
  return spyAgents.some(spy => userAgent.includes(spy)) ||
         spyReferrers.some(spy => referrer.includes(spy));
};

// Calculate comprehensive risk score
export const calculateRiskScore = async (): Promise<RiskScoreResult> => {
  let score = 0;
  const details = {
    country: false,
    mobile: false,
    language: false,
    spyTools: false,
    vpn: false,
    suspiciousUA: false,
    datacenter: false,
    emulator: false,
    visitCount: false
  };
  
  // Meta moderator check (immediate block)
  if (isMetaModerator()) {
    score = 10;
    details.suspiciousUA = true;
    return { score, details };
  }
  
  // Spy tools check (immediate block)
  if (spyToolsDetection()) {
    score = 10;
    details.spyTools = true;
    return { score, details };
  }
  
  // VPN check
  if (await isVPNDetected()) {
    score += 3;
    details.vpn = true;
  }
  
  // Country check
  const country = await getCountry();
  if (country !== 'BR') {
    score += 3;
    details.country = true;
  }
  
  // Mobile device check
  if (!isRealMobile()) {
    score += 2;
    details.mobile = true;
  }
  
  // Language check
  if (!isValidLanguage()) {
    score += 2;
    details.language = true;
  }
  
  // Suspicious user agent check
  if (isSuspiciousUserAgent()) {
    score += 3;
    details.suspiciousUA = true;
  }
  
  // Datacenter IP check
  if (await isDatacenterIP()) {
    score += 2;
    details.datacenter = true;
  }
  
  // Emulator check
  if (isEmulatorDetected()) {
    score += 2;
    details.emulator = true;
  }
  
  // Visit count check
  if (getVisitCountForIP() > 5) {
    score += 1;
    details.visitCount = true;
  }
  
  return { score, details };
};