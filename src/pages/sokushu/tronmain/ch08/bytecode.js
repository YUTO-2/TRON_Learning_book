// コンパイルで得たバイトコードを、下の "" の中に貼る（先頭の 0x は、あってもなくてもよい）
COUNTER_BYTECODE = "";

if (typeof COUNTER_ABI === "undefined") throw new Error("8.2 のABIを先に実行してください");
COUNTER_BC = COUNTER_BYTECODE.trim().replace(/^0x/i, "").toLowerCase();
if (COUNTER_BC === "") throw new Error("バイトコードが空です。コンパイルで得たバイトコードを、COUNTER_BYTECODE の \"\" の中に貼ってください");
if (!/^([0-9a-f]{2})+$/.test(COUNTER_BC)) throw new Error("16進の文字列ではありません（0-9 と a-f の、偶数桁だけ）");
console.log("バイトコードの長さ:", COUNTER_BC.length / 2, "バイト");
console.log("先頭の16バイト    :", COUNTER_BC.slice(0, 32));
// 関数の呼び分けのコードには、セレクタが PUSH4（63）の直後に、そのまま入る。7.3 の6つが、あるかを確かめる
sels = COUNTER_ABI.filter((x) => x.type === "function").map((e) => [e.name + "()", tronWeb.sha3(e.name + "()", false).slice(0, 8)]);
for (const [s, h] of sels) console.log(s.padEnd(12), h, COUNTER_BC.includes("63" + h) ? "あり" : "なし");
console.log(sels.every(([, h]) => COUNTER_BC.includes("63" + h)) ? "→ Counter のバイトコードのようです" : "→ ABIと合っていません。別のコントラクトのバイトコードではありませんか");
