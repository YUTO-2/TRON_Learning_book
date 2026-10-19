// ノードが返した raw_data の値を、1.10と同じ手順でバイト列に並べ直して、txIDと比べる
if (typeof tx === "undefined") throw new Error("4.3 を先に実行してください");
hexToU8 = (s) => Uint8Array.from(s.match(/../g) ?? [], (h) => parseInt(h, 16));
u8hex = (u) => Array.from(u, (b) => b.toString(16).padStart(2, "0")).join("");
varint = (n) => { n = BigInt(n); const o = []; while (n > 0x7fn) { o.push(Number(n & 0x7fn) | 0x80); n >>= 7n; } o.push(Number(n)); return o; };
fVar = (no, v) => [...varint(BigInt(no) << 3n), ...varint(v)];                              // 数値の欄（番号 + 値）
fLen = (no, u) => [...varint((BigInt(no) << 3n) | 2n), ...varint(u.length), ...u];         // バイト列の欄（番号 + 長さ + 中身）

rd = tx.raw_data;
ct = rd.contract[0];
if (ct.type !== "TransferContract") throw new Error("TransferContract ではありません");
v = ct.parameter.value;
transfer = [...fLen(1, hexToU8(v.owner_address)), ...fLen(2, hexToU8(v.to_address)), ...fVar(3, v.amount)];     // TransferContract
any = [...fLen(1, new TextEncoder().encode(ct.parameter.type_url)), ...fLen(2, Uint8Array.from(transfer))];      // Any（種類の名前 + 中身）
contract = [...fVar(1, 1), ...fLen(2, Uint8Array.from(any))];                                                    // type=1（TransferContract）
parts = [
  ["欄1  ref_block_bytes", fLen(1, hexToU8(rd.ref_block_bytes))],
  ["欄4  ref_block_hash ", fLen(4, hexToU8(rd.ref_block_hash))],
  ["欄8  expiration     ", fVar(8, rd.expiration)],
  ["欄11 contract       ", fLen(11, Uint8Array.from(contract))],
  ["欄14 timestamp      ", fVar(14, rd.timestamp)],
];
raw = Uint8Array.from(parts.flatMap((p) => p[1]));
for (p of parts) console.log(p[0], ":", p[1].length, "バイト");
sha = new Uint8Array(await crypto.subtle.digest("SHA-256", raw));
console.log("手組みの raw_data     :", raw.length, "バイト");
console.log("raw_data_hex が一致   :", u8hex(raw) === tx.raw_data_hex);
console.log("SHA-256 が txID と一致:", u8hex(sha) === tx.txID);
