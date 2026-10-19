// Counter の公開関数のセレクタを求める（関数名と引数の型 → Keccak-256 の先頭4バイト。1.17と同じ）
if (typeof tronWeb === "undefined") throw new Error("第2章の2.5の①②を先に実行してください");
selOf = (sig) => tronWeb.sha3(sig, false).slice(0, 8);      // sha3 は、Keccak-256。false で 0x を付けない
sigs = ["MAX()", "owner()", "count()", "increment()", "reset()", "remaining()"];
for (const s of sigs) console.log(s.padEnd(12), "→", selOf(s));
console.log("increment() を呼ぶ data（引数がないので、セレクタだけ）: 0x" + selOf("increment()"));
