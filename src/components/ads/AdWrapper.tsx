import { AdSidebar } from './AdSidebar';

interface AdWrapperProps {
  children: React.ReactNode;
}

export function AdWrapper({ children }: AdWrapperProps) {
  return (
    <div className="flex gap-6 max-w-7xl mx-auto w-full">
      {/* Main content */}
      <div className="flex-1 min-w-0">{children}</div>

      {/* Desktop sidebar ad */}
      <AdSidebar />
    </div>
  );
}
