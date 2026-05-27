'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dashboard',       label: 'DASHBOARD' },
  { href: '/matchups',        label: 'MATCHUPS' },
  { href: '/standings',       label: 'STANDINGS' },
  { href: '/power-rankings',  label: 'POWER RANKINGS' },
  { href: '/media',           label: 'MEDIA FEED' },
  { href: '/personas',        label: 'PERSONALITIES' },
  { href: '/podcast',         label: 'PODCAST' },
  { href: '/debate',          label: 'DEBATE' },
  { href: '/analytics',       label: 'ANALYTICS' },
  { href: '/trades',          label: 'TRADES' },
  { href: '/franchise',       label: 'FRANCHISES' },
];

export function NavBar() {
  const path = usePathname();
  return (
    <nav style={{
      background: 'var(--espn-navy)', borderBottom: '2px solid rgba(255,255,255,0.1)',
      padding: '0 12px', display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto',
    }}>
      {NAV.map(({ href, label }) => {
        const active = path === href || (href !== '/dashboard' && path.startsWith(href));
        return (
          <Link key={href} href={href} style={{
            fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.4px', padding: '9px 12px', color: active ? '#fff' : 'rgba(255,255,255,0.6)',
            background: 'none', border: 'none', borderBottom: active ? '3px solid var(--espn-gold)' : '3px solid transparent',
            marginBottom: -2, cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none',
            display: 'inline-block', transition: 'color 0.15s',
          }}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
