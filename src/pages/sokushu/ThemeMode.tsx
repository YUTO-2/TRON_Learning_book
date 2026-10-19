import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ButtonBase, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// テーマ（ダーク／ホワイト）。選んだほうは、このブラウザの localStorage に保存する（初期値はダーク）。
export type Mode = 'dark' | 'light';
const KEY = 'sokushu-theme';

const ModeContext = createContext<{ mode: Mode; setMode: (m: Mode) => void }>({ mode: 'dark', setMode: () => {} });
export const useMode = () => useContext(ModeContext);

// TRONの赤(#FF060A)が基調。ダークは黒地、ホワイトは白地（白地では文字に使う赤だけ、少し濃くして読みやすくする）。
const makeTheme = (mode: Mode) => {
  const dark = mode === 'dark';
  const bg = dark ? '#08080a' : '#ffffff';
  const grid = dark ? 'rgba(255,255,255,0.025)' : 'rgba(22,22,26,0.035)';
  return createTheme({
    palette: {
      mode,
      primary: dark ? { main: '#ff060a', dark: '#cc0007', light: '#ff6a6e', contrastText: '#fff' } : { main: '#e60008', dark: '#b30006', light: '#ff4a4d', contrastText: '#fff' },
      secondary: { main: dark ? '#ededf0' : '#16161a' },
      success: { main: dark ? '#4cd68a' : '#2e7d32' },
      warning: { main: dark ? '#f5a524' : '#b45309' },
      info: { main: dark ? '#7aa7ff' : '#455a64' },
      background: { default: bg, paper: dark ? '#0f0f13' : '#ffffff' },
      text: dark ? { primary: '#ededf0', secondary: '#9b9ba8' } : { primary: '#16161a', secondary: '#6b6b75' },
      divider: dark ? 'rgba(255,255,255,0.09)' : '#e7e7ea',
      action: dark ? { hover: 'rgba(255,255,255,0.045)', selected: 'rgba(255,6,10,0.12)' } : { hover: 'rgba(22,22,26,0.045)', selected: 'rgba(230,0,8,0.08)' },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "BIZ UDPGothic", Meiryo, sans-serif',
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              background: 'linear-gradient(180deg, #ff2a2e 0%, #cc0007 100%)',
              boxShadow: dark ? '0 0 18px rgba(255,6,10,0.28)' : '0 2px 8px rgba(255,6,10,0.25)',
              '&:hover': { background: 'linear-gradient(180deg, #ff4a4d 0%, #e60008 100%)', boxShadow: dark ? '0 0 26px rgba(255,6,10,0.45)' : '0 3px 12px rgba(255,6,10,0.35)' },
              '&.Mui-disabled': { background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(22,22,26,0.08)', boxShadow: 'none' },
            },
          },
        ],
      },
      MuiCssBaseline: {
        styleOverrides: {
          html: { colorScheme: mode },
          // 第1章の図解の色（figs.tsx が var() で使う）。白地では濃いめ、黒地では明るめ。
          ':root': dark
            ? { '--fig-blue': '#c7c7d1', '--fig-green': '#4cd68a', '--fig-orange': '#ffa040', '--fig-red': '#ff5266', '--fig-purple': '#c58bff', '--fig-cyan': '#3ad3e6', '--fig-gray': '#8e8e9c' }
            : { '--fig-blue': '#2b2b31', '--fig-green': '#2e7d32', '--fig-orange': '#ef6c00', '--fig-red': '#d32f2f', '--fig-purple': '#7b1fa2', '--fig-cyan': '#00838f', '--fig-gray': '#757575' },
          body: {
            WebkitFontSmoothing: 'antialiased',
            backgroundColor: bg,
            backgroundImage: [
              `radial-gradient(900px 440px at 50% -140px, rgba(255,6,10,${dark ? 0.17 : 0.07}), transparent 70%)`,
              `linear-gradient(${grid} 1px, transparent 1px)`,
              `linear-gradient(90deg, ${grid} 1px, transparent 1px)`,
            ].join(','),
            backgroundSize: '100% 100%, 48px 48px, 48px 48px',
            backgroundAttachment: 'fixed',
          },
          '::selection': { backgroundColor: 'rgba(255,6,10,0.38)', color: dark ? '#fff' : '#16161a' },
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-thumb': { backgroundColor: dark ? 'rgba(255,255,255,0.14)' : 'rgba(22,22,26,0.2)', borderRadius: 6, border: '2px solid transparent', backgroundClip: 'content-box' },
          '*::-webkit-scrollbar-thumb:hover': { backgroundColor: 'rgba(255,6,10,0.55)', backgroundClip: 'content-box' },
          // 本文中の `code`（コードブロックの pre は対象外）
          'code': { fontFamily: 'Consolas, Menlo, monospace', fontSize: '0.88em', color: dark ? '#ffb0b2' : '#b3000b', backgroundColor: dark ? 'rgba(255,6,10,0.12)' : 'rgba(230,0,8,0.07)', padding: '0.1em 0.4em', borderRadius: 4 },
        },
      },
    },
  });
};

export function ThemeRoot({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(() => {
    try { return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
  });
  const setMode = (m: Mode) => {
    setModeState(m);
    try { localStorage.setItem(KEY, m); } catch { /* 保存できなくても動作には影響しない */ }
  };
  const theme = useMemo(() => makeTheme(mode), [mode]);
  // 読み込み中の白／黒のちらつきを防ぐため、index.html の背景色も、選んだテーマに合わせる。
  useEffect(() => { document.documentElement.style.background = mode === 'dark' ? '#08080a' : '#ffffff'; }, [mode]);
  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ModeContext.Provider>
  );
}

// ダーク／ホワイトの切り替え。onRed=true は、赤い地（タイトルのバナー）の上に置く白い版。
export function ThemeToggle({ onRed = false }: { onRed?: boolean }) {
  const { mode, setMode } = useMode();
  const items: { m: Mode; label: string }[] = [{ m: 'dark', label: 'ダーク' }, { m: 'light', label: 'ホワイト' }];
  return (
    <Box role="group" aria-label="テーマ" sx={{ display: 'inline-flex', overflow: 'hidden', borderRadius: 1, border: 1, borderColor: onRed ? 'rgba(255,255,255,0.75)' : 'divider' }}>
      {items.map(({ m, label }) => {
        const on = mode === m;
        return (
          <ButtonBase key={m} onClick={() => setMode(m)} aria-pressed={on}
            sx={{ px: 1.25, py: 0.6, fontSize: '0.8rem', fontWeight: 700, color: on ? (onRed ? '#d4000a' : '#fff') : onRed ? '#fff' : 'text.secondary', bgcolor: on ? (onRed ? '#fff' : 'primary.main') : 'transparent', '&:hover': { bgcolor: on ? undefined : onRed ? 'rgba(255,255,255,0.16)' : 'action.hover' } }}>
            {label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
