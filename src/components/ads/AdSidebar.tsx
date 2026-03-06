'use client';

import { AdBanner } from './AdBanner';

export function AdSidebar() {
  return (
    <aside className="hidden lg:block sticky top-20 self-start w-[160px] xl:w-[300px] shrink-0">
      <AdBanner slot="sidebar" format="vertical" />
    </aside>
  );
}
