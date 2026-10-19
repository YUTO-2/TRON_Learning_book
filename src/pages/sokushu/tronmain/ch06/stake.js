// TRXをステークして、帯域幅とエネルギーを得る（ステーク2.0）。帯域幅に200 TRX、エネルギーに100 TRX
if (typeof sendOp === "undefined" || typeof showRes === "undefined") throw new Error("6.2 と 6.3 を先に実行してください");
STAKE = { BANDWIDTH: 200 * 1000000, ENERGY: 100 * 1000000 };   // ステークする量（sun）
bal = await tronWeb.trx.getUnconfirmedBalance(alice.address.base58);
if (bal < STAKE.BANDWIDTH + STAKE.ENERGY + 10000000) throw new Error("Aliceの残高が足りません（310 TRX以上が必要）。第3章の3.5で、フォーセットから受け取ってください");
A = alice.address.hex.toLowerCase();
await showRes(alice.address.base58, "ステーク前");
for (const [res, no] of [["BANDWIDTH", 0], ["ENERGY", 1]]) {
  console.log("=== " + res + " を、" + STAKE[res] / 1000000 + " TRXステークする ===");
  const t = await tronWeb.transactionBuilder.freezeBalanceV2(STAKE[res], res, alice.address.base58);
  const want = no === 0 ? { 1: A, 2: STAKE[res] } : { 1: A, 2: STAKE[res], 3: no };   // 欄3（resource）は、帯域幅（0）のとき省かれる
  await sendOp(t, 54, want);                                // 54 ＝ FreezeBalanceV2Contract
}
await showRes(alice.address.base58, "ステーク後");
acc = await tronWeb.trx.getUnconfirmedAccount(alice.address.base58);
for (const x of acc.frozenV2 ?? []) if (x.amount) console.log("ステーク中:", x.type ?? "BANDWIDTH", x.amount, "sun");   // 帯域幅は、type が省かれる
