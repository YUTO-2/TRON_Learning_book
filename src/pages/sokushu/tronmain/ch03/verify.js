// 第1章（1.7）で手計算した結果と、SDKの結果を照合する
testPriv = "0000000000000000000000000000000000000000000000000000000000000001";   // 1.7のステップ2と同じ練習用の鍵（実際の資産には使わない）
sdkPub = tronWeb.utils.bytes.byteArray2hexStr(tronWeb.utils.crypto.getPubKeyFromPriKey(Uint8Array.from(testPriv.match(/../g), (h) => parseInt(h, 16))));
sdkAddr = tronWeb.address.fromPrivateKey(testPriv);
sdkHex = tronWeb.address.toHex(sdkAddr).toUpperCase();

// 第1章の出力（1.7のステップ2・3）
manualX = "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
manualY = "483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8";
manualHex = "417E5F4552091A69125D5DFCB7B8C2659029395BDF";
manualAddr = "TMVQGm1qAQYVdetCeGRRkTWYYrLXuHK2HC";

console.log("SDKの公開鍵の長さ:", sdkPub.length / 2, "バイト 先頭:", sdkPub.slice(0, 2));
console.log("公開鍵 x が一致  :", sdkPub.slice(2, 66) === manualX);
console.log("公開鍵 y が一致  :", sdkPub.slice(66) === manualY);
console.log("21バイトが一致   :", sdkHex === manualHex);
console.log("アドレスが一致   :", sdkAddr === manualAddr);
