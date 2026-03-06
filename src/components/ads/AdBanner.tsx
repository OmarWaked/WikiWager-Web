'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ADSENSE_PUB_ID } from '@/lib/constants';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

type AdFormat = 'auto' | 'rectangle' | 'horizontal' | 'vertical';

interface AdBannerProps {
  slot: string;
  format?: AdFormat;
  className?: string;
}

const formatStyles: Record<AdFormat, { width: string; height: string }> = {
  auto: { width: '100%', height: 'auto' },
  rectangle: { width: '300px', height: '250px' },
  horizontal: { width: '728px', height: '90px' },
  vertical: { width: '160px', height: '600px' },
};

export function AdBanner({
  slot,
  format = 'auto',
  className,
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      console.error('[AdBanner] adsbygoogle push error:', err);
    }
  }, []);

  const styles = formatStyles[format];

  return (
    <div
      className={cn(
        'ad-container flex flex-col items-center justify-center',
        className,
      )}
    >
      <span className="text-[10px] text-muted-gray/50 uppercase tracking-widest mb-1">
        Advertisement
      </span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: format === 'auto' ? '100%' : styles.width,
          height: format === 'auto' ? 'auto' : styles.height,
          maxWidth: '100%',
        }}
        data-ad-client={ADSENSE_PUB_ID}
        data-ad-slot={slot}
        data-ad-format={format === 'auto' ? 'auto' : undefined}
        data-full-width-responsive={format === 'auto' ? 'true' : undefined}
      />
    </div>
  );
}
