// ステークした帯域幅が、無料枠より先に使われることを確かめる（1 TRXの送金で、前後のリソースを比べる）
if (typeof safeSend === "undefined") throw new Error("5.5 を先に実行してください");
r0 = await tronWeb.trx.getAccountResources(alice.address.base58);
await safeSend(bob.address.base58, 1000000);
r1 = await tronWeb.trx.getAccountResources(alice.address.base58);
console.log("ステークした帯域幅の使用 NetUsed     :", r0.NetUsed ?? 0, "→", r1.NetUsed ?? 0);
console.log("無料の帯域幅の使用       freeNetUsed :", r0.freeNetUsed ?? 0, "→", r1.freeNetUsed ?? 0);
console.log("エネルギーの使用         EnergyUsed  :", r0.EnergyUsed ?? 0, "→", r1.EnergyUsed ?? 0);
