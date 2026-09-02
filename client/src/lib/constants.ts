export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';


export const COLORS = {
  teal: { 950: '#031c1c', 900: '#0a2e2e', 800: '#0d4f4f', 700: '#0f6868', 600: '#0d9488', 500: '#14b8a6', 400: '#2dd4bf', 300: '#5eead4', 200: '#99f6e4', 100: '#ccfbf1' },
  amber: '#f59e0b',
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
} as const;

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { id: 'predict', label: 'Predict', href: '/predict', icon: 'predict' },
  { id: 'navigate', label: 'Navigate', href: '/navigate', icon: 'navigate' },
  { id: 'aiDoctor', label: 'AI Doctor', href: '/verify', icon: 'aiDoctor' },
  { id: 'verify', label: 'Verify', href: '/verify-drug', icon: 'verify' },
  { id: 'settings', label: 'Settings', href: '/settings', icon: 'settings' },
] as const;


export const BANGLADESH_CENTER: [number, number] = [23.685, 90.3563];
export const BANGLADESH_ZOOM = 7;
