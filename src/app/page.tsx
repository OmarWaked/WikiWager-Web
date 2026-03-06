import { Hero } from '@/components/landing/Hero';
import { Ticker } from '@/components/landing/Ticker';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { StreakDemo } from '@/components/landing/StreakDemo';
import { GamePreview } from '@/components/landing/GamePreview';
import { Reviews } from '@/components/landing/Reviews';
import { Referral } from '@/components/landing/Referral';
import { FAQ } from '@/components/landing/FAQ';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { AdBanner } from '@/components/ads/AdBanner';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-deep-void overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-neon-violet/[0.04] blur-[150px] animate-gradient" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-electric-cyan/[0.03] blur-[130px] animate-gradient" />
      </div>

      {/* Content */}
      <main className="relative z-10">
        <Hero />
        <Ticker />

        <HowItWorks />

        <div className="max-w-4xl mx-auto px-4 py-4">
          <AdBanner slot="landing-how-it-works" format="horizontal" />
        </div>

        <GamePreview />
        <Features />

        <div className="max-w-4xl mx-auto px-4 py-4">
          <AdBanner slot="landing-features" format="horizontal" />
        </div>

        <StreakDemo />
        <Reviews />
        <Referral />

        <div className="max-w-4xl mx-auto px-4 py-4">
          <AdBanner slot="landing-referral" format="horizontal" />
        </div>

        <FAQ />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
