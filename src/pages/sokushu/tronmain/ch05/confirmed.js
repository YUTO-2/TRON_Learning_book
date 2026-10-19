// 確定済みの台帳で、入金を確かめる（商品を渡す前の確認）。宛先と量は、JSONではなくバイト列から読む
if (typeof decodeTx === "undefined") throw new Error("5.2 を先に実行してください");
async function confirmPayment(txid, expect) {
  for (let i = 0; i < 24; i++) {                       // 5秒おきに、最大2分待つ
    const t = await tronWeb.solidityNode.request("walletsolidity/gettransactionbyid", { value: txid }, "post");
    if (t.txID === txid) {
      const d = decodeTx(t.raw_data_hex);
      const checks = [
        ["実行結果が SUCCESS", t.ret?.[0]?.contractRet === "SUCCESS"],
        ["種類が TransferContract", d.type === 1],
        ["宛先が、受け取る側（Bob）", d.to === expect.to],
        ["量が、足りている", d.amount >= expect.amount],
        ["txID ＝ SHA-256(raw_data_hex)", (await sha256hex(t.raw_data_hex)) === txid],
      ];
      for (const c of checks) console.log(c[1] ? "OK  " : "NG  ", c[0]);
      return checks.every((c) => c[1]);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  console.log("2分待っても、確定済みの台帳に入りません");
  return false;
}
if (typeof safeTxid === "undefined") throw new Error("5.5 を先に実行してください");
okPay = await confirmPayment(safeTxid, { to: bob.address.hex.toLowerCase(), amount: 1000000 });
console.log("入金確認:", okPay ? "OK（確定済み）" : "NG");
