// デプロイの費用を、結果（receipt）から読む。手数料の単価は、そのときの値を取得する
if (typeof deployInfo === "undefined") throw new Error("8.6 を先に実行してください");
cp = Object.fromEntries(((await tronWeb.fullNode.request("wallet/getchainparameters", {}, "get")).chainParameter ?? []).map((p) => [p.key, p.value]));
rc = deployInfo.receipt ?? {};
console.log("実行結果 result            :", rc.result);
console.log("エネルギーの単価           :", cp.getEnergyFee, "sun / エネルギー");
console.log("エネルギー（合計）         :", rc.energy_usage_total ?? 0);
console.log("  ステークから（Alice）    :", rc.energy_usage ?? 0);
console.log("  TRXの焼却で払った        :", (rc.energy_fee ?? 0) / cp.getEnergyFee, "（", rc.energy_fee ?? 0, "sun）");
console.log("  作成者が負担（呼び出し用）:", rc.origin_energy_usage ?? 0);
console.log("帯域幅 net_usage           :", rc.net_usage ?? 0, "バイト  net_fee:", rc.net_fee ?? 0, "sun");
console.log("手数料 fee（焼却の合計）   :", deployInfo.fee ?? 0, "sun =", tronWeb.fromSun(deployInfo.fee ?? 0), "TRX");
console.log("fee_limit                  :", DEPLOY.feeLimit, "sun（焼却してよい上限）");
console.log("合計の内訳が合う           :", (rc.energy_usage ?? 0) + (rc.energy_fee ?? 0) / cp.getEnergyFee + (rc.origin_energy_usage ?? 0) === (rc.energy_usage_total ?? 0));
