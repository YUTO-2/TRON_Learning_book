// 関数を呼ぶ data（セレクタ＋引数）を、手で組み立てて、SDKの並べ方（encodeParams）と比べる。ノードには、何も送らない
if (typeof tronWeb === "undefined") throw new Error("第2章の2.5の①②を先に実行してください");
if (typeof bob === "undefined") throw new Error("第4章の4.2までを済ませてください（bob が必要です）");
selOf = (sig) => tronWeb.sha3(sig, false).slice(0, 8);              // 関数名と引数の型 → 先頭4バイト（7.3・8.2と同じ）
pad32 = (hex) => hex.padStart(64, "0");                             // 左をゼロで埋めて、32バイトにする

// 引数がない関数：data は、セレクタだけ（4バイト）
for (const s of ["count()", "increment()"]) console.log(s.padEnd(12), "→ data:", selOf(s), "（" + selOf(s).length / 2 + "バイト）");

// 引数がある関数（1.17）。Counter には無いので、transfer(address,uint256) を例にする（送らない）
sig = "transfer(address,uint256)";
to20 = bob.address.hex.slice(2).toLowerCase();                      // アドレスは、41 を除いた20バイト
amount = 5000000n;                                                  // 数値は、32バイトの整数（ビッグエンディアン）
manualData = selOf(sig) + pad32(to20) + pad32(amount.toString(16));
sdkParams = tronWeb.utils.abi.encodeParams(["address", "uint256"], [bob.address.base58, amount]).slice(2);
console.log("セレクタ      :", selOf(sig));
console.log("引数1（to）   :", pad32(to20));
console.log("引数2（量）   :", pad32(amount.toString(16)));
console.log("手組みの data :", manualData.length / 2, "バイト（4 + 32 + 32）");
console.log("引数の並べ方が、SDKの encodeParams と同じ:", manualData.slice(8) === sdkParams);

// 逆向き：引数の部分を、型を指定して読み戻す
back = tronWeb.utils.abi.decodeParams([], ["address", "uint256"], "0x" + manualData.slice(8));
console.log("読み戻した to :", tronWeb.address.fromHex(back[0]), "（Bob:", tronWeb.address.fromHex(back[0]) === bob.address.base58, "）");
console.log("読み戻した 量 :", String(back[1]));
