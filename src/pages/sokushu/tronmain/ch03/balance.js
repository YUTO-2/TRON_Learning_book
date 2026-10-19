// Aliceの残高を調べる
addr = alice.address.base58;
confirmed = await tronWeb.trx.getBalance(addr);              // 確定済みの台帳（solidityノード）
latest = await tronWeb.trx.getUnconfirmedBalance(addr);      // 最新の台帳（未確定を含む。fullノード）
console.log("確定済み(sun):", confirmed, " → TRX:", tronWeb.fromSun(confirmed));
console.log("最新(sun)    :", latest, " → TRX:", tronWeb.fromSun(latest));
