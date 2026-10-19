// トランザクションの状態：ノードにある結果と、確定済みの台帳での結果
const base = "https://nile.trongrid.io";
const post = async (path, body) => (await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) })).json();
let blk = await post("/wallet/getnowblock");
for (let n = 0; n < 30 && !(blk.transactions ?? []).length; n++) blk = await post("/wallet/getblockbynum", { num: blk.block_header.raw_data.number - 1 });
const id = blk.transactions?.[0]?.txID;
if (!id) throw new Error("直近のブロックに取引が見つかりません。時間をおいて試してください");
console.log("調べるtxID:", id);
const tx = await post("/wallet/gettransactionbyid", { value: id });
console.log("実行結果 ret[0].contractRet:", tx.ret?.[0]?.contractRet);
const info = await post("/wallet/gettransactioninfobyid", { value: id });
console.log("入ったブロック:", info.blockNumber, " 時刻:", new Date(info.blockTimeStamp).toISOString());
console.log("手数料 fee:", info.fee ?? 0, "sun  帯域幅の使用 net_usage:", info.receipt?.net_usage ?? 0, " エネルギー使用:", info.receipt?.energy_usage_total ?? 0);
const solid = await post("/walletsolidity/gettransactionbyid", { value: id });
console.log("確定済みの台帳にあるか:", solid.txID === id ? "あり（確定）" : "まだなし（未確定）");
