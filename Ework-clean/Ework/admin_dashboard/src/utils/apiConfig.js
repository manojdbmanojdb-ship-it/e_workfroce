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
  
  // Environment variable (Vite production build / cloud deployment)
  if (import.meta.env?.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url;
  }

  // Custom user-configured backend endpoint (e.g. settings / QR scan)
  const customUrl = localStorage.getItem('ework_api_url');
  if (customUrl) return customUrl.replace(/\/+$/, '');

  // Global override from window
  if (window.__EWORK_API_URL__) return window.__EWORK_API_URL__.replace(/\/+$/, '');

  // If hosted on Render, route directly to the deployed backend
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://ework-backend.onrender.com';
  }

  // In Android native environment:
  // If running in Android emulator, 10.0.2.2 routes to the host computer's localhost:5000
  if (isCapacitor()) {
    return 'http://10.0.2.2:5000';
  }

  // If accessing from another device on local Wi-Fi/LAN (e.g. phone accessing laptop at 10.x.x.x or 192.168.x.x)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const protocol = window.location.protocol || 'http:';
    return `${protocol}//${window.location.hostname}:5000`;
  }

  // If deployed behind Nginx reverse-proxy on port 80 or 443
  if (window.location.port === '' || window.location.port === '80' || window.location.port === '443') {
    return window.location.origin;
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
