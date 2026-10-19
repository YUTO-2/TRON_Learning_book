// 読み取りの関数を、data を手で組み立てて呼び、SDKの結果と比べる。戻り値は、32バイトずつ読む
if (typeof counterAddr === "undefined" || typeof counterHex === "undefined") throw new Error("8.6 を先に実行してください");
selOf = (sig) => tronWeb.sha3(sig, false).slice(0, 8);
aliceHex = alice.address.hex.toLowerCase();
// ノードに、data をそのまま渡す（SDKを通さない）。署名も手数料も要らない
callRaw = (data, from = aliceHex) => tronWeb.fullNode.request("wallet/triggerconstantcontract", { owner_address: from, contract_address: counterHex, data }, "post");

ret = {};
for (const sig of ["count()", "MAX()", "remaining()", "owner()"]) {
  const raw = await callRaw(selOf(sig));                                     // 手組みの data
  const sdk = await tronWeb.transactionBuilder.triggerConstantContract(counterAddr, sig, {}, [], alice.address.base58);   // SDK
  const sdkData = sdk.transaction.raw_data.contract[0].parameter.value.data;  // SDKが、ノードに渡した data
  ret[sig] = raw.constant_result?.[0] ?? "";
  console.log("--- " + sig + " ---");
  console.log("手組みの data  :", selOf(sig), "  SDKの data:", sdkData, "  同じ:", sdkData === selOf(sig));
  console.log("戻り値（手組み）:", ret[sig]);
  console.log("戻り値（SDK）   :", sdk.constant_result?.[0], "  同じ:", sdk.constant_result?.[0] === ret[sig]);
  console.log("使ったエネルギー:", raw.energy_used, "（予行の使用量。手数料はかからない）");
}

console.log("=== 戻り値の読み方 ===");
console.log("uint256 : count() =", BigInt("0x" + ret["count()"]), "（32バイトの整数）");
ownerHex = "41" + ret["owner()"].slice(-40);                                 // address は、後ろ20バイト。41を付ける
console.log("address : owner() =", tronWeb.address.fromHex(ownerHex), "（Alice:", tronWeb.address.fromHex(ownerHex) === alice.address.base58, "）");
two = tronWeb.utils.abi.decodeParams([], ["uint256", "address"], "0x" + ret["count()"] + ret["owner()"]);   // 戻り値が2つなら、32バイトが2つ並ぶ
console.log("SDKの decodeParams（型を指定）:", String(two[0]), tronWeb.address.fromHex(two[1]));
