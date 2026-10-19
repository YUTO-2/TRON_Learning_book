// 取引の結果の log を、手で読む。ABIのイベントと引き合わせて、topics と data を、値に戻す
if (typeof callTxid === "undefined") throw new Error("9.6 を先に実行してください（callTxid が必要です）");
if (typeof COUNTER_ABI === "undefined" || typeof counterHex === "undefined") throw new Error("8.2 と 8.6 を先に実行してください");
topicOf = (sig) => tronWeb.sha3(sig, false);                                   // イベントの目印（署名のKeccak-256。32バイト全体）
h20 = (v) => /^T/.test(v) ? tronWeb.address.toHex(v).slice(-40).toLowerCase() : String(v).toLowerCase().slice(-40);   // アドレスの形をそろえる（下位20バイト）
EVENTS = COUNTER_ABI.filter((x) => x.type === "event").map((ev) => {
  const sig = ev.name + "(" + ev.inputs.map((x) => x.type).join(",") + ")";    // 型だけを並べる（名前と indexed は入れない）
  return { ...ev, sig, topic: topicOf(sig) };
});
decodeLog = (lg) => {
  const ev = EVENTS.find((e) => e.topic === lg.topics[0]);                     // topics[0] で、どのイベントかが決まる
  if (!ev) return null;
  const words = lg.data.match(/.{64}/g) ?? [];                                 // data は、32バイト（64文字）ずつ
  let ti = 1, di = 0;
  const args = {};
  for (const inp of ev.inputs) {
    const w = inp.indexed ? lg.topics[ti++] : words[di++];                     // indexed は topics に、そうでないものは data に、宣言の順に並ぶ
    args[inp.name] = inp.type === "address" ? tronWeb.address.fromHex("41" + w.slice(-40))
      : inp.type === "bool" ? BigInt("0x" + w) === 1n
      : inp.type.startsWith("uint") ? BigInt("0x" + w) : "0x" + w;             // string・bytes・配列などは、この章では読まない
  }
  return { name: ev.name, sig: ev.sig, args };
};
console.log("--- ABIのイベント（目印の先頭4バイト） ---");
EVENTS.forEach((e) => console.log(e.sig.padEnd(30), e.topic.slice(0, 8)));

info = await tronWeb.fullNode.request("wallet/gettransactioninfobyid", { value: callTxid }, "post");
console.log("--- 取引", callTxid.slice(0, 8) + "… の log ---");
console.log("ログの数:", info.log?.length ?? 0);
for (const [i, lg] of (info.log ?? []).entries()) {
  console.log("log[" + i + "] address（発行したコントラクト）:", lg.address, "（Counter:", lg.address === counterHex.slice(2), "）");
  lg.topics.forEach((t, j) => console.log("  topics[" + j + "]:", t));
  console.log("  data      :", lg.data || "（空）");
  const d = decodeLog(lg);
  if (!d) { console.log("  → ABIにないイベントです"); continue; }
  console.log("  →", d.sig);
  for (const [k, v] of Object.entries(d.args)) console.log("     " + k + " =", String(v));
  if (d.args.by) console.log("  by は Alice:", d.args.by === alice.address.base58);
}
