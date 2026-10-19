// 署名の前の点検: 取引が、頼んだとおりのものかを確かめる関数
if (typeof decodeTx === "undefined") throw new Error("5.2 を先に実行してください");
checkTx = async (t, expect) => {
  const ng = [];
  const ok = (cond, label) => { console.log((cond ? "OK  " : "NG  ") + label); if (!cond) ng.push(label); };
  const d = decodeTx(t.raw_data_hex);                 // 点検するのは、JSONの表示ではなく、バイト列
  ok((await sha256hex(t.raw_data_hex)) === t.txID, "txID ＝ SHA-256(raw_data_hex)");
  ok(d.type === 1, "種類が TransferContract");
  ok(d.from === expect.from, "送り主が、頼んだとおり");
  ok(d.to === expect.to, "宛先が、頼んだとおり");
  ok(d.amount === expect.amount, "量が、頼んだとおり");
  ok(d.fields.join() === "1,4,8,11,14", "欄が、5つだけ（余計な欄がない）");
  const j = t.raw_data.contract[0].parameter.value;
  ok(j.to_address === d.to && j.owner_address === d.from && j.amount === d.amount, "JSONの表示が、バイト列と同じ");
  ok(d.expiration > Date.now() && d.expiration < Date.now() + 90000, "有効期限が、これから約60秒以内");
  const latest = (await tronWeb.trx.getCurrentBlock()).block_header.raw_data.number;
  const back = (((latest - parseInt(d.refBytes, 16)) % 65536) + 65536) % 65536;   // 下位2バイトが同じ、最新のブロックまでの距離
  const blk = await tronWeb.trx.getBlockByNumber(latest - back);
  ok(back <= 1000 && blk.blockID.slice(16, 32) === d.refHash, "参照ブロックが、このチェーンの最近のブロック（" + back + "ブロック前）");
  console.log(ng.length === 0 ? "→ 点検を通りました。署名してよい取引です" : "→ " + ng.length + "件の問題があります。署名してはいけません");
  return ng;
};
expect = { from: alice.address.hex.toLowerCase(), to: bob.address.hex.toLowerCase(), amount: 1000000 };   // 頼んだ内容
tx = await newTx();
await checkTx(tx, expect);
