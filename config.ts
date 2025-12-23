/**
 * Application Configuration
 * Centralizes API URL configuration for both development and production environments.
 */

const getApiUrl = (): string => {
  // In production, use the same origin (relative to domain)
  // In development, use localhost with specific backend port
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If running on localhost, use specific backend port
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'http://localhost:3001/api';
    }
    // In production, API is proxied through nginx on the same origin
    return `${origin}/api`;
  }
  return 'http://localhost:3001/api';
};

const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'http://localhost:3001';
    }
    return origin;
  }
  return 'http://localhost:3001';
};

export const API_URL = getApiUrl();
export const API_BASE = getApiBase();
