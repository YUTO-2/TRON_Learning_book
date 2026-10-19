// 再読み込みの後に、同じAliceに戻す（控えておいた秘密鍵を貼って実行する）
alicePriv = "（ここにAliceの秘密鍵を貼る）";
if (!/^[0-9a-fA-F]{64}$/.test(alicePriv)) throw new Error("秘密鍵（16進で64桁）に書き換えてから実行してください");
aliceAddr = tronWeb.address.fromPrivateKey(alicePriv);
alice = { privateKey: alicePriv, address: { base58: aliceAddr, hex: tronWeb.address.toHex(aliceAddr) } };
console.log("復元:", alice.address.base58);
