import type { ReactNode } from 'react';
import { Box } from '@mui/material';

// 章の本文（Tron.tsx / TronCh02.tsx）で共通に使う部品。
export const Ul = ({ items }: { items: string[] }) => (
  <Box component="ul" sx={{ my: 1.5, pl: 3, lineHeight: 1.95, '& li::marker': { color: 'text.secondary' } }}>{items.map((t) => <li key={t}>{t}</li>)}</Box>
);
export const B = ({ children }: { children: ReactNode }) => <Box component="strong" sx={{ fontWeight: 700 }}>{children}</Box>;

// 注記。種類は見出しの文字の色だけで分け、枠や絵文字は使わない。
const NOTE = {
  goal: ['この節のゴール', 'primary.main', 'action.hover'],
  point: ['ポイント', 'text.primary', 'action.hover'],
  ex: ['例', 'text.secondary', 'action.hover'],
  warn: ['注意', 'warning.main', 'rgba(245,165,36,0.09)'],
  story: ['小噺', 'text.secondary', 'action.hover'],
} as const;
export const Note = ({ kind, children }: { kind: keyof typeof NOTE; children: ReactNode }) => (
  <Box sx={{ my: 3, px: 2.5, py: 2, bgcolor: NOTE[kind][2], borderRadius: 2, borderLeft: 3, borderColor: kind === 'goal' ? 'primary.main' : kind === 'warn' ? 'warning.main' : 'divider' }}>
    <Box sx={{ fontWeight: 800, fontSize: '0.74rem', letterSpacing: '0.08em', color: NOTE[kind][1], mb: 0.5 }}>{NOTE[kind][0]}</Box>
    <Box sx={{ lineHeight: 1.9 }}>{children}</Box>
  </Box>
);
// 表。列ごとに内容の長さを見て、短い列（見出し・章番号・略称など）は折り返さず、いちばん長い列に幅を回す。
// 全角は半角2つ分として数える。
const wlen = (t: string) => Array.from(t).reduce((n, ch) => n + (ch.charCodeAt(0) > 0x2e7f ? 2 : 1), 0);
export const Tbl = ({ head, rows }: { head: string[]; rows: string[][] }) => {
  const widths = head.map((h, j) => Math.max(wlen(h), ...rows.map((r) => wlen(r[j] ?? ''))));
  const widest = widths.indexOf(Math.max(...widths));
  const cellStyle = (j: number) => (j !== widest && widths[j] <= 32 ? { whiteSpace: 'nowrap' as const } : { minWidth: '12em' });
  return (
    <Box sx={{ overflowX: 'auto', my: 3 }}>
      <Box component="table" sx={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.93rem', lineHeight: 1.8,
        '& th, & td': { px: 1.5, py: 1.1, textAlign: 'left', verticalAlign: 'top', borderBottom: 1, borderColor: 'divider' },
        '& th': { fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', color: 'text.secondary', borderBottom: 2, borderColor: 'primary.main' },
        '& td:first-of-type': { fontWeight: 700 } }}>
        <thead><tr>{head.map((h, j) => <th key={h} style={cellStyle(j)}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={cellStyle(j)}>{c}</td>)}</tr>)}</tbody>
      </Box>
    </Box>
  );
};
export const Q = ({ q, a }: { q: string; a: string }) => (
  <Box sx={{ my: 2, pl: 2, borderLeft: 2, borderColor: 'divider' }}>
    <Box sx={{ fontWeight: 700 }}>問. {q}</Box>
    <Box component="details" sx={{ mt: 0.5, color: 'text.secondary' }}><summary style={{ cursor: 'pointer' }}>答えを見る</summary><Box sx={{ mt: 0.5 }}>{a}</Box></Box>
  </Box>
);
export const L = (...lines: string[]) => lines.join('\n');
