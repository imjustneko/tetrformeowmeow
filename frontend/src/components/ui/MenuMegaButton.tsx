import Link from 'next/link';

export type MenuMegaTone = 'multiplayer' | 'solo' | 'arcade' | 'config';

const tones: Record<
  MenuMegaTone,
  { bar: string; iconBg: string; iconText: string; sub: string }
> = {
  multiplayer: {
    bar: 'from-[#5c2035] to-[#2a1018]',
    iconBg: 'bg-black/35',
    iconText: 'text-[#ff4477]',
    sub: 'text-[#ff9eb5]/80',
  },
  solo: {
    bar: 'from-[#3d2855] to-[#1a1225]',
    iconBg: 'bg-black/35',
    iconText: 'text-[#aa88dd]',
    sub: 'text-[#c9b8e8]/75',
  },
  arcade: {
    bar: 'from-[#1f3d28] to-[#0f1f14]',
    iconBg: 'bg-black/35',
    iconText: 'text-[#55cc66]',
    sub: 'text-[#9ee5a8]/80',
  },
  config: {
    bar: 'from-[#1e3358] to-[#0f1828]',
    iconBg: 'bg-black/35',
    iconText: 'text-[#5599ff]',
    sub: 'text-[#a8c8ff]/75',
  },
};

type Props = {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  tone: MenuMegaTone;
};

export function MenuMegaButton({ href, icon, title, subtitle, tone }: Props) {
  const t = tones[tone];
  return (
    <Link href={href} className="group block outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508]">
      <div
        className={`relative flex min-h-[5.5rem] overflow-hidden rounded-sm border border-white/10 bg-gradient-to-r shadow-[0_4px_24px_rgba(0,0,0,0.45)] transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:border-white/20 ${t.bar}`}
      >
        <div
          className={`flex w-[5.5rem] shrink-0 items-center justify-center border-r border-black/25 font-black uppercase tracking-tighter ${t.iconBg} ${t.iconText}`}
        >
          <span
            className="select-none text-[1.35rem] leading-none drop-shadow-[3px_3px_0_rgba(0,0,0,0.4)]"
            aria-hidden
          >
            {icon}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3 sm:px-6">
          <span className="truncate text-lg font-black uppercase tracking-wide text-white sm:text-xl">
            {title}
          </span>
          <span className={`mt-0.5 line-clamp-2 text-[0.65rem] font-bold uppercase leading-snug tracking-wider sm:text-xs ${t.sub}`}>
            {subtitle}
          </span>
        </div>
      </div>
    </Link>
  );
}
