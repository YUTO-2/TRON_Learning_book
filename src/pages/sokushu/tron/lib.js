// ステップ1：ハッシュ関数とBase58を用意する（この後のコードで使います）
const hex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
const fromHex = (s) => Uint8Array.from(s.match(/../g) ?? [], (h) => parseInt(h, 16));
const sha256 = async (u8) => new Uint8Array(await crypto.subtle.digest("SHA-256", u8));

// Keccak-256（SHA3-256とは区切りのバイトだけが違う）
const M64 = (1n << 64n) - 1n;
const rotl = (x, n) => ((x << BigInt(n)) | (x >> BigInt(64 - n))) & M64;
const keccakF = (s) => {
  let R = 1;
  for (let round = 0; round < 24; round++) {
    const C = [0, 1, 2, 3, 4].map((x) => s[x] ^ s[x + 5] ^ s[x + 10] ^ s[x + 15] ^ s[x + 20]);
    for (let x = 0; x < 5; x++) { const D = C[(x + 4) % 5] ^ rotl(C[(x + 1) % 5], 1); for (let y = 0; y < 25; y += 5) s[y + x] ^= D; }
    let [x, y] = [1, 0], cur = s[1];
    for (let t = 0; t < 24; t++) { [x, y] = [y, (2 * x + 3 * y) % 5]; const tmp = s[x + 5 * y]; s[x + 5 * y] = rotl(cur, ((t + 1) * (t + 2) / 2) % 64); cur = tmp; }
    for (let y = 0; y < 25; y += 5) { const a = s.slice(y, y + 5); for (let x = 0; x < 5; x++) s[y + x] = a[x] ^ (~a[(x + 1) % 5] & M64 & a[(x + 2) % 5]); }
    for (let j = 0; j < 7; j++) { R = ((R << 1) ^ ((R >> 7) * 0x71)) % 256; if (R & 2) s[0] ^= 1n << BigInt((1 << j) - 1); }
  }
};
const keccak256 = (u8) => {
  const rate = 136, q = Array.from(u8);
  q.push(0x01); while (q.length % rate) q.push(0); q[q.length - 1] ^= 0x80;   // パディング（SHA3-256なら 0x06）
  const s = Array(25).fill(0n);
  for (let off = 0; off < q.length; off += rate) {
    for (let i = 0; i < rate / 8; i++) { let v = 0n; for (let k = 7; k >= 0; k--) v = (v << 8n) | BigInt(q[off + i * 8 + k]); s[i] ^= v; }
    keccakF(s);
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) out[i] = Number((s[i >> 3] >> BigInt(8 * (i & 7))) & 0xFFn);
  return out;
};

// Base58Check（TRONのアドレスの表記）。チェックサムはSHA-256を2回かけた先頭4バイト
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const b58enc = (u8) => { let n = BigInt("0x" + (hex(u8) || "0")), s = ""; while (n > 0n) { s = B58[Number(n % 58n)] + s; n /= 58n; } for (const b of u8) { if (b) break; s = "1" + s; } return s; };
const b58dec = (s) => { let n = 0n; for (const c of s) { const i = B58.indexOf(c); if (i < 0) throw new Error("Base58にない文字: " + c); n = n * 58n + BigInt(i); } let h = n.toString(16); if (h.length % 2) h = "0" + h; const body = n ? fromHex(h) : new Uint8Array(); const z = s.length - s.replace(/^1+/, "").length; return Uint8Array.from([...new Uint8Array(z), ...body]); };
const toBase58 = async (hex42) => { const a = fromHex(hex42); const c = (await sha256(await sha256(a))).slice(0, 4); return b58enc(Uint8Array.from([...a, ...c])); };
const toHex42 = async (addr) => { const r = b58dec(addr); const a = r.slice(0, 21), c = r.slice(21); const ok = hex((await sha256(await sha256(a))).slice(0, 4)) === hex(c); if (!ok || r.length !== 25 || a[0] !== 0x41) throw new Error("不正なアドレス: " + addr); return hex(a); };

console.log("Keccak-256(空文字):", hex(keccak256(new Uint8Array())));
console.log("Keccak-256(abc)  :", hex(keccak256(new TextEncoder().encode("abc"))));
console.log("Base58(\"Hello\")   :", b58enc(new TextEncoder().encode("Hello")));
console.log("SHA-256(abc)     :", hex(await sha256(new TextEncoder().encode("abc"))));
