// エネルギーの単価と、コントラクト呼び出しの費用の見積り
const base = "https://api.trongrid.io";
const cp = Object.fromEntries(((await (await fetch(base + "/wallet/getchainparameters")).json()).chainParameter ?? []).map((p) => [p.key, p.value]));
const price = BigInt(cp.getEnergyFee);
console.log("エネルギーの単価:", price, "sun");
const prices = (await (await fetch(base + "/wallet/getenergyprices")).json()).prices ?? "";
console.log("単価の履歴（開始時刻:単価）の末尾:", prices.split(",").filter(Boolean).slice(-3).join("  "));

// USDT の transfer は、受取側が初めてUSDTを持つかで、エネルギーが変わる（目安）
for (const [label, energy] of [["受取側がUSDT保有済み", 65000n], ["受取側が初めて", 131000n]]) {
  const sun = energy * price;
  console.log(label + "：", energy, "エネルギー × ", price, "sun =", sun, "sun =", Number(sun) / 1e6, "TRX");
}
console.log("fee_limit の上限:", cp.getMaxFeeLimit, "sun =", Number(cp.getMaxFeeLimit) / 1e6, "TRX");
