// ステップ4：アドレスを検証して、21バイトに戻す
if (typeof keccak256 === "undefined") throw new Error("ステップ1（ハッシュ関数）を先に実行してください");
const test = async (label, s) => {
  try { console.log(label + ":", "有効 →", await toHex42(s)); }
  catch (e) { console.log(label + ":", "無効 →", e.message); }
};
await test("正しいアドレス", "TMVQGm1qAQYVdetCeGRRkTWYYrLXuHK2HC");
await test("1文字違う   ", "TMVQGm1qAQYVdetCeGRRkTWYYrLXuHK2HD");   // 末尾の C を D に変えた
await test("Base58にない文字", "TMVQGm1qAQYVdetCeGRRkTWYYrLXuHK2H0");   // 0（ゼロ）は使えない
const r = b58dec("TMVQGm1qAQYVdetCeGRRkTWYYrLXuHK2HC");
console.log("デコード後のバイト数:", r.length, " 先頭:", r[0].toString(16), "= 0x41");
