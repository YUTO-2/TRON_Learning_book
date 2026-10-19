// 取引の raw_data_hex（バイト列）を読み解く関数と、組み立て直す関数を作る
if (typeof alice === "undefined" || typeof bob === "undefined") throw new Error("第4章の4.2までを済ませてください（alice と bob が必要です）");
hexToU8 = (s) => Uint8Array.from(s.match(/../g) ?? [], (h) => parseInt(h, 16));
u8hex = (u) => Array.from(u, (b) => b.toString(16).padStart(2, "0")).join("");
sha256hex = async (hex) => u8hex(new Uint8Array(await crypto.subtle.digest("SHA-256", hexToU8(hex))));
varint = (n) => { n = BigInt(n); const o = []; while (n > 0x7fn) { o.push(Number(n & 0x7fn) | 0x80); n >>= 7n; } o.push(Number(n)); return o; };
fVar = (no, v) => [...varint(BigInt(no) << 3n), ...varint(v)];                       // 数値の欄（番号 + 値）
fLen = (no, u) => [...varint((BigInt(no) << 3n) | 2n), ...varint(u.length), ...u];  // バイト列の欄（番号 + 長さ + 中身）

// バイト列 → 欄の一覧 [番号, 値]。値は、数値ならBigInt、バイト列ならUint8Array（1.10の読み取り器と同じ）
readPb = (u8) => {
  const out = []; let i = 0;
  const rv = () => { let r = 0n, s = 0n; for (;;) { const b = u8[i++]; r |= BigInt(b & 0x7f) << s; if (!(b & 0x80)) return r; s += 7n; } };
  while (i < u8.length) {
    const k = rv(), no = Number(k >> 3n), wt = Number(k & 7n);
    if (wt === 0) out.push([no, rv()]);
    else if (wt === 2) { const n = Number(rv()); out.push([no, u8.slice(i, i + n)]); i += n; }
    else throw new Error("未対応のワイヤー型 " + wt);
  }
  return out;
};

// raw_data_hex → 項目（TransferContract の取引を読む）
decodeTx = (hex) => {
  const get = (list, no) => list.find((x) => x[0] === no)?.[1];
  const f = readPb(hexToU8(hex));
  const c = readPb(get(f, 11));
  const anyList = readPb(get(c, 2));
  const r = { fields: f.map((x) => x[0]), type: Number(get(c, 1) ?? 0n), typeUrl: new TextDecoder().decode(get(anyList, 1)),
    refBytes: u8hex(get(f, 1)), refHash: u8hex(get(f, 4)), expiration: Number(get(f, 8)), timestamp: Number(get(f, 14)) };
  if (r.type === 1) { const t = readPb(get(anyList, 2)); r.from = u8hex(get(t, 1)); r.to = u8hex(get(t, 2)); r.amount = Number(get(t, 3) ?? 0n); }
  return r;
};

// 項目 → raw_data_hex（4.4と同じ並べ方）
encodeTx = (r) => {
  const transfer = [...fLen(1, hexToU8(r.from)), ...fLen(2, hexToU8(r.to)), ...fVar(3, r.amount)];
  const anyMsg = [...fLen(1, new TextEncoder().encode(r.typeUrl)), ...fLen(2, Uint8Array.from(transfer))];
  const contract = [...fVar(1, 1), ...fLen(2, Uint8Array.from(anyMsg))];
  return u8hex(Uint8Array.from([...fLen(1, hexToU8(r.refBytes)), ...fLen(4, hexToU8(r.refHash)), ...fVar(8, r.expiration), ...fLen(11, Uint8Array.from(contract)), ...fVar(14, r.timestamp)]));
};

// ノードに、AliceからBobへ1 TRXの取引を作らせる関数（以降の節で使う）
newTx = () => tronWeb.transactionBuilder.sendTrx(bob.address.base58, 1000000, alice.address.base58);

tx = await newTx();
d = decodeTx(tx.raw_data_hex);
console.log("欄の番号     :", d.fields.join(", "));
console.log("種類         :", d.type, d.typeUrl);
console.log("送り主(16進) :", d.from);
console.log("宛先(16進)   :", d.to);
console.log("量(sun)      :", d.amount);
console.log("参照ブロック :", d.refBytes, d.refHash);
console.log("有効期限     :", new Date(d.expiration).toISOString());
console.log("組み立て直すと、raw_data_hex と同じ:", encodeTx(d) === tx.raw_data_hex);
console.log("JSONの宛先と、バイト列の宛先が同じ :", tx.raw_data.contract[0].parameter.value.to_address === d.to);
