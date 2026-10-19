// ② 署名: Aliceの秘密鍵で、取引に署名する
if (typeof tx === "undefined") throw new Error("4.3 を先に実行してください");
signed = await tronWeb.trx.sign(structuredClone(tx), alice.privateKey);   // コピーに署名して、元の tx は署名なしのまま残す
console.log("署名の数       :", signed.signature.length);
console.log("署名の長さ     :", signed.signature[0].length / 2, "バイト");
console.log("署名           :", signed.signature[0].slice(0, 32) + "…");
console.log("txID が同じ    :", signed.txID === tx.txID);
console.log("raw_data が同じ:", signed.raw_data_hex === tx.raw_data_hex);
console.log("元のtxの署名   :", tx.signature ? "あり" : "なし");
