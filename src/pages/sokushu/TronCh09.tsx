import { Code, H, H3, Out, P } from './ui';
import { B, Note, Tbl, Ul } from './introParts';
import encodeJs from './tronmain/ch09/encode.js?raw';
import readJs from './tronmain/ch09/read.js?raw';
import writeJs from './tronmain/ch09/write.js?raw';
import checkJs from './tronmain/ch09/check.js?raw';
import sendJs from './tronmain/ch09/send.js?raw';
import dryrunJs from './tronmain/ch09/dryrun.js?raw';
import failJs from './tronmain/ch09/fail.js?raw';
import contractJs from './tronmain/ch09/contract.js?raw';

// 出力例のうち、txID・アドレス・ブロック番号・エネルギーの量・手数料は見本。32バイトの値は、桁数をそろえて組み立てている。
const W0 = '0'.repeat(64);
const WA = '0'.repeat(24) + 'bb3605a39e7febadf055da74a2425d364feec4d0'; // owner() の戻り値（アドレスの20バイトの左を、ゼロで埋めた形）
const REVERT_MSG = '524556455254206f70636f6465206578656375746564'; // "REVERT opcode executed" の16進

const encodeOut = `count()      → data: 06661abd （4バイト）
increment()  → data: d09de08a （4バイト）
セレクタ      : a9059cbb
引数1（to）   : 000000000000000000000000（Bobの20バイト）
引数2（量）   : 00000000000000000000000000000000000000000000000000000000004c4b40
手組みの data : 68 バイト（4 + 32 + 32）
引数の並べ方が、SDKの encodeParams と同じ: true
読み戻した to : T…（Bob） （Bob: true ）
読み戻した 量 : 5000000`;

const readOut = `--- count() ---
手組みの data  : 06661abd   SDKの data: 06661abd   同じ: true
戻り値（手組み）: ${W0}
戻り値（SDK）   : ${W0}   同じ: true
使ったエネルギー: （エネルギーの量） （予行の使用量。手数料はかからない）
--- MAX() ---
（同じ形で続く。戻り値は ${'0'.repeat(62)}0a）
--- remaining() ---
（同じ形で続く。戻り値は ${'0'.repeat(62)}0a）
--- owner() ---
手組みの data  : 8da5cb5b   SDKの data: 8da5cb5b   同じ: true
戻り値（手組み）: ${WA}
戻り値（SDK）   : ${WA}   同じ: true
使ったエネルギー: （エネルギーの量） （予行の使用量。手数料はかからない）
=== 戻り値の読み方 ===
uint256 : count() = 0n （32バイトの整数）
address : owner() = T…（Alice） （Alice: true ）
SDKの decodeParams（型を指定）: 0 T…（Alice）`;

const writeOut = `result            : {"result":true}
txID              : 7be1…（64桁）
種類 type         : TriggerSmartContract
署名 signature    : （まだ無い）
owner_address     : 41bb3605… （Alice: true ）
contract_address  : 41…（Counter） （Counter: true ）
data              : d09de08a （increment() のセレクタ: true ）
call_value        : 0 sun
fee_limit         : 100000000 sun
raw_data_hex      : （バイト数）バイト`;

const checkOut = `checkCall を定義しました`;

const sendOut = `OK  txID ＝ SHA-256(raw_data_hex)
OK  種類が、コントラクトの呼び出し（31）
OK  型の名前が、TriggerSmartContract
OK  送り主が、頼んだアカウント
OK  呼び先が、頼んだコントラクト
OK  data が、頼んだとおり（d09de08a）
OK  call_value が、頼んだとおり（0）
OK  呼び出しの定義に、想定外の欄がない（トークンの欄 5・6 が無い）
OK  fee_limit が、頼んだとおり（100000000 sun）
OK  取引の欄が、6つだけ（18 は fee_limit）
OK  有効期限が、これから約60秒以内
OK  参照ブロックが、このチェーンの最近のブロック（1ブロック前）
参考  呼ぶ関数: increment()（nonpayable）  引数の部分: 0 バイト
→ 点検を通りました。署名してよい取引です
result: true  txid: c41d…
実行結果 contractRet : SUCCESS
入ったブロック       : （ブロック番号）  時刻: （時刻）
手数料 fee           : （焼却された合計）sun
（帯域幅・Aliceの残高の減りが続く）
--- 結果の読み方 ---
contractResult（戻り値）: [""] （increment() は、戻り値がない）
ログの数 log           : 1
  topics[0] の先頭4バイト: 38ac789e （Incremented: true ）
  topics[1]（by）       : bb3605a39e7febadf055da74a2425d364feec4d0 （Alice: true ）
  data（newCount）      : 1
エネルギー（合計）     : （エネルギーの量）
count()                : 0 → 1`;

const dryrunOut = `--- Alice が reset() を予行（成功する） ---
result          : {"result":true}
message（文字） : （なし）
constant_result : （空）
energy_used     : （エネルギーの量）
--- Bob が reset() を予行（失敗する） ---
result          : {"result":true,"code":"CONTRACT_EXE_ERROR","message":"${REVERT_MSG}"}
message（文字） : REVERT opcode executed
constant_result : 08c379a0（位置・長さ・文字が続く）
energy_used     : （エネルギーの量）
=== 失敗の理由を読む（7.4と同じ） ===
先頭4バイト: 08c379a0 → Error(string)（require・revert の理由）
理由        : not owner
count()（予行は、状態を変えない）: 1`;

const failOut = `result（ノードの答え）: {"result":true} ← 取引を作れただけで、実行はまだ
OK  txID ＝ SHA-256(raw_data_hex)
（点検の行が続く。すべて OK）
→ 点検を通りました。署名してよい取引です
アナウンス result: true  txid: e8a2… ← 受け付けられただけ
実行結果 contractRet : REVERT
info.result          : FAILED  receipt.result: REVERT
resMessage（文字）   : REVERT opcode executed
contractResult の先頭: 08c379a0 → Error(string)
理由                 : not owner
エネルギー（合計）   : （エネルギーの量） うち焼却 energy_fee: （sun） sun
手数料 fee           : （sun） sun（失敗しても、使った分は焼却される）
Bobの残高の減り      : （sun） sun
count()              : 1 → 1 （失敗した取引は、状態を変えない）`;

const contractOut = `MAX()       : 10
count()     : 1
remaining() : 9
owner()     : （版によって、41付きの16進・Base58などの形） → Alice: true
send() の戻り値（txID）: 5d7e…
実行結果 contractRet : SUCCESS
入ったブロック       : （ブロック番号）  時刻: （時刻）
手数料 fee           : （焼却された合計）sun
（帯域幅・Aliceの残高の減りが続く）
count()     : 2`;

// TRON開発概論: 第9章 呼び出し。
export default function TronCh09() {
  return (
    <>
      <P>第8章でデプロイした Counter は、台帳の上で動いています。この章では、その<B>関数を呼びます</B>。関数の呼び出しは、1.17で見たとおり、<B>セレクタと引数を並べた1本のバイト列（data）</B>です。<code>data</code> を手で組み立ててノードに渡し、SDKの結果と比べます。そのうえで、状態を変えない<B>読み取り</B>と、状態を変える<B>書き込み</B>を、別の道で呼び分けます。書き込みは、第5章・第8章と同じく、<B>署名の前に、取引の中身を自分で点検</B>してから送ります。最後に、戻り値と、失敗の理由を、バイト列から読みます。</P>

      <H>9.1 この章の進め方</H>
      <Note kind="goal">読み取りと書き込みの違いを説明し、Counter の関数を、data の手組みと点検つきで呼んで、戻り値と失敗の理由を読める。</Note>
      <Tbl head={['節', 'やること', '使うもの', '第1章との対応']} rows={[
        ['9.2', '読み取りと書き込みの違いを整理し、Counter の関数を分ける', '—', '1.17、1.18'],
        ['9.3', 'data（セレクタ＋引数）を、手で組み立てる', 'sha3、encodeParams', '1.17'],
        ['9.4', '読み取りの関数を、手組みの data で呼び、SDKと比べる。戻り値を読む', 'triggerconstantcontract', '1.18'],
        ['9.5', '書き込みの取引を作り、署名の前に点検する関数を作る', 'triggerSmartContract、checkCall', '1.10、1.13'],
        ['9.6', 'increment() を、点検 → 署名 → アナウンスで呼び、結果を読む', 'sign、sendRawTransaction', '1.12、1.20'],
        ['9.7', '失敗を、予行で読む。実際に失敗した取引も読む', 'Error(string)、receipt', '1.12'],
        ['9.8', 'SDKの近道 contract() を使い、各層の役割を整理する', 'contract()、call、send', '1.17、1.18'],
      ]} />
      <Note kind="point">この章のコードは、<B>Nileに取引を送ります</B>（9.6、9.7の後半、9.8）。第8章の8.6までを済ませて、<code>counterAddr</code>・<code>counterHex</code>・<code>COUNTER_ABI</code> を、コンソールに残しておいてください。そのほかに、第3章の3.2までの Alice、第4章の4.2の Bob、4.7（<code>showResult</code>）、5.2（<code>readPb</code> など）を使います。ページを再読み込みすると変数が消えるので、そのときは、順にやり直してください（8.6の注意のとおり、<code>counterAddr</code> は、控えたアドレスから戻せます）。</Note>
      <Note kind="warn">Aliceのエネルギーは、第6章でステークした分が残っています。足りない分は、TRXが焼却されます。9.7の後半は、Bobが取引を送るので、<B>Bobにも、少しのTRX</B>（1 TRX 程度）が要ります。練習は、テストネットのNileで行ってください。</Note>

      <H>9.2 読み取りと書き込み</H>
      <Note kind="goal">読み取りの呼び出しと、書き込みの呼び出しの違いを、6つの観点で説明できる。</Note>
      <P>コントラクトの関数は、状態を<B>変えない</B>ものと、<B>変える</B>ものに分かれます（1.18）。Solidityでは、前者に <code>view</code> が付きます（7.3）。この違いが、呼び方を決めます。</P>
      <Tbl head={['観点', '読み取り（call）', '書き込み（send）']} rows={[
        ['ノードのAPI', 'triggerconstantcontract', 'triggersmartcontract で取引を作り、署名して、アナウンスする'],
        ['署名', '要らない', '要る（Aliceの秘密鍵）'],
        ['手数料', 'かからない。ノードが、手元で試しに実行するだけ', '帯域幅とエネルギーを使う。足りない分は、TRXが焼却される'],
        ['状態', '変わらない。実行の結果は、捨てられる', '変わる。ブロックに入って、実行されたあと'],
        ['戻り値', 'constant_result で、その場で受け取れる', '取引の結果の contractResult に残るが、呼んだ側が、その場で受け取るものではない'],
        ['イベント', '出ない', '取引の結果の log に残る（第10章）'],
        ['失敗', '返ってきた結果で分かる。手数料はかからない', '取引は台帳に残り、使った分は、焼却される'],
      ]} />
      <P>第7章の Counter の関数を、この違いで分けると、次のようになります。ABI（8.2）の <code>stateMutability</code> が、<code>view</code> か <code>nonpayable</code> かで、見分けられます。</P>
      <Tbl head={['関数', 'stateMutability', '呼び方', '引数', '戻り値']} rows={[
        ['MAX()', 'view', '読み取り', 'なし', 'uint256（上限の 10）'],
        ['count()', 'view', '読み取り', 'なし', 'uint256（いまのカウント）'],
        ['owner()', 'view', '読み取り', 'なし', 'address（作った人）'],
        ['remaining()', 'view', '読み取り', 'なし', 'uint256（あと何回か）'],
        ['increment()', 'nonpayable', '書き込み', 'なし', 'なし（イベント Incremented が残る）'],
        ['reset()', 'nonpayable', '書き込み', 'なし', 'なし（イベント Reset が残る。作成者だけ）'],
      ]} />
      <Note kind="ex">書き込みの関数も、<code>triggerconstantcontract</code> に渡すと、<B>状態を変えずに、実行だけを試せます</B>（予行）。エネルギーの見当や、失敗の理由が、お金を使わずに分かります（9.7）。<code>view</code> でない関数を、読み取りの道で呼んでも、結果が台帳に残らないだけで、エラーにはなりません。</Note>

      <H>9.3 data を、手で組み立てる</H>
      <Note kind="goal">セレクタと引数から data を組み立て、SDKの並べ方と一致することを確かめられる。</Note>
      <P>関数を呼ぶ <code>data</code> は、<B>セレクタ（4バイト）に、引数を32バイトずつ並べたもの</B>です（1.17）。Counter の関数は、すべて引数がないので、data は<B>セレクタだけ</B>になります。引数の並べ方を確かめるために、1.17の <code>transfer(address,uint256)</code> を例にして、手で組み立て、SDKの <code>encodeParams</code> と比べます（このコードは、ノードに何も送りません）。</P>
      <Tbl head={['型', '並べ方']} rows={[
        ['uint256 など（数）', '32バイトの整数。上の桁から先に並べる（ビッグエンディアン）。左をゼロで埋める'],
        ['address', '41を除いた20バイトを、左をゼロで埋めて32バイトにする（7.6）。Base58のままでは入れられない'],
        ['bool', '0 または 1 を、32バイトの整数として並べる'],
        ['string・bytes・配列', '先頭に「位置」、位置の先に「長さ」、そのあとに中身を並べる（7.4の Error(string) と同じ形）'],
      ]} />
      <Code code={encodeJs} />
      <Out code={encodeOut} />
      <Note kind="warn"><B>数値は、JavaScriptの number で渡さず、BigInt（<code>5000000n</code> のように、末尾に n）か、文字列で渡します</B>。<code>number</code> は、2の53乗を超えると、桁が丸められます。トークンの量は、可分性が18のものだと、すぐに超えます（1.8）。</Note>
      <Note kind="point">SDKの <code>parameters</code> に <code>[{'{'} type: "address", value: … {'}'}, {'{'} type: "uint256", value: … {'}'}]</code> のように型と値を渡すのは、この並べ方を、SDKにやらせるということです。<B>型の指定を間違えると、別の並びになり、別の意味の data になります</B>。<code>uint256</code> と <code>uint</code> は同じ型ですが、セレクタは、省略せずに <code>uint256</code> と書いた文字列から求めます。</Note>

      <H>9.4 読み取りの関数を呼ぶ</H>
      <Note kind="goal">手組みの data で、読み取りの関数を呼び、SDKの結果と比べて、戻り値を型に合わせて読める。</Note>
      <P>読み取りは、<code>/wallet/triggerconstantcontract</code> に、<B>呼ぶ人</B>（<code>owner_address</code>）、<B>呼び先</B>（<code>contract_address</code>）、<B>data</B> を渡します。SDKは、関数名の文字列と引数から、この <code>data</code> を作っているだけです。ここでは、<B>手組みの data を、ノードに直接渡し</B>、SDKの <code>triggerConstantContract</code> の結果と、<code>data</code>・戻り値・使ったエネルギーを、見比べます。</P>
      <Code code={readJs} />
      <Out code={readOut} />
      <P>戻り値は、<code>constant_result</code> に、<B>16進の文字列</B>で入ります（1.18）。型に合わせて、次のように読みます。<code>count()</code> は32バイトの整数、<code>owner()</code> は、32バイトのうち<B>後ろの20バイト</B>がアドレスです（8.7と同じ）。戻り値が2つある関数なら、32バイトが2つ並び、<code>decodeParams</code> に、型を並べて渡すと、まとめて読めます。</P>
      <Note kind="point">SDKが作った <code>data</code> と、手で組み立てた <code>data</code> が一致します。つまり、<B>SDKは、ABIの規則で、バイト列を作ってくれているだけ</B>です。結果が合わないときは、セレクタの文字列（関数名・型・空白）か、引数の型を、疑ってください。</Note>
      <Note kind="warn">読み取りは、ノードの<B>最新の状態</B>で実行されます。確定する前の状態も、含まれます（1.13）。確定済みの状態で読みたいときは、Solidityノードの同名のAPI（<code>walletsolidity/triggerconstantcontract</code>）に、同じ形で問い合わせます。送金の入金確認を確定済みの台帳で行った考え方（第5章）と同じです。</Note>

      <H>9.5 書き込みの取引を作り、点検する</H>
      <Note kind="goal">書き込みの取引を作り、署名の前に、呼び先・関数・費用の項目を、バイト列で点検できる。</Note>
      <P>書き込みは、<code>transactionBuilder.triggerSmartContract</code> で、<B>署名前の取引</B>を作ります。渡す項目は、次のとおりです。</P>
      <Tbl head={['引数・項目', '意味', 'この章の値']} rows={[
        ['contractAddress', '呼び先のコントラクト', 'counterAddr（Base58）'],
        ['functionSelector', '関数名と引数の型（空白なし）。ノードが、Keccak-256の先頭4バイトを求め、data にする', '"increment()"'],
        ['options.feeLimit', '焼却してよいTRXの上限（sun）。実際に焼却されるのは、使った分だけ', '100 TRX（100,000,000 sun）'],
        ['options.callValue', '一緒に送るTRX（sun）。payable の関数だけが、受け取れる', '0'],
        ['parameters', '引数の型と値の配列（9.3）', '[]（increment() に、引数はない）'],
        ['issuerAddress', '呼ぶ人（取引の送り主）', 'alice.address.base58'],
      ]} />
      <Code code={writeJs} />
      <Out code={writeOut} />
      <P>返ってきた取引の <code>type</code> は <code>TriggerSmartContract</code>（番号は31）で、<code>data</code> は、9.3の手組みと同じセレクタです。取引は、まだ送っていません。<code>result: {'{'}"result":true{'}'}</code> は、<B>取引を作れた</B>という意味で、<B>実行が成功する</B>という意味ではありません。書き込みの関数は、取引を作る時点では、実行されません。</P>
      <P>8.5の <code>checkDeploy</code> と同じ考え方で、呼び出しの取引を点検する関数 <code>checkCall</code> を作ります。点検するのは、JSONの表示ではなく、<code>raw_data_hex</code>（署名されるバイト列）です。</P>
      <Tbl head={['点検', '見るところ', '違うと、どうなるか']} rows={[
        ['txID・種類', 'SHA-256 が txID と一致。種類が 31（TriggerSmartContract）', '別の取引・別の操作に署名してしまう'],
        ['送り主', '欄1が、頼んだアカウント', '別のアカウントの名義で呼ばれる'],
        ['呼び先', '欄2が、頼んだコントラクト', '別のコントラクトの関数が、呼ばれる'],
        ['data', '欄4が、頼んだセレクタ＋引数', '別の関数（transfer や approve など）が、呼ばれる'],
        ['call_value', '欄3が、頼んだ値', '頼んでいないTRXが、送られる'],
        ['欄', '呼び出しの定義が 1〜4 だけ。取引の欄が 1・4・8・11・14・18 だけ', '余計な内容（トークンの送付など）が、混ざる'],
        ['fee_limit', '取引の欄18が、頼んだ値', '焼却してよいTRXの上限が、変わる'],
        ['有効期限・参照ブロック', '5.3と同じ', '期限切れ、別のチェーンの取引'],
      ]} />
      <Code code={checkJs} />
      <Out code={checkOut} />
      <Note kind="point">このコードは、<code>data</code> の先頭4バイトを、ABIの関数と引き合わせて、<B>呼ぶ関数の名前</B>も表示します。ノードが返した取引の <code>data</code> を、人間が読める名前にして確かめられます。ただし、判断の基準は、<B>頼んだ data と、バイト列として一致するか</B>です。名前の表示は、読む人のための参考です。</Note>
      <Note kind="ex">呼び先と data の点検は、<B>署名の前に、何に署名するのかを知る</B>ための、いちばん大事な点検です。取引の送り主は自分でも、呼び先と data を差し替えられたら、別のコントラクトの別の関数に、署名することになります。第13章で、<code>approve</code> を例に、もう一度扱います。</Note>

      <H>9.6 increment() を呼ぶ</H>
      <Note kind="goal">点検・署名・アナウンスを順に行い、取引の結果から、戻り値・ログ・状態の変化を読める。</Note>
      <P>取引の有効期限は、約60秒です。そこで、このコードも、取引を<B>作り直してから</B>、点検・署名・アナウンスを、続けて行います（9.5で作った取引は、使いません）。点検でNGが1つでもあれば、署名しないで止まります。</P>
      <Code code={sendJs} />
      <Out code={sendOut} />
      <P>結果は、3つの面で読みます。</P>
      <Ul items={[
        '実行結果：contractRet が SUCCESS なら、成功です。アナウンスの result: true は、受け付けられただけの意味です（4.6）。',
        '戻り値：contractResult に、関数が返したバイト列が入ります。increment() は、何も返さないので、空です。戻り値のある関数なら、ここに、9.4と同じ形の32バイトが残ります。',
        'ログ：イベントは、log に残ります。topics[0] が、イベントの署名のKeccak-256（7.5。Incremented なら 38ac789e…）、topics[1] が indexed の引数 by、data が newCount です。取得の方法は、第10章で扱います。',
      ]} />
      <Note kind="point">書き込みの呼び出しは、<B>戻り値を、その場で受け取れません</B>。取引は、ブロックに入ってから実行されるからです。呼んだ側が、結果を知りたいときは、取引の結果を読むか、状態（<code>count()</code>）を読み直します。ここでは、<code>count()</code> が 0 から 1 になったことで、状態が変わったことを確かめました。</Note>

      <H>9.7 失敗の読み方</H>
      <Note kind="goal">失敗の種類を見分け、失敗の理由（Error(string)）を、予行と取引の結果の両方から読める。</Note>
      <P>失敗は、<B>どの段階で起きたか</B>で、見え方が違います。</P>
      <Tbl head={['失敗', 'いつ分かるか', '見え方', '手数料']} rows={[
        ['実行前に、拒否される', 'アナウンスのとき', 'result が false。code に理由（署名の誤り、期限切れなど。4.6）', 'かからない。取引は、台帳に残らない'],
        ['require・revert', '実行されたとき', 'contractRet が REVERT。理由は Error(string)（08c379a0 ＋ 位置・長さ・文字。7.4）', '使った分は、焼却される。状態は、元に戻る'],
        ['assert・桁あふれ', '実行されたとき', 'REVERT。理由は Panic(uint256)（4e487b71 ＋ コード。0x01 は assert、0x11 は桁あふれ、0x12 はゼロでの割り算）', '同上'],
        ['エネルギー不足', '実行されたとき', 'contractRet が OUT_OF_ENERGY。feeLimit の分まで、使い切った', 'feeLimit の分が、焼却される。状態は、元に戻る'],
      ]} />
      <H3>予行で読む</H3>
      <P>書き込みの関数も、<code>triggerconstantcontract</code> で予行できます（9.2）。<B>署名も、手数料も要らず、状態も変わりません</B>。ここでは、<code>reset()</code> を、作成者（Alice）が呼んだ場合と、そうでない Bob が呼んだ場合を、予行します。Counter の <code>reset()</code> は、<code>require(msg.sender == owner, "not owner")</code> で、作成者以外を、はじかれます（7.4）。</P>
      <Code code={dryrunJs} />
      <Out code={dryrunOut} />
      <Note kind="warn">失敗したときの <code>result</code> の形（<code>code</code> や <code>message</code> の有無・書き方）は、ノードの版で変わることがあります。出力が出力例と違うときは、まず、返ってきたJSONをそのまま <code>console.log</code> で確かめてください。失敗の理由は、<code>constant_result</code> の先頭4バイトで見分けます。</Note>
      <H3>実際に失敗した取引を読む</H3>
      <P>予行で失敗が分かるのに、取引を送ると、<B>失敗する取引も、台帳に残り、使った分が焼却されます</B>。それを、目で確かめます。次のコードは、Bob が <code>reset()</code> を送ります（練習なので、<code>feeLimit</code> を 10 TRX に下げています）。9.5の <code>checkCall</code> で、取引を点検してから、署名します。<B>点検は、取引が「頼んだとおり」かを確かめるもので、実行が成功するかは、確かめません</B>。実行が失敗することは、点検では、見つかりません。</P>
      <Code code={failJs} />
      <Out code={failOut} />
      <Note kind="point">取引の結果には、失敗の理由が、2か所に残ります。<code>resMessage</code> は、ノードの短い説明（16進の文字列。<code>REVERT opcode executed</code>）、<code>contractResult</code> は、コントラクトが返した理由（<code>Error(string)</code> のバイト列）です。<B>理由を読むには、<code>contractResult</code> を見ます</B>。第12章では、エネルギーの見積りと、<code>OUT_OF_ENERGY</code> の読み方を扱います。</Note>
      <Note kind="ex">失敗する取引を送る前に、予行で確かめるのは、手数料を無駄にしないための、いちばん手軽な方法です。ただし、予行と実際の実行では、ブロックに入るまでの間に、状態が変わるかもしれません。予行が成功しても、実際の実行が、失敗することはあります。</Note>

      <H>9.8 SDKの近道：contract()</H>
      <Note kind="goal"><code>contract()</code> で、読み取りと書き込みを1行で呼び、各層が何をしているかを説明できる。</Note>
      <P>ここまでの手順を、SDKは、<code>tronWeb.contract(abi, address)</code> で、まとめて行います。ABIを渡すと、関数が、メソッドになります。<B>読み取りは <code>call()</code>、書き込みは <code>send()</code></B> です。第4章の <code>sendTransaction</code>（4.8）と同じ、<B>1行で送る近道</B>です。</P>
      <Code code={contractJs} />
      <Out code={contractOut} />
      <Note kind="warn"><B><code>send()</code> は、組み立て・署名・アナウンスを、1回の呼び出しで行います</B>。署名の前に、取引の中身を点検する場所が、ありません。9.5の <code>checkCall</code> を挟むには、<code>triggerSmartContract</code> で取引を作り、点検してから、署名して送る道（9.6）を使います。近道は、練習用の鍵と、中身を信頼できる関数だけに、使ってください。<code>call()</code> の戻り値の型（BigInt・文字列など）は、SDKの版で違うので、<code>num</code> のように、受け取った値を、いったん文字にして扱うと安全です。</Note>
      <P>ここまでに使った3つの層を、整理します。</P>
      <Tbl head={['層', '道具', '何をしてくれるか']} rows={[
        ['HTTP API', 'wallet/triggerconstantcontract', 'data を、そのまま渡す。セレクタも引数も、自分で組み立てる（9.4）'],
        ['transactionBuilder', 'triggerConstantContract、triggerSmartContract', '関数名の文字列と、型つきの引数から、data を作る。書き込みは、署名前の取引を返す（9.4、9.5）'],
        ['contract()', 'call()、send()', 'ABIから、関数をメソッドにする。send() は、署名・アナウンスまで、まとめて行う（9.8）'],
      ]} />
      <Note kind="point">層が上がるほど、書く量は減りますが、<B>自分が目で確かめられる場所が、減ります</B>。この講座では、下の層（data を手で並べる、署名の前に点検する）を押さえてから、上の層を使います。上の層で動かないときに、下の層で、何が起きているかを確かめられるからです。</Note>

      <H>9.9 つまずきやすい点</H>
      <Ul items={[
        '「8.6 を先に実行してください」と出る：counterAddr、counterHex が、定義されていません。ページを再読み込みすると、消えます。8.6の注意の方法で、控えたアドレスから戻してください。',
        '「第4章の4.2までを済ませてください」と出る：bob が、定義されていません。4.2を実行してください。',
        '9.4で、constant_result が空になる：data の組み立てを、間違えています。セレクタの関数名・型・空白を確かめてください。呼び先が、コントラクトではない（アドレスの誤り）ときも、空になります。',
        '9.4で、「同じ: false」になる：手組みの data と、SDKの data が違います。引数のない関数なら、セレクタだけのはずです。引数の型や、並べ方を確かめてください。',
        '9.5の点検で、有効期限や参照ブロックが NG になる：取引を作ってから、60秒以上たっています。9.6のコードは、取引を作り直すので、そちらを実行してください。',
        'triggerSmartContract が、エラーを返す：呼び先のアドレスや、関数の署名の文字列が、誤っています。そのコントラクトに、その関数があるかを、ABI（8.2）で確かめてください。',
        '9.6で contractRet が REVERT になる：count が上限（MAX＝10）に達しています（require(count < MAX, "limit reached")）。予行（9.7）で、理由を読んでください。作成者なら、reset() で戻せます。',
        '9.6で contractRet が OUT_OF_ENERGY になる：エネルギーが足りず、feeLimit も尽きました。Aliceの残高（TRX）と、feeLimit を確かめてください。取引は台帳に残り、焼却された分は、戻りません。',
        '9.7の後半で、Bobの取引がブロックに入らない、または失敗する理由が REVERT ではない：Bobの残高が足りないことがあります。第4章の送金で、Bobに、少しのTRXを送ってください。',
        '9.7で、予行の結果の形が、出力例と違う：ノードの版で、result の中身が変わることがあります。返ってきたJSONを、そのまま表示して、constant_result と message を見てください。',
        '9.8で、owner() の戻り値の形が、出力例と違う：SDKの版で、アドレスが、41付きの16進・0x付きの16進・Base58のどれかで返ります。比べるときは、下位20バイト（40桁）だけを使います。',
        '9.8で、count() が、思った数と違う：9.6や9.8を、何度も実行すると、増えます。count は、実行した回数だけ増え、上限は10です。作成者（Alice）は、reset() で、0に戻せます。',
      ]} />

      <H>9.10 次のステップ</H>
      <P>これで、Counter の関数を、読み取りと書き込みに分けて呼べるようになりました。<code>data</code> を手で組み立てて、SDKの結果と比べ、書き込みの取引は、署名の前に、呼び先と関数を点検しました。戻り値は、型に合わせて32バイトずつ読み、失敗の理由は、予行と取引の結果から読めます。次の<B>第10章</B>では、取引の結果の <code>log</code> に残った<B>イベント</B>を取り出します。トランザクションごと、コントラクトごとの検索と、ポーリングによる監視を扱います。9.6と9.8で呼んだ <code>increment()</code> が、<code>Incremented</code> イベントとして、台帳に残っています。</P>
    </>
  );
}
