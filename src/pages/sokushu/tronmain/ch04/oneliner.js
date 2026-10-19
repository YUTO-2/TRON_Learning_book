// 組み立て・署名・アナウンスを1行にまとめる（2回目の送金）。Bobはもう有効化されているので、手数料が違う
if (typeof showResult === "undefined") throw new Error("4.7 を先に実行してください");
balBefore2 = await tronWeb.trx.getUnconfirmedBalance(alice.address.base58);
result2 = await tronWeb.trx.sendTransaction(bob.address.base58, 2000000, alice.privateKey);   // 2 TRX
console.log("result:", result2.result, " txid:", result2.txid);
await showResult(result2.txid, balBefore2);
