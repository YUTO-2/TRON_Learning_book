// 読み取り専用の呼び出し（triggerconstantcontract）。台帳は変わらず、手数料もかからない
if (typeof toHex42 === "undefined") throw new Error("1.7 ステップ1（ハッシュ関数とBase58）を先に実行してください");
const base = "https://api.trongrid.io";
const post = async (path, body) => (await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) })).json();
const USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const OWNER = "TMVQGm1qAQYVdetCeGRRkTWYYrLXuHK2HC";   // 呼び出し元（読み取りでは署名しないので、どのアドレスでもよい）
const view = (fn, parameter = "") => post("/wallet/triggerconstantcontract", { owner_address: OWNER, contract_address: USDT, function_selector: fn, parameter, visible: true });
const asText = (h) => { const len = parseInt(h.slice(64, 128), 16); return new TextDecoder().decode(fromHex(h.slice(128, 128 + len * 2))); };   // 文字列：位置(32) + 長さ(32) + 中身

const dec = await view("decimals()");
const decimals = parseInt(dec.constant_result[0], 16);
console.log("name    :", asText((await view("name()")).constant_result[0]));
console.log("symbol  :", asText((await view("symbol()")).constant_result[0]));
console.log("decimals:", decimals);
const ts = BigInt("0x" + (await view("totalSupply()")).constant_result[0]);
console.log("totalSupply(最小単位):", ts, " → 整数部:", ts / 10n ** BigInt(decimals));
console.log("使ったエネルギー(decimals):", dec.energy_used);

const who = (await toHex42(OWNER)).slice(2);               // balanceOf(address) の引数
const bal = BigInt("0x" + (await view("balanceOf(address)", who.padStart(64, "0"))).constant_result[0]);
console.log("balanceOf(" + OWNER + ") =", bal, "（最小単位）→", Number(bal) / 10 ** decimals, "USDT");
