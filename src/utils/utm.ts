// Capture UTM parameters from URL
export const captureUTMParams = (): { [key: string]: string } => {
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: { [key: string]: string } = {};
  
  const trackingParams = [
    'utm_source', 'utm_medium', 'utm_campaign',
    'utm_content', 'utm_term', 'fbclid', 'gclid'
  ];
  
  trackingParams.forEach(param => {
    if (urlParams.has(param)) {
      utmParams[param] = urlParams.get(param) || '';
    }
  });
  
  return utmParams;
};

// Build URL with UTM parameters
export const buildUrlWithUtm = (
  baseUrl: string, 
  utmParams: { [key: string]: string }
): string => {
  // If there are no UTM parameters, return the base URL
  if (!Object.keys(utmParams).length) {
    return baseUrl;
  }
  
  // Parse the base URL to handle existing query parameters
  const url = new URL(baseUrl);
  const params = new URLSearchParams(url.search);
  
  // Add UTM parameters
  Object.entries(utmParams).forEach(([key, value]) => {
    params.set(key, value);
  });
  
  // Update the URL search params
  url.search = params.toString();
  
  return url.toString();
};

// Store UTM parameters in localStorage for later use
export const storeUtmParams = (utmParams: { [key: string]: string }): void => {
  if (Object.keys(utmParams).length) {
    localStorage.setItem('utmParams', JSON.stringify(utmParams));
  }
};

// Retrieve UTM parameters from localStorage
export const retrieveUtmParams = (): { [key: string]: string } => {
  const stored = localStorage.getItem('utmParams');
  return stored ? JSON.parse(stored) : {};
};