'use client';

import { useEffect } from 'react';

export default function AdBanner({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = true,
}: {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
}) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  // If the client ID is not set, we can show a placeholder or just render nothing.
  // We'll render the ins tag anyway so that when the ID is set, it works.
  return (
    <div className="w-full overflow-hidden flex justify-center my-6 bg-stone-200/50 dark:bg-stone-800/50 rounded-xl min-h-[90px] items-center relative z-0">
      <span className="absolute -z-10 text-stone-400 dark:text-stone-600 text-sm font-medium tracking-widest uppercase">Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX'}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      />
    </div>
  );
}
