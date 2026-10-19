// Bob（送金の相手）を作り、送る前のAliceの残高と、Bobが台帳にいないことを確かめる
if (typeof alice === "undefined") throw new Error("第3章の3.2で、Aliceを作ってください");
bob = await tronWeb.createAccount();
console.log("Bob            :", bob.address.base58);
accBob = await tronWeb.trx.getUnconfirmedAccount(bob.address.base58);
console.log("Bobは台帳にいるか:", Object.keys(accBob).length > 0);
balAlice = await tronWeb.trx.getUnconfirmedBalance(alice.address.base58);
console.log("Aliceの残高    :", balAlice, "sun → TRX:", tronWeb.fromSun(balAlice));
if (balAlice < 5000000) throw new Error("Aliceの残高が足りません（5 TRX以上が必要）。第3章の3.5で、フォーセットから受け取ってください");
