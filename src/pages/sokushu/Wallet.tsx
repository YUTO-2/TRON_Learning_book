import { useEffect, useState } from 'react';
import { Box, Button, ButtonBase, Dialog, DialogContent, TextField, Typography } from '@mui/material';
import { TronMark, mono } from './ui';
import { NAME_MAX, NODE, WALLET_SLOTS, createWallet, fetchHoldings, formatUnits, loadWallets, saveWallets } from './walletCore';
import type { Holdings, Token, Wallet } from './walletCore';

// テスト用ウォレット。秘密鍵を貼り付けてアカウントを作り、3つまで持てる。
// アドレス・公開鍵・秘密鍵は、隠さずに、いつでも表示する（テスト用なので）。
export default function WalletDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [wallets, setWallets] = useState<(Wallet | null)[]>(loadWallets);
  const [copied, setCopied] = useState('');

  const copy = async (id: string, text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* コピーできない環境では何もしない */ }
      document.body.removeChild(ta);
    }
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? '' : c)), 1400);
  };

  // 作成。エラーのときは、画面に出す文章を返す。
  const create = (i: number, name: string, key: string): string | null => {
    try {
      const w = createWallet(name.trim() || `ウォレット${i + 1}`, key);
      const dup = wallets.findIndex((x) => x?.privateKey === w.privateKey);
      if (dup >= 0) return `この秘密鍵は、すでにウォレット${dup + 1}に登録されています`;
      const next = wallets.map((x, j) => (j === i ? w : x));
      setWallets(next);
      saveWallets(next);
      return null;
    } catch (e) { return e instanceof Error ? e.message : String(e); }
  };
  const remove = (i: number) => {
    const w = wallets[i];
    if (!w || !window.confirm(`「${w.name}」を削除します。\nこのブラウザからアドレスと鍵が消えます（秘密鍵は、控えがなければ元に戻せません）。\n\n削除しますか？`)) return;
    const next = wallets.map((x, j) => (j === i ? null : x));
    setWallets(next);
    saveWallets(next);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper"
      slotProps={{ paper: { sx: { bgcolor: 'background.paper', backgroundImage: 'none', border: '1px solid rgba(255,6,10,0.35)', boxShadow: '0 0 48px rgba(255,6,10,0.15)', m: { xs: 1.5, sm: 4 }, width: { xs: 'calc(100% - 24px)', sm: undefined } } } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: { xs: 2, sm: 3 }, py: 2, borderBottom: 1, borderColor: 'divider' }}>
        <TronMark size={34} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ ...mono, fontSize: '0.7rem', letterSpacing: '0.3em', color: 'primary.main' }}>WALLET</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem' }}>ウォレット（テスト用）</Typography>
        </Box>
        <Button color="inherit" onClick={onClose} sx={{ color: 'text.secondary' }}>閉じる</Button>
      </Box>
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
        <Box sx={{ mb: 2.5, px: 2, py: 1.5, bgcolor: 'rgba(245,165,36,0.10)', border: '1px solid rgba(245,165,36,0.35)', borderRadius: 2, fontSize: '0.88rem', lineHeight: 1.85 }}>
          練習用のウォレットです。<b>練習用に作った秘密鍵だけ</b>を貼ってください（メインネットで資産を持つ鍵は使わない）。秘密鍵は、このブラウザの localStorage に<b>そのまま</b>保存され、画面にも表示されます。
        </Box>
        <Box sx={{ display: 'grid', gap: 2 }}>
          {Array.from({ length: WALLET_SLOTS }, (_, i) => (
            <Slot key={i} index={i} wallet={wallets[i]} copied={copied} onCopy={copy} onCreate={create} onDelete={remove} />
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// 1つ分の枠。空なら秘密鍵の入力欄、作成済みなら3つの値を表示する。
function Slot({ index, wallet, copied, onCopy, onCreate, onDelete }: {
  index: number; wallet: Wallet | null; copied: string;
  onCopy: (id: string, text: string) => void; onCreate: (i: number, name: string, key: string) => string | null; onDelete: (i: number) => void;
}) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    const e = onCreate(index, name, key);
    if (e) { setErr(e); return; }
    setErr(''); setName(''); setKey('');   // 作成できたら、入力欄の秘密鍵は消す
  };
  const num = String(index + 1).padStart(2, '0');

  return (
    <Box sx={{ border: 1, borderColor: wallet ? 'rgba(255,6,10,0.4)' : 'divider', borderRadius: 2, bgcolor: 'action.hover', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
        <Typography sx={{ ...mono, fontSize: '1.2rem', fontWeight: 700, color: wallet ? 'primary.main' : 'text.secondary' }}>{num}</Typography>
        <Typography noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 700 }}>{wallet ? wallet.name : '空き'}</Typography>
        {wallet && <ButtonBase onClick={() => onDelete(index)} sx={{ fontSize: '0.8rem', color: 'text.secondary', textDecoration: 'underline', textUnderlineOffset: '3px', '&:hover': { color: 'primary.main' } }}>削除</ButtonBase>}
      </Box>
      {wallet ? (
        <Box sx={{ px: 2, py: 1.5, display: 'grid', gap: 1.5 }}>
          <Balance address={wallet.address} />
          <Field id={`${index}-addr`} label="アドレス（Base58）" value={wallet.address} copied={copied} onCopy={onCopy} />
          <Field id={`${index}-hex`} label="アドレス（16進・41付き）" value={wallet.addressHex} copied={copied} onCopy={onCopy} />
          <Field id={`${index}-pub`} label="公開鍵（x と y、64バイト）" value={wallet.publicKey} copied={copied} onCopy={onCopy} />
          <Field id={`${index}-priv`} label="秘密鍵" value={wallet.privateKey} copied={copied} onCopy={onCopy} secret />
        </Box>
      ) : (
        <Box sx={{ px: 2, py: 1.75, display: 'grid', gap: 1.5 }}>
          <TextField size="small" label="名前（省略できます）" value={name} onChange={(e) => setName(e.target.value)} slotProps={{ htmlInput: { maxLength: NAME_MAX } }} />
          <TextField size="small" label="秘密鍵（64桁の16進）を貼り付け" value={key} error={!!err} helperText={err || '例: 0000…0001（先頭の 0x は付けても構いません）'}
            onChange={(e) => { setKey(e.target.value); setErr(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && key.trim()) { e.preventDefault(); submit(); } }}
            slotProps={{ input: { sx: mono }, htmlInput: { autoComplete: 'off', spellCheck: false, 'aria-label': `ウォレット${index + 1}の秘密鍵` } }} />
          <Box><Button variant="contained" disabled={!key.trim()} onClick={submit}>アカウントを作成</Button></Box>
        </Box>
      )}
    </Box>
  );
}

// 残高（TRX）と、持っているトークンの一覧。開いたときに自動で取得し、「更新」で取り直す。
type Load = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ok'; data: Holdings };
function Balance({ address }: { address: string }) {
  const [state, setState] = useState<Load>({ status: 'loading' });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const ac = new AbortController();
    fetchHoldings(address, ac.signal)
      .then((data) => setState({ status: 'ok', data }))
      .catch((e) => { if (!ac.signal.aborted) setState({ status: 'error', message: e instanceof Error && e.message !== 'Failed to fetch' ? e.message : 'ノードに接続できませんでした。通信を確認して、もう一度「更新」を押してください' }); });
    return () => ac.abort();
  }, [address, tick]);
  const reload = () => { setState({ status: 'loading' }); setTick((t) => t + 1); };
  const net = new URL(NODE).hostname.startsWith('nile') ? 'Nile' : 'メインネット';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.4 }}>
        <Typography sx={{ flex: 1, fontSize: '0.72rem', letterSpacing: '0.06em', color: 'text.secondary' }}>残高とトークン（{net}）</Typography>
        <ButtonBase onClick={reload} disabled={state.status === 'loading'} sx={{ px: 1, py: 0.25, borderRadius: 1, fontSize: '0.76rem', fontWeight: 700, color: 'text.secondary', '&:hover': { bgcolor: 'action.selected', color: 'text.primary' } }}>
          {state.status === 'loading' ? '取得中…' : '更新'}
        </ButtonBase>
      </Box>
      <Box sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1, px: 1.25, py: 1 }}>
        {state.status === 'loading' && <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary' }}>台帳から読み込んでいます…</Typography>}
        {state.status === 'error' && <Typography sx={{ fontSize: '0.86rem', color: 'error.main', lineHeight: 1.7 }}>{state.message}</Typography>}
        {state.status === 'ok' && <HoldingsList data={state.data} />}
      </Box>
    </Box>
  );
}

function HoldingsList({ data }: { data: Holdings }) {
  if (!data.exists) {
    return <Typography sx={{ fontSize: '0.86rem', color: 'text.secondary', lineHeight: 1.8 }}>このアドレスは、まだ台帳に存在しません。TRXを受け取って「有効化」されると、残高が表示されます（フォーセットで受け取れます）。</Typography>;
  }
  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <Row badge="TRX" title="TRX" sub="ネイティブ通貨" amount={formatUnits(data.sun, 6)} unit="TRX" />
      {data.tokens.map((t) => <TokenRow key={`${t.kind}-${t.id}`} t={t} />)}
      {data.tokens.length === 0 && <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>TRX以外のトークンは、持っていません。</Typography>}
      {data.hidden > 0 && <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>ほか {data.hidden} 種類のトークンは、表示を省略しています。</Typography>}
    </Box>
  );
}

function TokenRow({ t }: { t: Token }) {
  const amount = t.decimals === null ? t.raw : formatUnits(t.raw, t.decimals);
  const sub = `${t.kind === 'TRC-10' ? 'ID' : 'コントラクト'}: ${t.id}`;
  return <Row badge={t.kind} title={t.name} sub={sub} amount={amount} unit={t.symbol || (t.decimals === null ? '（最小単位）' : '')} />;
}

function Row({ badge, title, sub, amount, unit }: { badge: string; title: string; sub: string; amount: string; unit: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
      <Box sx={{ ...mono, fontSize: '0.7rem', fontWeight: 700, px: 0.75, py: 0.25, mt: 0.2, borderRadius: 0.75, border: 1, borderColor: badge === 'TRX' ? 'primary.main' : 'divider', color: badge === 'TRX' ? 'primary.main' : 'text.secondary', flexShrink: 0 }}>{badge}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', wordBreak: 'break-all' }}>{title}</Typography>
        <Typography sx={{ ...mono, fontSize: '0.7rem', color: 'text.secondary', wordBreak: 'break-all' }}>{sub}</Typography>
      </Box>
      <Box sx={{ ...mono, textAlign: 'right', fontWeight: 700, wordBreak: 'break-all', maxWidth: '55%' }}>{amount}{unit && <Box component="span" sx={{ ml: 0.75, fontWeight: 400, color: 'text.secondary' }}>{unit}</Box>}</Box>
    </Box>
  );
}

// ラベルと値とコピーボタン。値は折り返して、全部見せる。
function Field({ id, label, value, copied, onCopy, secret }: { id: string; label: string; value: string; copied: string; onCopy: (id: string, text: string) => void; secret?: boolean }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: secret ? 'primary.main' : 'text.secondary', mb: 0.4 }}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1, px: 1.25, py: 0.75 }}>
        <Box sx={{ ...mono, flex: 1, minWidth: 0, wordBreak: 'break-all', lineHeight: 1.6, userSelect: 'all' }}>{value}</Box>
        <ButtonBase onClick={() => onCopy(id, value)} sx={{ flexShrink: 0, px: 1, py: 0.25, borderRadius: 1, fontSize: '0.76rem', fontWeight: 700, color: copied === id ? 'success.main' : 'text.secondary', '&:hover': { bgcolor: 'action.selected', color: 'text.primary' } }}>
          {copied === id ? 'コピー済み' : 'コピー'}
        </ButtonBase>
      </Box>
    </Box>
  );
}
