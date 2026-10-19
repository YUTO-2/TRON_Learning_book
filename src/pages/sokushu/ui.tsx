import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Box, ButtonBase, Collapse, Link, Typography } from '@mui/material';
import { explainOf } from './explain';

export const mono = { fontFamily: 'Consolas, Menlo, monospace', fontSize: 14 };

// TRONのロゴ（赤い円と、白い線のひし形）。画像ではなくSVGで描く。
// circle=true: 赤い円つき（目次・タブ用）。circle=false: 線だけ（赤い地や背景の透かし用。color で線の色を変える）。
export const TronMark = ({ size = 40, circle = true, color = '#fff', glow = false, opacity = 1 }: { size?: number; circle?: boolean; color?: string; glow?: boolean; opacity?: number }) => (
  <Box component="svg" viewBox="0 0 450 450" aria-hidden width={size} height={size}
    sx={{ display: 'block', flexShrink: 0, opacity, filter: glow ? 'drop-shadow(0 0 10px rgba(255,6,10,0.55))' : undefined }}>
    {circle && <circle cx="225" cy="225" r="220" fill="#ff060a" />}
    <g fill="none" stroke={color} strokeWidth="21" strokeLinejoin="miter" strokeMiterlimit="10">
      <path d="M104 117 L306 155 L352 194 L203 376 Z" />
      <path d="M104 117 L228 207 L306 155" />
      <path d="M228 207 L346 194" />
      <path d="M228 207 L204 372" />
    </g>
  </Box>
);

// コンソール（Sokushu.tsx が持つ）への実行・入力の窓口。
type ConsoleApi = { run: (src: string) => void; setInput: (src: string) => void };
export const ConsoleContext = createContext<ConsoleApi>({ run: () => {}, setInput: () => {} });

// コードの色（暗い地に明るい文字）。コード・出力例・コンソールで共通。
const CODE_BG = '#0b0b0f';
const CODE_FG = '#e6e6ea';
const CODE_MUTED = '#8c8c98';

// コードブロック内の小さな操作ボタン。
const Act = ({ children, onClick, accent, pressed }: { children: ReactNode; onClick: () => void; accent?: boolean; pressed?: boolean }) => (
  <ButtonBase onClick={onClick} aria-pressed={pressed}
    sx={{ px: 1.25, py: 0.25, borderRadius: 1, fontSize: '0.78rem', fontWeight: 700, color: accent ? '#fff' : pressed ? '#fff' : CODE_MUTED, bgcolor: accent ? '#e60008' : pressed ? 'rgba(255,255,255,0.14)' : 'transparent',
      '&:hover': { bgcolor: accent ? '#ff2a2e' : 'rgba(255,255,255,0.1)', color: '#fff' } }}>{children}</ButtonBase>
);

// コード。上の細い帯に「解説 / 入力 / 実行」を並べる（解説があるコードのみ「解説」が出る）。
// runnable=false は、引数を省略した断片など「そのままでは実行できないコード」用で、実行・入力は出さない。
// lang='solidity' は、コンソールでは動かないSolidityのソース（第7章以降）用で、実行・入力は出さない。
export function Code({ code, runnable = true, lang = 'javascript' }: { code: string; runnable?: boolean; lang?: 'javascript' | 'solidity' }) {
  const { run, setInput } = useContext(ConsoleContext);
  const [showExp, setShowExp] = useState(false);
  const exp = explainOf(code);
  const canRun = runnable && lang === 'javascript';
  const label = lang === 'solidity' ? 'SOLIDITY（コンソールでは実行しない。第8章でデプロイする）' : runnable ? 'JAVASCRIPT' : 'JAVASCRIPT（参考・実行不可）';
  return (
    <Box sx={{ my: 3, borderRadius: 2, overflow: 'hidden', bgcolor: CODE_BG, border: '1px solid rgba(255,255,255,0.08)', borderTop: '2px solid #ff060a', boxShadow: '0 0 28px rgba(255,6,10,0.07)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography sx={{ flex: 1, fontSize: '0.74rem', letterSpacing: '0.06em', color: CODE_MUTED }}>{label}</Typography>
        {exp && <Act pressed={showExp} onClick={() => setShowExp((v) => !v)}>解説</Act>}
        {canRun && <Act onClick={() => setInput(code)}>入力</Act>}
        {canRun && <Act accent onClick={() => run(code)}>▶ 実行</Act>}
      </Box>
      <Box component="pre" sx={{ ...mono, lineHeight: 1.75, m: 0, px: 2, py: 1.75, color: CODE_FG, overflow: 'auto' }}>{code}</Box>
      {exp && (
        <Collapse in={showExp} unmountOnExit>
          <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)', bgcolor: '#14141a' }}>
            <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.85, fontSize: '0.9rem', color: '#d3d3da' }}>{exp}</Typography>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

// 出力例（実行はできない、表示のみ）。
export function Out({ code }: { code: string }) {
  return (
    <Box sx={{ my: 3, borderRadius: 2, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
      <Typography sx={{ px: 1.5, py: 0.5, fontSize: '0.74rem', letterSpacing: '0.06em', color: 'text.secondary', bgcolor: 'action.hover' }}>OUTPUT（出力例）</Typography>
      <Box component="pre" sx={{ ...mono, lineHeight: 1.75, m: 0, px: 2, py: 1.5, color: 'text.primary', overflow: 'auto' }}>{code}</Box>
    </Box>
  );
}

// 見出し。飾りは付けず、大きさと余白だけで階層を示す。
// 節（h2）: 上に細い区切り線。目次（サイドバー）はこの見出しを集める。
export const H = ({ children }: { children: ReactNode }) => <Typography component="h2" sx={{ fontSize: { xs: '1.35rem', md: '1.6rem' }, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.45, mt: 9, mb: 2.5, pt: 4, borderTop: 1, borderColor: 'divider', position: 'relative', '&::before': { content: '""', position: 'absolute', top: -1, left: 0, width: 56, height: 2, bgcolor: 'primary.main', boxShadow: '0 0 10px rgba(255,6,10,0.8)' } }}>{children}</Typography>;
// 項（h3）
export const H3 = ({ children }: { children: ReactNode }) => <Typography component="h3" sx={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.5, mt: 5, mb: 1 }}>{children}</Typography>;
// 目（h4）
export const H4 = ({ children }: { children: ReactNode }) => <Typography component="h4" sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.secondary', mt: 3.5, mb: 0.5 }}>{children}</Typography>;
export const P = ({ children }: { children: ReactNode }) => <Typography sx={{ my: 1.5, lineHeight: 2, letterSpacing: '0.01em' }}>{children}</Typography>;
export const Ext = ({ href, children }: { href: string; children?: ReactNode }) => (
  <Link href={href} target="_blank" rel="noopener noreferrer" underline="always" sx={{ textUnderlineOffset: '3px', textDecorationColor: 'rgba(235,0,41,0.4)' }}>{children ?? href}</Link>
);
