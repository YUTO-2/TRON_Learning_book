// 悪意あるノードを真似て、取引を書き換え、点検で見つかるかを試す（書き換えた取引は、送らない）
if (typeof checkTx === "undefined") throw new Error("5.3 を先に実行してください");
mallory = await tronWeb.createAccount();               // 攻撃者のアカウント（練習用）
tx = await newTx();
d = decodeTx(tx.raw_data_hex);

// 攻撃A: JSONの表示はそのままで、バイト列の宛先だけを、攻撃者に差し替える（txIDも、合わせ直す）
forgedA = structuredClone(tx);
forgedA.raw_data_hex = encodeTx({ ...d, to: mallory.address.hex.toLowerCase() });
forgedA.txID = await sha256hex(forgedA.raw_data_hex);
console.log("--- 攻撃A: 宛先を差し替える（JSONは、Bobのまま） ---");
await checkTx(forgedA, expect);

// 攻撃B: 量を100倍にする
forgedB = structuredClone(tx);
forgedB.raw_data_hex = encodeTx({ ...d, amount: d.amount * 100 });
forgedB.txID = await sha256hex(forgedB.raw_data_hex);
console.log("--- 攻撃B: 量を100倍にする ---");
await checkTx(forgedB, expect);

// 点検せずに署名すると、どうなるか（署名するだけで、送らない）
try {
  s = await tronWeb.trx.sign(structuredClone(forgedA), alice.privateKey);
  console.log("点検なしの署名 : 署名できてしまう。署名は txID（攻撃者宛のバイト列のSHA-256）に付く。送らないこと");
} catch (e) {
  console.log("点検なしの署名 : SDKが拒否した:", String(e).slice(0, 60));
}
