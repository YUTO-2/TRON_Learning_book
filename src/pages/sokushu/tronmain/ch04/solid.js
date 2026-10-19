// 確定済みの台帳（solidityノード）に入ったかを確かめる
if (typeof result === "undefined" || !result.txid) throw new Error("4.6 を先に実行してください");
solid = await tronWeb.solidityNode.request("walletsolidity/gettransactionbyid", { value: result.txid }, "post");
console.log("確定済みの台帳にあるか:", solid.txID === result.txid ? "あり（確定）" : "まだなし（未確定）");
