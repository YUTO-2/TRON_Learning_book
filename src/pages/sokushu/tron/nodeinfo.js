// ノードの状態を取得する
const base = "https://nile.trongrid.io";   // テストネット（Nile）。メインネットは https://api.trongrid.io
const info = await (await fetch(base + "/wallet/getnodeinfo")).json();
console.log("ノードのバージョン:", info.configNodeInfo?.codeVersion);
console.log("P2Pバージョン:", info.configNodeInfo?.p2pVersion);
console.log("最新ブロック:", info.block);
console.log("確定済みブロック:", info.solidityBlock);
console.log("接続しているノード数:", info.currentConnectCount);
