// emit したイベントが、ログとして、どんな形で残るかを、手作業で組み立てる（1.20と同じ形）
if (typeof alice === "undefined") throw new Error("3.2 までを先に実行してください（alice が必要です）");
topicOf = (sig) => tronWeb.sha3(sig, false);                  // イベントの目印（署名のハッシュ。32バイト全体）
pad32 = (h) => h.padStart(64, "0");
aliceHex = alice.address.hex.slice(2).toLowerCase();               // 41 を除いた20バイト（Aliceのアドレス）
newCount = 3n;
console.log("emit Incremented(Alice, 3) のログ:");
console.log("  topics[0] 目印          :", topicOf("Incremented(address,uint256)"));
console.log("  topics[1] by（indexed） :", pad32(aliceHex));                            // indexed の引数は、topic に入る
console.log("  data      newCount      :", pad32(newCount.toString(16)));         // indexed でない引数は、data に入る
console.log("emit Reset(Alice) のログ:");
console.log("  topics[0] 目印          :", topicOf("Reset(address)"));
console.log("  topics[1] by（indexed） :", pad32(aliceHex));
console.log("  data                    : （空）");
