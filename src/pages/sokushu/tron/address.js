// ステップ3：公開鍵からアドレスを作る
if (typeof keccak256 === "undefined") throw new Error("ステップ1（ハッシュ関数）を先に実行してください");
const pubXYhex = "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8";
const hash = keccak256(fromHex(pubXYhex));                                   // ① 公開鍵(64バイト)をKeccak-256
const body = hash.slice(12);                                                 // ② 末尾20バイトを取る
const addr21 = Uint8Array.from([0x41, ...body]);                             // ③ 先頭に 0x41 を付ける（21バイト）
const check = (await sha256(await sha256(addr21))).slice(0, 4);              // ④ SHA-256を2回かけて先頭4バイト
const addr25 = Uint8Array.from([...addr21, ...check]);                       // ⑤ 末尾にチェックサム（25バイト）
console.log("Keccak-256     :", hex(hash));
console.log("末尾20バイト   :", hex(body));
console.log("21バイト(16進) :", hex(addr21));
console.log("チェックサム   :", hex(check));
console.log("25バイト       :", hex(addr25));
console.log("アドレス       :", b58enc(addr25), "（" + b58enc(addr25).length + "文字）");
console.log("EVMアドレス    : 0x" + hex(body) + "  ← 21バイトから 41 を除いた部分");
