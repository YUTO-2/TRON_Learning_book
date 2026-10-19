// 取引がブロックに入るまで待って、結果・手数料・Aliceの残高の変化を表示する関数
async function showResult(txid, before) {
  let info = {};
  for (let i = 0; i < 10 && !info.blockNumber; i++) {   // 3秒おきに、最大30秒待つ
    await new Promise((r) => setTimeout(r, 3000));
    info = await tronWeb.fullNode.request("wallet/gettransactioninfobyid", { value: txid }, "post");
  }
  if (!info.blockNumber) { console.log("30秒待っても、ブロックに入りません（有効期限が切れて、破棄された可能性があります）"); return info; }
  const t = await tronWeb.fullNode.request("wallet/gettransactionbyid", { value: txid }, "post");
  console.log("実行結果 contractRet :", t.ret?.[0]?.contractRet);
  console.log("入ったブロック       :", info.blockNumber, " 時刻:", new Date(info.blockTimeStamp).toISOString());
  console.log("手数料 fee           :", info.fee ?? 0, "sun（焼却された合計）");
  console.log("帯域幅 net_usage     :", info.receipt?.net_usage ?? 0, "バイト（無料枠・ステークから）");
  console.log("帯域幅 net_fee       :", info.receipt?.net_fee ?? 0, "sun（TRXを焼却して払った分）");
  const after = await tronWeb.trx.getUnconfirmedBalance(alice.address.base58);
  console.log("Aliceの残高の減り    :", before - after, "sun =", tronWeb.fromSun(before - after), "TRX");
  return info;
}
if (typeof result === "undefined" || !result.txid) throw new Error("4.6 を先に実行してください");
await showResult(result.txid, balBefore);
