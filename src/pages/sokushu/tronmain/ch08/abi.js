// Counter の ABI（コンパイラが出力する形式）。7.3 の公開関数・7.5 のイベントと、同じ顔ぶれになる
if (typeof tronWeb === "undefined") throw new Error("第2章の2.5の①②を先に実行してください");
COUNTER_ABI = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "event", name: "Incremented", anonymous: false, inputs: [{ name: "by", type: "address", indexed: true }, { name: "newCount", type: "uint256", indexed: false }] },
  { type: "event", name: "Reset", anonymous: false, inputs: [{ name: "by", type: "address", indexed: true }] },
  { type: "function", name: "MAX", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "count", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "increment", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "owner", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "remaining", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "reset", inputs: [], outputs: [], stateMutability: "nonpayable" },
];
// 関数名と引数の型 → セレクタ。7.3 で求めた値と、照合する
sigOf = (e) => e.name + "(" + e.inputs.map((i) => i.type).join(",") + ")";
selOf = (sig) => tronWeb.sha3(sig, false).slice(0, 8);
known = { "MAX()": "d49d5181", "owner()": "8da5cb5b", "count()": "06661abd", "increment()": "d09de08a", "reset()": "d826f88f", "remaining()": "55234ec0" };
console.log("--- 関数（セレクタ） ---");
for (const e of COUNTER_ABI.filter((x) => x.type === "function")) {
  const s = sigOf(e);
  console.log(s.padEnd(12), selOf(s), selOf(s) === known[s] ? "OK（7.3と同じ）" : "NG");
}
console.log("--- イベント（topics[0] の先頭4バイト） ---");
for (const e of COUNTER_ABI.filter((x) => x.type === "event")) {
  console.log(sigOf(e).padEnd(30), tronWeb.sha3(sigOf(e), false).slice(0, 8));
}
console.log("コンストラクタの引数の数:", COUNTER_ABI.find((x) => x.type === "constructor").inputs.length);
