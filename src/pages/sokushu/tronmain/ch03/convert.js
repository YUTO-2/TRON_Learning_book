// アドレスの書き方を変換する
base58 = alice.address.base58;
hex41 = tronWeb.address.toHex(base58);                                // Base58 → 16進（41 ＋ 20バイト）
back = tronWeb.address.fromHex(hex41);                                // 16進 → Base58
fromKey = tronWeb.address.fromPrivateKey(alice.privateKey);           // 秘密鍵 → Base58
broken = base58.slice(0, -1) + (base58.endsWith("1") ? "2" : "1");    // 最後の1文字だけ変えたアドレス
console.log("Base58          :", base58);
console.log("16進（41付き）  :", hex41);
console.log("EVM形式         : 0x" + hex41.slice(2));
console.log("16進→Base58     :", back === base58);
console.log("秘密鍵→Base58   :", fromKey === base58);
console.log("isAddress       :", tronWeb.isAddress(base58), tronWeb.isAddress(hex41), tronWeb.isAddress(broken));
