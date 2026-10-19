import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { Box, Button, ButtonBase, Drawer, IconButton, SvgIcon, TextField, Typography, alpha, useMediaQuery, useTheme } from '@mui/material';
import { ConsoleContext, TronMark, mono } from './ui';
import Title from './Title';
import WalletDialog from './Wallet';
import { ThemeToggle } from './ThemeMode';
import { TRON_MAIN } from './TronMain';
import type { TronSetup } from './TronMain';

type Line = { k: 'in' | 'log' | 'err'; s: string };
type Toc = { i: number; text: string };

// Uint8Array は 16進、BigInt は 123n 表記にして、循環参照があっても落ちないように文字列化する。
const fmt = (x: unknown): string => {
  if (typeof x === 'string') return x;
  const seen = new WeakSet<object>();
  try {
    return JSON.stringify(x, (_k, v) => {
      if (typeof v === 'bigint') return `${v}n`;
      if (v instanceof Uint8Array) return `${v.constructor.name}(${v.length}) ` + Array.from(v, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      if (v && typeof v === 'object') { if (seen.has(v)) return '[Circular]'; seen.add(v); }
      return v;
    }, 2) ?? String(x);
  } catch { return String(x); }
};

// コンソールの高さは次回も使えるように保存しておく（保存できない環境では何もしない）。
const PREF_KEY = 'sokushu-console';
const loadPref = (): { h?: number } => {
  try { return JSON.parse(localStorage.getItem(PREF_KEY) ?? '{}'); } catch { return {}; }
};
// TRON本編の環境構築（TRON第2章 2.5）の完了判定。コンソールで実行した結果、グローバルに置かれた変数が揃っているかを見る。
const checkTron = (): number => {
  const g = globalThis as unknown as Record<string, unknown>;
  const sdk = !!g.TronWeb;
  const common = typeof g.tronWeb === 'object' && !!g.tronWeb && typeof g.NILE === 'string';
  return (sdk ? 1 : 0) | (common ? 2 : 0);
};
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), Math.max(min, max));

// 配色（コンソール）。
const CON_BG = '#050507';
const CON_MUTED = '#8c8c98';
const SIDEBAR_W = 272;
const chNo = (no: number) => no - 200;

// TRON開発概論。
// 広い画面: 左に固定の目次（章と、いま読んでいる章の節）、中央に本文、下にコンソール。
// 狭い画面: 目次はメニューから開く。コンソールは普段は1行に畳んでおき、コードの「実行」を押すと開く。
export default function Sokushu() {
  const theme = useTheme();
  const narrow = useMediaQuery(theme.breakpoints.down('md'));
  const [h, setH] = useState(() => loadPref().h ?? 300);
  const [open, setOpen] = useState(false);
  const [tronBits, setTronBits] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false); // テスト用ウォレットの画面

  const [chapter, setChapter] = useState<number | null>(null); // null = 目次ページ（章の選択）
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const colRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const [drawer, setDrawer] = useState(false);
  const [toc, setToc] = useState<Toc[]>([]); // いま表示している章の節（h2）
  const [tocActive, setTocActive] = useState(-1);
  const push = (k: Line['k'], s: string) => setLines((l) => [...l, { k, s }]);

  useEffect(() => {
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ h })); } catch { /* 保存できなくても動作には影響しない */ }
  }, [h]);

  // console.log をこのコンソールにも流す（fetch の .then など、実行後に呼ばれる出力も拾うため、ページを開いている間ずっと差し替える）
  useEffect(() => {
    const orig = { log: console.log, warn: console.warn, error: console.error };
    (['log', 'warn', 'error'] as const).forEach((m) => {
      console[m] = (...a: unknown[]) => { orig[m](...a); setLines((l) => [...l, { k: m === 'log' ? 'log' : 'err', s: a.map(fmt).join(' ') }]); };
    });
    return () => { Object.assign(console, orig); };
  }, []);

  // いま読んでいる節（画面の上端より上にある、いちばん下の見出し）を調べる。
  const syncActive = () => {
    const page = pageRef.current;
    const els = bodyRef.current?.querySelectorAll<HTMLElement>('h2');
    if (!page || !els) return;
    const line = page.getBoundingClientRect().top + 96;
    let a = -1;
    els.forEach((el, i) => { if (el.getBoundingClientRect().top <= line) a = i; });
    setTocActive(a);
  };
  const onScroll = () => { syncActive(); };
  // 章を開いたら、本文の見出し（節 ＝ h2）を集めて目次にする。
  useEffect(() => {
    if (chapter === null) return;
    const t = setTimeout(() => {
      const els = Array.from(bodyRef.current?.querySelectorAll<HTMLElement>('h2') ?? []);
      setToc(els.map((el, i) => ({ i, text: (el.textContent ?? '').trim() })));
      syncActive();
    }, 80);
    return () => clearTimeout(t);
  }, [chapter]); // eslint-disable-line react-hooks/exhaustive-deps
  // 以前の版が保存した、プロファイルの名前と学習の進捗を消す（この版では記録しない）。ほかの保存データには触れない。
  useEffect(() => {
    try { Object.keys(localStorage).filter((k) => k === 'sokushu-profiles' || k.startsWith('sokushu-progress')).forEach((k) => localStorage.removeItem(k)); } catch { /* 消せなくても動作には影響しない */ }
  }, []);
  useEffect(() => { const t = setInterval(() => { setTronBits(checkTron()); }, 700); return () => clearInterval(t); }, []);
  useEffect(() => { const el = outRef.current; if (el) el.scrollTop = el.scrollHeight; }, [lines, open]);
  // 目次の「いまの節」が見える位置に来るよう、サイドバーを追従させる。
  useEffect(() => {
    const box = sideRef.current;
    const el = box?.querySelector<HTMLElement>('[data-active="true"]');
    if (!box || !el) return;
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.top < b.top + 60 || r.bottom > b.bottom - 60) box.scrollTop += r.top - b.top - b.height / 3;
  }, [tocActive, toc]);

  // ブラウザの開発者コンソールと同じ挙動にする: 行頭の const/let/var と function は外してグローバルに置き、変数が次の実行にも残るようにする。
  const run = async (src: string) => {
    push('in', src);
    // async function の宣言は、そのまま実行すると実行ごとの内側に閉じてしまうので、先にグローバルへ公開しておく（宣言は巻き上げられる）。
    const asyncFns = [...src.matchAll(/^async\s+function\s+(\w+)\s*\(/gm)].map((m) => `globalThis.${m[1]} = ${m[1]};`).join('\n');
    const code = asyncFns + '\n' + src
      .replace(/^(const|let|var)\s+/gm, '')
      .replace(/^function\s+(\w+)\s*\(/gm, '$1 = function(');
    try {
      const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
      await new AsyncFunction(code)();
    } catch (e) { push('err', String(e)); }
  };

  // コードのボタンを押したとき、コンソールが畳んであれば自動で開く。
  const api = useMemo(() => ({
    run: (src: string) => { setOpen(true); run(src); },
    setInput: (src: string) => { setOpen(true); setInput(src); },
  }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const tronSetup: TronSetup = { sdk: !!(tronBits & 1), common: !!(tronBits & 2) };
  const tronReady = tronSetup.sdk && tronSetup.common;
  // 章の内部番号は 200 + 章番号（第1章 TRON概説 ＝ 201）。
  const ALL: readonly { no: number; title: string; desc: string }[] = [...TRON_MAIN];
  const tronMain = TRON_MAIN.find((c) => c.no === chapter);
  const needsSdk = tronMain !== undefined && tronMain.no !== 201; // 第1章（TRON概説）は読み取りだけで、SDKの環境構築は要らない
  const cur = ALL.find((c) => c.no === chapter) ?? ALL[0];
  const selectChapter = (no: number) => {
    setChapter(no);
    setToc([]);
    setTocActive(-1);
    setDrawer(false);
    requestAnimationFrame(() => pageRef.current?.scrollTo({ top: 0 }));
  };
  // 節へ移動する。ドロワーから選んだときは、閉じてフォーカスが戻ったあとに動かす（同時だとスクロールが途中で止まることがある）。
  const jumpTo = (i: number) => {
    const go = () => {
      const page = pageRef.current;
      const el = bodyRef.current?.querySelectorAll<HTMLElement>('h2')[i];
      if (!el || !page) return;
      const top = el.getBoundingClientRect().top - page.getBoundingClientRect().top + page.scrollTop - 16;
      page.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };
    if (drawer) { setDrawer(false); setTimeout(go, 320); } else go();
  };

  // 境界のドラッグでコンソールの高さを変える。
  const onDragMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging || !colRef.current) return;
    const r = colRef.current.getBoundingClientRect();
    setH(clamp(r.bottom - e.clientY, 140, r.height * 0.8));
  };

  const submit = () => { if (input.trim()) { run(input); setInput(''); } };

  const envLabel = needsSdk ? (tronReady ? '環境構築 ✓' : '環境構築 未完了') : null;
  const consolePanel = !open ? (
    <ButtonBase onClick={() => setOpen(true)}
      sx={{ flexShrink: 0, height: 38, px: { xs: 2, md: 3 }, gap: 2, justifyContent: 'flex-start', bgcolor: CON_BG, borderTop: '1px solid rgba(255,6,10,0.45)', color: CON_MUTED, '&:hover': { color: '#fff' } }}>
      <Typography sx={{ ...mono, fontSize: '0.82rem', color: 'inherit' }}>› コンソール</Typography>
      {envLabel && <Typography sx={{ fontSize: '0.75rem', color: tronReady ? '#6fcf7f' : 'inherit' }}>{envLabel}</Typography>}
      <Box sx={{ flex: 1 }} />
      <Typography sx={{ fontSize: '0.75rem', color: 'inherit' }}>▲ 開く</Typography>
    </ButtonBase>
  ) : (
    <Box sx={{ flexShrink: 0, height: h, display: 'flex', flexDirection: 'column', bgcolor: CON_BG, color: '#d4d4d8', borderTop: '1px solid rgba(255,6,10,0.45)', boxShadow: '0 -8px 28px rgba(255,6,10,0.08)' }}>
      <Box
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); }}
        onPointerMove={onDragMove}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        sx={{ flexShrink: 0, height: 12, cursor: 'row-resize', touchAction: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover > div': { bgcolor: 'primary.main' } }}>
        <Box sx={{ width: 40, height: 3, borderRadius: 2, bgcolor: dragging ? 'primary.main' : '#3a3a44' }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: { xs: 2, md: 3 }, pb: 0.5 }}>
        <Typography sx={{ ...mono, fontSize: '0.82rem', color: CON_MUTED }}>› コンソール</Typography>
        {envLabel && <Typography sx={{ fontSize: '0.75rem', color: tronReady ? '#6fcf7f' : CON_MUTED }}>{envLabel}</Typography>}
        <Box sx={{ flex: 1 }} />
        <Button size="small" onClick={() => setLines([])} sx={{ color: CON_MUTED, minWidth: 0, '&:hover': { color: '#fff' } }}>クリア</Button>
        <Button size="small" onClick={() => setOpen(false)} sx={{ color: CON_MUTED, minWidth: 0, '&:hover': { color: '#fff' } }}>▼ 閉じる</Button>
      </Box>
      <Box ref={outRef} sx={{ ...mono, flex: 1, minHeight: 40, overflow: 'auto', px: { xs: 2, md: 3 }, py: 0.5, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {lines.length === 0 && <Box sx={{ color: '#6a6a75' }}>ここに実行結果が表示されます。</Box>}
        {lines.map((l, i) => <Box key={i} sx={{ color: l.k === 'err' ? '#f48771' : l.k === 'in' ? '#9cdcfe' : '#d4d4d8' }}>{(l.k === 'in' ? '< ' : '> ') + l.s}</Box>)}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, px: { xs: 2, md: 3 }, py: 1.25, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <TextField multiline minRows={2} maxRows={6} fullWidth size="small" placeholder="コードを入力（Ctrl+Enterで実行）" value={input}
          onChange={(e) => setInput(e.target.value)} slotProps={{ input: { sx: mono } }}
          sx={{ '& .MuiInputBase-root': { bgcolor: '#1b1b20', color: '#e6e6ea', p: 1 }, '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '& .Mui-focused fieldset': { borderColor: 'primary.main !important' }, '& textarea::placeholder': { color: '#6a6a75', opacity: 1 } }}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); } }} />
        <Button variant="contained" disabled={!input.trim()} onClick={submit} sx={{ flexShrink: 0, alignSelf: 'flex-end', '&.Mui-disabled': { bgcolor: '#2a2a31', color: '#6a6a75' } }}>実行</Button>
      </Box>
    </Box>
  );

  const walletDialog = <WalletDialog open={walletOpen} onClose={() => setWalletOpen(false)} />;
  if (chapter === null) return <><Title tron={TRON_MAIN} onSelect={selectChapter} onWallet={() => setWalletOpen(true)} />{walletDialog}</>;

  const idx = ALL.findIndex((c) => c.no === cur.no);
  const prev = ALL[idx - 1];
  const next = ALL[idx + 1];

  // 左の目次。章の一覧と、いま開いている章の節。
  const sidebar = (
    <Box ref={sideRef} sx={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column', px: 2, py: 3 }}>
      <ButtonBase onClick={() => { setDrawer(false); setChapter(null); }} sx={{ alignSelf: 'flex-start', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', px: 1, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <TronMark size={32} />
          <Box>
            <Typography sx={{ ...mono, fontSize: '0.7rem', letterSpacing: '0.3em', color: 'primary.main' }}>TRON</Typography>
            <Typography sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>TRON開発概論</Typography>
          </Box>
        </Box>
      </ButtonBase>
      <Box component="nav" aria-label="目次">
        {ALL.map((c) => {
          const here = c.no === cur.no;
          return (
            <Box key={c.no}>
              <ButtonBase onClick={() => selectChapter(c.no)} aria-current={here ? 'page' : undefined}
                sx={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', gap: 1, px: 1, py: 0.9, borderRadius: 1, color: here ? 'text.primary' : 'text.secondary', bgcolor: here ? 'action.selected' : undefined, boxShadow: here ? 'inset 2px 0 0 #ff060a' : undefined, '&:hover': { bgcolor: here ? 'action.selected' : 'action.hover', color: 'text.primary' } }}>
                <Typography sx={{ ...mono, fontSize: '0.78rem', width: '1.5rem', flexShrink: 0, color: here ? 'primary.main' : 'text.secondary' }}>{String(chNo(c.no)).padStart(2, '0')}</Typography>
                <Typography sx={{ flex: 1, fontSize: '0.92rem', fontWeight: here ? 800 : 500, lineHeight: 1.5, color: 'inherit' }}>{c.title}</Typography>
              </ButtonBase>
              {here && toc.length > 0 && (
                <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 0.5, mb: 1.5, ml: '1.6rem', p: 0, borderLeft: 1, borderColor: 'divider' }}>
                  {toc.map((t) => {
                    const active = t.i === tocActive;
                    return (
                      <li key={t.i}>
                        <ButtonBase onClick={() => jumpTo(t.i)} data-active={active ? 'true' : undefined}
                          sx={{ display: 'block', width: '100%', textAlign: 'left', ml: '-1px', pl: 1.5, pr: 1, py: 0.4, borderLeft: 2, borderColor: active ? 'primary.main' : 'transparent', fontSize: '0.8rem', lineHeight: 1.55, fontWeight: active ? 700 : 400, color: active ? 'text.primary' : 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                          {t.text}
                        </ButtonBase>
                      </li>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      <Box sx={{ mt: 'auto', pt: 3, display: 'grid', gap: 1.75 }}>
        <ButtonBase onClick={() => { setDrawer(false); setWalletOpen(true); }}
          sx={{ justifyContent: 'flex-start', gap: 1, px: 1.25, py: 0.9, border: 1, borderColor: 'rgba(255,6,10,0.4)', borderRadius: 1, color: 'text.primary', fontSize: '0.9rem', fontWeight: 700, '&:hover': { bgcolor: 'action.selected', borderColor: 'primary.main' } }}>
          <TronMark size={20} />
          ウォレット
        </ButtonBase>
        <ThemeToggle />
        <Box sx={{ px: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, bgcolor: tronReady ? 'success.main' : 'text.secondary', boxShadow: tronReady ? '0 0 8px #4cd68a' : undefined }} />
          <Typography noWrap sx={{ ...mono, fontSize: '0.72rem', letterSpacing: '0.1em', color: 'text.secondary' }}>NILE TESTNET</Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <ConsoleContext.Provider value={api}>
      <Box sx={{ height: '100dvh', display: 'flex', overflow: 'hidden', userSelect: dragging ? 'none' : undefined }}>
        {!narrow && <Box sx={{ width: SIDEBAR_W, flexShrink: 0, borderRight: 1, borderColor: 'rgba(255,6,10,0.22)', bgcolor: (th) => alpha(th.palette.background.default, 0.85), backdropFilter: 'blur(6px)' }}>{sidebar}</Box>}
        <Box ref={colRef} sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {narrow && (
            <Box sx={{ flexShrink: 0, height: 48, display: 'flex', alignItems: 'center', gap: 0.5, pl: 0.5, pr: 2, borderBottom: 1, borderColor: 'divider' }}>
              <IconButton aria-label="目次を開く" onClick={() => setDrawer(true)}>
                <SvgIcon><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></SvgIcon>
              </IconButton>
              <TronMark size={24} />
              <Typography noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: '0.92rem' }}>第{chNo(cur.no)}章　{cur.title}</Typography>
            </Box>
          )}
          <Box sx={{ flexShrink: 0, height: 2, background: 'linear-gradient(90deg, #ff060a, rgba(255,6,10,0) 70%)', boxShadow: '0 0 12px rgba(255,6,10,0.6)' }} />
          {/* 本文。ここだけがスクロールし、コンソールは常に画面内に残る。 */}
          <Box ref={pageRef} onScroll={onScroll} sx={{ flex: 1, minHeight: 0, overflow: 'auto', textAlign: 'left' }}>
            <Box ref={bodyRef} sx={{ maxWidth: 760, mx: 'auto', px: { xs: 2.5, md: 5 }, pt: { xs: 3, md: 7 }, pb: 8, '& h1 + h2': { mt: 4, pt: 0, borderTop: 0 } }}>
              <Typography sx={{ ...mono, fontSize: '0.78rem', letterSpacing: '0.2em', color: 'primary.main' }}>CHAPTER {String(chNo(cur.no)).padStart(2, '0')}</Typography>
              <Typography component="h1" sx={{ fontSize: { xs: '1.9rem', md: '2.4rem' }, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.35, mt: 1, mb: 1 }}>{cur.title}</Typography>
              <Box sx={{ width: 64, height: 3, borderRadius: 2, bgcolor: 'primary.main', boxShadow: '0 0 14px rgba(255,6,10,0.8)', mb: 1 }} />

              {tronMain && (
                <>
                  {!tronReady && needsSdk && tronMain.no !== 202 && (
                    <Box sx={{ mt: 3, px: 2.5, py: 1.5, bgcolor: 'rgba(245,165,36,0.10)', border: '1px solid rgba(245,165,36,0.35)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Typography sx={{ flex: 1, minWidth: 200, fontSize: '0.9rem', lineHeight: 1.8 }}>環境構築（第2章 2.5）が完了していません。このままではコードが動かないので、先に済ませてください。</Typography>
                      <Button size="small" color="warning" variant="outlined" onClick={() => selectChapter(202)}>第2章へ</Button>
                    </Box>
                  )}
                  <tronMain.Body setup={tronSetup} />
                </>
              )}

              <Box sx={{ mt: 10, pt: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                {prev ? <Button color="inherit" onClick={() => selectChapter(prev.no)} sx={{ textAlign: 'left' }}>← 第{chNo(prev.no)}章　{prev.title}</Button> : <span />}
                {next ? <Button color="inherit" onClick={() => selectChapter(next.no)} sx={{ textAlign: 'right' }}>第{chNo(next.no)}章　{next.title} →</Button> : <span />}
              </Box>
            </Box>
          </Box>
          {consolePanel}
        </Box>
        {narrow && (
          <Drawer anchor="left" open={drawer} onClose={() => setDrawer(false)} slotProps={{ paper: { sx: { width: { xs: '85vw', sm: SIDEBAR_W + 60 }, maxWidth: 360, bgcolor: 'background.paper', backgroundImage: 'none' } } }}>
            {sidebar}
          </Drawer>
        )}
      </Box>
      {walletDialog}
    </ConsoleContext.Provider>
  );
}
