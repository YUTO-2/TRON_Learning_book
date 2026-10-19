// 失敗を、予行で読む。署名も手数料も要らず、状態も変わらない（Bob が reset() を呼ぶと、require が失敗する）
if (typeof callRaw === "undefined") throw new Error("9.4 を先に実行してください");
if (typeof bob === "undefined" || typeof hexToU8 === "undefined") throw new Error("第4章の4.2と、5.2 を先に実行してください");
selOf = (sig) => tronWeb.sha3(sig, false).slice(0, 8);
aliceHex = alice.address.hex.toLowerCase();
bobHex = bob.address.hex.toLowerCase();
hexText = (h) => new TextDecoder().decode(hexToU8(h ?? ""));
show = (label, res) => {
  console.log("--- " + label + " ---");
  console.log("result          :", JSON.stringify(res.result));
  console.log("message（文字） :", res.result?.message ? hexText(res.result.message) : "（なし）");
  console.log("constant_result :", res.constant_result?.[0] || "（空）");
  console.log("energy_used     :", res.energy_used);
};
okRes = await callRaw(selOf("reset()"), aliceHex);                 // owner（Alice）が呼ぶ：成功する予行
show("Alice が reset() を予行（成功する）", okRes);
ngRes = await callRaw(selOf("reset()"), bobHex);                   // Bob が呼ぶ：require(msg.sender == owner) で失敗する予行
show("Bob が reset() を予行（失敗する）", ngRes);

rv = ngRes.constant_result?.[0] ?? "";
head4 = rv.slice(0, 8);
console.log("=== 失敗の理由を読む（7.4と同じ） ===");
console.log("先頭4バイト:", head4, head4 === selOf("Error(string)") ? "→ Error(string)（require・revert の理由）" : head4 === selOf("Panic(uint256)") ? "→ Panic(uint256)（assert・算術エラー）" : "→ 理由なし、または独自のエラー");
if (head4 === selOf("Error(string)")) console.log("理由        :", tronWeb.utils.abi.decodeParams([], ["string"], "0x" + rv.slice(8))[0]);
if (head4 === selOf("Panic(uint256)")) console.log("コード      : 0x" + parseInt(rv.slice(8), 16).toString(16));
console.log("count()（予行は、状態を変えない）:", parseInt((await callRaw(selOf("count()"))).constant_result[0], 16));
