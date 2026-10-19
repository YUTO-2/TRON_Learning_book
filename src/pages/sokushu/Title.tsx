import { Box, ButtonBase, Typography } from '@mui/material';
import { TronMark, mono } from './ui';
import { ThemeToggle } from './ThemeMode';

export type ChapterInfo = { no: number; title: string; desc: string };

// 章のまとまり（前半・後半の区切り）。内部番号 201 = 第1章。
const groupOf = (no: number): string => (no <= 201 ? 'FOUNDATION　基礎' : no <= 206 ? 'SDK　前半（TronWebとTRONの標準機能）' : 'SMART CONTRACT　後半（Solidityとコントラクト）');

// 起動時の目次ページ。TRONの赤い地と白いロゴで、TRONの雰囲気を出す。章を選ぶと、その章から学習を始める。
// 学習の進捗やプロファイルは持たない（開くたびに、いつでも好きな章から始められる）。
export default function Title({ tron, onSelect, onWallet }: { tron: readonly ChapterInfo[]; onSelect: (no: number) => void; onWallet: () => void }) {
  return (
    <Box sx={{ height: '100dvh', overflow: 'auto' }}>
      <Box sx={{ maxWidth: 820, mx: 'auto', px: { xs: 3, sm: 5 }, pt: { xs: 8, sm: 11 }, pb: 10 }}>
        {/* ヒーロー: TRONの赤い地に、白いロゴの線。右には大きな透かし。 */}
        <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 3, px: { xs: 3, sm: 5 }, py: { xs: 4, sm: 6 }, background: 'linear-gradient(135deg, #ff060a 0%, #d4000a 100%)', boxShadow: '0 12px 48px rgba(255,6,10,0.28)' }}>
          <Box sx={{ position: 'absolute', right: { xs: -70, sm: -30 }, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <TronMark size={360} circle={false} color="#fff" opacity={0.14} />
          </Box>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#fff', display: 'grid', placeItems: 'center' }}>
                <TronMark size={34} circle={false} color="#ff060a" />
              </Box>
              <Typography sx={{ ...mono, fontSize: '0.9rem', letterSpacing: '0.42em', color: '#fff', fontWeight: 700 }}>TRON</Typography>
              <Box sx={{ flex: 1 }} />
              <ThemeToggle onRed />
              <ButtonBase onClick={onWallet} sx={{ px: 1.75, py: 0.75, borderRadius: 1, border: '1px solid rgba(255,255,255,0.75)', color: '#fff', fontSize: '0.86rem', fontWeight: 700, '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' } }}>ウォレット</ButtonBase>
            </Box>
            <Typography component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, fontSize: { xs: '2.3rem', sm: '3.3rem' }, color: '#fff' }}>TRON開発概論</Typography>
            <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.88)', lineHeight: 1.9, maxWidth: 520 }}>コードを読んで、その場で実行して覚える。台帳を読み、TronWebで書き、Solidityのコントラクトを動かす。</Typography>
            <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[`${tron.length} CHAPTERS`, 'TRONWEB v6.3.0', 'NILE TESTNET'].map((s) => (
                <Box key={s} sx={{ ...mono, fontSize: '0.72rem', letterSpacing: '0.14em', color: '#fff', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 1, px: 1, py: 0.35 }}>{s}</Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 7 }}>
          {tron.map((c, i) => {
            const g = groupOf(c.no);
            const head = i === 0 || groupOf(tron[i - 1].no) !== g;
            return (
              <Box key={c.no}>
                {head && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: i === 0 ? 0 : 5, mb: 1.5 }}>
                    <Box sx={{ width: 7, height: 7, bgcolor: 'primary.main', transform: 'rotate(45deg)', boxShadow: '0 0 10px rgba(255,6,10,0.9)' }} />
                    <Typography sx={{ ...mono, fontSize: '0.74rem', letterSpacing: '0.16em', color: 'text.secondary' }}>{g}</Typography>
                    <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,6,10,0.45), transparent)' }} />
                  </Box>
                )}
                <ButtonBase onClick={() => onSelect(c.no)} focusRipple
                  sx={{ display: 'grid', gridTemplateColumns: { xs: '2.6rem 1fr auto', sm: '3.4rem 1fr auto' }, columnGap: 1.5, alignItems: 'center', width: '100%', textAlign: 'left', px: 2, py: 2, mb: 1, borderRadius: 2, border: 1, borderColor: 'divider', bgcolor: 'action.hover', transition: 'border-color .15s, background-color .15s, box-shadow .15s',
                    '&:hover, &.Mui-focusVisible': { borderColor: 'rgba(255,6,10,0.7)', bgcolor: 'rgba(255,6,10,0.06)', boxShadow: '0 0 24px rgba(255,6,10,0.16)' },
                    '&:hover .arrow': { color: 'primary.main', transform: 'translateX(3px)' } }}>
                  <Typography sx={{ ...mono, fontSize: { xs: '1.2rem', sm: '1.5rem' }, fontWeight: 700, color: 'primary.main' }}>{String(c.no - 200).padStart(2, '0')}</Typography>
                  <Box>
                    <Typography sx={{ fontSize: '1.12rem', fontWeight: 700 }}>{c.title}</Typography>
                    <Typography sx={{ mt: 0.5, fontSize: '0.86rem', color: 'text.secondary', lineHeight: 1.7 }}>{c.desc}</Typography>
                  </Box>
                  <Typography className="arrow" sx={{ ...mono, color: 'text.secondary', transition: 'transform .15s, color .15s' }}>→</Typography>
                </ButtonBase>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
