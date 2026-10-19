// ステークで得たリソースを、Bobに委任する（それぞれ50 TRX分。委任できる上限が小さければ、その量）
if (typeof sendOp === "undefined" || typeof showRes === "undefined") throw new Error("6.2 と 6.3 を先に実行してください");
if (typeof STAKE === "undefined") throw new Error("6.4 を先に実行してください");
DELEG = {};                                                  // 委任する量（sun）
for (const res of ["BANDWIDTH", "ENERGY"]) {
  const m = await tronWeb.trx.getCanDelegatedMaxSize(alice.address.base58, res, { confirmed: false });
  DELEG[res] = Math.min(50 * 1000000, m.max_size ?? 0);
  console.log("委任できる上限", res, ":", m.max_size ?? 0, "sun → 委任する量:", DELEG[res], "sun");
  if (DELEG[res] < 1000000) throw new Error(res + " を委任できる量が、1 TRX未満です（6.9 を見てください）");
}
Bhex = bob.address.hex.toLowerCase();
await showRes(bob.address.base58, "委任前のBob");
for (const [res, no] of [["BANDWIDTH", 0], ["ENERGY", 1]]) {
  console.log("=== " + res + " を、Bobに委任する ===");
  const t = await tronWeb.transactionBuilder.delegateResource(DELEG[res], bob.address.base58, res, alice.address.base58);
  const want = no === 0 ? { 1: A, 3: DELEG[res], 4: Bhex } : { 1: A, 2: no, 3: DELEG[res], 4: Bhex };   // 欄2（resource）は、帯域幅（0）のとき省かれる
  await sendOp(t, 57, want);                                // 57 ＝ DelegateResourceContract
}
await showRes(bob.address.base58, "委任後のBob");
await showRes(alice.address.base58, "委任後のAlice");
dr = await tronWeb.trx.getDelegatedResourceV2(alice.address.base58, bob.address.base58, { confirmed: false });
for (const x of dr.delegatedResource ?? []) console.log("委任の記録: 帯域幅", x.frozen_balance_for_bandwidth ?? 0, "sun  エネルギー", x.frozen_balance_for_energy ?? 0, "sun");
