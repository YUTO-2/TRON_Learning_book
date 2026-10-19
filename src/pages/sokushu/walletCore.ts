// テスト用ウォレット。秘密鍵を貼り付けて、公開鍵とアドレスを計算し、3つまで保存する。
// 計算は第1章（tron/lib.js・pubkey.js・address.js）と同じ手順を、依存なしで書いたもの
// （secp256k1 → Keccak-256 → 先頭に41 → SHA-256を2回のチェックサム → Base58）。TronWebの読み込みは要らない。
// 保存先はこのブラウザの localStorage（平文）。練習用の鍵だけを使うこと。

export const WALLET_SLOTS = 3;
export const NAME_MAX = 20;
const STORAGE_KEY = 'sokushu-wallets';

export type Wallet = { name: string; privateKey: string; publicKey: string; address: string; addressHex: string };

// ───────── バイト列の道具 ─────────
const hex = (u8: Uint8Array): string => Array.from(u8, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
const fromHex = (s: string): Uint8Array => Uint8Array.from(s.match(/../g) ?? [], (h) => parseInt(h, 16));

// ───────── SHA-256（同期。crypto.subtle は使わない） ─────────
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];
const sha256 = (data: Uint8Array): Uint8Array => {
  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const len = data.length;
  const padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  padded.set(data);
  padded[len] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, Math.floor((len * 8) / 0x100000000));
  dv.setUint32(padded.length - 4, (len * 8) >>> 0);
  const w = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = (hh + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
  }
  const out = new Uint8Array(32);
  const odv = new DataView(out.buffer);
  h.forEach((v, i) => odv.setUint32(i * 4, v));
  return out;
};

// ───────── Keccak-256（SHA3-256とは区切りのバイトだけが違う） ─────────
const M64 = (1n << 64n) - 1n;
const rotl = (x: bigint, n: number): bigint => ((x << BigInt(n)) | (x >> BigInt(64 - n))) & M64;
const keccakF = (s: bigint[]): void => {
  let R = 1;
  for (let round = 0; round < 24; round++) {
    const C = [0, 1, 2, 3, 4].map((x) => s[x] ^ s[x + 5] ^ s[x + 10] ^ s[x + 15] ^ s[x + 20]);
    for (let x = 0; x < 5; x++) { const D = C[(x + 4) % 5] ^ rotl(C[(x + 1) % 5], 1); for (let y = 0; y < 25; y += 5) s[y + x] ^= D; }
    let x = 1, y = 0, cur = s[1];
    for (let t = 0; t < 24; t++) { [x, y] = [y, (2 * x + 3 * y) % 5]; const tmp = s[x + 5 * y]; s[x + 5 * y] = rotl(cur, ((t + 1) * (t + 2) / 2) % 64); cur = tmp; }
    for (let yy = 0; yy < 25; yy += 5) { const a = s.slice(yy, yy + 5); for (let xx = 0; xx < 5; xx++) s[yy + xx] = a[xx] ^ (~a[(xx + 1) % 5] & M64 & a[(xx + 2) % 5]); }
    for (let j = 0; j < 7; j++) { R = ((R << 1) ^ ((R >> 7) * 0x71)) % 256; if (R & 2) s[0] ^= 1n << BigInt((1 << j) - 1); }
  }
};
const keccak256 = (u8: Uint8Array): Uint8Array => {
  const rate = 136, q = Array.from(u8);
  q.push(0x01); while (q.length % rate) q.push(0); q[q.length - 1] ^= 0x80;
  const s: bigint[] = Array(25).fill(0n);
  for (let off = 0; off < q.length; off += rate) {
    for (let i = 0; i < rate / 8; i++) { let v = 0n; for (let k = 7; k >= 0; k--) v = (v << 8n) | BigInt(q[off + i * 8 + k]); s[i] ^= v; }
    keccakF(s);
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) out[i] = Number((s[i >> 3] >> BigInt(8 * (i & 7))) & 0xFFn);
  return out;
};

// ───────── secp256k1（公開鍵 ＝ 秘密鍵 × 基点） ─────────
const P = 2n ** 256n - 2n ** 32n - 977n;
const N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n;
type Pt = [bigint, bigint] | null;
const G: Pt = [0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798n, 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8n];
const md = (a: bigint): bigint => ((a % P) + P) % P;
const inv = (a: bigint): bigint => { let [r0, r1, s0, s1] = [P, md(a), 0n, 1n]; while (r1) { const q = r0 / r1; [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; } return md(s0); };
const add = (A: Pt, B: Pt): Pt => {
  if (!A) return B; if (!B) return A;
  if (A[0] === B[0] && md(A[1] + B[1]) === 0n) return null;
  const l = A[0] === B[0] ? md(3n * A[0] * A[0] * inv(2n * A[1])) : md((B[1] - A[1]) * inv(B[0] - A[0]));
  const x = md(l * l - A[0] - B[0]);
  return [x, md(l * (A[0] - x) - A[1])];
};
const mul = (k: bigint, A: Pt): Pt => { let R: Pt = null; while (k > 0n) { if (k & 1n) R = add(R, A); A = add(A, A); k >>= 1n; } return R; };

// ───────── Base58Check ─────────
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const b58enc = (u8: Uint8Array): string => {
  let n = BigInt('0x' + (hex(u8) || '0')), s = '';
  while (n > 0n) { s = B58[Number(n % 58n)] + s; n /= 58n; }
  for (const b of u8) { if (b) break; s = '1' + s; }
  return s;
};

// ───────── 秘密鍵 → 公開鍵・アドレス ─────────
// 入力は、64桁の16進（大文字小文字どちらも可。先頭の 0x は外す）。1 以上 N 未満でなければ、エラー。
export const parsePrivateKey = (input: string): string => {
  const s = input.trim().replace(/^0x/i, '');
  if (!s) throw new Error('秘密鍵を入力してください');
  if (!/^[0-9a-fA-F]+$/.test(s)) throw new Error('秘密鍵は、16進（0〜9、A〜F）の文字だけで入力してください');
  if (s.length !== 64) throw new Error(`秘密鍵は64桁です（いまは${s.length}桁）`);
  const k = BigInt('0x' + s);
  if (k < 1n || k >= N) throw new Error('秘密鍵は、1 以上、曲線の位数 N 未満でなければなりません');
  return s.toUpperCase();
};

export const createWallet = (name: string, input: string): Wallet => {
  const privateKey = parsePrivateKey(input);
  const pt = mul(BigInt('0x' + privateKey), G);
  if (!pt) throw new Error('公開鍵を計算できませんでした');
  const publicKey = hex(fromHex(pt[0].toString(16).padStart(64, '0') + pt[1].toString(16).padStart(64, '0')));   // x と y を32バイトずつ（先頭の 04 は付けない）
  const body = keccak256(fromHex(publicKey)).slice(12);                       // Keccak-256 の末尾20バイト
  const addr21 = Uint8Array.from([0x41, ...body]);                            // 先頭に 41
  const check = sha256(sha256(addr21)).slice(0, 4);                           // SHA-256を2回かけて先頭4バイト
  const address = b58enc(Uint8Array.from([...addr21, ...check]));
  return { name: name.trim().slice(0, NAME_MAX), privateKey, publicKey, address, addressHex: hex(addr21) };
};

// ───────── 保存（このブラウザの localStorage） ─────────
const isWallet = (w: unknown): w is Wallet => {
  const o = w as Record<string, unknown> | null;
  return !!o && ['name', 'privateKey', 'publicKey', 'address', 'addressHex'].every((k) => typeof o[k] === 'string');
};
export const loadWallets = (): (Wallet | null)[] => {
  let a: unknown = [];
  try { a = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { /* 読めなければ空 */ }
  const arr = Array.isArray(a) ? a : [];
  return Array.from({ length: WALLET_SLOTS }, (_, i) => (isWallet(arr[i]) ? arr[i] : null));
};
export const saveWallets = (w: (Wallet | null)[]): void => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(w)); } catch { /* 保存できなくても動作には影響しない */ }
};

// ───────── 残高とトークンの取得（読み取りだけ。秘密鍵はノードに送らない） ─────────
// 接続先は、本書の既定と同じテストネットのNile。メインネットで見たいときは、NODE を https://api.trongrid.io に変える。
export const NODE = 'https://nile.trongrid.io';
const TOKEN_LIMIT = 20;   // 名前などを問い合わせるトークンの上限（保有が多いときの回数制限対策）

export type Token = {
  kind: 'TRC-10' | 'TRC-20';
  id: string;                 // TRC-10: トークンID／TRC-20: コントラクトのアドレス
  name: string;
  symbol: string;
  decimals: number | null;    // 取得できなかったときは null（最小単位のまま表示する）
  raw: string;                // 最小単位の残高
};
export type Holdings = { exists: boolean; sun: string; tokens: Token[]; hidden: number };

// 最小単位の整数を、可分性（decimals）で割った表示にする。BigIntで計算するので、桁あふれしない。
export const formatUnits = (raw: string, decimals: number): string => {
  let n: bigint;
  try { n = BigInt(raw); } catch { return raw; }
  const neg = n < 0n;
  if (neg) n = -n;
  const s = n.toString().padStart(decimals + 1, '0');
  const int = s.slice(0, s.length - decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const frac = decimals ? s.slice(-decimals).replace(/0+$/, '') : '';
  return (neg ? '-' : '') + int + (frac ? '.' + frac : '');
};

const request = async (path: string, signal: AbortSignal, body?: unknown): Promise<any> => {   // eslint-disable-line @typescript-eslint/no-explicit-any
  const res = await fetch(NODE + path, body === undefined ? { signal } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
  if (!res.ok) throw new Error(res.status === 429 ? '回数制限（429）にかかりました。少し待ってから「更新」を押してください' : `ノードがエラーを返しました（HTTP ${res.status}）`);
  return res.json();
};

// ABIの文字列（string。bytes32で返す古いトークンにも対応）を読む。
const decodeAbiString = (h: string): string => {
  const text = (x: string) => { const t = new TextDecoder().decode(fromHex(x)).replace(/\0+/g, ''); return t.includes('\uFFFD') ? '' : t; };   // 文字として読めなければ空
  if (h.length >= 128) {
    const len = parseInt(h.slice(64, 128), 16);
    if (Number.isFinite(len) && 128 + len * 2 <= h.length) return text(h.slice(128, 128 + len * 2));
  }
  return text(h.slice(0, 64));
};

// 名前・単位・可分性は、トークンごとに変わらないので、一度調べたら覚えておく。
const metaCache = new Map<string, Pick<Token, 'name' | 'symbol' | 'decimals'>>();

const trc10Meta = async (id: string, signal: AbortSignal) => {
  const key = `10:${id}`;
  const hit = metaCache.get(key);
  if (hit) return hit;
  let meta: Pick<Token, 'name' | 'symbol' | 'decimals'> = { name: `（ID ${id}）`, symbol: '', decimals: null };
  try {
    const a = await request('/wallet/getassetissuebyid', signal, { value: id, visible: true });
    if (a?.name) { meta = { name: String(a.name), symbol: String(a.abbr ?? ''), decimals: Number(a.precision ?? 0) }; metaCache.set(key, meta); }
  } catch (e) { if (signal.aborted) throw e; /* 名前が取れなくても、残高は出す */ }
  return meta;
};

const trc20Meta = async (owner: string, contract: string, signal: AbortSignal) => {
  const key = `20:${contract}`;
  const hit = metaCache.get(key);
  if (hit) return hit;
  const call = async (sel: string): Promise<string> => {
    const r = await request('/wallet/triggerconstantcontract', signal, { owner_address: owner, contract_address: contract, function_selector: sel, visible: true });
    return r?.constant_result?.[0] ?? '';
  };
  const [name, symbol, dec] = await Promise.all([call('name()'), call('symbol()'), call('decimals()')].map((p) => p.catch((e) => { if (signal.aborted) throw e; return ''; })));
  const decimals = dec ? Number(BigInt('0x' + dec.slice(0, 64))) : null;
  const meta = { name: decodeAbiString(name) || '（名前なし）', symbol: decodeAbiString(symbol), decimals: decimals !== null && decimals <= 77 ? decimals : null };
  if (symbol || dec) metaCache.set(key, meta);   // 全部失敗したときは、覚えない（次の更新で、もう一度試す）
  return meta;
};

// アドレスの残高（TRX）と、持っているトークン（TRC-10とTRC-20）の一覧を取得する。
export const fetchHoldings = async (address: string, signal: AbortSignal): Promise<Holdings> => {
  const res = await request(`/v1/accounts/${address}`, signal);
  const acc = res?.data?.[0];
  if (!acc) return { exists: false, sun: '0', tokens: [], hidden: 0 };   // TRXを受け取るまで、台帳にアカウントがない（1.7）

  const raw10: { id: string; raw: string }[] = (acc.assetV2 ?? []).map((a: { key: string; value: number | string }) => ({ id: String(a.key), raw: String(a.value) }));
  const raw20: { id: string; raw: string }[] = (acc.trc20 ?? []).flatMap((m: Record<string, string>) => Object.entries(m).map(([id, raw]) => ({ id, raw: String(raw) })));
  const nonZero = <T extends { raw: string }>(l: T[]) => l.filter((t) => t.raw !== '0');
  const all = [...nonZero(raw10).map((t) => ({ ...t, kind: 'TRC-10' as const })), ...nonZero(raw20).map((t) => ({ ...t, kind: 'TRC-20' as const }))];
  const shown = all.slice(0, TOKEN_LIMIT);

  const tokens = await Promise.all(shown.map(async (t): Promise<Token> => {
    const m = t.kind === 'TRC-10' ? await trc10Meta(t.id, signal) : await trc20Meta(address, t.id, signal);
    return { kind: t.kind, id: t.id, raw: t.raw, ...m };
  }));
  return { exists: true, sun: String(acc.balance ?? 0), tokens, hidden: all.length - shown.length };
};
