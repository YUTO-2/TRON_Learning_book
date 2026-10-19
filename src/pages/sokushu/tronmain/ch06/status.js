// アカウントのリソース（帯域幅とエネルギー）を表示する関数。Alice・Bobと、ネットワーク全体の合計も見る
if (typeof alice === "undefined" || typeof bob === "undefined") throw new Error("第4章の4.2までを済ませてください（alice と bob が必要です）");
showRes = async (addr, label) => {
  const r = await tronWeb.trx.getAccountResources(addr);       // /wallet/getaccountresource（最新の台帳）
  console.log("--- " + label + " ---");
  console.log("無料の帯域幅    :", (r.freeNetLimit ?? 0) - (r.freeNetUsed ?? 0), "/", r.freeNetLimit ?? 0, "（残り / 1日の枠）");
  console.log("帯域幅 NetLimit :", r.NetLimit ?? 0, " 使用済み:", r.NetUsed ?? 0);
  console.log("エネルギー      :", r.EnergyLimit ?? 0, " 使用済み:", r.EnergyUsed ?? 0);
  return r;
};
ra = await showRes(alice.address.base58, "Alice");
await showRes(bob.address.base58, "Bob");
console.log("--- ネットワーク全体 ---");
console.log("帯域幅     TotalNetLimit   :", ra.TotalNetLimit, " TotalNetWeight   :", ra.TotalNetWeight, "（TRX）");
console.log("エネルギー TotalEnergyLimit:", ra.TotalEnergyLimit, " TotalEnergyWeight:", ra.TotalEnergyWeight, "（TRX）");
console.log("1 TRXのステークで、1日に使える帯域幅   ≈", (ra.TotalNetLimit / ra.TotalNetWeight).toFixed(3), "バイト");
console.log("1 TRXのステークで、1日に使えるエネルギー ≈", (ra.TotalEnergyLimit / ra.TotalEnergyWeight).toFixed(3));
