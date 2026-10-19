// 単位：Solidity の数値は整数だけ。TRONでは、TRXの単位は sun（1 trx ＝ 1,000,000 sun）
if (typeof tronWeb === "undefined") throw new Error("第2章の2.5の①②を先に実行してください");
SUN = 1000000n;
console.log("1 trx            →", String(1n * SUN), "sun");
console.log("5 trx            →", String(5n * SUN), "sun");
console.log("toSun(1.5)       →", tronWeb.toSun(1.5), "sun");
console.log("fromSun(2500000) →", tronWeb.fromSun(2500000), "TRX");
console.log("1 ether          →", String(10n ** 18n), "（これを sun として扱うと", String(10n ** 18n / SUN), "TRX）");
