// increment() を呼ぶ: 組み立て → 点検 → 署名 → アナウンス → 結果の確認
if (typeof checkCall === "undefined") throw new Error("9.5 を先に実行してください");
if (typeof CALL === "undefined") throw new Error("9.5 の取引を、先に作ってください");
selOf = (sig) => tronWeb.sha3(sig, false).slice(0, 8);
readCount = async () => parseInt((await tronWeb.transactionBuilder.triggerConstantContract(counterAddr, "count()", {}, [], alice.address.base58)).constant_result[0], 16);
cnt0 = await readCount();
callRes = await tronWeb.transactionBuilder.triggerSmartContract(counterAddr, "increment()", CALL, [], alice.address.base58);   // 有効期限が60秒なので、ここで作り直す
want = { owner: alice.address.hex.toLowerCase(), contract: counterHex, data: selOf("increment()"), callValue: CALL.callValue, feeLimit: CALL.feeLimit };
ng = await checkCall(callRes.transaction, want);
if (ng.length > 0) throw new Error("点検で問題が見つかったので、署名しません: " + ng.join(" / "));
signed = await tronWeb.trx.sign(structuredClone(callRes.transaction), alice.privateKey);
before = await tronWeb.trx.getUnconfirmedBalance(alice.address.base58);
r = await tronWeb.trx.sendRawTransaction(signed);
console.log("result:", r.result, " txid:", r.txid);
if (!r.result) throw new Error("アナウンスに失敗しました: " + r.code);
callInfo = await showResult(r.txid, before);
callTxid = r.txid;
console.log("--- 結果の読み方 ---");
console.log("contractResult（戻り値）:", JSON.stringify(callInfo.contractResult), "（increment() は、戻り値がない）");
console.log("ログの数 log           :", callInfo.log?.length ?? 0);
lg = callInfo.log?.[0];
if (lg) {
  console.log("  topics[0] の先頭4バイト:", lg.topics[0].slice(0, 8), "（Incremented:", lg.topics[0].slice(0, 8) === "38ac789e", "）");
  console.log("  topics[1]（by）       :", lg.topics[1].slice(-40), "（Alice:", "41" + lg.topics[1].slice(-40) === alice.address.hex.toLowerCase(), "）");
  console.log("  data（newCount）      :", parseInt(lg.data, 16));
}
console.log("エネルギー（合計）     :", callInfo.receipt?.energy_usage_total ?? 0);
cnt1 = await readCount();
console.log("count()                :", cnt0, "→", cnt1);
