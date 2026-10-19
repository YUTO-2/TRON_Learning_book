// SDK の contract(): ABI を渡すと、関数が、メソッドになる。読み取りは call()、書き込みは send()
if (typeof COUNTER_ABI === "undefined" || typeof counterAddr === "undefined") throw new Error("8.2 と 8.6 を先に実行してください");
if (typeof showResult === "undefined") throw new Error("第4章の4.7 を先に実行してください");
num = (v) => Number(String(v));                                    // 戻り値の整数は、版によって BigInt などになる。文字にして数へ戻す
cnt = tronWeb.contract(COUNTER_ABI, counterAddr);
console.log("MAX()       :", num(await cnt.MAX().call()));
console.log("count()     :", num(await cnt.count().call()));
console.log("remaining() :", num(await cnt.remaining().call()));
ownerRet = await cnt.owner().call();
console.log("owner()     :", ownerRet, "→ Alice:", String(ownerRet).replace(/^0x/i, "").toLowerCase().slice(-40) === alice.address.hex.slice(2).toLowerCase());

// 書き込み：組み立て・署名・アナウンスが、1回の await で続く（署名の前に、点検を挟めない）
before = await tronWeb.trx.getUnconfirmedBalance(alice.address.base58);
sent = await cnt.increment().send({ feeLimit: 100 * 1000000, callValue: 0 }, alice.privateKey);
txid2 = Array.isArray(sent) ? sent[0] : (sent?.txid ?? sent);
console.log("send() の戻り値（txID）:", txid2);
info2 = await showResult(txid2, before);
console.log("count()     :", num(await cnt.count().call()));
