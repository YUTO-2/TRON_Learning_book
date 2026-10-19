// デプロイの取引を、ノードに作らせる（署名の前の取引）。送らずに、中身を読む
if (typeof alice === "undefined") throw new Error("3.2 までを先に実行してください（alice が必要です）");
if (typeof COUNTER_ABI === "undefined" || typeof COUNTER_BC === "undefined") throw new Error("8.2 と 8.3 を先に実行してください");
DEPLOY = {
  name: "Counter",                  // コントラクトの名前（台帳に残る。動きには関係しない）
  feeLimit: 100 * 1000000,          // 焼却してよいTRXの上限（sun）。100 TRX
  callValue: 0,                     // デプロイと一緒に送るTRX（sun）。Counter は受け取らない
  userFeePercentage: 100,           // 呼び出した人が負担するエネルギーの割合（%）
  originEnergyLimit: 10000000,      // 作成者が、1回の呼び出しで負担する上限（エネルギー）
};
deployTx = await tronWeb.transactionBuilder.createSmartContract({ abi: COUNTER_ABI, bytecode: COUNTER_BC, parameters: [], ...DEPLOY }, alice.address.base58);
c0 = deployTx.raw_data.contract[0];
console.log("txID               :", deployTx.txID);
console.log("種類 type          :", c0.type);
console.log("署名 signature     :", deployTx.signature ?? "（まだ無い）");
console.log("raw_data_hex       :", deployTx.raw_data_hex.length / 2, "バイト（バイトコードを含むので、送金より、ずっと大きい）");
console.log("fee_limit          :", deployTx.raw_data.fee_limit, "sun");
console.log("contract_address   :", deployTx.contract_address, "→", tronWeb.address.fromHex(deployTx.contract_address));
