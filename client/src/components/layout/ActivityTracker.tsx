'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { auditApi } from '@/lib/api';

export default function ActivityTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    try {
      auditApi.logPageView(
        pathname,
        document.title || 'MediSense BD',
        document.referrer || ''
      ).catch(() => {});
    } catch (err) {
      console.error('Activity page view tracking error:', err);
    }
  }, [pathname]);

  return null;
}
