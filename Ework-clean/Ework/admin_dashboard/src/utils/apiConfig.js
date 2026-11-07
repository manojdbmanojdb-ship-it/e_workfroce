/**
 * E-WorkForce Centralized API Configuration & Safe Fetch
 * Enables seamless connectivity across desktop browsers and Android Capacitor packaging.
 */

export const isCapacitor = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.Capacitor?.isNativePlatform?.() ||
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && window.location.port === '' && !window.location.search.includes('web=1'))
  );
};

export const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000';
  
  // Custom user-configured backend endpoint (e.g. settings / QR scan)
  const customUrl = localStorage.getItem('ework_api_url');
  if (customUrl) return customUrl.replace(/\/+$/, '');

  // Global override from window
  if (window.__EWORK_API_URL__) return window.__EWORK_API_URL__.replace(/\/+$/, '');

  // In Android native environment:
  // If running in Android emulator, 10.0.2.2 routes to the host computer's localhost:5000
  if (isCapacitor()) {
    // Check if we are running in emulator or default
    return 'http://10.0.2.2:5000';
  }

  // Standard web browser
  return 'http://localhost:5000';
};

export const API_BASE = getApiBaseUrl();

/**
 * Safe fetch wrapper that handles network offline, Android connection timeouts,
 * and JSON parsing errors gracefully without unmounting the React DOM.
 */
export async function safeFetch(endpoint, options = {}, fallbackData = null) {
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${getApiBaseUrl()}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || 8000);

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[SafeFetch] ${url} returned HTTP ${res.status}`);
      return { success: false, status: res.status, data: fallbackData };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`[SafeFetch Warning] Request to ${url} failed:`, err.message);
    return { success: false, error: err.message, data: fallbackData };
  }
}
