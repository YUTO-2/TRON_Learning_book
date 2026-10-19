// アドレス：コントラクトの中では20バイト。外に出るとき（API・Base58）に、先頭に 41 が付く
if (typeof alice === "undefined") throw new Error("3.2 までを先に実行してください（alice が必要です）");
hex41 = tronWeb.address.toHex(alice.address.base58).toLowerCase();   // 41 ＋ 20バイト（21バイト）
inVm = hex41.slice(2);                                               // コントラクトの中の address（20バイト）
console.log("Base58（ウォレット・画面）    :", alice.address.base58);
console.log("16進（ノードのAPI）           :", hex41, "（" + hex41.length / 2 + " バイト）");
console.log("コントラクトの中の address    : 0x" + inVm, "（" + inVm.length / 2 + " バイト）");
console.log("owner() の戻り値（32バイト）  : 0x" + inVm.padStart(64, "0"));
console.log("41 を付けて戻すと Alice       :", tronWeb.address.fromHex("41" + inVm) === alice.address.base58);
