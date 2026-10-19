// トランザクション（TRXの送金）の raw_data を、手作業でバイト列に並べる
if (typeof toHex42 === "undefined") throw new Error("1.7 ステップ1（ハッシュ関数とBase58）を先に実行してください");
const base = "https://nile.trongrid.io";
const post = async (path, body) => (await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) })).json();
const hexToU8 = (s) => Uint8Array.from(s.match(/../g) ?? [], (h) => parseInt(h, 16));
const varint = (n) => { n = BigInt(n); const o = []; while (n > 0x7fn) { o.push(Number(n & 0x7fn) | 0x80); n >>= 7n; } o.push(Number(n)); return o; };
const fVar = (no, v) => [...varint(BigInt(no) << 3n), ...varint(v)];          // 数値の欄（番号 + 値）
const fLen = (no, u) => [...varint((BigInt(no) << 3n) | 2n), ...varint(u.length), ...u];   // バイト列の欄（番号 + 長さ + 中身）

const blk = await post("/wallet/getnowblock");
const num = BigInt(blk.block_header.raw_data.number);
const refBytes = hexToU8(num.toString(16).padStart(16, "0")).slice(6, 8);        // 参照ブロック高の下位2バイト
const refHash = hexToU8(blk.blockID).slice(8, 16);                               // 参照ブロックのIDの9〜16バイト目
const t = blk.block_header.raw_data.timestamp;
const owner = hexToU8(await toHex42("TMVQGm1qAQYVdetCeGRRkTWYYrLXuHK2HC"));      // 送り主（21バイト）
const to = hexToU8(await toHex42("TDvSsdrNM5eeXNL3czpa6AxLDHZA9nwe9K"));         // 宛先（21バイト）
const amount = 1000000n;                                                         // 1 TRX = 1,000,000 sun

const transfer = [...fLen(1, owner), ...fLen(2, to), ...fVar(3, amount)];        // TransferContract
const any = [...fLen(1, new TextEncoder().encode("type.googleapis.com/protocol.TransferContract")), ...fLen(2, Uint8Array.from(transfer))];
const contract = [...fVar(1, 1), ...fLen(2, Uint8Array.from(any))];             // type=1（TransferContract）
const raw = Uint8Array.from([
  ...fLen(1, refBytes), ...fLen(4, refHash), ...fVar(8, t + 60000),             // 参照ブロック、有効期限（60秒後）
  ...fLen(11, Uint8Array.from(contract)), ...fVar(14, t),                       // コントラクト、作成時刻
]);
const id = new Uint8Array(await crypto.subtle.digest("SHA-256", raw));
console.log("ref_block_bytes:", hex(refBytes), " ref_block_hash:", hex(refHash));
console.log("raw_data(" + raw.length + "バイト):", hex(raw));
console.log("txID = SHA-256(raw_data):", hex(id));
console.log("帯域幅の見積り:", raw.length + 2 + 67 + 64, "バイト（raw_data＋署名欄＋結果欄の予約64）");
