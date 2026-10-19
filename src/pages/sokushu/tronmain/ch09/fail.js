// わざと失敗する取引を送る（Bob が reset() を呼ぶ）。失敗しても、取引は台帳に残り、手数料が焼却される
if (typeof checkCall === "undefined" || typeof callRaw === "undefined") throw new Error("9.4 と 9.5 を先に実行してください");
if (typeof bob === "undefined") throw new Error("第4章の4.2を先に実行してください");
selOf = (sig) => tronWeb.sha3(sig, false).slice(0, 8);
bobHex = bob.address.hex.toLowerCase();
hexText = (h) => new TextDecoder().decode(hexToU8(h ?? ""));
readCount = async () => parseInt((await callRaw(selOf("count()"))).constant_result[0], 16);
waitInfo = async (txid) => {                                       // ブロックに入るまで待つ（showResult と同じ待ち方）
  let info = {};
  for (let i = 0; i < 10 && !info.blockNumber; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    info = await tronWeb.fullNode.request("wallet/gettransactioninfobyid", { value: txid }, "post");
  }
  return info;
};
FAILCALL = { feeLimit: 10 * 1000000, callValue: 0 };               // 失敗してもよい練習なので、上限を 10 TRX に下げる
cnt0 = await readCount();
res = await tronWeb.transactionBuilder.triggerSmartContract(counterAddr, "reset()", FAILCALL, [], bob.address.base58);
console.log("result（ノードの答え）:", JSON.stringify(res.result), "← 取引を作れただけで、実行はまだ");
ng = await checkCall(res.transaction, { owner: bobHex, contract: counterHex, data: selOf("reset()"), callValue: 0, feeLimit: FAILCALL.feeLimit });
if (ng.length > 0) throw new Error("点検で問題が見つかったので、署名しません: " + ng.join(" / "));
signed = await tronWeb.trx.sign(structuredClone(res.transaction), bob.privateKey);
bobBefore = await tronWeb.trx.getUnconfirmedBalance(bob.address.base58);
r = await tronWeb.trx.sendRawTransaction(signed);
console.log("アナウンス result:", r.result, " txid:", r.txid, "← 受け付けられただけ");
if (!r.result) throw new Error("アナウンスに失敗しました: " + r.code);
failInfo = await waitInfo(r.txid);
if (!failInfo.blockNumber) throw new Error("30秒待っても、ブロックに入りません");
t2 = await tronWeb.fullNode.request("wallet/gettransactionbyid", { value: r.txid }, "post");
console.log("実行結果 contractRet :", t2.ret?.[0]?.contractRet);
console.log("info.result          :", failInfo.result, " receipt.result:", failInfo.receipt?.result);
console.log("resMessage（文字）   :", hexText(failInfo.resMessage));
rv = failInfo.contractResult?.[0] ?? "";
console.log("contractResult の先頭:", rv.slice(0, 8), rv.slice(0, 8) === selOf("Error(string)") ? "→ Error(string)" : "");
if (rv.slice(0, 8) === selOf("Error(string)")) console.log("理由                 :", tronWeb.utils.abi.decodeParams([], ["string"], "0x" + rv.slice(8))[0]);
console.log("エネルギー（合計）   :", failInfo.receipt?.energy_usage_total ?? 0, " うち焼却 energy_fee:", failInfo.receipt?.energy_fee ?? 0, "sun");
console.log("手数料 fee           :", failInfo.fee ?? 0, "sun（失敗しても、使った分は焼却される）");
bobAfter = await tronWeb.trx.getUnconfirmedBalance(bob.address.base58);
console.log("Bobの残高の減り      :", bobBefore - bobAfter, "sun");
console.log("count()              :", cnt0, "→", await readCount(), "（失敗した取引は、状態を変えない）");
