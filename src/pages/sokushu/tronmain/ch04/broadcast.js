// ③ アナウンス: 署名済みの取引を、ノードに送る
if (typeof signed === "undefined") throw new Error("4.5 を先に実行してください");
if (signed.raw_data.expiration < Date.now()) throw new Error("有効期限が切れています。4.3からやり直してください");
balBefore = await tronWeb.trx.getUnconfirmedBalance(alice.address.base58);   // 送る前の残高（4.7で使う）
result = await tronWeb.trx.sendRawTransaction(signed);
console.log("result:", result.result, " txid:", result.txid);
if (!result.result) console.log("失敗:", result.code, new TextDecoder().decode(Uint8Array.from((result.message ?? "").match(/../g) ?? [], (h) => parseInt(h, 16))));
if (result.txid) clog(result.txid);
