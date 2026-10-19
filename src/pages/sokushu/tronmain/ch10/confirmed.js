// 確定前と確定済み：同じ取引のイベントを、only_unconfirmed と only_confirmed で、見比べ続ける（最大2分）
if (typeof watchTxid === "undefined") throw new Error("10.6 を先に実行してください（watchTxid が必要です）");
sleep = (ms) => new Promise((r) => setTimeout(r, ms));
t0 = Date.now();
done = false;
for (let i = 0; i < 20 && !done; i++) {
  const un = (await evByTx(watchTxid, "?only_unconfirmed=true")).length;   // まだ巻き戻る可能性があるもの
  const cf = (await evByTx(watchTxid, "?only_confirmed=true")).length;     // 確定済み（19人以上のSRが確認。1.13）
  console.log("経過 " + String(Math.round((Date.now() - t0) / 1000)).padStart(3) + "秒   確定前: " + un + " 件   確定済み: " + cf + " 件");
  if (cf > 0) done = true;
  else await sleep(6000);
}
console.log(done ? "確定しました。ここから先は、巻き戻りません" : "2分では確定を確認できませんでした。しばらくしてから、もう一度実行してください");
