// 点検してから署名して送る: 組み立て → 点検 → 署名 → アナウンス → 結果の確認
if (typeof checkTx === "undefined" || typeof showResult === "undefined") throw new Error("5.3 と、第4章の4.7 を先に実行してください");
async function safeSend(to, amount) {
  const t = await tronWeb.transactionBuilder.sendTrx(to, amount, alice.address.base58);
  const want = { from: alice.address.hex.toLowerCase(), to: tronWeb.address.toHex(to).toLowerCase(), amount };
  const ng = await checkTx(t, want);
  if (ng.length > 0) throw new Error("点検で問題が見つかったので、署名しません: " + ng.join(" / "));
  const signed = await tronWeb.trx.sign(structuredClone(t), alice.privateKey);
  const before = await tronWeb.trx.getUnconfirmedBalance(alice.address.base58);
  const r = await tronWeb.trx.sendRawTransaction(signed);
  console.log("result:", r.result, " txid:", r.txid);
  if (!r.result) throw new Error("アナウンスに失敗しました: " + r.code);
  await showResult(r.txid, before);
  return r.txid;
}
safeTxid = await safeSend(bob.address.base58, 1000000);
