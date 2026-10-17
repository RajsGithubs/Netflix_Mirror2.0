'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  online: boolean;
  effectiveType: string;
  downlinkMbps: number;
  rttMs: number;
  isLowNetwork: boolean;
  manualDataSaver: boolean;
  setManualDataSaver: (val: boolean) => void;
  recommendedQuality: '360p' | '480p' | '720p' | '1080p';
}

export function useNetworkQuality(): NetworkStatus {
  const [manualDataSaver, setManualDataSaverState] = useState<boolean>(false);
  const [netState, setNetState] = useState({
    online: true,
    effectiveType: '4g',
    downlinkMbps: 10,
    rttMs: 50,
    autoLow: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('streamverse_datasaver');
      if (saved === 'true') {
        setManualDataSaverState(true);
      }
    } catch {
      // Ignore localStorage access issues in restrictive private modes
    }

    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection;

    const update = () => {
      const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
      const effectiveType = conn?.effectiveType || '4g';
      const downlink = typeof conn?.downlink === 'number' ? conn.downlink : 10;
      const rtt = typeof conn?.rtt === 'number' ? conn.rtt : 50;
      const saveData = Boolean(conn?.saveData);

      const autoLow =
        !online ||
        saveData ||
        ['slow-2g', '2g', '3g'].includes(effectiveType) ||
        downlink < 2.5 ||
        rtt > 400;

      setNetState({ online, effectiveType, downlinkMbps: downlink, rttMs: rtt, autoLow });
    };

    update();

    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    conn?.addEventListener?.('change', update);

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      conn?.removeEventListener?.('change', update);
    };
  }, []);

  const setManualDataSaver = useCallback((val: boolean) => {
    setManualDataSaverState(val);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('streamverse_datasaver', String(val));
      }
    } catch {
      // Ignore
    }
  }, []);

  const isLowNetwork = manualDataSaver || netState.autoLow;
  const recommendedQuality: '360p' | '480p' | '720p' | '1080p' = isLowNetwork
    ? netState.downlinkMbps < 1.2
      ? '360p'
      : '480p'
    : netState.downlinkMbps < 6
    ? '720p'
    : '1080p';

  return {
    ...netState,
    isLowNetwork,
    manualDataSaver,
    setManualDataSaver,
    recommendedQuality,
  };
}
