// Counter をNileにデプロイする: 組み立て → 点検 → 署名 → アナウンス → 結果の確認
if (typeof checkDeploy === "undefined") throw new Error("8.5 を先に実行してください");
if (typeof DEPLOY === "undefined") throw new Error("8.4 を先に実行してください");
t = await tronWeb.transactionBuilder.createSmartContract({ abi: COUNTER_ABI, bytecode: COUNTER_BC, parameters: [], ...DEPLOY }, alice.address.base58);   // 有効期限が60秒なので、ここで作り直す
want = { owner: alice.address.hex.toLowerCase(), bytecode: COUNTER_BC, ...DEPLOY };
ng = await checkDeploy(t, want);
if (ng.length > 0) throw new Error("点検で問題が見つかったので、署名しません: " + ng.join(" / "));
expectHex = t.contract_address.toLowerCase();                       // 送る前に分かっているアドレス（8.4）
signed = await tronWeb.trx.sign(structuredClone(t), alice.privateKey);
before = await tronWeb.trx.getUnconfirmedBalance(alice.address.base58);
r = await tronWeb.trx.sendRawTransaction(signed);
console.log("result:", r.result, " txid:", r.txid);
if (!r.result) throw new Error("アナウンスに失敗しました: " + r.code);
deployInfo = await showResult(r.txid, before);
counterTxid = r.txid;
counterHex = expectHex;                                             // 第9章以降で使う
counterAddr = tronWeb.address.fromHex(counterHex);
console.log("Counter のアドレス:", counterAddr);
