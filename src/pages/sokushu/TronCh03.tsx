import { Code, Ext, H, Out, P } from './ui';
import { B, Note, Tbl, Ul } from './introParts';
import createJs from './tronmain/ch03/create.js?raw';
import restoreJs from './tronmain/ch03/restore.js?raw';
import convertJs from './tronmain/ch03/convert.js?raw';
import verifyJs from './tronmain/ch03/verify.js?raw';
import balanceJs from './tronmain/ch03/balance.js?raw';
import accountJs from './tronmain/ch03/account.js?raw';

// 出力例の値は、実行ごとに変わる（秘密鍵は乱数から作るため）。ここに載せた鍵は、見本として作った使い捨てのもの。
const createOut = `秘密鍵  : A5B052B0B9807B88…（64桁の16進数）
公開鍵  : 04AD60A3435A59D2…（130桁の16進数）
アドレス: TPEdACJkh4Z4h3ng5u3XFpkzbD7RdqfAU1
16進    : 4191840A51887C30BDE932081BADD38D8A16E96B32`;

const convertOut = `Base58          : TPEdACJkh4Z4h3ng5u3XFpkzbD7RdqfAU1
16進（41付き）  : 4191840a51887c30bde932081badd38d8a16e96b32
EVM形式         : 0x91840a51887c30bde932081badd38d8a16e96b32
16進→Base58     : true
秘密鍵→Base58   : true
isAddress       : true true false`;

const verifyOut = `SDKの公開鍵の長さ: 65 バイト 先頭: 04
公開鍵 x が一致  : true
公開鍵 y が一致  : true
21バイトが一致   : true
アドレスが一致   : true`;

const balanceOut = `確定済み(sun): 2000000000  → TRX: 2000
最新(sun)    : 2000000000  → TRX: 2000`;

const accountOut = `作ったばかりのアカウント: {}
Alice(16進)  : 4191840a51887c30bde932081badd38d8a16e96b32
Alice(Base58): TPEdACJkh4Z4h3ng5u3XFpkzbD7RdqfAU1
残高(sun)    : 2000000000  → TRX: 2000
作成時刻     : 2026-10-19T04:12:36.000Z
owner権限    : しきい値 1  鍵の数 1
active権限   : active(しきい値1)`;

// TRON開発概論: 第3章 アカウント。
export default function TronCh03() {
  return (
    <>
      <P>この章では、アカウント（鍵とアドレス）をSDKで作り、テストのTRXを受け取って、残高とアカウント情報を読みます。以降の章で使い続ける<B>Alice</B>も、ここで作ります。</P>

      <H>3.1 この章の進め方</H>
      <Note kind="goal">アカウントをSDKで作り、第1章で手計算した結果と照合し、テストTRXを受け取って、残高とアカウント情報を取得できる。</Note>
      <P>第1章の1.7では、秘密鍵からアドレスまでを、手元の計算で求めました。この章では、同じことをTronWebの関数に任せます。そのうえで、練習用のアカウント<B>Alice</B>を作り、Nileのフォーセットでテスト用のTRXを受け取って、台帳から残高とアカウント情報を読みます。</P>
      <Tbl head={['節', 'やること', '使うもの', '第1章との対応']} rows={[
        ['3.2', 'アカウントを作る', 'tronWeb.createAccount()', '1.7'],
        ['3.3', '鍵とアドレスを変換する', 'tronWeb.address、tronWeb.isAddress()', '1.7（ステップ3・4）'],
        ['3.4', '手計算の結果と照合する', 'tronWeb.utils.crypto', '1.7（ステップ2・3）'],
        ['3.5', 'テストTRXを受け取る', 'Nileのフォーセット', '1.8'],
        ['3.6', '残高を調べる', 'tronWeb.trx.getBalance()', '1.8'],
        ['3.7', 'アカウント情報を取得する', 'tronWeb.trx.getUnconfirmedAccount()', '1.7、1.11'],
      ]} />
      <Note kind="point">この章のコードは、第2章の2.5の①②（SDKの読み込みと共通ロジック）を済ませてから実行します。コンソールの変数は、ページを再読み込みすると消えるので、そのときは①②からやり直してください。</Note>

      <H>3.2 アカウントを作る</H>
      <Note kind="goal">アカウントをSDKで作り、返ってきた値の意味を説明できる。</Note>
      <P><code>tronWeb.createAccount()</code> は、乱数から秘密鍵を作り、そこから公開鍵とアドレスを計算して返します。結果は <code>alice</code> に入れます（<code>const</code> を書かない理由は、2.3の「変数宣言」のとおりです）。</P>
      <Code code={createJs} />
      <Out code={createOut} />
      <P>秘密鍵は乱数で決まるので、<B>実行するたびに、まったく別の値</B>になります。出力例の値とは一致しません。</P>
      <Tbl head={['項目', '形', '第1章との対応']} rows={[
        ['privateKey', '32バイト（16進で64桁）', '1.7の「秘密鍵」。署名に使う、誰にも見せない値'],
        ['publicKey', '65バイト（16進で130桁）。先頭の 04 ＋ x座標32 ＋ y座標32', '1.7の64バイトの公開鍵の前に、04 が付いた形（3.4）'],
        ['address.base58', 'Tで始まる34文字', '1.7のステップ3の「アドレス」'],
        ['address.hex', '41で始まる42桁', '1.7のステップ3の「21バイト（16進）」'],
      ]} />
      <P><code>createAccount()</code> は、<B>ノードに問い合わせません</B>。鍵の生成も、アドレスの計算も、手元のブラウザの中だけで行うので、秘密鍵がネットワークに出ることはありません（第1章の1.7と同じです）。</P>
      <Note kind="point"><B>作っただけでは、台帳には何も書かれません</B>。アカウントは、TRXを受け取って有効化されるまで、台帳に存在しません（1.7）。HTTP APIには <code>/wallet/createaccount</code> という名前の似たものがありますが、そちらは、台帳で有効化するためのトランザクションを作る別の機能です。</Note>
      <Note kind="warn">Aliceには、このあとTRXを入れて、以降の章でも使い続けます。ところが、<B>ページを再読み込みすると、<code>alice</code> は消えます</B>。作ったら、秘密鍵を、練習用のメモとして控えておいてください。控えるのは、この講座の練習用の鍵だけです。実際の資産の鍵は、メモや画面に残さないでください。また、チャットや画面共有に貼らないでください。</Note>
      <P>再読み込みのあとは、①②を実行してから、次のコードで同じAliceに戻します。「入力」ボタンでコンソールに入力し、秘密鍵の部分を書き換えてから、実行してください。</P>
      <Code code={restoreJs} />
      <Note kind="ex">控えを失くしたときは、新しいAliceを作って、フォーセットで受け取り直せば済みます。練習用のTRXには価値がありません。</Note>

      <H>3.3 鍵とアドレスの変換</H>
      <Note kind="goal">アドレスの書き方（Base58・16進・EVM形式）を、SDKの関数で変換し、アドレスの形式を確かめられる。</Note>
      <P>1.7で見たとおり、アドレスの中身は同じ21バイトで、<B>Base58Check（Tで始まる34文字）</B>と、<B>16進（41で始まる42桁）</B>のどちらでも書けます。HTTP APIは、<code>visible</code> の指定で、どちらの書き方でも受け渡せます（1.7の <code>getaccount</code> は <code>visible: true</code>）。TronWebには、変換のための関数があります。</P>
      <Tbl head={['関数', '役割']} rows={[
        ['tronWeb.address.fromPrivateKey(秘密鍵)', '秘密鍵から、Base58のアドレスを求める'],
        ['tronWeb.address.toHex(Base58)', 'Base58を、16進（41付きの42桁）にする'],
        ['tronWeb.address.fromHex(16進)', '16進を、Base58にする'],
        ['tronWeb.isAddress(アドレス)', 'アドレスの形式とチェックサムを確かめる（Base58・16進のどちらも渡せる）'],
      ]} />
      <Code code={convertJs} />
      <Out code={convertOut} />
      <Note kind="point"><B>16進は、大文字と小文字を区別しません</B>。<code>createAccount()</code> は大文字、<code>toHex()</code> は小文字で返します。文字列として比べるときは、<code>toUpperCase()</code> などで、どちらかにそろえてください（3.4で使います）。</Note>
      <Note kind="point">「EVM形式」の <code>0x…</code>（20バイト）は、TRONのアドレスから、先頭の <code>41</code> を除いた部分です。<code>isAddress()</code> は <code>0x</code> 形式を受け付けません。<code>0x…</code> をTRONのアドレスとして使うときは、先頭の <code>0x</code> を <code>41</code> に置き換えます。</Note>
      <Note kind="warn"><code>isAddress()</code> が確かめるのは、形式とチェックサムだけです。つまり、<B>打ち間違い</B>を見つけるためのものです。そのアドレスが台帳に存在するか、誰のものかは分かりません（1.7）。</Note>

      <H>3.4 手計算の結果との照合</H>
      <Note kind="goal">SDKの結果が、第1章で手計算した結果と一致することを確かめ、SDKの内部で何が起きているかを説明できる。</Note>
      <P>1.7で使った練習用の鍵（<code>00…01</code>）で、SDKに公開鍵とアドレスを求めさせ、1.7の出力と見比べます。1.7の出力例の値をコードに書き込んであるので、1.7を実行していなくても動きます。</P>
      <Code code={verifyJs} />
      <Out code={verifyOut} />
      <P>すべて <code>true</code> なら、SDKの <code>fromPrivateKey()</code> は、1.7で自分で計算した手順（secp256k1 → Keccak-256 → 末尾20バイト → 41を付ける → チェックサム → Base58）と、同じことをしていると分かります。SDKは魔法ではなく、第1章の計算を包んでいるだけです。</P>
      <P>公開鍵の先頭の <code>04</code> は、「x座標とy座標を、そのまま並べた形（圧縮していない形）」であることを示す印です。アドレスのもとになるKeccak-256は、<B>04を除いた64バイト</B>にかけます。1.7が64バイトで説明していたのは、そのためです。</P>
      <Note kind="warn">この鍵（<code>00…01</code>）は、世界中の人が知っている値です（1.7）。<B>照合のためだけに使い、Aliceには使わないでください</B>。</Note>

      <H>3.5 テストTRXを受け取る</H>
      <Note kind="goal">Nileのフォーセットで、AliceにテストのTRXを受け取れる。</Note>
      <P>新しいアカウントは、TRXを受け取るまで、台帳に存在しません（1.7）。Nileは練習用の台帳で、TRXに価値はありません（2.4）。<B>フォーセット</B>は、この練習用のTRXを、無料で配るサイトです。Aliceのアドレスを伝えるだけで、受け取れます。</P>
      <P>① Aliceのアドレスを表示して、コピーします。</P>
      <Code code={'console.log(alice.address.base58);'} />
      <P>② フォーセットのページを開きます: <Ext href="https://nileex.io/join/getJoinPage">Nile Testnet Faucet</Ext></P>
      <P>③ 入力欄にAliceのアドレス（Tで始まる34文字）を貼り、reCAPTCHAを済ませて、「Obtain」を押します。</P>
      <P>④ 受け取りに成功したと表示されたら、1分ほど待ってから、3.6に進みます。</P>
      <Note kind="warn">フォーセットに貼るのは、<B>アドレスだけ</B>です。秘密鍵は、どのサイトにも貼らないでください。フォーセットが、秘密鍵を求めることはありません。</Note>
      <Note kind="point">受け取れる量と回数には上限があり、ページに表示されます。足りないときは、公式のドキュメント（<Ext href="https://developers.tron.network/docs/getting-testnet-tokens-on-tron">Getting Testnet Tokens on TRON</Ext>）で案内されている、TronFAQBot（TelegramとDiscord）からも受け取れます。サイトの仕様は変わることがあるので、画面の案内に従ってください。</Note>
      <Note kind="point">TRONのアドレスにネットワークの区別はありません（1.2）が、<B>残高は台帳ごとに別</B>です。もう1つのテストネットのShastaには、別のフォーセットがあります。ここで受け取るのは、<B>Nile</B>のフォーセットです。</Note>
      <Note kind="ex">Aliceは、有効化の手数料を、何も払っていません。受け取る側がまだ有効化されていないときの手数料（1 TRX）は、送る側が払います（1.12）。</Note>

      <H>3.6 残高を調べる</H>
      <Note kind="goal">残高を取得して、TRXに直し、確定済みと最新の違いを説明できる。</Note>
      <P><code>tronWeb.trx.getBalance(アドレス)</code> は、残高を<B>sunの数</B>で返します（1 TRX ＝ 1,000,000 sun。1.8）。TRXに直すには、<code>tronWeb.fromSun()</code> を使います（TRXの数を、文字列で返します）。</P>
      <Code code={balanceJs} />
      <Out code={balanceOut} />
      <P>残高を調べる関数には、2種類あります。</P>
      <Tbl head={['関数', '読む台帳', '特徴']} rows={[
        ['getBalance()', '確定済み（solidityノード）', '19人以上のSRが確認したブロックまで。最新より、約1分遅れる（1.2）'],
        ['getUnconfirmedBalance()', '最新（fullノード）', 'まだ確定していない取引も含む。確定前にひっくり返る可能性がある'],
      ]} />
      <P>フォーセットで受け取った直後は、<B>最新の残高だけが増えて、確定済みの残高は0のまま</B>、ということがあります。1分ほど待つと、2つの値は同じになります。</P>
      <Note kind="warn">残高が0と表示されるときは、「まだ受け取っていない（反映待ち）」か、「アドレスを間違えている」かです。また、<code>getBalance()</code> は、<B>残高が0のアカウント</B>と、<B>台帳に存在しないアドレス</B>の、どちらにも0を返します。見分けるには、次の3.7で、アカウント情報そのものを取得します。</Note>

      <H>3.7 アカウント情報を取得する</H>
      <Note kind="goal">アカウント情報を取得して、有効化の前後の違いと、返ってくる項目を説明できる。</Note>
      <P>アカウント情報は、<code>tronWeb.trx.getUnconfirmedAccount()</code> で取得します。1.7で呼んだHTTP APIの <code>/wallet/getaccount</code> に対応します（2.7）。確定済みの台帳を読む <code>getAccount()</code> は、<code>/walletsolidity/getaccount</code> に対応します。ここでは、<B>作ったばかりのアカウント</B>と、<B>Alice</B>を、並べて取得します。</P>
      <Code code={accountJs} />
      <Out code={accountOut} />
      <P>作ったばかりのアカウント（<code>tmp</code>）は、誰からも受け取っていないので、台帳に存在せず、<B>空のオブジェクト（<code>{'{}'}</code>）</B>が返ります。一方、Aliceは有効化されているので、アドレス、残高、作成時刻、権限が返ります。SDKは、アドレスを<B>16進</B>で返すので、<code>fromHex()</code> でBase58にしています（3.3）。</P>
      <P>返ってくる <code>owner_permission</code> と <code>active_permission</code> が、<B>権限</B>です。しきい値と鍵ごとの重みで、取引を有効にする署名の条件を決めます（1.11）。作ったばかりのAliceは、鍵が1つ、しきい値が1で、その鍵で署名すれば、取引が有効になります。</P>
      <Note kind="point">アカウントが存在するかどうかは、<code>Object.keys(acc).length === 0</code> で調べられます。<code>getBalance()</code> の0とは違って、<B>「存在しない」と「残高が0」を区別</B>できます。</Note>
      <Note kind="warn"><code>tmp</code> は、見比べるための使い捨てのアカウントです。秘密鍵を控える必要はありません。</Note>

      <H>3.8 つまずきやすい点</H>
      <Ul items={[
        '「alice is not defined」と出る：ページを再読み込みすると、変数は消えます。第2章の①②を実行してから、3.2の復元のコードで、Aliceに戻してください。',
        '残高が0、または空のオブジェクトのまま：フォーセットで成功のメッセージが出たかを確かめてください。出ているなら、1〜2分待ってから、もう一度実行します。確定済みの値は遅れるので、getUnconfirmedBalance() の値も見てください。',
        '「Invalid address provided」と出る：アドレスが空だったり、コピーのときに空白が混ざったりしている可能性があります。alice が定義されているか、アドレスが34文字かを確かめてください。',
        'フォーセットで受け取れない：受け取りの上限に達している可能性があります。ページの案内を確認するか、3.5のTronFAQBotを試してください。',
        '「Failed to fetch」や、429エラーが出る：Nileが応答していないか、回数制限です。2.8を確認して、少し待ってから、もう一度実行してください。',
        '3.4の照合が false になる：testPriv が 00…01 のままか、manualX・manualY・manualHex・manualAddr が、1.7の出力と同じかを確かめてください。',
      ]} />

      <H>3.9 次のステップ</H>
      <P>これで、Aliceに、使えるTRXが入りました。次の<B>第4章</B>では、AliceからBobへ、TRXを送ります。1行の送金を、組み立て・署名・アナウンスの3段階に分けて、1.10で手作業で並べた内容と、txIDが一致することを確かめます。</P>
    </>
  );
}
