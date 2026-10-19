// 関数の呼び出しを、バイト列で表す：関数名のハッシュの先頭4バイト（セレクタ）＋ 引数（32バイトずつ）
if (typeof keccak256 === "undefined") throw new Error("1.7 ステップ1（ハッシュ関数とBase58）を先に実行してください");
const te = new TextEncoder();
const selector = (sig) => hex(keccak256(te.encode(sig)).slice(0, 4));
console.log("balanceOf(address)          →", selector("balanceOf(address)"));
console.log("transfer(address,uint256)   →", selector("transfer(address,uint256)"));
console.log("decimals()                  →", selector("decimals()"));

// 引数は32バイトに左をゼロで埋める。アドレスは 41 を除いた20バイトを使う
const pad32 = (h) => h.padStart(64, "0");
const toArg = async (addr) => pad32((await toHex42(addr)).slice(2));
const to = await toArg("TDvSsdrNM5eeXNL3czpa6AxLDHZA9nwe9K");
const amount = pad32((5n * 1000000n).toString(16));        // 5 USDT（可分性6なので 5 × 10^6）
const data = selector("transfer(address,uint256)") + to + amount;
console.log("transfer の data:");
console.log("  セレクタ:", data.slice(0, 8));
console.log("  引数1(to):", data.slice(8, 72));
console.log("  引数2(amount):", data.slice(72));
console.log("  全体:", data.length / 2, "バイト（4 + 32 + 32）");

// イベントは、署名文字列のハッシュ（32バイト）全体が「topic」になる
console.log("Transfer イベントの topic:", hex(keccak256(te.encode("Transfer(address,address,uint256)"))));
