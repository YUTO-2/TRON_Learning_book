// require が失敗したとき、コントラクトが返すバイト列（理由の文字列）を、手作業で組み立てて、読み戻す
if (typeof tronWeb === "undefined") throw new Error("第2章の2.5の①②を先に実行してください");
sel = (sig) => tronWeb.sha3(sig, false).slice(0, 8);
reason = "not owner";                                         // require(..., "not owner") の、理由の文字列
revData = sel("Error(string)") + tronWeb.utils.abi.encodeParams(["string"], [reason]).slice(2);   // セレクタ ＋ 文字列の並べ方（1.18）
console.log("Error(string) のセレクタ  :", sel("Error(string)"));
console.log("Panic(uint256) のセレクタ :", sel("Panic(uint256)"));
console.log("revert のバイト列（" + revData.length / 2 + " バイト）:");
console.log("  セレクタ:", revData.slice(0, 8));
console.log("  位置    :", revData.slice(8, 72));
console.log("  長さ    :", revData.slice(72, 136), "→", parseInt(revData.slice(72, 136), 16), "バイト");
console.log("  文字    :", revData.slice(136));
decoded = tronWeb.utils.abi.decodeParams([], ["string"], "0x" + revData.slice(8));
console.log("読み戻した理由:", decoded[0]);
