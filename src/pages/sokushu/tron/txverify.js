// 実際のトランザクションで、txID = SHA-256(raw_data) を確かめ、raw_data を読み解く
const base = "https://nile.trongrid.io";
const post = async (path, body) => (await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) })).json();
const hexToU8 = (s) => Uint8Array.from(s.match(/../g) ?? [], (h) => parseInt(h, 16));
const u8hex = (u) => Array.from(u, (b) => b.toString(16).padStart(2, "0")).join("");
const readPb = (u8) => {                                  // protobufを「欄番号・種類・値」に分解する小さな読み取り器
  const out = []; let i = 0;
  const rv = () => { let r = 0n, s = 0n; for (;;) { const b = u8[i++]; r |= BigInt(b & 0x7f) << s; if (!(b & 0x80)) return r; s += 7n; } };
  while (i < u8.length) {
    const k = rv(), no = Number(k >> 3n), wt = Number(k & 7n);
    if (wt === 0) out.push([no, "数値", rv()]);
    else if (wt === 2) { const n = Number(rv()); out.push([no, "バイト列", u8.slice(i, i + n)]); i += n; }
    else throw new Error("未対応のワイヤー型 " + wt);
  }
  return out;
};
// 最新ブロックから遡って、取引のあるブロックを探す
let blk = await post("/wallet/getnowblock");
for (let n = 0; n < 30 && !(blk.transactions ?? []).length; n++) blk = await post("/wallet/getblockbynum", { num: blk.block_header.raw_data.number - 1 });
const tx = (blk.transactions ?? [])[0];
if (!tx) throw new Error("直近のブロックに取引が見つかりません。時間をおいて試してください");
const sha = new Uint8Array(await crypto.subtle.digest("SHA-256", hexToU8(tx.raw_data_hex)));
console.log("ブロック高:", blk.block_header.raw_data.number, " 取引の数:", blk.transactions.length);
console.log("txID          :", tx.txID);
console.log("SHA-256(raw_data_hex):", u8hex(sha));
console.log("一致:", u8hex(sha) === tx.txID);
console.log("コントラクトの種類:", tx.raw_data.contract[0].type, "  署名の数:", tx.signature.length, "  署名(65バイト):", tx.signature[0].length / 2, "バイト");
console.log("--- raw_data の欄 ---");
for (const [no, kind, v] of readPb(hexToU8(tx.raw_data_hex))) {
  console.log("欄" + no, kind, kind === "数値" ? String(v) : u8hex(v).slice(0, 64) + (v.length > 32 ? "…" : "") + "（" + v.length + "バイト）");
}
