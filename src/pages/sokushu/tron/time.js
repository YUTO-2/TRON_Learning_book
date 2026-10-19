// 時刻：timestamp は Unix時刻（ミリ秒）
const base = "https://nile.trongrid.io";
const post = async (path, body) => (await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) })).json();
const b1 = await post("/wallet/getnowblock");
const h = b1.block_header.raw_data.number;
const b0 = await post("/wallet/getblockbynum", { num: h - 1 });
const t1 = b1.block_header.raw_data.timestamp, t0 = b0.block_header.raw_data.timestamp;
console.log("ブロック", h, "の timestamp:", t1);
console.log("作成時刻(UTC):", new Date(t1).toISOString());
console.log("日本時間:", new Date(t1).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
console.log("前のブロックとの間隔:", t1 - t0, "ミリ秒");
