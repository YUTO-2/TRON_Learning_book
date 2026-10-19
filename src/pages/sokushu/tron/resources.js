// 手数料の仕組み：チェーンのパラメータと、アカウントのリソース
const base = "https://nile.trongrid.io";
const post = async (path, body) => (await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) })).json();
const cp = Object.fromEntries(((await (await fetch(base + "/wallet/getchainparameters")).json()).chainParameter ?? []).map((p) => [p.key, p.value]));
console.log("帯域幅の単価 getTransactionFee:", cp.getTransactionFee, "sun / バイト");
console.log("エネルギーの単価 getEnergyFee:", cp.getEnergyFee, "sun / エネルギー");
console.log("アカウント有効化の料金:", cp.getCreateNewAccountFeeInSystemContract, "sun");
console.log("fee_limit の上限 getMaxFeeLimit:", cp.getMaxFeeLimit, "sun");

const bytes = 267n;   // TRX送金の帯域幅の目安（1.10の見積りと同じくらい）
console.log("TRX送金を、帯域幅をすべて焼却で払うと:", bytes * BigInt(cp.getTransactionFee), "sun =", Number(bytes * BigInt(cp.getTransactionFee)) / 1e6, "TRX");

const res = await post("/wallet/getaccountresource", { address: "TMVQGm1qAQYVdetCeGRRkTWYYrLXuHK2HC", visible: true });
console.log("無料の帯域幅(1日):", res.freeNetLimit, " 使用済み:", res.freeNetUsed ?? 0);
console.log("ステークで得た帯域幅:", res.NetLimit ?? 0, " エネルギー:", res.EnergyLimit ?? 0);
