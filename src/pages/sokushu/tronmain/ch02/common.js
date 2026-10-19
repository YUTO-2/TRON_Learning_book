if (typeof globalThis.TronWeb === "undefined") throw new Error("① SDKの読み込みが完了していません");
TronWeb = globalThis.TronWeb.TronWeb ?? globalThis.TronWeb;   // クラスが TronWeb と TronWeb.TronWeb のどちらに入っていても使えるようにそろえる
NILE = "https://nile.trongrid.io";                            // 接続先ノード（テストネットのNile）
tronWeb = new TronWeb({ fullHost: NILE });                    // SDKの本体。まだ秘密鍵は渡さない（読み取りだけ）

function clog(txid){
  console.log("https://nile.tronscan.org/#/transaction/" + txid);
}
