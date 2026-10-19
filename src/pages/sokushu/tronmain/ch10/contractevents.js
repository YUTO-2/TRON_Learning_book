// コントラクトごとに、イベントを探す。ページをめくり、名前で絞り、発行した人ごとに数え、イベントから count を組み立て直す
if (typeof getJson === "undefined" || typeof h20 === "undefined") throw new Error("10.3 と 10.4 を先に実行してください");
getAll = async (addr, q = "") => {                                       // 続きがあれば、fingerprint をつけて、取り切る
  const out = [];
  let fp = "";
  for (let page = 0; page < 20; page++) {
    const j = await getJson("/v1/contracts/" + addr + "/events?limit=200&" + q + (fp ? "&fingerprint=" + fp : ""));
    out.push(...(j.data ?? []));
    fp = j.meta?.fingerprint ?? "";
    if (!fp) break;
  }
  return out;
};
ORDER = "order_by=block_timestamp,asc";                                  // 古い順
all = await getAll(counterAddr, ORDER);
console.log("全イベント:", all.length, "件");
tally = {};
for (const e of all) tally[e.event_name] = (tally[e.event_name] ?? 0) + 1;
console.log("名前ごと  :", JSON.stringify(tally));
for (const e of all) {
  console.log(String(e.block_number), new Date(e.block_timestamp).toISOString(), e.event_name.padEnd(12), "tx:", e.transaction_id.slice(0, 12) + "…", " by:", e.result.by === undefined ? "" : h20(e.result.by).slice(0, 8) + "…", " newCount:", e.result.newCount ?? "-");
}
console.log("--- 名前で絞る（event_name=Incremented） ---");
inc = await getAll(counterAddr, "event_name=Incremented&" + ORDER);
console.log("Incremented:", inc.length, "件");
console.log("--- 発行した人ごと（by で数える。by は indexed だが、絞り込みはサーバーではなく、手元で行う） ---");
mineCnt = inc.filter((e) => h20(e.result.by) === h20(alice.address.base58)).length;
console.log("Alice:", mineCnt, "件  それ以外:", inc.length - mineCnt, "件");
console.log("--- イベントから、count を組み立て直す ---");
replay = 0;
for (const e of all) {
  if (e.event_name === "Incremented") replay = Number(e.result.newCount);
  else if (e.event_name === "Reset") replay = 0;
}
nowCount = parseInt((await tronWeb.transactionBuilder.triggerConstantContract(counterAddr, "count()", {}, [], alice.address.base58)).constant_result[0], 16);
console.log("イベントから:", replay, "  count() の読み取り:", nowCount, "  一致:", replay === nowCount);
