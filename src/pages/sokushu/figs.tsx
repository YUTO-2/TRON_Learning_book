// 第1章の図解。すべてSVGで描き、文字色はテーマの文字色（currentColor）に合わせる。
import type { ReactNode } from 'react';
import { Box } from '@mui/material';

// ── 配色（ダーク／ホワイトで変わる CSS変数。値は ThemeMode.tsx。塗りは同じ色に透明度を付けて作る）──
const BLUE = 'var(--fig-blue)';
const GREEN = 'var(--fig-green)';
const ORANGE = 'var(--fig-orange)';
const RED = 'var(--fig-red)';
const PURPLE = 'var(--fig-purple)';
const CYAN = 'var(--fig-cyan)';
const GRAY = 'var(--fig-gray)';
// 色は CSS変数なので、透明度は color-mix で付ける（'33' は16進の透明度 ＝ 約20%）
const tint = (c: string, a = '33') => `color-mix(in srgb, ${c} ${Math.round((parseInt(a, 16) / 255) * 100)}%, transparent)`;

// ── 共通部品 ──
export function Fig({ title, caption, w, h, children, max = 680 }: { title: string; caption?: ReactNode; w: number; h: number; children: ReactNode; max?: number }) {
  return (
    <Box component="figure" sx={{ my: 3, mx: 0, px: 2, py: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
      <Box sx={{ fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.04em', mb: 1, color: 'text.secondary' }}>図　{title}</Box>
      <Box component="svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={title} sx={{ display: 'block', width: '100%', maxWidth: max, height: 'auto', mx: 'auto', color: 'text.primary' }}>
        {children}
      </Box>
      {caption && <Box component="figcaption" sx={{ mt: 1, fontSize: '0.85rem', lineHeight: 1.8, color: 'text.secondary' }}>{caption}</Box>}
    </Box>
  );
}

type TProps = { x: number; y: number; children: ReactNode; size?: number; anchor?: 'start' | 'middle' | 'end'; fill?: string; bold?: boolean; dim?: boolean; mono?: boolean };
const T = ({ x, y, children, size = 14, anchor = 'middle', fill = 'currentColor', bold, dim, mono }: TProps) => (
  <text x={x} y={y} fontSize={size} textAnchor={anchor} fill={fill} fillOpacity={dim ? 0.7 : 1} fontWeight={bold ? 700 : 400} fontFamily={mono ? 'Consolas, Menlo, monospace' : undefined}>{children}</text>
);

function Arrow({ x1, y1, x2, y2, c = 'currentColor', dash, w = 2, head = 9 }: { x1: number; y1: number; x2: number; y2: number; c?: string; dash?: boolean; w?: number; head?: number }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const ca = Math.cos(a), sa = Math.sin(a);
  const bx = x2 - head * ca, by = y2 - head * sa;
  const pts = `${x2},${y2} ${bx + (head / 2) * sa},${by - (head / 2) * ca} ${bx - (head / 2) * sa},${by + (head / 2) * ca}`;
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx + ca} y2={by + sa} stroke={c} strokeWidth={w} strokeDasharray={dash ? '6 4' : undefined} strokeOpacity={c === 'currentColor' ? 0.7 : 1} />
      <polygon points={pts} fill={c} fillOpacity={c === 'currentColor' ? 0.7 : 1} />
    </g>
  );
}

function Bx({ x, y, w, h, lines, c = GRAY, size = 14, bold, dash, rx = 8, filled = true, mono }: { x: number; y: number; w: number; h: number; lines: string[]; c?: string; size?: number; bold?: boolean; dash?: boolean; rx?: number; filled?: boolean; mono?: boolean }) {
  const lh = size * 1.4;
  const y0 = y + h / 2 - ((lines.length - 1) * lh) / 2 + size * 0.35;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={filled ? tint(c) : 'none'} stroke={c} strokeWidth={1.5} strokeDasharray={dash ? '5 4' : undefined} />
      {lines.map((s, i) => <T key={i} x={x + w / 2} y={y0 + i * lh} size={size} bold={bold && i === 0} mono={mono}>{s}</T>)}
    </g>
  );
}

// 1ビット分のマス

// ── 1.1 章の地図 ──

export function FigTronParts() {
  return (
    <Fig title="TRONを構成する3つの層" w={640} h={330} caption="下から、ブロックを作る合意形成（DPoS）、手数料の仕組み（帯域幅とエネルギー）、そして台帳に載るものの種類です。TRC-20などのトークンは、いちばん上のTVM（コントラクト）の上に作られます。">
      <Bx x={20} y={14} w={600} h={118} c={BLUE} lines={[]} />
      <T x={36} y={36} anchor="start" size={13} bold fill={BLUE}>台帳に載るもの</T>
      <Bx x={34} y={48} w={136} h={72} c={BLUE} lines={['アカウント', '（21バイトの', 'アドレス）']} size={12} bold />
      <Bx x={182} y={48} w={136} h={72} c={GREEN} lines={['TRX・TRC-10', '（標準機能の', 'トークン）']} size={12} bold />
      <Bx x={330} y={48} w={136} h={72} c={ORANGE} lines={['組み込みの', 'コントラクト', '（送金・投票・権限）']} size={12} bold />
      <Bx x={478} y={48} w={130} h={72} c={PURPLE} lines={['TVM', 'スマートコントラクト', '（TRC-20など）']} size={12} bold />
      <Arrow x1={320} y1={146} x2={320} y2={136} c={GRAY} />
      <Bx x={20} y={148} w={600} h={70} c={CYAN} lines={['リソースモデル', '帯域幅（Bandwidth）：取引のサイズ　／　エネルギー（Energy）：コントラクトの計算量']} size={12} bold />
      <Arrow x1={320} y1={244} x2={320} y2={222} c={GRAY} />
      <Bx x={20} y={246} w={600} h={70} c={GRAY} lines={['合意形成：DPoS（委任型PoS）', 'TRXを持つ人が投票 → 上位27人のSRが3秒ごとに交代でブロックを作る']} size={12} bold />
    </Fig>
  );
}

// アドレスの作り方
export function FigTronAddress() {
  const steps: [string, string, string, string][] = [
    ['秘密鍵', '32バイト', 'ランダムな数', BLUE],
    ['公開鍵', '64バイト', 'x と y（04は付けない）', BLUE],
    ['ハッシュ', '32バイト', 'Keccak-256', ORANGE],
    ['末尾20バイト', '20バイト', '後ろ20バイトだけ取る', ORANGE],
    ['41 を付ける', '21バイト', '先頭に 0x41', GREEN],
    ['チェックサム', '25バイト', 'SHA-256を2回→先頭4バイト', GREEN],
    ['Base58', '34文字', '先頭は必ず T', PURPLE],
  ];
  return (
    <Fig title="秘密鍵からアドレスまで（TRON）" w={640} h={400} caption="秘密鍵 → 公開鍵 → ハッシュ → アドレスは一方向です。逆向きには戻せません。同じ秘密鍵からEVM系（イーサリアムなど）のアドレスも作れ、その20バイトはTRONのアドレスと同じです。">
      {steps.map(([a, b, c, col], i) => (
        <g key={a}>
          <Bx x={30} y={12 + i * 54} w={150} h={42} c={col} lines={[a]} size={13} bold />
          <T x={200} y={38 + i * 54} anchor="start" size={13} bold mono>{b}</T>
          <T x={300} y={38 + i * 54} anchor="start" size={13} dim>{c}</T>
          {i < steps.length - 1 && <Arrow x1={105} y1={54 + i * 54} x2={105} y2={66 + i * 54} c={GRAY} head={7} />}
        </g>
      ))}
    </Fig>
  );
}

// ブロックIDの構造とハッシュチェーン
export function FigTronBlockId() {
  return (
    <Fig title="blockID と、鎖のつながり" w={640} h={290} caption="blockID（32バイト）は、先頭8バイトがブロック高で、残り24バイトがヘッダーのSHA-256の後ろ24バイトです。次のブロックの parentHash に、この blockID がそのまま入ります。">
      <Bx x={20} y={14} w={290} h={120} c={BLUE} lines={[]} />
      <T x={34} y={36} anchor="start" size={13} bold fill={BLUE}>ブロック N</T>
      <T x={34} y={60} anchor="start" size={12} mono>raw_data: timestamp, txTrieRoot,</T>
      <T x={34} y={78} anchor="start" size={12} mono>  parentHash, number, witness_address…</T>
      <T x={34} y={100} anchor="start" size={12} mono>witness_signature（SRの署名）</T>
      <T x={34} y={122} anchor="start" size={12} mono dim>blockID = N(8バイト) + SHA-256(raw_data)の9〜32バイト目</T>
      <Bx x={330} y={14} w={290} h={120} c={GREEN} lines={[]} />
      <T x={344} y={36} anchor="start" size={13} bold fill={GREEN}>ブロック N＋1</T>
      <T x={344} y={60} anchor="start" size={12} mono>raw_data: …</T>
      <T x={344} y={78} anchor="start" size={12} mono bold>  parentHash = ブロックN の blockID</T>
      <T x={344} y={100} anchor="start" size={12} mono>witness_signature</T>
      <Arrow x1={310} y1={76} x2={330} y2={76} c={ORANGE} w={3} />
      <T x={320} y={166} size={13} bold>blockID の内訳（32バイト）</T>
      <rect x={60} y={180} width={140} height={44} rx={6} fill={tint(ORANGE)} stroke={ORANGE} strokeWidth={1.5} />
      <T x={130} y={207} size={13} bold>ブロック高（8バイト）</T>
      <rect x={200} y={180} width={380} height={44} rx={6} fill={tint(BLUE)} stroke={BLUE} strokeWidth={1.5} />
      <T x={390} y={207} size={13} bold>SHA-256(raw_data) の後ろ24バイト</T>
      <T x={320} y={258} size={12} dim>ブロック高が先頭にあるので、blockID を見るだけで「何番目のブロックか」が分かる</T>
    </Fig>
  );
}

// 確定（solidified）
export function FigTronFinality() {
  const n = 12;
  return (
    <Fig title="最新ブロックと、確定済み（solidified）ブロック" w={640} h={250} caption="27人のSRのうち19人（70%）以上が、あるブロックの上にブロックを積むと、そのブロックは確定済みになり、巻き戻らなくなります。3秒 × 19ブロック ≒ 57秒が目安です。">
      {Array.from({ length: n }, (_, i) => {
        const solid = i < 4, latest = i === n - 1;
        const c = solid ? GREEN : latest ? ORANGE : GRAY;
        return (
          <g key={i}>
            <rect x={16 + i * 51} y={60} width={44} height={44} rx={6} fill={tint(c)} stroke={c} strokeWidth={1.5} />
            <T x={38 + i * 51} y={87} size={11} mono>{i === 3 ? 'N−19' : latest ? 'N' : ''}</T>
            {i < n - 1 && <line x1={60 + i * 51} y1={82} x2={67 + i * 51} y2={82} stroke={GRAY} strokeWidth={2} />}
          </g>
        );
      })}
      <T x={16} y={46} anchor="start" size={13} bold fill={GREEN}>◀ 確定済みの最新（/walletsolidity）</T>
      <T x={624} y={46} anchor="end" size={13} bold fill={ORANGE}>最新（/wallet） ▶</T>
      <rect x={16 + 4 * 51} y={120} width={n * 51 - 4 * 51 - 7} height={28} rx={14} fill="none" stroke={BLUE} strokeWidth={1.5} strokeDasharray="5 4" />
      <T x={16 + 4 * 51 + (n * 51 - 4 * 51 - 7) / 2} y={139} size={12} fill={BLUE}>まだ確定していない（巻き戻る可能性がある）</T>
      <Bx x={90} y={176} w={460} h={56} c={BLUE} lines={['ブロック間隔 3秒 ／ SR 27人 ／ 確定に必要なのは 19人（27 × 70%）', 'ブロックが巻き戻らなくなる「確定（solidified）」の仕組み']} size={12} />
    </Fig>
  );
}

// 帯域幅とエネルギーの消費順
export function FigTronResources() {
  return (
    <Fig title="手数料の払われ方：帯域幅とエネルギー" w={640} h={300} caption="どちらも、足りない分は最後にTRXの焼却（burn）で払います。TRXを預けて（ステークして）得たリソースは、約24時間かけて回復します。">
      <T x={20} y={22} anchor="start" size={14} bold fill={BLUE}>帯域幅（取引のサイズ ＝ バイト数）</T>
      <Bx x={20} y={34} w={170} h={50} c={GREEN} lines={['① ステークで得た帯域幅']} size={12} bold />
      <Arrow x1={192} y1={59} x2={222} y2={59} c={GRAY} />
      <Bx x={224} y={34} w={170} h={50} c={CYAN} lines={['② 無料の600／日']} size={12} bold />
      <Arrow x1={396} y1={59} x2={426} y2={59} c={GRAY} />
      <Bx x={428} y={34} w={190} h={50} c={RED} lines={['③ TRXを焼却', '1,000 sun ／ バイト']} size={12} bold />
      <T x={20} y={140} anchor="start" size={14} bold fill={PURPLE}>エネルギー（コントラクトの計算量）</T>
      <Bx x={20} y={152} w={170} h={50} c={GREEN} lines={['① ステークまたは', '委任されたエネルギー']} size={12} bold />
      <Arrow x1={192} y1={177} x2={222} y2={177} c={GRAY} />
      <Bx x={224} y={152} w={170} h={50} c={GRAY} lines={['（無料枠はない）']} size={12} dash />
      <Arrow x1={396} y1={177} x2={426} y2={177} c={GRAY} />
      <Bx x={428} y={152} w={190} h={50} c={RED} lines={['② TRXを焼却', '100 sun ／ エネルギー（現在）']} size={12} bold />
      <Bx x={20} y={232} w={598} h={52} c={ORANGE} lines={['TRX送金は、おもに帯域幅だけ。TRC-20の送金など、コントラクトを動かす取引は、', '帯域幅とエネルギーの両方を使う。']} size={12} />
    </Fig>
  );
}

// 関数呼び出しのバイト列
export function FigTronAbi() {
  return (
    <Fig title="コントラクト呼び出しの data（transfer の例）" w={640} h={250} caption="関数名と引数の型を並べた文字列のKeccak-256の先頭4バイトが「セレクタ」です。引数は32バイトずつに左をゼロで埋めて並べます。USDTの transfer なら、4 ＋ 32 ＋ 32 ＝ 68バイトです。">
      <T x={320} y={22} size={13} bold>transfer(address,uint256) の data ＝ 68バイト</T>
      <Bx x={20} y={36} w={110} h={64} c={ORANGE} lines={['セレクタ', '4バイト']} size={13} bold />
      <Bx x={134} y={36} w={250} h={64} c={BLUE} lines={['引数1：to（宛先）', '32バイト']} size={13} bold />
      <Bx x={388} y={36} w={232} h={64} c={GREEN} lines={['引数2：amount（量）', '32バイト']} size={13} bold />
      <T x={75} y={128} size={12} mono>A9059CBB</T>
      <T x={259} y={128} size={12} mono>000…0 ＋ 宛先の20バイト</T>
      <T x={504} y={128} size={12} mono>000…0 ＋ 量（最小単位）</T>
      <Arrow x1={75} y1={140} x2={75} y2={162} c={GRAY} head={7} />
      <T x={75} y={182} size={12}>Keccak-256(関数名と型)</T>
      <T x={75} y={198} size={12}>の先頭4バイト</T>
      <Arrow x1={259} y1={140} x2={259} y2={162} c={GRAY} head={7} />
      <T x={259} y={182} size={12}>アドレスの 41 は除く</T>
      <Arrow x1={504} y1={140} x2={504} y2={162} c={GRAY} head={7} />
      <T x={504} y={182} size={12}>5 USDT ＝ 5 × 10⁶</T>
    </Fig>
  );
}
