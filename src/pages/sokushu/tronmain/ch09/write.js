// 書き込みの関数 increment() の取引を、ノードに作らせる（署名の前の取引）。送らずに、中身を読む
if (typeof counterAddr === "undefined" || typeof counterHex === "undefined") throw new Error("8.6 を先に実行してください");
selOf = (sig) => tronWeb.sha3(sig, false).slice(0, 8);
CALL = {
  feeLimit: 100 * 1000000,          // 焼却してよいTRXの上限（sun）。100 TRX
  callValue: 0,                     // 一緒に送るTRX（sun）。increment() は受け取らない
};
callRes = await tronWeb.transactionBuilder.triggerSmartContract(counterAddr, "increment()", CALL, [], alice.address.base58);
callTx = callRes.transaction;
cv = callTx.raw_data.contract[0].parameter.value;
console.log("result            :", JSON.stringify(callRes.result));
console.log("txID              :", callTx.txID);
console.log("種類 type         :", callTx.raw_data.contract[0].type);
console.log("署名 signature    :", callTx.signature ?? "（まだ無い）");
console.log("owner_address     :", cv.owner_address, "（Alice:", cv.owner_address.toLowerCase() === alice.address.hex.toLowerCase(), "）");
console.log("contract_address  :", cv.contract_address, "（Counter:", cv.contract_address.toLowerCase() === counterHex, "）");
console.log("data              :", cv.data, "（increment() のセレクタ:", cv.data === selOf("increment()"), "）");
console.log("call_value        :", cv.call_value ?? 0, "sun");
console.log("fee_limit         :", callTx.raw_data.fee_limit, "sun");
console.log("raw_data_hex      :", callTx.raw_data_hex.length / 2, "バイト");
