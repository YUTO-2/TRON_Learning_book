// TronGrid の v1 で、取引ごとのイベントを取る。10.3 の手読みと比べる。失敗した取引には、イベントが無い
if (typeof decodeLog === "undefined") throw new Error("10.3 を先に実行してください");
getJson = async (path) => {                                              // TronGrid（Nile）に GET して、JSON を返す
  const r = await fetch(NILE + path);
  if (!r.ok) throw new Error("HTTP " + r.status + "  " + path);
  return r.json();
};
evByTx = async (txid, q = "") => (await getJson("/v1/transactions/" + txid + "/events" + q)).data ?? [];
rows = await evByTx(callTxid);
console.log("件数:", rows.length);
console.log("そのままの形（1件目）:", JSON.stringify(rows[0]));
for (const e of rows) {
  console.log("--- " + e.event_name + " ---");
  console.log("event（署名）  :", e.event, " event_index:", e.event_index);
  console.log("ブロック       :", e.block_number, new Date(e.block_timestamp).toISOString());
  console.log("コントラクト   :", e.contract_address, "（Counter:", h20(e.contract_address) === counterHex.slice(2), "）");
  console.log("by             :", e.result.by, " newCount:", e.result.newCount);
}
lg0 = (await tronWeb.fullNode.request("wallet/gettransactioninfobyid", { value: callTxid }, "post")).log?.[0];
mine = lg0 ? decodeLog(lg0) : null;                                      // 10.3 の手読み
if (mine && rows[0]) {
  console.log("--- 手読みとの照合 ---");
  console.log("イベント名 :", mine.name === rows[0].event_name);
  console.log("by         :", h20(mine.args.by) === h20(rows[0].result.by));
  console.log("newCount   :", String(mine.args.newCount) === String(rows[0].result.newCount));
}
if (typeof failInfo !== "undefined" && failInfo.id) {                    // 9.7 で、Bob が失敗させた取引
  console.log("--- 失敗した取引（9.7） ---");
  console.log("contractRet が REVERT の取引のイベント:", (await evByTx(failInfo.id)).length, "件");
}
