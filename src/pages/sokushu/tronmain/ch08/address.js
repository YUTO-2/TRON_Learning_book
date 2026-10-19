// コントラクトのアドレスを、txID と作成者から、手作業で求める
if (typeof deployTx === "undefined") throw new Error("8.4 の取引を、先に作ってください");
keccak = (hex) => tronWeb.utils.ethersUtils.keccak256("0x" + hex).slice(2);       // Keccak-256（バイト列を渡す）
payload = deployTx.txID + alice.address.hex.toLowerCase();                       // txID（32バイト）＋ 作成者（41付きの21バイト）
manualHex = "41" + keccak(payload).slice(-40);                                   // ハッシュの下位20バイトに、41を付ける
nodeHex = deployTx.contract_address.toLowerCase();
console.log("手計算        :", manualHex, "→", tronWeb.address.fromHex(manualHex));
console.log("ノードの答え  :", nodeHex, "→", tronWeb.address.fromHex(nodeHex));
console.log("一致          :", manualHex === nodeHex);
// 別の取引（別のtxID）なら、アドレスも別になる。同じコードを、もう一度デプロイしても、別のコントラクトになる
other = await tronWeb.transactionBuilder.createSmartContract({ abi: COUNTER_ABI, bytecode: COUNTER_BC, parameters: [], ...DEPLOY }, alice.address.base58);
console.log("作り直した取引のアドレス:", tronWeb.address.fromHex(other.contract_address), "（上と違う:", other.contract_address !== deployTx.contract_address, "）");
