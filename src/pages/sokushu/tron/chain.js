// チェーンの現在地：最新ブロックと、確定済み（solidified）ブロック
const base = "https://nile.trongrid.io";
const post = async (path, body) => (await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) })).json();
const now = await post("/wallet/getnowblock");              // 最新のブロック
const fin = await post("/walletsolidity/getnowblock");      // 確定済みの最新ブロック
const h = now.block_header.raw_data.number, f = fin.block_header.raw_data.number;
console.log("最新ブロック高:", h, " 確定済み:", f);
console.log("確定が追いついていないブロック数:", h - f, "（約", (h - f) * 3, "秒）");
console.log("JSONでの型:", typeof h, " → 2^53 未満なので、そのまま計算できる");
console.log("blockID:", now.blockID);
