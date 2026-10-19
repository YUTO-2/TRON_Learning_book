// コントラクトの情報を読む（メインネットのUSDT。読み取りだけなので、資産には影響しない）
const base = "https://api.trongrid.io";
const post = async (path, body) => (await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) })).json();
const USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const c = await post("/wallet/getcontract", { value: USDT, visible: true });
const abi = c.abi?.entrys ?? [];
console.log("名前:", c.name, " 作成者:", c.origin_address);
console.log("ABIの項目数:", abi.length, "  バイトコードの長さ:", (c.bytecode ?? "").length / 2, "バイト");
console.log("関数:", abi.filter((e) => e.type === "Function" || e.type === "function").map((e) => e.name).join(", "));
console.log("イベント:", abi.filter((e) => e.type === "Event" || e.type === "event").map((e) => e.name).join(", "));
console.log("consume_user_resource_percent:", c.consume_user_resource_percent, " origin_energy_limit:", c.origin_energy_limit);
