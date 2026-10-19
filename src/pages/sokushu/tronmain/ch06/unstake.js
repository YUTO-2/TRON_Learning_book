// 委任を取り戻し、帯域幅のステーク（200 TRX）を解除する。エネルギーのステークは、第9章以降のために残す
if (typeof sendOp === "undefined" || typeof STAKE === "undefined") throw new Error("6.3 と 6.4 を先に実行してください");
if (typeof DELEG === "undefined") throw new Error("6.6 を先に実行してください");
for (const [res, no] of [["BANDWIDTH", 0], ["ENERGY", 1]]) {
  console.log("=== " + res + " の委任を、取り戻す ===");
  const t = await tronWeb.transactionBuilder.undelegateResource(DELEG[res], bob.address.base58, res, alice.address.base58);
  const want = no === 0 ? { 1: A, 3: DELEG[res], 4: Bhex } : { 1: A, 2: no, 3: DELEG[res], 4: Bhex };
  await sendOp(t, 58, want);                                // 58 ＝ UnDelegateResourceContract
}
console.log("=== BANDWIDTH のステーク（200 TRX）を、解除する ===");
u = await tronWeb.transactionBuilder.unfreezeBalanceV2(STAKE.BANDWIDTH, "BANDWIDTH", alice.address.base58);
await sendOp(u, 55, { 1: A, 2: STAKE.BANDWIDTH });                    // 55 ＝ UnfreezeBalanceV2Contract
acc = await tronWeb.trx.getUnconfirmedAccount(alice.address.base58);
for (const x of acc.unfrozenV2 ?? []) console.log("解除待ち:", x.type ?? "BANDWIDTH", x.unfreeze_amount, "sun  引き出せる時刻:", new Date(x.unfreeze_expire_time).toISOString());
cp = Object.fromEntries((await tronWeb.trx.getChainParameters()).map((p) => [p.key, p.value]));
console.log("解除してから引き出せるまでの日数 getUnfreezeDelayDays:", cp.getUnfreezeDelayDays ?? "取得できません");
cnt = await tronWeb.trx.getAvailableUnfreezeCount(alice.address.base58, { confirmed: false });
console.log("あと何回、解除できるか:", cnt.count);
r = await tronWeb.trx.getAccountResources(alice.address.base58);
console.log("帯域幅 NetLimit      :", r.NetLimit ?? 0, "（解除した分の帯域幅は、すぐに無くなる）");
console.log("エネルギー EnergyLimit:", r.EnergyLimit ?? 0, "（ステークを残した分）");
