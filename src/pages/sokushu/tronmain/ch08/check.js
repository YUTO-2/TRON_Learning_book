// デプロイの取引を、署名の前に点検する関数（5.3・6.2 の点検を、コントラクトの作成へ広げたもの）
if (typeof readPb === "undefined" || typeof showResult === "undefined") throw new Error("5.2 と、第4章の4.7 を先に実行してください");
// t: 取引、want: 頼んだ内容（owner、bytecode は16進、ほかはDEPLOYと同じ名前）
checkDeploy = async (t, want) => {
  const ng = [];
  const ok = (cond, label) => { console.log((cond ? "OK  " : "NG  ") + label); if (!cond) ng.push(label); };
  const get = (list, no) => list.find((x) => x[0] === no)?.[1];
  const none = new Uint8Array();
  const f = readPb(hexToU8(t.raw_data_hex));                  // 点検するのは、JSONの表示ではなく、バイト列
  const c = readPb(get(f, 11));
  const cc = readPb(get(readPb(get(c, 2)), 2));               // CreateSmartContract：欄1 送り主、欄2 コントラクトの定義
  const sc = readPb(get(cc, 2));                              // コントラクトの定義：欄1 作成者、欄2 アドレス、欄3 ABI、欄4 バイトコード …
  const num = (no) => Number(get(sc, no) ?? 0n);
  ok((await sha256hex(t.raw_data_hex)) === t.txID, "txID ＝ SHA-256(raw_data_hex)");
  ok(Number(get(c, 1) ?? 0n) === 30, "種類が、コントラクトの作成（30）");
  ok(u8hex(get(cc, 1) ?? none) === want.owner && u8hex(get(sc, 1) ?? none) === want.owner, "送り主と作成者が、Alice");
  ok(u8hex(get(sc, 4) ?? none) === want.bytecode, "バイトコードが、頼んだものと同じ");
  ok(num(5) === want.callValue, "callValue が、頼んだとおり（" + want.callValue + "）");
  ok(num(6) === want.userFeePercentage, "userFeePercentage が、頼んだとおり（" + want.userFeePercentage + "）");
  ok(num(8) === want.originEnergyLimit, "originEnergyLimit が、頼んだとおり（" + want.originEnergyLimit + "）");
  ok(new TextDecoder().decode(get(sc, 7) ?? none) === want.name, "名前が、頼んだとおり（" + want.name + "）");
  ok(get(sc, 2) === undefined, "アドレスの欄が、空（アドレスは、txID から決まる）");
  ok(sc.every((x) => [1, 3, 4, 5, 6, 7, 8].includes(x[0])), "コントラクトの定義に、想定外の欄がない");
  ok(Number(get(f, 18) ?? 0n) === want.feeLimit, "fee_limit が、頼んだとおり（" + want.feeLimit + " sun）");
  ok(f.map((x) => x[0]).join() === "1,4,8,11,14,18", "取引の欄が、6つだけ（18 は fee_limit）");
  const exp = Number(get(f, 8));
  ok(exp > Date.now() && exp < Date.now() + 90000, "有効期限が、これから約60秒以内");
  const latest = (await tronWeb.trx.getCurrentBlock()).block_header.raw_data.number;
  const back = (((latest - parseInt(u8hex(get(f, 1)), 16)) % 65536) + 65536) % 65536;
  const blk = await tronWeb.trx.getBlockByNumber(latest - back);
  ok(back <= 1000 && blk.blockID.slice(16, 32) === u8hex(get(f, 4)), "参照ブロックが、このチェーンの最近のブロック（" + back + "ブロック前）");
  // ABI は、実行には使われない（台帳に残る説明）。名前の一覧だけ、見えるようにする
  const names = readPb(get(sc, 3) ?? none).filter((x) => x[0] === 1).map((x) => new TextDecoder().decode(get(readPb(x[1]), 4) ?? none) || "(constructor)");
  console.log("参考  ABIの項目:", names.join(", "));
  console.log(ng.length === 0 ? "→ 点検を通りました。署名してよい取引です" : "→ " + ng.length + "件の問題があります。署名してはいけません");
  return ng;
};
console.log("checkDeploy を定義しました");
