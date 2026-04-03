'use client';

import { useEffect, useState } from 'react';

function formatRelative(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60_000);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffDay) >= 1) { return rtf.format(diffDay, 'day'); }
  if (Math.abs(diffHr) >= 1) { return rtf.format(diffHr, 'hour'); }
  if (Math.abs(diffMin) >= 1) { return rtf.format(diffMin, 'minute'); }
  return 'just now';
}

function formatUTC(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}` +
    ` ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`
  );
}

interface Props {
  iso: string;
  showUTC?: boolean;
}

export function RelativeTime({ iso, showUTC = false }: Props) {
  const utc = formatUTC(new Date(iso));
  const [relative, setRelative] = useState<string>('');

  useEffect(() => {
    const date = new Date(iso);
    setRelative(formatRelative(date));
    const interval = setInterval(() => setRelative(formatRelative(date)), 60_000);
    return () => clearInterval(interval);
  }, [iso]);

  if (!relative) {
    // Pre-hydration: show UTC to avoid layout shift
    return <span suppressHydrationWarning>{utc}</span>;
  }

  if (showUTC) {
    return (
      <span>
        {relative} ({utc})
      </span>
    );
  }

  return <span>{relative}</span>;
}
