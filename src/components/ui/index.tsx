'use client';
import { useState, useEffect } from 'react';
import type { TeamStanding, StorylineTag } from '@/types';

// ─── Team Avatar ─────────────────────────────────────────────────────────────
export function TeamAvatar({ team, size = 36 }: { team: TeamStanding; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: team.colors[0], color: team.colors[1],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 800,
      fontSize: Math.round(size * 0.33), flexShrink: 0,
    }}>
      {team.initials}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, badge, badgeColor = 'red' }: { title: string; badge?: string; badgeColor?: 'red' | 'gold' | 'green' }) {
  const badgeBg = badgeColor === 'gold' ? 'var(--espn-gold)' : badgeColor === 'green' ? '#166534' : 'var(--espn-red)';
  const badgeText = badgeColor === 'gold' ? '#000' : '#fff';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {title}
      </span>
      {badge && (
        <span style={{ background: badgeBg, color: badgeText, fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, padding: '2px 6px', letterSpacing: 1 }}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── Storyline Tags ───────────────────────────────────────────────────────────
export function StorylineTags({ tags }: { tags: StorylineTag[] }) {
  if (!tags.length) return null;
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {tags.map(tag => (
        <span key={tag} className={`tag-${tag}`} style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 2, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          {tag}
        </span>
      ))}
    </div>
  );
}

// ─── AI Content Box ───────────────────────────────────────────────────────────
export function AIBox({ label, children, loading }: { label: string; children?: React.ReactNode; loading?: boolean }) {
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--espn-gold)', borderRadius: 6, padding: 14, marginBottom: 10 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 800, color: 'var(--espn-gold)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 12 }}>
          <Spinner /> Generating...
        </div>
      ) : children}
    </div>
  );
}

// ─── Formatted AI Text ────────────────────────────────────────────────────────
export function AIText({ content }: { content: string }) {
  const paras = content.split(/\n\n+/).filter(Boolean);
  return (
    <div style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--text)' }}>
      {paras.map((p, i) => <p key={i} style={{ marginBottom: i < paras.length - 1 ? 8 : 0 }}>{p}</p>)}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid rgba(255,255,255,0.1)',
      borderTopColor: 'var(--espn-gold)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, variant = 'neutral' }: { label: string; value: string; sub?: string; variant?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const valueColor = variant === 'good' ? '#22c55e' : variant === 'warn' ? '#f59e0b' : variant === 'bad' ? '#ef4444' : '#fff';
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px' }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, lineHeight: 1, marginBottom: 2, color: valueColor }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--muted)' }}>{sub}</div>}
    </div>
  );
}

// ─── AI Content Loader ────────────────────────────────────────────────────────
export function AIContentLoader({
  type, params = {}, label, personaName,
}: {
  type: string; params?: Record<string, unknown>; label: string; personaName?: string;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch('/api/generate/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, params }),
    })
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        if (d.error) setError(d.error);
        else setContent(d.content);
      })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, JSON.stringify(params)]);

  const fullLabel = personaName ? `${label} — ${personaName}` : label;

  return (
    <AIBox label={fullLabel} loading={loading}>
      {error ? <div style={{ fontSize: 12, color: '#f87171' }}>Error: {error}</div> : content ? <AIText content={content} /> : null}
    </AIBox>
  );
}
