// ポーリング：決まった間隔で問い合わせ、まだ見ていないイベントだけを処理する。途中で increment() を1回送り、拾えるかを見る
if (typeof getAll === "undefined" || typeof checkCall === "undefined" || typeof CALL === "undefined") throw new Error("9.5 と、10.5 を先に実行してください");
selOf = (sig) => tronWeb.sha3(sig, false).slice(0, 8);
sleep = (ms) => new Promise((r) => setTimeout(r, ms));
remain = parseInt((await tronWeb.transactionBuilder.triggerConstantContract(counterAddr, "remaining()", {}, [], alice.address.base58)).constant_result[0], 16);
if (remain === 0) throw new Error("count が上限（MAX）です。Alice が reset() を呼んでから、やり直してください");

// 1. 監視の起点：いまあるイベントは、見たことにする
seen = new Set();                                                         // 処理済み（txID + event_index）
evKey = (e) => e.transaction_id + ":" + e.event_index;
baseline = await getAll(counterAddr, "order_by=block_timestamp,asc");
baseline.forEach((e) => seen.add(evKey(e)));
cursor = baseline.length ? Math.max(...baseline.map((e) => e.block_timestamp)) : Date.now() - 60000;   // これ以降のものだけを、問い合わせる
console.log("起点：既存のイベント", baseline.length, "件を、見たことにしました");

// 2. 1回の問い合わせ：cursor 以降のうち、まだ見ていないものを返す
poll = async () => {
  const rows = await getAll(counterAddr, "order_by=block_timestamp,asc&min_block_timestamp=" + cursor);
  const fresh = [];
  for (const e of rows) {
    if (seen.has(evKey(e))) continue;                                     // cursor と同じ時刻のものは、重なって返る。重複を除く
    seen.add(evKey(e));
    fresh.push(e);
    cursor = Math.max(cursor, e.block_timestamp);
  }
  return fresh;
};

// 3. 監視しながら、increment() を1回送る（9.6 と同じ。点検 → 署名 → アナウンス）
res = await tronWeb.transactionBuilder.triggerSmartContract(counterAddr, "increment()", CALL, [], alice.address.base58);
ng = await checkCall(res.transaction, { owner: alice.address.hex.toLowerCase(), contract: counterHex, data: selOf("increment()"), callValue: CALL.callValue, feeLimit: CALL.feeLimit });
if (ng.length > 0) throw new Error("点検で問題が見つかったので、署名しません: " + ng.join(" / "));
signed = await tronWeb.trx.sign(structuredClone(res.transaction), alice.privateKey);
t0 = Date.now();
r = await tronWeb.trx.sendRawTransaction(signed);
if (!r.result) throw new Error("アナウンスに失敗しました: " + r.code);
watchTxid = r.txid;
console.log("送りました txid:", watchTxid.slice(0, 12) + "…  監視を始めます（3秒おき。最大45秒）");

// 4. 3秒おきに問い合わせる（ブロックは約3秒おき）
found = false;
for (let i = 1; i <= 15 && !found; i++) {
  await sleep(3000);
  const fresh = await poll();
  console.log("経過 " + Math.round((Date.now() - t0) / 1000) + "秒  問い合わせ " + i + " 回目  新しいイベント:", fresh.length, "件");
  for (const e of fresh) {
    console.log("   →", e.event_name, "newCount =", e.result.newCount, " ブロック", e.block_number, e.transaction_id === watchTxid ? " ← 送った取引" : "");
    if (e.transaction_id === watchTxid) found = true;
  }
}
console.log(found ? "拾えました" : "45秒では見つかりませんでした。ブロックに入ったか（4.7の showResult）を確かめてください");
