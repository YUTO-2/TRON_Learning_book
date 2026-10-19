// SDKと、素のHTTP APIで、同じブロックを取得して比べる
n = (await tronWeb.trx.getCurrentBlock()).block_header.raw_data.number - 10;   // 少し前のブロック（確定済み）
viaSdk = await tronWeb.trx.getBlockByNumber(n);
viaHttp = await (await fetch(NILE + "/wallet/getblockbynum", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ num: n }) })).json();
console.log("SDK :", viaSdk.blockID);
console.log("HTTP:", viaHttp.blockID);
console.log("一致:", viaSdk.blockID === viaHttp.blockID);
