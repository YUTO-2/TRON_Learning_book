// イベント：TRC-20の Transfer の記録を、TronGridの拡張API（v1）から取る
const base = "https://api.trongrid.io";
const USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const res = await (await fetch(base + "/v1/contracts/" + USDT + "/events?event_name=Transfer&only_confirmed=true&limit=3")).json();
for (const e of res.data ?? []) {
  console.log("ブロック", e.block_number, new Date(e.block_timestamp).toISOString(), " tx:", e.transaction_id.slice(0, 16) + "…");
  console.log("  from:", e.result.from, " to:", e.result.to, " value:", e.result.value, "（最小単位）→", Number(e.result.value) / 1e6, "USDT");
}
