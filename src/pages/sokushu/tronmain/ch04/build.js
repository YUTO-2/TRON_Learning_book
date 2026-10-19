// ① 組み立て: AliceからBobへ1 TRXを送る取引を、ノードに作らせる（まだ署名しない）
if (typeof bob === "undefined") throw new Error("4.2 を先に実行してください");
amount = 1000000;   // 金額はsunの整数で渡す（1 TRX = 1,000,000 sun）
tx = await tronWeb.transactionBuilder.sendTrx(bob.address.base58, amount, alice.address.base58);
rd = tx.raw_data;
ct = rd.contract[0];
console.log("署名          :", tx.signature ? "あり" : "なし");
console.log("txID          :", tx.txID);
console.log("raw_data_hex  :", tx.raw_data_hex.slice(0, 32) + "…（" + tx.raw_data_hex.length / 2 + "バイト）");
console.log("種類          :", ct.type);
console.log("送り主(16進)  :", ct.parameter.value.owner_address);
console.log("宛先(16進)    :", ct.parameter.value.to_address);
console.log("量(sun)       :", ct.parameter.value.amount);
console.log("参照ブロック  :", rd.ref_block_bytes, rd.ref_block_hash);
console.log("作成時刻      :", new Date(rd.timestamp).toISOString());
console.log("有効期限      :", new Date(rd.expiration).toISOString(), "（作成の約" + Math.round((rd.expiration - rd.timestamp) / 1000) + "秒後）");
