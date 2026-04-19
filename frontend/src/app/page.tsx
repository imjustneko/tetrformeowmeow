import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/layout/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <Navbar />

      {/* Hero */}
      <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 inline-block px-4 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-sm font-medium">
            🐱 Competitive Block Puzzle
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6">
            <span className="text-cyan-400" style={{ textShadow: '0 0 40px rgba(0,245,255,0.3)' }}>
              Meow
            </span>
            <span className="text-white">Tetr</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Fast. Competitive. Cute. The online block puzzle arena where every drop counts.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register">
              <Button variant="primary" size="lg">Play Now</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full px-4">
          {[
            { icon: '⚡', title: 'Lightning Fast', desc: '60fps gameplay with ultra-low input latency' },
            { icon: '🏆', title: 'Ranked Matches', desc: 'Climb the ELO ladder and earn your rank' },
            { icon: '🎓', title: 'Training Academy', desc: 'Learn T-spins, openers, and advanced techniques' },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-xl border border-[#2a2a3a] bg-[#12121a] text-left hover:border-cyan-500/30 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}