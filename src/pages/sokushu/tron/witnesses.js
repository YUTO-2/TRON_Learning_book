// スーパーリプレゼンタティブ（SR）：得票数の上位27が、ブロックを作る
if (typeof toBase58 === "undefined") throw new Error("1.7 ステップ1（ハッシュ関数とBase58）を先に実行してください");
const base = "https://nile.trongrid.io";
const res = await (await fetch(base + "/wallet/listwitnesses")).json();
const list = (res.witnesses ?? []).slice().sort((a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0));
console.log("候補の数:", list.length, "（得票数の上位27がSR、28〜127位がパートナー）");
for (const [i, w] of list.slice(0, 5).entries()) {
  console.log((i + 1) + "位", await toBase58(w.address), " 得票:", w.voteCount, " 生産:", w.totalProduced, " 逃した:", w.totalMissed ?? 0, " ", w.url);
}
const total = list.slice(0, 27).reduce((s, w) => s + (w.voteCount ?? 0), 0);
console.log("SR27の合計得票数:", total);
