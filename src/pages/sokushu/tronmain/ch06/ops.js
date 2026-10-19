// ステーク・委任などの取引を、署名の前に点検して、署名して送る関数（5.3 の checkTx を、送金以外の取引へ広げたもの）
if (typeof readPb === "undefined" || typeof showResult === "undefined") throw new Error("5.2 と、第4章の4.7 を先に実行してください");
// t: 取引、typeNo: 取引の種類の番号、want: 頼んだ内容（契約の欄の番号 → 値。送り主は 1 番の欄）
checkOp = async (t, typeNo, want) => {
  const ng = [];
  const ok = (cond, label) => { console.log((cond ? "OK  " : "NG  ") + label); if (!cond) ng.push(label); };
  const get = (list, no) => list.find((x) => x[0] === no)?.[1];
  const f = readPb(hexToU8(t.raw_data_hex));                  // 点検するのは、JSONの表示ではなく、バイト列
  const c = readPb(get(f, 11));
  const any = readPb(get(c, 2));
  const got = Object.fromEntries(readPb(get(any, 2)).map(([no, v]) => [no, typeof v === "bigint" ? Number(v) : u8hex(v)]));
  ok((await sha256hex(t.raw_data_hex)) === t.txID, "txID ＝ SHA-256(raw_data_hex)");
  ok(Number(get(c, 1) ?? 0n) === typeNo, "種類が、頼んだ操作（" + typeNo + "）");
  ok(JSON.stringify(got) === JSON.stringify(want), "契約の中身が、頼んだとおり");
  ok(f.map((x) => x[0]).join() === "1,4,8,11,14", "欄が、5つだけ（余計な欄がない）");
  const exp = Number(get(f, 8));
  ok(exp > Date.now() && exp < Date.now() + 90000, "有効期限が、これから約60秒以内");
  const latest = (await tronWeb.trx.getCurrentBlock()).block_header.raw_data.number;
  const back = (((latest - parseInt(u8hex(get(f, 1)), 16)) % 65536) + 65536) % 65536;
  const blk = await tronWeb.trx.getBlockByNumber(latest - back);
  ok(back <= 1000 && blk.blockID.slice(16, 32) === u8hex(get(f, 4)), "参照ブロックが、このチェーンの最近のブロック（" + back + "ブロック前）");
  console.log(ng.length === 0 ? "→ 点検を通りました。署名してよい取引です" : "→ " + ng.length + "件の問題があります。署名してはいけません");
  return ng;
};
// 点検 → 署名 → アナウンス → 結果の確認
sendOp = async (t, typeNo, want) => {
  const ng = await checkOp(t, typeNo, want);
  if (ng.length > 0) throw new Error("点検で問題が見つかったので、署名しません: " + ng.join(" / "));
  const signed = await tronWeb.trx.sign(structuredClone(t), alice.privateKey);
  const before = await tronWeb.trx.getUnconfirmedBalance(alice.address.base58);
  const r = await tronWeb.trx.sendRawTransaction(signed);
  console.log("result:", r.result, " txid:", r.txid);
  if (!r.result) throw new Error("アナウンスに失敗しました: " + r.code);
  return showResult(r.txid, before);
};
console.log("checkOp と sendOp を定義しました");
