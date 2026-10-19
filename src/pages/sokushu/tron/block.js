// ブロックを読む：項目の確認、鎖のつながり、blockIDの再計算
const base = "https://nile.trongrid.io";
const post = async (path, body) => (await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) })).json();
const hexToU8 = (s) => Uint8Array.from(s.match(/../g) ?? [], (h) => parseInt(h, 16));
const u8hex = (u) => Array.from(u, (b) => b.toString(16).padStart(2, "0")).join("");
const varint = (n) => { n = BigInt(n); const o = []; while (n > 0x7fn) { o.push(Number(n & 0x7fn) | 0x80); n >>= 7n; } o.push(Number(n)); return o; };
const fVar = (no, v) => [...varint(BigInt(no) << 3n), ...varint(v)];
const fLen = (no, u) => [...varint((BigInt(no) << 3n) | 2n), ...varint(u.length), ...u];

const cur = await post("/wallet/getnowblock");
const r = cur.block_header.raw_data;
const prev = await post("/wallet/getblockbynum", { num: r.number - 1 });

console.log("高さ:", r.number, " 取引の数:", (cur.transactions ?? []).length);
console.log("txTrieRoot:", r.txTrieRoot);
console.log("witness_address(SR):", r.witness_address);
console.log("version:", r.version);
console.log("--- 鎖のつながり ---");
console.log("parentHash   :", r.parentHash);
console.log("前のblockID  :", prev.blockID);
console.log("つながっている:", r.parentHash === prev.blockID);
console.log("--- blockID の中身 ---");
console.log("blockID の先頭8バイト:", cur.blockID.slice(0, 16), "→ 高さ", parseInt(cur.blockID.slice(0, 16), 16));
// ヘッダー（raw_data）をprotobufで並べ直し、SHA-256を取る。blockID = 高さ(8バイト) + そのハッシュの9バイト目以降
const raw = Uint8Array.from([
  ...fVar(1, r.timestamp), ...fLen(2, hexToU8(r.txTrieRoot)), ...fLen(3, hexToU8(r.parentHash)),
  ...fVar(7, r.number), ...(r.witness_id ? fVar(8, r.witness_id) : []), ...fLen(9, hexToU8(r.witness_address)), ...(r.version ? fVar(10, r.version) : []),
]);
const sha = new Uint8Array(await crypto.subtle.digest("SHA-256", raw));
const calc = BigInt(r.number).toString(16).padStart(16, "0") + u8hex(sha.slice(8));
console.log("再計算した blockID:", calc);
console.log("一致:", calc === cur.blockID);
