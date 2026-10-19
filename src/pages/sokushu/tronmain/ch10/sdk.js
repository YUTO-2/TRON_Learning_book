// SDK の近道：tronWeb.event。10.4・10.5 の HTTP と、件数と中身を比べる
if (typeof evByTx === "undefined" || typeof getAll === "undefined") throw new Error("10.4 と 10.5 を先に実行してください");
list = (r) => Array.isArray(r) ? r : (r?.data ?? []);                      // 版によって、配列そのものか、{ data: [...] } で返る
byTx = list(await tronWeb.event.getEventsByTransactionID(callTxid));
console.log("取引ごと    SDK:", byTx.length, "件  HTTP:", (await evByTx(callTxid)).length, "件");
byContract = list(await tronWeb.event.getEventsByContractAddress(counterAddr, { eventName: "Incremented", orderBy: "block_timestamp,asc", limit: 200 }));
viaHttp = await getAll(counterAddr, "event_name=Incremented&order_by=block_timestamp,asc");
console.log("コントラクト SDK:", byContract.length, "件  HTTP:", viaHttp.length, "件");
same = byContract.length === viaHttp.length && byContract.every((e, i) => e.transaction_id === viaHttp[i].transaction_id);
console.log("同じ取引が、同じ順に並ぶ:", same);
console.log("先頭1件:", JSON.stringify(byContract[0]));
