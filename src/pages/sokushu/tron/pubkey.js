// ステップ2：秘密鍵から公開鍵を作る（secp256k1）
const P = 2n ** 256n - 2n ** 32n - 977n;                                   // 有限体の素数
const N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n;  // 基点の位数
const G = [0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798n,
           0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8n];   // 基点
const md = (a) => ((a % P) + P) % P;
const inv = (a) => { let [r0, r1, s0, s1] = [P, md(a), 0n, 1n]; while (r1) { const q = r0 / r1; [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; } return md(s0); };
const add = (A, B) => {                                                     // 曲線上の足し算（y² = x³ + 7）
  if (!A) return B; if (!B) return A;
  if (A[0] === B[0] && md(A[1] + B[1]) === 0n) return null;                 // 無限遠点
  const l = A[0] === B[0] ? md(3n * A[0] * A[0] * inv(2n * A[1])) : md((B[1] - A[1]) * inv(B[0] - A[0]));
  const x = md(l * l - A[0] - B[0]);
  return [x, md(l * (A[0] - x) - A[1])];
};
const mul = (k, A) => { let R = null; while (k > 0n) { if (k & 1n) R = add(R, A); A = add(A, A); k >>= 1n; } return R; };

const priv = "0000000000000000000000000000000000000000000000000000000000000001";   // 練習用。実際の資産には使わない
const k = BigInt("0x" + priv);
if (k < 1n || k >= N) throw new Error("秘密鍵は 1 以上 N 未満");
const [x, y] = mul(k, G);                                                   // 公開鍵 ＝ 秘密鍵 × 基点
const pubXY = fromHex(x.toString(16).padStart(64, "0") + y.toString(16).padStart(64, "0"));   // x と y を32バイトずつ（先頭の04は付けない）
console.log("秘密鍵:", priv);
console.log("公開鍵(x):", hex(pubXY.slice(0, 32)));
console.log("公開鍵(y):", hex(pubXY.slice(32)));
console.log("曲線上の点か:", md(y * y) === md(x * x * x + 7n));
