import { Code, H, Out, P } from './ui';
import { B, Note, Tbl, Ul } from './introParts';
import bobJs from './tronmain/ch04/bob.js?raw';
import buildJs from './tronmain/ch04/build.js?raw';
import rawcheckJs from './tronmain/ch04/rawcheck.js?raw';
import signJs from './tronmain/ch04/sign.js?raw';
import broadcastJs from './tronmain/ch04/broadcast.js?raw';
import confirmJs from './tronmain/ch04/confirm.js?raw';
import bobafterJs from './tronmain/ch04/bobafter.js?raw';
import solidJs from './tronmain/ch04/solid.js?raw';
import onelinerJs from './tronmain/ch04/oneliner.js?raw';

// 出力例の値は、実行ごとに変わる（txID・時刻・参照ブロックなど）。Bobの鍵は、見本として作った使い捨てのもの。
const bobOut = `Bob            : TJfu3Nsty8pNWYoimVURiv2C1L6aLZzWwL
Bobは台帳にいるか: false
Aliceの残高    : 2000000000 sun → TRX: 2000`;

const buildOut = `署名          : なし
txID          : a97e5f1c54606c60b12e9b78ac1f569568853ecb40cea58332fb560a58122ec1
raw_data_hex  : 0a0244b92208a1b2c3d4e5f6071840f0…（133バイト）
種類          : TransferContract
送り主(16進)  : 4191840a51887c30bde932081badd38d8a16e96b32
宛先(16進)    : 415f7311850c9e555284d3110ab69d94bba5015b2a
量(sun)       : 1000000
参照ブロック  : 44b9 a1b2c3d4e5f60718
作成時刻      : 2026-10-19T04:21:31.842Z
有効期限      : 2026-10-19T04:22:30.000Z （作成の約58秒後）`;

const rawcheckOut = `欄1  ref_block_bytes : 4 バイト
欄4  ref_block_hash  : 10 バイト
欄8  expiration      : 7 バイト
欄11 contract        : 105 バイト
欄14 timestamp       : 7 バイト
手組みの raw_data     : 133 バイト
raw_data_hex が一致   : true
SHA-256 が txID と一致: true`;

const signOut = `署名の数       : 1
署名の長さ     : 65 バイト
署名           : 7c1e5b0f93a24d68e1b7c9a0d4f3e2b5…
txID が同じ    : true
raw_data が同じ: true
元のtxの署名   : なし`;

const broadcastOut = `result: true  txid: a97e5f1c54606c60b12e9b78ac1f569568853ecb40cea58332fb560a58122ec1
https://nile.tronscan.org/#/transaction/a97e5f1c54606c60b12e9b78ac1f569568853ecb40cea58332fb560a58122ec1`;

const confirmOut = `実行結果 contractRet : SUCCESS
入ったブロック       : 66012348  時刻: 2026-10-19T04:21:36.000Z
手数料 fee           : 1100000 sun（焼却された合計）
帯域幅 net_usage     : 0 バイト（無料枠・ステークから）
帯域幅 net_fee       : 100000 sun（TRXを焼却して払った分）
Aliceの残高の減り    : 2100000 sun = 2.1 TRX`;

const bobafterOut = `Bobは台帳にいるか: true
Bobの残高(sun)   : 1000000  → TRX: 1
Bobの作成時刻    : 2026-10-19T04:21:36.000Z`;

const solidOut = `確定済みの台帳にあるか: まだなし（未確定）`;

const onelinerOut = `result: true  txid: 4e88e934ecaaf754a91a5104dd1e4183cbfbd594cbdc37a629beace5d063cc0b
実行結果 contractRet : SUCCESS
入ったブロック       : 66012351  時刻: 2026-10-19T04:21:45.000Z
手数料 fee           : 0 sun（焼却された合計）
帯域幅 net_usage     : 267 バイト（無料枠・ステークから）
帯域幅 net_fee       : 0 sun（TRXを焼却して払った分）
Aliceの残高の減り    : 2000000 sun = 2 TRX`;

// TRON開発概論: 第4章 TRXの送金。
export default function TronCh04() {
  return (
    <>
      <P>この章では、AliceからBobへ、TRXを送ります。1行で済む送金を、<B>組み立て・署名・アナウンス</B>の3段階に分けて実行し、第1章の1.10で手作業で並べた <code>raw_data</code> と、txIDが一致することを確かめます。</P>

      <H>4.1 この章の進め方</H>
      <Note kind="goal">送金を、組み立て・署名・アナウンスの3段階に分けて実行し、それぞれが何をしているかを説明できる。送金の結果と手数料を、台帳から読める。</Note>
      <P>第1章の1.13で見たとおり、トランザクションは、<B>作成 → 署名 → アナウンス</B>の順に、手元で作って、ノードに送ります。TronWebには、この3段階をまとめて1行で行う関数もあります（4.8）。しかし、この章では、あえて<B>1段階ずつ</B>実行します。各段階で、手元にあるものと、ノードが決めているものを、見分けるためです。</P>
      <Tbl head={['段階', 'TronWebの関数', '対応するHTTP API', '秘密鍵']} rows={[
        ['① 組み立て', 'tronWeb.transactionBuilder.sendTrx()', '/wallet/createtransaction', '不要'],
        ['② 署名', 'tronWeb.trx.sign()', 'なし（手元だけで計算する）', '必要'],
        ['③ アナウンス', 'tronWeb.trx.sendRawTransaction()', '/wallet/broadcasttransaction', '不要'],
      ]} />
      <P>秘密鍵を使うのは、②の署名だけです。しかも、署名は手元のブラウザの中で終わり、秘密鍵がネットワークに出ることはありません（1.14）。</P>
      <Tbl head={['節', 'やること', '使うもの', '第1章との対応']} rows={[
        ['4.2', '送金の相手（Bob）を用意する', 'tronWeb.createAccount()', '1.7'],
        ['4.3', '① 組み立て', 'tronWeb.transactionBuilder.sendTrx()', '1.10'],
        ['4.4', '手組みの raw_data と照合する', 'SHA-256（crypto.subtle）', '1.10'],
        ['4.5', '② 署名', 'tronWeb.trx.sign()', '1.10、1.14'],
        ['4.6', '③ アナウンス', 'tronWeb.trx.sendRawTransaction()', '1.13'],
        ['4.7', '結果を確かめる', 'tronWeb.fullNode.request()', '1.12、1.13'],
        ['4.8', '1行で送る', 'tronWeb.trx.sendTransaction()', '1.14'],
      ]} />
      <Note kind="point">この章のコードは、第2章の2.5の①②（SDKの読み込みと共通ロジック）と、第3章のAlice（3.2で作り、3.5でテストTRXを受け取ったもの）が前提です。コンソールの変数は、ページを再読み込みすると消えるので、そのときは①②と、3.2の復元のコードからやり直してください。</Note>
      <Note kind="warn">4.3で作った取引の<B>有効期限は、約60秒</B>です（1.10）。4.3から4.6までは、<B>続けて</B>実行してください。説明を読んでいる間に期限が切れたら、4.3からやり直せば済みます。</Note>

      <H>4.2 送金の相手を用意する</H>
      <Note kind="goal">送金の相手（Bob）をSDKで作り、Bobがまだ台帳に存在しないことを確かめる。</Note>
      <P>3.2と同じ <code>createAccount()</code> で、Bobを作ります。あわせて、送る前のAliceの残高と、Bobが台帳に存在しないことを確かめます。Bobの存在の確かめ方は、3.7と同じです。</P>
      <Code code={bobJs} />
      <Out code={bobOut} />
      <P>Bobは、作っただけでは台帳に存在しません（3.2）。これから送る1 TRXが、Bobを<B>有効化</B>することになります。4.7と4.8で、この違いが、手数料に表れます。</P>
      <Note kind="warn">BobもAliceと同じく、この講座の練習用のアカウントです。Bobの秘密鍵は、この章では使いません（受け取るだけなので、アドレスがあれば足ります）。ページを再読み込みすると、<code>bob</code> は消えます。実際の資産の鍵は、練習に使わないでください。</Note>

      <H>4.3 ① 組み立て</H>
      <Note kind="goal">送金の取引を組み立て、署名前の取引に何が入っているか、そのうち何をノードが決めているかを説明できる。</Note>
      <P><code>tronWeb.transactionBuilder.sendTrx(宛先, 量, 送り主)</code> は、<B>署名前の取引</B>を返します。中身は、HTTP APIの <code>/wallet/createtransaction</code> が作ります。つまり、取引を作るのは、<B>手元ではなくノード</B>です。結果を <code>tx</code> に入れて、中身を読みます。</P>
      <Code code={buildJs} />
      <Out code={buildOut} />
      <Tbl head={['項目', '誰が決めるか', '意味']} rows={[
        ['宛先・量・送り主', '自分（関数の引数）', '何を、誰から誰へ送るか'],
        ['ref_block_bytes、ref_block_hash', 'ノード', '参照するブロック。ノードの最新ブロックから決まる（1.10）'],
        ['timestamp、expiration', 'ノード', '作成時刻と、有効期限（約60秒後）'],
        ['txID', 'ノード', 'SHA-256(raw_data)。4.4で、自分で計算して確かめる'],
        ['signature', '（まだない）', '署名は、4.5で付ける。署名は raw_data の外にある（1.10）'],
      ]} />
      <P>送り主のアドレスは、<B>引数で明示</B>しています。第2章で作った <code>tronWeb</code> は、秘密鍵も、既定のアドレスも持たないためです。アドレスは、Base58で渡せます。取引の中では、16進（41で始まる42桁）で書かれます（3.3）。</P>
      <Note kind="warn">引数の順番は、<B>宛先、量、送り主</B>です。送り主を先に書きたくなりますが、逆です。また、量は<B>sunの整数</B>で渡します（1 TRX ＝ 1,000,000 sun。1.8）。<code>1</code> と書くと、1 sunを送ることになります。</Note>
      <Note kind="warn">この取引は、<B>ノードが作ったもの</B>です。ここでは、出力を目で見て、宛先と量が頼んだとおりかを確かめています。ノードが、宛先や量を書き換えた取引を返してきたら、そのまま署名してはいけません（1.14）。この確かめ方は、第5章で、コードで行います。</Note>

      <H>4.4 手組みの raw_data と照合する</H>
      <Note kind="goal">ノードが返した取引の raw_data を、1.10と同じ手順で自分で並べ直し、txIDを自分で計算して、一致することを確かめられる。</Note>
      <P>1.10では、最新のブロックを参照して、<code>raw_data</code> を手作業でバイト列に並べ、SHA-256でtxIDを求めました。ここでは、同じ手順を、<B>4.3の取引の値</B>で行います。参照ブロック、作成時刻、有効期限は、ノードが決めた値なので、1.10のように自分で決められません。ノードが返した値を、そのまま使います。</P>
      <Code code={rawcheckJs} />
      <Out code={rawcheckOut} />
      <P>2つとも <code>true</code> なら、<B>ノードの返した <code>raw_data_hex</code> は、1.10で自分が並べたバイト列と、1バイトも違わない</B>と分かります。各欄の長さは、欄の番号と長さを示す印（1〜2バイト）を含んでいます。たとえば欄11は、中身の103バイトに印の2バイトが付いて、105バイトです。合計の133バイトは、1.10の出力と同じです。</P>
      <Note kind="point">1.10の手組みは、TransferContractの場合、この5つの欄で足ります。<code>fee_limit</code>（欄18）は、コントラクト呼び出しだけで使います（1.10）。</Note>
      <Note kind="warn">ここで確かめられたのは、<B>txIDが、raw_dataから正しく計算されている</B>ことだけです。raw_dataの中身（宛先や量）が、頼んだとおりかは、別の話です。書き換えられた取引でも、txIDは、書き換えたあとのraw_dataから正しく計算されて、この照合は <code>true</code> になります。第5章で、中身を確かめます。</Note>

      <H>4.5 ② 署名</H>
      <Note kind="goal">取引に署名して、署名が取引のどこにどう付くかを説明できる。</Note>
      <P><code>tronWeb.trx.sign(取引, 秘密鍵)</code> は、取引に署名を付けて返します。署名の対象は <B>txID</B>（<code>raw_data</code> のSHA-256）で、秘密鍵を使ったECDSAの計算は、手元のブラウザの中だけで終わります。</P>
      <Code code={signJs} />
      <Out code={signOut} />
      <Tbl head={['項目', '形', '意味']} rows={[
        ['signature', '配列。1つの署名は、65バイト（16進で130桁）', '署名は、取引の raw_data の外に付く（1.10）。複数並べると、マルチシグになる（1.11）'],
        ['署名の65バイト', 'r（32）＋ s（32）＋ 1バイト', '最後の1バイトは、署名から公開鍵を復元するための値。ノードは、復元した公開鍵から送り主のアドレスを求めて、権限を確かめる（1.13）'],
        ['txID', '署名の前後で変わらない', '署名は raw_data の外にあるので、署名してもtxIDは変わらない'],
      ]} />
      <P>コードでは、<code>structuredClone(tx)</code> でコピーした取引に署名しています。<code>sign()</code> は、渡した取引に署名の欄を書き足して返します。コピーせずに署名すると、<code>tx</code> そのものが署名済みになり、もう一度実行したときに「Transaction is already signed」と出て、署名できなくなります。</P>
      <Note kind="warn">署名に使う秘密鍵は、<B>送り主（Alice）の鍵</B>です。別の鍵で署名すると、送り主のアドレスと合わず、エラーになります。また、実際の資産の鍵は、この講座のコードに貼らないでください。</Note>

      <H>4.6 ③ アナウンス</H>
      <Note kind="goal">署名済みの取引をノードに送り、その結果の読み方と、よくあるエラーを説明できる。</Note>
      <P><code>tronWeb.trx.sendRawTransaction(署名済みの取引)</code> は、取引をノードに送ります。HTTP APIの <code>/wallet/broadcasttransaction</code> に対応します。秘密鍵は不要です。送る前に、有効期限が切れていないかを確かめ、4.7のために、送る前の残高を控えています。</P>
      <Code code={broadcastJs} />
      <Out code={broadcastOut} />
      <Note kind="warn"><code>result: true</code> は、<B>ノードが受け付けた</B>という意味です。ブロックに入った、成功した、という意味ではありません（1.13）。結果は、4.7で確かめます。</Note>
      <P>失敗したときは、<code>result</code> の代わりに、<code>code</code> と <code>message</code> が返ります。<code>message</code> は16進の文字列で届くので、コードの中で文字に直しています。</P>
      <Tbl head={['code', '意味', '対処']} rows={[
        ['SIGERROR', '署名が正しくない。送り主の権限を持たない鍵で署名した、など', '署名に使った鍵が、送り主のものかを確かめる'],
        ['TRANSACTION_EXPIRATION_ERROR', '有効期限が切れている', '4.3からやり直す'],
        ['DUP_TRANSACTION_ERROR', '同じ取引を、すでに受け付けている', '同じ取引を、2回送らない。結果は4.7で確かめる'],
        ['BANDWITH_ERROR', '帯域幅（またはTRX）が足りない。綴りは、ノードの表示のまま', 'Aliceの残高を確かめる'],
        ['CONTRACT_VALIDATE_ERROR', '操作の条件を満たさない（残高不足など）', 'message に理由が書かれている'],
        ['TAPOS_ERROR', '参照ブロックが、このチェーンのものと合わない', '別のネットワークで作った取引を流用していないかを確かめる（1.10）'],
      ]} />

      <H>4.7 結果を確かめる</H>
      <Note kind="goal">送金がブロックに入って成功したことと、手数料の内訳を、台帳から読める。</Note>
      <P>アナウンスのあと、取引は、SRが作るブロックに入ります（約3秒ごと）。次の関数は、ブロックに入るまで3秒おきに調べて（最大30秒）、結果、手数料、Aliceの残高の変化を表示します。後の4.8でも使うので、<code>showResult</code> という名前の関数にしています。</P>
      <Code code={confirmJs} />
      <Out code={confirmOut} />
      <P>ノードへの問い合わせには、<code>tronWeb.fullNode.request(パス, 本体, "post")</code> を使っています。SDKが包んでいるHTTP APIを、そのまま呼ぶ方法です（2.7）。ヘッダー（2.8のAPIキー）も、この方法なら、SDKの設定がそのまま使われます。</P>
      <Tbl head={['項目', '意味', 'どこから']} rows={[
        ['contractRet', '実行結果。SUCCESS なら成功', '/wallet/gettransactionbyid の ret[0]'],
        ['blockNumber、blockTimeStamp', '入ったブロックの高さと時刻', '/wallet/gettransactioninfobyid'],
        ['fee', '焼却されたTRXの合計（sun）。有効化の料金も含む', '同上'],
        ['receipt.net_usage', '帯域幅を、無料枠やステークから使った量（バイト）', '同上'],
        ['receipt.net_fee', '帯域幅を、TRXの焼却で払った分（sun）', '同上'],
      ]} />
      <P>出力例の手数料 <code>1100000</code> sun（1.1 TRX）の内訳は、次のとおりです。Bobは、この送金で有効化されました。</P>
      <Tbl head={['内訳', '金額', '説明']} rows={[
        ['アカウントの有効化の料金', '1,000,000 sun', '受け取り側がまだ台帳にいないときの料金（1.12の getCreateNewAccountFeeInSystemContract）'],
        ['帯域幅の分', '100,000 sun（net_fee）', '新しいアカウントを作る送金は、無料枠の帯域幅が使えず、代わりに0.1 TRXが焼却される（チェーンパラメータ getCreateAccountFee）。ステークした帯域幅があれば、それが使われることがある（第6章）'],
      ]} />
      <P>Aliceの残高の減りは、<B>送った1 TRX ＋ 手数料1.1 TRX ＝ 2.1 TRX</B>です。手数料の単価は、<B>委員会の提案で変わります</B>（1.12）。実際の値は、1.12の <code>getchainparameters</code> で確かめてください。</P>
      <Note kind="point">1.12では、TRX送金は、約270バイトで無料枠（600）に収まる、と見積もりました。それは、<B>受け取り側がすでに有効化されている</B>場合です。有効化を伴う1回目は、無料枠が使えません。2回目（4.8）で、この違いを確かめます。</Note>
      <P>続いて、Bobが有効化されて、1 TRXを受け取ったことを確かめます。確かめ方は、3.7と同じです。</P>
      <Code code={bobafterJs} />
      <Out code={bobafterOut} />
      <P>最後に、確定済みの台帳（solidityノード）に入ったかを確かめます。取引は、約1分で確定します（1.13）。</P>
      <Code code={solidJs} />
      <Out code={solidOut} />
      <P>ブロックに入った直後は「まだなし」です。約1分後に、もう一度実行すると、「あり（確定）」に変わります。確定を待ってから次の処理に進むとき（たとえば、入金を確認して商品を渡すとき）は、確定済みの台帳で確かめます（1.13）。</P>
      <P>送金の記録は、エクスプローラーでも見られます。4.6の最後に表示されたURLを開くと、TRONSCAN（Nile）で、同じ取引を、送り主・宛先・量・手数料つきで確かめられます。</P>
      <Note kind="warn"><code>contractRet</code> が <code>SUCCESS</code> でも、確定済みとは限りません。逆に、<code>SUCCESS</code> 以外のとき、実行は失敗していますが、手数料は消費されます（1.13）。TRXの送金で失敗することは少ないですが、第7章以降のコントラクトの呼び出しでは、この区別が大切になります。</Note>

      <H>4.8 1行で送る</H>
      <Note kind="goal">3段階を1行にまとめた送り方を使い、1回目と2回目の手数料の違いを説明できる。</Note>
      <P><code>tronWeb.trx.sendTransaction(宛先, 量, 秘密鍵)</code> は、組み立て・署名・アナウンスを、内部で順に行います。4.3〜4.6を1行にまとめたものです。送り主は、秘密鍵から求められます。今度は、Bobは有効化されているので、2 TRXを送って、手数料を見比べます。</P>
      <Code code={onelinerJs} />
      <Out code={onelinerOut} />
      <Tbl head={['', '1回目（4.6）', '2回目（4.8）']} rows={[
        ['受け取り側', '台帳にいない（有効化される）', 'すでに有効化されている'],
        ['fee', '1,100,000 sun', '0 sun'],
        ['net_usage', '0 バイト', '267 バイト（無料枠）'],
        ['net_fee', '100,000 sun', '0 sun'],
        ['Aliceの残高の減り', '2.1 TRX（送金1 ＋ 手数料1.1）', '2 TRX（送金のみ）'],
      ]} />
      <P>2回目は、無料枠の帯域幅（1日600。1.12）の中で収まり、TRXは焼却されません。無料枠は、使った分が、約24時間かけて回復します。</P>
      <Note kind="point"><B>1行で送るのは便利ですが、署名の前に、取引の中身を確かめる場所がありません</B>。この章で3段階に分けたのは、段階の間に、確認や別の処理を挟めるからです。署名の前に中身を確かめる（第5章）、署名だけを別の環境で行う、複数の署名を集める、といった使い方は、すべて3段階に分かれていることが前提です。</Note>

      <H>4.9 つまずきやすい点</H>
      <Ul items={[
        '「alice is not defined」と出る：ページを再読み込みすると、変数は消えます。第2章の①②を実行してから、3.2の復元のコードで、Aliceに戻してください。',
        '「Aliceの残高が足りません」と出る：3.5のフォーセットで、テストTRXを受け取ってください。1回目の送金で2.1 TRX、4.8で2 TRXが減ります。',
        '「Invalid recipient provided」や「Invalid origin address provided」と出る：sendTrx() の引数の順番は、宛先、量、送り主です。bob と alice が定義されているか、アドレス（Base58）が空でないかも確かめてください。',
        '「Invalid amount provided」と出る：量は、sunの整数で渡します。小数や文字列、TRX単位の値は受け付けません。',
        '「Transaction is already signed」と出る：署名済みの取引に、もう一度署名しています。4.3からやり直すか、4.5のように、コピーに署名してください。',
        '「Private key does not match address in transaction」と出る：署名の鍵が、送り主（Alice）のものではありません。alice.privateKey で署名しているかを確かめてください。',
        '4.6で「有効期限が切れています」と出る、または TRANSACTION_EXPIRATION_ERROR が返る：4.3から4.6までに、約60秒以上かかっています。4.3から続けて実行してください。',
        'DUP_TRANSACTION_ERROR が返る：同じ取引を、2回送っています。1回目が受け付けられているので、4.7で結果を確かめてください。',
        '4.7で「30秒待っても、ブロックに入りません」と出る：4.6の result が true だったかを確かめてください。true なら、Nileが混んでいる可能性があります。少し待って、showResult(result.txid, balBefore) をもう一度実行します。',
        '「Failed to fetch」や、429エラーが出る：Nileが応答していないか、回数制限です。2.8を確認して、少し待ってから、もう一度実行してください。',
        '4.4の照合が false になる：4.3を実行し直したあとに、4.4を実行しているかを確かめてください。取引にpermission_idなどの欄が加わっているときも、この章の5つの欄だけでは、一致しません。',
      ]} />

      <H>4.10 次のステップ</H>
      <P>これで、AliceからBobへ、TRXを送れるようになりました。ただし、この章では、ノードが作った取引を、中身を確かめずに署名しました。次の<B>第5章</B>では、署名する前に、取引の中身（宛先・量・有効期限・参照ブロック）を、自分で確かめます。ノードが取引を書き換えていたら、どう見つけるか。1.14の警告を、コードで実践します。</P>
    </>
  );
}
