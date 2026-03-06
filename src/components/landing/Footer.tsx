import Link from 'next/link';

const navLinks = [
  { label: 'Play', href: '/play' },
  { label: 'Leaderboard', href: '/play/leaderboard' },
  { label: 'Store', href: '/play/store' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-deep-void-light">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-black text-gradient-violet">WikiWager</span>
          </Link>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-gray hover:text-neon-violet-light transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social placeholder */}
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-card-bg border border-white/5 flex items-center justify-center text-muted-gray hover:text-neon-violet-light hover:border-neon-violet/30 transition-all duration-200"
              aria-label="Twitter"
            >
              𝕏
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-card-bg border border-white/5 flex items-center justify-center text-muted-gray hover:text-neon-violet-light hover:border-neon-violet/30 transition-all duration-200"
              aria-label="Discord"
            >
              💬
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-card-bg border border-white/5 flex items-center justify-center text-muted-gray hover:text-neon-violet-light hover:border-neon-violet/30 transition-all duration-200"
              aria-label="Reddit"
            >
              📢
            </a>
          </div>

          {/* Tagline & copyright */}
          <div className="text-center">
            <p className="text-sm text-muted-gray mb-2">
              Made with 🧠 by WikiWager
            </p>
            <p className="text-xs text-muted-gray/60">
              &copy; {new Date().getFullYear()} WikiWager. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
