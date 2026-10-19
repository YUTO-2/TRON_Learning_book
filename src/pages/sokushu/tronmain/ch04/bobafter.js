// Bobが有効化されて、1 TRXを受け取ったことを確かめる
accBob = await tronWeb.trx.getUnconfirmedAccount(bob.address.base58);
console.log("Bobは台帳にいるか:", Object.keys(accBob).length > 0);
console.log("Bobの残高(sun)   :", accBob.balance ?? 0, " → TRX:", tronWeb.fromSun(accBob.balance ?? 0));
console.log("Bobの作成時刻    :", accBob.create_time ? new Date(accBob.create_time).toISOString() : "—");
