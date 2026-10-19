// アカウント情報を取得して、有効化の前後を見比べる
tmp = await tronWeb.createAccount();   // 作ったばかりで、誰からも受け取っていないアカウント
accTmp = await tronWeb.trx.getUnconfirmedAccount(tmp.address.base58);
console.log("作ったばかりのアカウント:", JSON.stringify(accTmp));

acc = await tronWeb.trx.getUnconfirmedAccount(alice.address.base58);
if (Object.keys(acc).length === 0) {
  console.log("Alice: まだ台帳に存在しません（フォーセットの受け取りがまだか、反映待ちです）");
} else {
  console.log("Alice(16進)  :", acc.address);
  console.log("Alice(Base58):", tronWeb.address.fromHex(acc.address));
  console.log("残高(sun)    :", acc.balance ?? 0, " → TRX:", tronWeb.fromSun(acc.balance ?? 0));
  console.log("作成時刻     :", acc.create_time ? new Date(acc.create_time).toISOString() : "—");
  console.log("owner権限    : しきい値", acc.owner_permission?.threshold, " 鍵の数", acc.owner_permission?.keys?.length);
  console.log("active権限   :", (acc.active_permission ?? []).map((p) => p.permission_name + "(しきい値" + p.threshold + ")").join(", "));
}
