// TRXの単位（sun）と、TRC-10トークンの一覧
const toSun = (trx) => { const [i, f = ""] = String(trx).split("."); return BigInt(i) * 1000000n + BigInt(f.padEnd(6, "0").slice(0, 6)); };
const fromSun = (sun) => { const s = BigInt(sun).toString().padStart(7, "0"); return s.slice(0, -6) + "." + s.slice(-6); };
console.log("1 TRX     =", toSun("1"), "sun");
console.log("12.5 TRX  =", toSun("12.5"), "sun");
console.log("1234567 sun =", fromSun(1234567n), "TRX");

const base = "https://nile.trongrid.io";
const post = async (path, body) => (await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) })).json();
const list = await post("/wallet/getpaginatedassetissuelist", { offset: 0, limit: 3, visible: true });
for (const a of list.assetIssue ?? []) {
  console.log("TRC-10:", a.name, "(" + a.abbr + ")  id:", a.id, " 可分性(precision):", a.precision ?? 0, " 発行量:", a.total_supply);
}
