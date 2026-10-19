// 関数を呼ぶ取引を、署名の前に点検する関数（8.5 の checkDeploy を、コントラクトの呼び出しへ広げたもの）
if (typeof readPb === "undefined" || typeof showResult === "undefined") throw new Error("5.2 と、第4章の4.7 を先に実行してください");
if (typeof COUNTER_ABI === "undefined") throw new Error("8.2 を先に実行してください");
// t: 取引、want: 頼んだ内容（owner・contract は41付きの16進、data は16進、callValue・feeLimit は数）
checkCall = async (t, want) => {
  const ng = [];
  const ok = (cond, label) => { console.log((cond ? "OK  " : "NG  ") + label); if (!cond) ng.push(label); };
  const get = (list, no) => list.find((x) => x[0] === no)?.[1];
  const none = new Uint8Array();
  const f = readPb(hexToU8(t.raw_data_hex));                  // 点検するのは、JSONの表示ではなく、バイト列
  const c = readPb(get(f, 11));
  const any = readPb(get(c, 2));
  const tc = readPb(get(any, 2));                             // TriggerSmartContract：欄1 送り主、欄2 コントラクト、欄3 call_value、欄4 data
  const data = u8hex(get(tc, 4) ?? none);
  ok((await sha256hex(t.raw_data_hex)) === t.txID, "txID ＝ SHA-256(raw_data_hex)");
  ok(Number(get(c, 1) ?? 0n) === 31, "種類が、コントラクトの呼び出し（31）");
  ok(new TextDecoder().decode(get(any, 1) ?? none).endsWith("protocol.TriggerSmartContract"), "型の名前が、TriggerSmartContract");
  ok(u8hex(get(tc, 1) ?? none) === want.owner, "送り主が、頼んだアカウント");
  ok(u8hex(get(tc, 2) ?? none) === want.contract, "呼び先が、頼んだコントラクト");
  ok(data === want.data, "data が、頼んだとおり（" + want.data + "）");
  ok(Number(get(tc, 3) ?? 0n) === want.callValue, "call_value が、頼んだとおり（" + want.callValue + "）");
  ok(tc.every((x) => [1, 2, 3, 4].includes(x[0])), "呼び出しの定義に、想定外の欄がない（トークンの欄 5・6 が無い）");
  ok(Number(get(f, 18) ?? 0n) === want.feeLimit, "fee_limit が、頼んだとおり（" + want.feeLimit + " sun）");
  ok(f.map((x) => x[0]).join() === "1,4,8,11,14,18", "取引の欄が、6つだけ（18 は fee_limit）");
  const exp = Number(get(f, 8));
  ok(exp > Date.now() && exp < Date.now() + 90000, "有効期限が、これから約60秒以内");
  const latest = (await tronWeb.trx.getCurrentBlock()).block_header.raw_data.number;
  const back = (((latest - parseInt(u8hex(get(f, 1)), 16)) % 65536) + 65536) % 65536;
  const blk = await tronWeb.trx.getBlockByNumber(latest - back);
  ok(back <= 1000 && blk.blockID.slice(16, 32) === u8hex(get(f, 4)), "参照ブロックが、このチェーンの最近のブロック（" + back + "ブロック前）");
  // data の先頭4バイトを、ABIの関数と引き合わせる（呼ぶ関数が、名前で分かる）
  const fn = COUNTER_ABI.filter((x) => x.type === "function").find((e) => tronWeb.sha3(e.name + "(" + e.inputs.map((i) => i.type).join(",") + ")", false).slice(0, 8) === data.slice(0, 8));
  console.log("参考  呼ぶ関数:", fn ? fn.name + "()（" + fn.stateMutability + "）" : "ABIにない関数", " 引数の部分:", Math.max(0, data.length / 2 - 4), "バイト");
  console.log(ng.length === 0 ? "→ 点検を通りました。署名してよい取引です" : "→ " + ng.length + "件の問題があります。署名してはいけません");
  return ng;
};
console.log("checkCall を定義しました");
