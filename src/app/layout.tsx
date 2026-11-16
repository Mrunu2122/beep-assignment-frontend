import type { Metadata } from 'next';
import Link from 'next/link';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Launchpad | Indian Fresher Tech Job Intelligence',
  description: 'High-trust, deduplicated, AI-classified job and internship intelligence for freshers in India.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0d0e] text-[#f3f4f6] antialiased flex flex-col font-sans selection:bg-[#22c55e]/20 selection:text-[#22c55e]">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-[#232b30]/70 bg-[#0a0d0e]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-base group-hover:border-emerald-400 transition-colors">
                ⚡
              </div>
              <span className="font-semibold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Launchpad<span className="text-emerald-500 text-xs ml-1 font-mono uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Beta</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
              <Link href="/jobs" className="hover:text-white transition-colors">Explore Jobs</Link>
              <Link href="/methodology" className="hover:text-white transition-colors">Methodology & AI</Link>
              <Link href="/about" className="hover:text-white transition-colors">System Transparency</Link>
              <Link href="/admin" className="hover:text-emerald-400 font-mono text-xs transition-colors">Admin Console</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/jobs"
                className="px-4 py-2 text-xs font-semibold rounded-md bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_-2px_rgba(34,197,94,0.5)]"
              >
                Browse 200+ Jobs →
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#232b30]/80 bg-[#0d1114] text-xs text-gray-400 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-mono">●</span>
              <span>Project Launchpad — Beep Gen AI & Engineering Hiring Assignment</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/methodology" className="hover:text-emerald-400 transition-colors">Deduplication Logic</Link>
              <Link href="/about" className="hover:text-emerald-400 transition-colors">Cost Model</Link>
              <Link href="/about" className="hover:text-emerald-400 transition-colors">50-Post Benchmark</Link>
              <Link href="/admin" className="hover:text-emerald-400 transition-colors">Admin</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
