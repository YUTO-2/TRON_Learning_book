import { Code, H, Out, P } from './ui';
import { B, Note, Tbl, Ul } from './introParts';
import logJs from './tronmain/ch10/log.js?raw';
import txeventsJs from './tronmain/ch10/txevents.js?raw';
import contracteventsJs from './tronmain/ch10/contractevents.js?raw';
import watchJs from './tronmain/ch10/watch.js?raw';
import confirmedJs from './tronmain/ch10/confirmed.js?raw';
import sdkJs from './tronmain/ch10/sdk.js?raw';

// 出力例のうち、txID・アドレス・ブロック番号・時刻・件数は見本。32バイトの値は、桁数をそろえて組み立てている。
const W1 = '0'.repeat(63) + '1';
const WBY = '0'.repeat(24) + 'bb3605a39e7febadf055da74a2425d364feec4d0'; // indexed の by（アドレスの20バイトの左を、ゼロで埋めた形）

const logOut = `--- ABIのイベント（目印の先頭4バイト） ---
Incremented(address,uint256)   38ac789e
Reset(address)                 162f4678
--- 取引 c41d…（9.6の increment()）の log ---
ログの数: 1
log[0] address（発行したコントラクト）: （Counterの20バイト） （Counter: true ）
  topics[0]: 38ac789e…（64桁）
  topics[1]: ${WBY}
  data      : ${W1}
  → Incremented(address,uint256)
     by = T…（Alice）
     newCount = 1
  by は Alice: true`;

const txeventsOut = `件数: 1
そのままの形（1件目）: {"block_number":（ブロック番号）,"block_timestamp":（ミリ秒）,"contract_address":"T…（Counter）","event_index":0,"event_name":"Incremented","event":"Incremented(address,uint256)","transaction_id":"c41d…","result":{"by":…,"newCount":"1"},…}
--- Incremented ---
event（署名）  : Incremented(address,uint256)  event_index: 0
ブロック       : （ブロック番号） （時刻）
コントラクト   : T…（Counter） （Counter: true ）
by             : （Aliceのアドレス。版によって、Base58・0x付き・41付きの16進）  newCount: 1
--- 手読みとの照合 ---
イベント名 : true
by         : true
newCount   : true
--- 失敗した取引（9.7） ---
contractRet が REVERT の取引のイベント: 0 件`;

const contracteventsOut = `全イベント: 2 件
名前ごと  : {"Incremented":2}
（ブロック番号） （時刻） Incremented  tx: c41d…  by: bb3605a3…  newCount: 1
（ブロック番号） （時刻） Incremented  tx: 5d7e…  by: bb3605a3…  newCount: 2
--- 名前で絞る（event_name=Incremented） ---
Incremented: 2 件
--- 発行した人ごと（by で数える。by は indexed だが、絞り込みはサーバーではなく、手元で行う） ---
Alice: 2 件  それ以外: 0 件
--- イベントから、count を組み立て直す ---
イベントから: 2  count() の読み取り: 2  一致: true`;

const watchOut = `起点：既存のイベント 2 件を、見たことにしました
送りました txid: 9b3f…  監視を始めます（3秒おき。最大45秒）
経過 3秒  問い合わせ 1 回目  新しいイベント: 0 件
経過 6秒  問い合わせ 2 回目  新しいイベント: 0 件
経過 9秒  問い合わせ 3 回目  新しいイベント: 1 件
   → Incremented newCount = 3  ブロック （ブロック番号）  ← 送った取引
拾えました`;

const confirmedOut = `経過   0秒   確定前: 1 件   確定済み: 0 件
経過   6秒   確定前: 1 件   確定済み: 0 件
（確定前が続く）
経過  54秒   確定前: 1 件   確定済み: 0 件
経過  60秒   確定前: 0 件   確定済み: 1 件
確定しました。ここから先は、巻き戻りません`;

const sdkOut = `取引ごと    SDK: 1 件  HTTP: 1 件
コントラクト SDK: 3 件  HTTP: 3 件
同じ取引が、同じ順に並ぶ: true
先頭1件: {"block_number":（ブロック番号）,"event_name":"Incremented",…}`;

// TRON開発概論: 第10章 イベント。
export default function TronCh10() {
  return (
    <>
      <P>第9章で呼んだ <code>increment()</code> は、<code>Incremented</code> というイベントを、台帳に残しました（9.6）。この章では、そのイベントを<B>取り出します</B>。まず、取引の結果の <code>log</code> を、ABIと引き合わせて、<B>手で値に戻し</B>ます。そのうえで、<B>取引ごと</B>・<B>コントラクトごと</B>に、イベントを探す道（TronGridのv1）を使い、<B>ポーリング</B>で、新しいイベントを見張ります。最後に、イベントが<B>確定前と確定済みで違って見える</B>ことを、確かめます。</P>

      <H>10.1 この章の進め方</H>
      <Note kind="goal">イベントが、台帳のどこにどんな形で残るかを説明し、取引ごと・コントラクトごとに取り出して、新しいイベントを見張れる。</Note>
      <Tbl head={['節', 'やること', '使うもの', '第1章との対応']} rows={[
        ['10.2', 'ログの形を読み直し、取り出す3つの道を整理する', '—', '1.20'],
        ['10.3', '取引の結果の log を、ABIと引き合わせて、手で値に戻す', 'gettransactioninfobyid、sha3', '1.20、7.5'],
        ['10.4', '取引ごとに、イベントを取る。手読みと比べる。失敗した取引を見る', '/v1/transactions/…/events', '1.20'],
        ['10.5', 'コントラクトごとに探す。ページをめくり、名前で絞り、イベントから状態を組み立て直す', '/v1/contracts/…/events', '1.20'],
        ['10.6', 'ポーリングで、新しいイベントを見張る', 'min_block_timestamp', '1.13'],
        ['10.7', '確定前と確定済みの違いを、確かめる', 'only_unconfirmed、only_confirmed', '1.13'],
        ['10.8', 'SDKの近道 tronWeb.event を使い、結果を比べる', 'tronWeb.event', '1.20'],
      ]} />
      <Note kind="point">この章のコードは、10.6で、Nileに取引を<B>1回</B>送ります（<code>increment()</code>。第9章と同じ）。第9章の9.6（<code>callTxid</code>）までと、9.5（<code>checkCall</code>・<code>CALL</code>）、第8章の <code>counterAddr</code>・<code>counterHex</code>・<code>COUNTER_ABI</code> を、コンソールに残しておいてください。10.4の最後の確認には、9.7の <code>failInfo</code> を使います（無くても動きます）。ページを再読み込みすると変数が消えるので、そのときは、順にやり直してください。</Note>
      <Note kind="warn">イベントを探すTronGridは、<B>ノードとは別の仕組み</B>（ノードのログを取り込んで、検索できるようにしたもの）です。取引がブロックに入ってから、探せるようになるまで、少し間があくことがあります（10.6）。練習は、テストネットのNileで行ってください。</Note>

      <H>10.2 ログの形と、取り出す道</H>
      <Note kind="goal">ログの各欄の意味を言い、イベントを取り出す3つの道の違いを説明できる。</Note>
      <P>イベントは、取引の結果の <code>log</code> に、<B>1件ずつ</B>残ります（1.20）。<code>increment()</code> の1回の呼び出しで、<code>Incremented</code> が1件です。ノードが返す <code>log</code> の各欄は、次のとおりです。</P>
      <Tbl head={['欄', '内容', 'Incremented の場合']} rows={[
        ['address', 'イベントを発行したコントラクト（41を除いた20バイト）', 'Counter。呼んだ人（Alice）ではない'],
        ['topics[0]', 'イベントの署名のKeccak-256（32バイト）', '38ac789e…（7.5）'],
        ['topics[1]〜', 'indexed の引数。宣言の順に、32バイトずつ', 'by（Aliceの20バイトの左を、ゼロで埋めた形）'],
        ['data', 'indexed でない引数。宣言の順に、32バイトずつ', 'newCount（32バイトの整数）'],
      ]} />
      <P>この <code>log</code> は、<B>取引の結果（gettransactioninfobyid）の中</B>にあります。取引のIDが分かっていれば、読めます。しかし、「このコントラクトのイベントを、全部」「新しいイベントだけ」のような探し方は、ノードのAPIでは、できません。そこで、取り出す道は、3つに分かれます。</P>
      <Tbl head={['道', '何を渡すか', '返るもの', '向いている場面']} rows={[
        ['取引の結果の log（ノードのAPI）', '取引のID', '生のログ（topics と data）。読むには、ABIが要る', '1つの取引の結果を、確かめたいとき（10.3）'],
        ['TronGrid v1：取引ごと', '取引のID', 'ABIで読んだ形（イベント名と、引数の名前・値）', '1つの取引のイベントを、手軽に読みたいとき（10.4）'],
        ['TronGrid v1：コントラクトごと', 'コントラクトのアドレス（名前・期間・確定の別で、絞れる）', '同上（複数件。ページ分け）', '履歴の検索、集計、監視（10.5〜10.7）'],
      ]} />
      <Note kind="point">ログは、コントラクトの<B>状態（変数）とは別の場所</B>に残り、コントラクトの中からは読めません（1.20）。そのかわり、<B>書き込みの呼び出しの記録</B>として、外から探す用途に向きます。「いつ、誰が、何をしたか」の履歴は、状態（<code>count</code>）には残らず、イベントにだけ残ります。</Note>

      <H>10.3 取引の結果の log を、手で読む</H>
      <Note kind="goal">log の topics と data を、ABIのイベントの定義と引き合わせて、値に戻せる。</Note>
      <P>9.6で呼んだ <code>increment()</code> の結果から、<code>log</code> を取り出して、読みます。やることは、次の3つです。</P>
      <Ul items={[
        'ABIのイベントから、署名（Incremented(address,uint256)）と、その目印（Keccak-256）の一覧を作る。名前と indexed は、署名に入れない（7.5）',
        'log の topics[0] を、目印の一覧と引き合わせて、どのイベントかを決める',
        'ABIの引数を、宣言の順に見て、indexed なら topics[1] から、そうでなければ data から、32バイトずつ取る。型に合わせて、address は下位20バイトに41を付け、uint256 は整数にする（9.4と同じ）',
      ]} />
      <Code code={logJs} />
      <Out code={logOut} />
      <Note kind="point">ログには、引数の<B>名前も、型も、入っていません</B>。32バイトの値が、並んでいるだけです。名前と型は、<B>ABIから</B>補います。ABIが手元にないと、<code>38ac789e…</code> が何のイベントなのかも、<code>1</code> が何の値なのかも、分かりません。TronGridが、コントラクトのABIを使って、読みやすい形にしてくれるのは、この手間を、肩代わりしているのです（10.4）。</Note>
      <Note kind="warn"><B>indexed の引数は、topics に入ります</B>。<code>by</code> が indexed でなかったら、<code>by</code> も、<code>newCount</code> も、data に、64桁ずつ並びます。<code>string</code> や <code>bytes</code>、配列の引数は、indexed でも、そうでなくても、さらに別の形になります（7.4の Error(string) と同じ「位置・長さ・中身」。indexed の場合は、中身のハッシュだけが topic に入り、元の値は戻せません）。この章のコードは、address・数・bool だけを読みます。</Note>

      <H>10.4 取引ごとに、イベントを取る</H>
      <Note kind="goal">TronGridで、取引のイベントを取り、手読みの結果と一致することを確かめる。失敗した取引には、イベントが残らないことを確かめる。</Note>
      <P>取引のIDからイベントを引くAPIは、<code>/v1/transactions/{'{'}txID{'}'}/events</code> です。ここでは、HTTPを直接呼び、10.3の手読みと比べます。接続先は、第2章の <code>NILE</code> です。</P>
      <Code code={txeventsJs} />
      <Out code={txeventsOut} />
      <Tbl head={['欄', '内容']} rows={[
        ['event_name・event', 'イベントの名前と、署名（Incremented(address,uint256)）'],
        ['result', '引数の、名前と値（by、newCount）。位置の番号（"0"、"1"）でも、入っていることがある'],
        ['contract_address', 'イベントを発行したコントラクト'],
        ['transaction_id・event_index', 'どの取引の、何番目のイベントか。この2つで、イベントを一意に決められる（10.6で使う）'],
        ['block_number・block_timestamp', '入ったブロックと、その時刻（ミリ秒）'],
      ]} />
      <Note kind="warn"><code>result</code> の中のアドレスの形（Base58・0x付きの16進・41付きの16進）や、整数が文字列かどうかは、APIの設定や版で変わることがあります。このコードでは、<code>h20</code>（10.3）で、下位20バイトにそろえてから、比べています。出力が出力例と違うときは、まず、返ってきたJSONを、そのまま <code>console.log</code> で確かめてください。</Note>
      <P>最後の行は、9.7で Bob が失敗させた取引の、イベントを引いています。<B>REVERT した取引には、イベントが残りません</B>。失敗すると、状態の変更と一緒に、<code>emit</code> も取り消されるからです。台帳には、取引と手数料の記録だけが残ります（9.7）。<B>イベントがない</B>ことは、<B>何も起きなかった</B>ことの、ひとつの確かめになります。</P>

      <H>10.5 コントラクトごとに、イベントを探す</H>
      <Note kind="goal">コントラクトのイベントを、続きまで取り切り、名前で絞り、発行した人ごとに数え、イベントから状態を組み立て直せる。</Note>
      <P>コントラクトごとの検索は、<code>/v1/contracts/{'{'}アドレス{'}'}/events</code> です。問い合わせに、次の条件を付けられます。</P>
      <Tbl head={['条件', '意味']} rows={[
        ['event_name', 'イベントの名前で絞る（Incremented など）'],
        ['order_by', '並び順。block_timestamp,asc が古い順、block_timestamp,desc が新しい順'],
        ['min_block_timestamp・max_block_timestamp', 'ブロックの時刻（ミリ秒）の範囲で絞る（10.6）'],
        ['block_number', 'ブロック番号で絞る'],
        ['only_confirmed・only_unconfirmed', '確定済み・確定前のどちらかだけにする（10.7）'],
        ['limit', '1回の件数の上限（最大200）'],
        ['fingerprint', '続きを取るための印。前の結果の meta に入っている'],
      ]} />
      <P>結果が1回で収まらないときは、返ってきた <code>meta.fingerprint</code> を、<B>次の問い合わせに付けて</B>、続きを取ります。<code>fingerprint</code> が無くなったら、全部取れたということです。次のコードは、この続きの取り方を <code>getAll</code> にまとめ、取ったイベントを、3通りに使います。</P>
      <Code code={contracteventsJs} />
      <Out code={contracteventsOut} />
      <P>最後の「組み立て直し」は、<B>イベントから、状態を作り直す</B>やり方です。<code>Incremented</code> が来たら <code>newCount</code> に、<code>Reset</code> が来たら 0 にする、という規則で、古い順に適用すると、いまの <code>count</code> と一致します。イベントが、状態の変化を、漏れなく記録しているからです。台帳の外に、検索用のデータベースを作るアプリは、この考え方で、状態を再現します。</P>
      <Note kind="warn">この組み立て直しは、<B>順番どおりに適用する</B>ことが前提です。同じブロックに、2つの取引が入ると、<code>block_timestamp</code> は同じになり、並びが、取引の順とは限りません。このコードのように、<code>newCount</code> の値そのものを使う場合は、順番の間違いが、結果に直接出ます。件数を数えるだけの集計なら、順番は問題になりません。</Note>
      <Note kind="ex">indexed の引数（<code>by</code>）で、サーバー側の絞り込みができるとは限りません。ここでは、取ってから、手元で数えています。<B>大量のイベントのうち、特定のアドレスのものだけがほしい</B>ときは、取ったものを手元で絞るのか、そのアドレスのアカウントの取引履歴（TronGridの別の窓口）から辿るのかを、あらかじめ、決めておく必要があります。</Note>

      <H>10.6 ポーリングで、新しいイベントを見張る</H>
      <Note kind="goal">一定の間隔で問い合わせ、まだ見ていないイベントだけを、重複なく処理するコードを書ける。</Note>
      <P>この講座で使うHTTPのAPIには、「イベントが起きたら、知らせる」窓口はありません。そこで、<B>一定の間隔で問い合わせて、新しいものだけを拾う</B>、<B>ポーリング</B>を使います。ブロックは約3秒おきにできるので、問い合わせも、3秒おきにします。</P>
      <P>新しいものだけを拾うには、「どこまで見たか」を、覚えておく必要があります。次の2つを使います。</P>
      <Ul items={[
        'cursor（時刻）：見たいちばん新しいブロックの時刻。次の問い合わせの min_block_timestamp に渡し、古いものを、取らないようにする',
        'seen（印の集合）：処理済みのイベントの印。transaction_id と event_index の組。同じ時刻のイベントは、次の問い合わせにも、重なって返ることがあるので、印で重複を除く',
      ]} />
      <Code code={watchJs} />
      <Out code={watchOut} />
      <P>「送りました」から「拾えました」まで、数秒〜十数秒かかります。内訳は、<B>ブロックに入るまで</B>（約3秒）と、<B>TronGridが取り込むまで</B>です。問い合わせの間隔を縮めても、取り込みが済むまでは、見えません。</P>
      <Note kind="point">ポーリングの要点は、<B>「取りこぼさない」ことと、「二重に処理しない」こと</B>です。cursor を、いまの時刻ではなく、<B>見たイベントの時刻</B>にするのは、取り込みが遅れたイベントを、取りこぼさないためです。同じ時刻のものが重なって返るのは、時刻の範囲に、境界を含めているからで、seen が、それを、受け止めます。実際のアプリでは、seen と cursor を、ファイルやデータベースに保存して、再起動しても、続きから見張れるようにします。</Note>
      <Note kind="warn">このコードは、<B>起動した時点より前のイベントは、処理しません</B>（既存のイベントを、見たことにする）。起動していなかった間のイベントを、あとから取りたいときは、cursor を、保存しておいた時刻から始めます。<code>count</code> が上限（<code>MAX</code>＝10）のときは、<code>increment()</code> が REVERT になり、イベントが出ません。コードは、先にその状態を調べて、止まります。</Note>

      <H>10.7 確定前と確定済み</H>
      <Note kind="goal">イベントが、確定前と確定済みで、取れる条件が違うことを、時間を追って確かめられる。</Note>
      <P>ブロックに入ったイベントは、すぐに取れますが、まだ<B>巻き戻る可能性があります</B>（1.13）。19人以上のSRが確認して、はじめて確定です。TronGridは、この区別を、問い合わせの条件で、使い分けられます。</P>
      <Tbl head={['条件', '返るもの', '向いている場面']} rows={[
        ['only_unconfirmed=true', '確定前のものだけ', '画面に、すぐに反映したい。表示の更新（あとで取り消される可能性を、許す）'],
        ['only_confirmed=true', '確定済みのものだけ', 'お金や権利が動くことの確認。入金の確定、残高の反映（第5章の confirmPayment と同じ考え方）'],
      ]} />
      <P>10.6で送った取引（<code>watchTxid</code>）を使い、2つの条件で、見比べ続けます。確定するまで、1分ほどかかります。</P>
      <Code code={confirmedJs} />
      <Out code={confirmedOut} />
      <Note kind="point">確定前は「確定前：1件、確定済み：0件」で、確定すると「確定前：0件、確定済み：1件」に変わります。<B>同じイベントが、確定前の窓口から消えて、確定済みの窓口に移る</B>のです。確定前のイベントだけを見て、処理を進めると、取り消されたときに、<B>起きなかったことに、反応してしまう</B>ことがあります。<B>お金の動きを、イベントで確かめるときは、確定済みだけを、使います</B>。</Note>

      <H>10.8 SDKの近道：tronWeb.event</H>
      <Note kind="goal"><code>tronWeb.event</code> で、取引ごと・コントラクトごとのイベントを取り、HTTPの結果と比べられる。</Note>
      <P>ここまで、HTTPを直接呼んできました。SDKには、同じ問い合わせをする部品 <code>tronWeb.event</code> があります。<code>getEventsByTransactionID</code> が取引ごと、<code>getEventsByContractAddress</code> がコントラクトごとです。HTTPの結果と、件数・並びを比べます。</P>
      <Code code={sdkJs} />
      <Out code={sdkOut} />
      <Note kind="warn">SDKの戻り値の形（配列か、<code>data</code> の中か）と、オプションの名前（<code>eventName</code>・<code>orderBy</code>・<code>limit</code> など）は、<B>SDKの版で違います</B>。出力が合わないときは、返ってきた値を、そのまま <code>console.log</code> で見て、版に合わせて直してください。<B>SDKが、中で呼んでいるのは、10.4・10.5のAPIです</B>。結果が合わないときは、HTTPで、同じ問い合わせをして、どちらが違うのかを、切り分けられます。</Note>
      <Tbl head={['層', '道具', '何をしてくれるか']} rows={[
        ['ノードのAPI', 'wallet/gettransactioninfobyid の log', '生のログ。ABIで読むのは、自分（10.3）'],
        ['TronGrid v1（HTTP）', '/v1/transactions/…/events、/v1/contracts/…/events', 'ABIで読んだ形で、検索できる。ページ分け・絞り込み・確定の別は、条件で指定する（10.4〜10.7）'],
        ['SDK', 'tronWeb.event', 'TronGrid v1の問い合わせを、メソッドにする（10.8）'],
      ]} />
      <Note kind="point">第9章と同じく、<B>層が上がるほど、書く量は減りますが、目で確かめられる場所が減ります</B>。イベントは、お金や権利の動きの根拠にしやすい反面、読み違えると、起きていないことを、起きたと思い込みます。ログの形（10.3）と、確定の別（10.7）を押さえてから、上の層を使うと、結果が、おかしいときに、原因を切り分けられます。</Note>

      <H>10.9 つまずきやすい点</H>
      <Ul items={[
        '「9.6 を先に実行してください」と出る：callTxid が、定義されていません。ページを再読み込みすると、消えます。9.6の方法で、取引をもう一度送るか、台帳に残っている取引のIDを、callTxid に入れてください（例：callTxid = "…"）。',
        '「10.3 と 10.4 を先に実行してください」と出る：getJson・h20 などが、定義されていません。10.3から、順に実行してください。',
        '10.3で、ログの数が 0 になる：取引が、ブロックに入っていないか、実行に失敗しています（REVERT の取引には、ログがありません。10.4）。9.6の結果の contractRet を、確かめてください。',
        '10.4で、件数が 0 になる：取引が入った直後は、TronGridが、まだ取り込んでいないことがあります。数秒待って、もう一度実行してください。それでも 0 なら、取引が失敗していないかを、確かめてください。',
        '10.4で、「HTTP 4xx」「HTTP 5xx」で止まる：TronGridの、アクセスの回数の制限に、当たっているかもしれません。少し待って、やり直してください。回数が多いときは、APIキーを使います（第2章）。',
        '10.4の「手読みとの照合」が false になる：アドレスの形か、整数の形が違うだけのことが、あります。result の中身を、そのまま表示して、確かめてください。h20 でそろえるのは、アドレスだけです。',
        '10.5で、「イベントから」と「count() の読み取り」が、一致しない：取引が、直前に入ったばかりで、取り込みが間に合っていない、または、同じブロックの中の順番が、入れ替わっています（10.5の注意）。少し待って、実行し直してください。',
        '10.6で、「count が上限です」と出て止まる：Counter の count が、MAX（10）に達しています。Alice が reset() を呼んで、0 に戻してから、やり直してください。reset() を呼ぶ取引にも、9.5の checkCall で、点検を挟めます（selOf("reset()") を、頼んだ data にします）。',
        '10.6で、45秒たっても、見つからない：取引が、ブロックに入ったかを、4.7の showResult で確かめてください。ブロックに入っていれば、TronGridの取り込みが遅れています。問い合わせを、もう少し続けてください。',
        '10.6で、同じイベントが、何度も表示される：seen と cursor が、ループのたびに、作り直されています。コードを書き換えたときは、seen の初期化を、ループの外に置いてください。',
        '10.7で、2分たっても、確定済みが 0 件のまま：Nileの確定が、遅れていることがあります。しばらくしてから、もう一度実行してください。それまでに、watchTxid が消えたときは、10.6を、やり直してください。',
        '10.8で、SDKの戻り値の形が、違う：版によって、配列、または { data: … } で返ります。list で、どちらも配列にしていますが、それでも合わないときは、返ってきた値を、そのまま表示してください。',
      ]} />

      <H>10.10 次のステップ</H>
      <P>これで、イベントを、3つの道（取引の結果の <code>log</code>、取引ごと、コントラクトごと）で取り出し、ログを、ABIと引き合わせて、手で読めるようになりました。ポーリングで、新しいイベントを、取りこぼさず、重複なく拾い、確定前と確定済みの違いも、確かめました。次の<B>第11章</B>では、<B>TRC-20のトークン</B>を、自作します。<code>transfer</code>・<code>approve</code>・<code>transferFrom</code>・<code>allowance</code> を、Counter と同じ手順（デプロイ → 呼び出し）で動かし、<code>Transfer</code>・<code>Approval</code> のイベントを、この章の道具で、取り出します。</P>
    </>
  );
}
