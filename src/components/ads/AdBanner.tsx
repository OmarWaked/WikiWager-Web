'use client';

import { useEffect, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (pushed.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      console.error('[AdBanner] adsbygoogle push error:', err);
    }
  }, []);

  // Observe the ad container — if an ad fills, it will have content/height
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      const ins = container.querySelector('ins.adsbygoogle');
      if (ins) {
        const status = ins.getAttribute('data-ad-status');
        if (status === 'filled') {
          setAdLoaded(true);
        }
        // If the ins element has actual rendered children or height, show it
        if (ins.clientHeight > 0) {
          setAdLoaded(true);
        }
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-ad-status', 'style'],
    });

    // Also check after a delay — ads may take a moment to fill
    const timer = setTimeout(() => {
      const ins = container.querySelector('ins.adsbygoogle');
      if (ins) {
        const status = ins.getAttribute('data-ad-status');
        if (status === 'filled' || ins.clientHeight > 0) {
          setAdLoaded(true);
        }
      }
    }, 2000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const styles = formatStyles[format];

  return (
    <div
      ref={containerRef}
      className={cn(
        'ad-container flex flex-col items-center justify-center',
        !adLoaded && 'hidden',
        className,
      )}
    >
      <ins
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
