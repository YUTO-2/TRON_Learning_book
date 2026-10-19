// 解除の待ち時間が過ぎたTRXを、引き出す（待ち時間の前に実行しても、何も起きない）
if (typeof sendOp === "undefined" || typeof A === "undefined") throw new Error("6.3 と 6.4 を先に実行してください");
can = await tronWeb.trx.getCanWithdrawUnfreezeAmount(alice.address.base58, Date.now(), { confirmed: false });
console.log("いま引き出せる量:", can.amount ?? 0, "sun");
if (!can.amount) {
  console.log("まだ引き出せるTRXがありません。待ち時間が過ぎてから、もう一度実行してください");
} else {
  w = await tronWeb.transactionBuilder.withdrawExpireUnfreeze(alice.address.base58);
  await sendOp(w, 56, { 1: A });                            // 56 ＝ WithdrawExpireUnfreezeContract
  console.log("引き出し後の残高:", await tronWeb.trx.getUnconfirmedBalance(alice.address.base58), "sun");
}
