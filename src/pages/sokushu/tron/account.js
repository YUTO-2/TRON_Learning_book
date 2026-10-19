// アカウント情報を取得する（1.7で計算したアドレスを使う）
const base = "https://nile.trongrid.io";
const post = async (path, body) => (await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) })).json();
const address = "TMVQGm1qAQYVdetCeGRRkTWYYrLXuHK2HC";   // 好きなアドレスに変えて試せます
const acc = await post("/wallet/getaccount", { address, visible: true });
if (!acc.address) {
  console.log("このアドレスは、まだ台帳に存在しません（TRXを受け取って「有効化」されるまで、アカウントは作られない）");
} else {
  console.log("アドレス:", acc.address);
  console.log("残高(sun):", acc.balance ?? 0, " → TRX:", (Number(acc.balance ?? 0) / 1e6).toFixed(6));
  console.log("作成時刻:", acc.create_time ? new Date(acc.create_time).toISOString() : "—");
  const op = acc.owner_permission;
  console.log("owner権限: しきい値", op?.threshold, " 鍵の数", op?.keys?.length);
  console.log("active権限:", (acc.active_permission ?? []).map((p) => p.permission_name + "(しきい値" + p.threshold + ")").join(", "));
  console.log("TRC-10の保有:", JSON.stringify(acc.assetV2 ?? []));
}
