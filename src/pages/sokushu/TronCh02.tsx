import { Chip } from '@mui/material';
import { Code, Ext, H, Out, P } from './ui';
import { B, Note, Tbl, Ul } from './introParts';
import loadJs from './tronmain/ch02/load.js?raw';
import commonJs from './tronmain/ch02/common.js?raw';
import checkJs from './tronmain/ch02/check.js?raw';
import compareJs from './tronmain/ch02/compare.js?raw';
import apikeyJs from './tronmain/ch02/apikey.js?raw';

// 環境構築の進み具合（Sokushu.tsx が、読み込み済みのグローバル変数を見て判定する）。
export type TronSetup = { sdk: boolean; common: boolean };

const Status = ({ done }: { done: boolean }) => <Chip size="small" variant="outlined" color={done ? 'success' : 'default'} label={done ? '完了' : '未実行'} sx={{ ml: 1 }} />;

const checkOut = `> 66000000
> 0000000003ef1480d3c6b0a7e9f2b4c58a17d3e0f6b92c41a58d7e3b0c9f1a26
> 2026-10-18T06:12:33.000Z`;

const compareOut = `> SDK : 0000000003ef1476a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718
> HTTP: 0000000003ef1476a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718
> 一致: true`;

// TRON開発概論: 第2章 環境構築。
export default function TronCh02({ setup }: { setup: TronSetup }) {
  return (
    <>
      <P>本編の読み進め方を解説します。コードはコンソールで、そのまま実行できます。</P>

      <H>2.1 本編の進め方</H>
      <Note kind="goal">本編で何を学ぶかを説明できる。</Note>
      <P>第1章（TRON概説）では、ノードに問い合わせて、台帳を<B>読む</B>ところまでを扱いました。第2章以降では、SDK（TronWeb）を使って、<B>署名して、トランザクションをアナウンスする</B>（台帳に書く）ところを扱います。前半はSDKとTRONの標準機能、後半はスマートコントラクトです。</P>
      <Tbl head={['章', '区分', '学ぶこと', '第1章との対応']} rows={[
        ['第2章 環境構築', '前半：SDK編', 'TronWebを読み込み、Nileに接続する', '1.3、1.14'],
        ['第3章 アカウント', '前半：SDK編', '鍵とアドレスの生成、テストTRXの受け取り', '1.7'],
        ['第4章 TRXの送金', '前半：SDK編', '組み立て・署名・アナウンスの3段階', '1.10'],
        ['第5章 署名と検証', '前半：SDK編', '署名前に、取引の中身を自分で確かめる', '1.13、1.14'],
        ['第6章 リソース', '前半：SDK編', 'ステーク、帯域幅とエネルギーの取得・委任', '1.12'],
        ['第7章 Solidity入門', '後半：コントラクト編', '最小のコントラクトを読み書きする', '1.15'],
        ['第8章 デプロイ', '後半：コントラクト編', 'ABIとバイトコード、feeLimit など', '1.16'],
        ['第9章 呼び出し', '後半：コントラクト編', '読み取りと書き込みの違い', '1.17、1.18'],
        ['第10章 イベント', '後半：コントラクト編', 'イベントの取得と監視', '1.20'],
        ['第11章 TRC-20', '後半：コントラクト編', 'トークンを自作して使う', '1.19'],
        ['第12章 エネルギー', '後半：コントラクト編', '見積りと、失敗の読み方', '1.21'],
        ['第13章 セキュリティ', '後半：コントラクト編', 'approve、署名前の確認、再入攻撃', '1.14'],
        ['第14章 演習', '後半：コントラクト編', '小さなコントラクトを、通しで作る', '—'],
      ]} />
      <Note kind="point">第1章で<B>自分で計算して確かめた</B>こと（アドレスの導出、txID、セレクタ、エネルギーの単価など）は、第2章以降ではSDKの結果と<B>見比べる</B>ために使います。SDKは便利ですが、中で何が起きているかを知っているほうが、間違いに気づけます。</Note>

      <H>2.2 使用言語とSDK</H>
      <Note kind="goal">本編で使うSDKとそのバージョンを説明できる。</Note>
      <P>JavaScriptを使用します。SDKは、TRON公式の <B>TronWeb</B> v6.3.0 です。これをブラウザ用にまとめたファイル（dist/TronWeb.js）を、コンソールに読み込んで使います。</P>
      <P>TronWeb v6 は、TypeScriptで書き直されたバージョンです。npmで使うときは、<code>import {'{'} TronWeb {'}'} from 'tronweb'</code> のように、名前を指定して読み込みます。v5以前の記事にある <code>const TronWeb = require('tronweb')</code> とは書き方が違うので、ネットの記事を参考にするときは、バージョンを確認してください。</P>
      <P>第1章の1.14で見た <code>new TronWeb({'{'} fullHost: ..., privateKey: ... {'}'})</code> の書き方は、v6でもそのまま使えます。</P>
      <P>リファレンス: <Ext href="https://github.com/tronprotocol/tronweb">TronWeb（GitHub）</Ext>　<Ext href="https://developers.tron.network">TRON Developer Hub</Ext></P>

      <H>2.3 サンプルソースコード</H>
      <P>■ 変数宣言: コンソール上で何度も書き直して検証できるよう、あえてconst宣言を行いません。アプリケーション開発時はconst宣言するなどしてセキュリティを確保してください。</P>
      <P>■ 出力値確認: console.log()で変数の内容を出力します。出力内容は「&gt;」以下に記述されているので、サンプルを実行する場合はこの部分を含めずに試してください。</P>
      <P>■ 同期・非同期: TronWebの関数の多くは、結果を<B>Promise</B>で返します。第2章以降では <code>await</code> を使って、結果を受け取ってから次に進みます。このコンソールでは、<code>await</code> をそのまま書けます。</P>
      <P>■ アカウント: 第3章で作る<B>Alice</B>を中心に解説します。Aliceには、Nileのフォーセットで受け取ったテストTRXを入れて、使い続けます。Bobは、Aliceとの送受信用に、各章で必要に応じて作ります。</P>
      <P>■ 金額の単位: TRXではなく<B>sun</B>で数えます（1 TRX = 1,000,000 sun。1.8）。</P>
      <P>■ 手数料: TRONの手数料は、帯域幅とエネルギーです（1.12）。手数料は、第4章の送金で最初に目にし、第6章で詳しく扱います。</P>
      <P>■ ネットワーク: 書き込み（署名してアナウンスする操作）は、<B>テストネットのNileだけ</B>で行います。メインネットは、読み取りだけに使います。</P>
      <Note kind="warn"><B>秘密鍵</B>は、この講座の練習用に作ったものだけを使い、メインネットで資産を持つアカウントには使い回さないでください（TRONのアドレスにはネットワークの区別がないため、同じ秘密鍵なら、同じアドレスになります。1.2）。また、チャットや画面共有に貼らないでください。</Note>

      <H>2.4 接続先</H>
      <Note kind="goal">接続先（Nile・メインネット）の違いと、APIキーの扱いを説明できる。</Note>
      <P>この章以降も、第1章と同じく、テストネットの<B>Nile</B>に接続します。接続先は、TronWebを作るときの <code>fullHost</code> に、ノードのURLを渡して決めます。</P>
      <Tbl head={['項目', 'Nile（テストネット）', 'メインネット']} rows={[
        ['HTTP API（TronGrid）', 'https://nile.trongrid.io', 'https://api.trongrid.io'],
        ['エクスプローラー', 'https://nile.tronscan.org', 'https://tronscan.org'],
        ['TRXの価値', '練習用。価値はない', '実際の資産'],
        ['本編での使い方', '読み取りも書き込みも行う', '読み取りだけ'],
        ['APIキー', '第2章以降では使わない', '回数制限（429エラー）に当たるときに使う'],
      ]} />
      <P>回数が多いと、ノードから<B>429エラー</B>（回数制限）が返ることがあります。そのときは、少し待ってから、もう一度実行してください。TronGridでAPIキーを発行すると、制限に当たりにくくなります。APIキーは、次のように、ヘッダーに付けて送ります。</P>
      <Code code={apikeyJs} runnable={false} />
      <Note kind="warn">APIキーは、公開するページやコードに<B>書き込まない</B>でください。第2章以降では、APIキーなしで進めます。</Note>

      <H>2.5 事前準備</H>
      <Note kind="goal">TronWebを読み込み、Nileに接続して、最新のブロックを取得できる。</Note>
      <P>この画面のコンソールが、ブラウザの開発者コンソール（F12）の代わりになります。以下の①〜③を、順番に実行してください。接続先は、②の <code>NILE</code> で決まります。</P>

      <P>① SDKを読み込みます。<Status done={setup.sdk} /></P>
      <Code code={loadJs} />
      <P>読み込みには数秒かかります。上の表示が「完了」になってから、次へ進んでください。</P>

      <P>② ほぼすべての章で使う共通ロジックを実行します。<Status done={setup.common} /></P>
      <P><code>NILE</code> は接続先ノードのURL、<code>tronWeb</code> はSDKの本体です。<code>clog()</code> は、トランザクションのID（txID）から、Nileのエクスプローラーで確認するためのURLを出力する関数です。</P>
      <Code code={commonJs} />

      <P>③ 準備ができたか確認します。</P>
      <Code code={checkJs} />
      <Out code={checkOut} />
      <P>ブロック高、ブロックID（64桁の16進数。先頭8バイトがブロック高、1.6）、ブロックの時刻が表示されれば、環境構築は完了です。値は、実行した時点のものなので、出力例とは一致しません。エラーが出る場合は、下の「つまずきやすい点」を確認してください。</P>

      <P>※ ご自身のブラウザで試す場合は、任意のページ（空白のページでも構いません）をChromeなどで開き、F12キーで開発者コンソールを開いて、同じスクリプトを入力します。</P>

      <H>2.6 TronWebの部品</H>
      <Note kind="goal">TronWebの主な部品と、本編のどの章で使うかを説明できる。</Note>
      <P>②で作った <code>tronWeb</code> には、役割ごとの部品がぶら下がっています。第2章以降では、次のように、章を進めながら使っていきます。</P>
      <Tbl head={['部品', '役割', '主な登場章']} rows={[
        ['tronWeb.trx', '台帳の読み取り（残高・ブロック・取引）、署名、アナウンス', '第3〜5章'],
        ['tronWeb.transactionBuilder', 'トランザクションの組み立て（送金・ステーク・コントラクトのデプロイと呼び出し）', '第4、6、8章'],
        ['tronWeb.address', 'アドレスの変換（Base58 と16進）、秘密鍵からアドレスを求める', '第3章'],
        ['tronWeb.utils', '補助の関数（トランザクションの変換、メッセージ署名など）', '第5章'],
        ['tronWeb.contract()', 'スマートコントラクトを、ABIから関数として呼び出すためのオブジェクト', '第8、9章'],
        ['tronWeb.event', 'コントラクトのイベントの取得', '第10章'],
      ]} />

      <H>2.7 SDKとHTTP APIの対応</H>
      <Note kind="goal">SDKが、第1章で使ったHTTP APIを包んだものだと説明できる。</Note>
      <P>TronWebは、第1章の1.3〜1.4で呼んだ<B>HTTP API</B>を、使いやすい関数にまとめたものです。同じブロックを、SDKと、<code>fetch</code> で呼ぶHTTP APIの両方で取得して、ブロックIDが一致することを確かめます。</P>
      <Code code={compareJs} />
      <Out code={compareOut} />
      <P>一致すれば、SDKの <code>getBlockByNumber</code> は、<code>/wallet/getblockbynum</code> を呼んで、その結果を返しているだけだと分かります。第2章以降では、SDKの関数を使うたびに、「第1章のどのHTTP APIに対応するか」を意識すると、挙動を理解しやすくなります。</P>

      <H>2.8 つまずきやすい点</H>
      <Ul items={[
        '「TronWeb is not defined」や、「is not a constructor」と出る：①の表示が「完了」になる前に、②を実行している可能性があります。①が完了してから、②を実行してください（②のコードは、クラスが TronWeb と TronWeb.TronWeb のどちらに入っていても動くようにしてあります）。',
        '変数が消えた：ページを再読み込みすると、コンソールの変数は消えます。①と②を、もう一度実行してください。',
        '429エラーが出る：回数制限です。少し待ってから、もう一度実行してください。',
        'SDKを読み込めない：社内ネットワークなどで、cdn.jsdelivr.net に接続できない場合があります。①のURLを、同じファイルが配布されている https://unpkg.com/tronweb@6.3.0/dist/TronWeb.js に差し替えてください。',
        '③で値が出ない：Nileは、メンテナンスなどで一時的に応答しないことがあります。時間をおいて、②からやり直してください。',
      ]} />

      <H>2.9 次のステップ</H>
      <P>これで、TronWebを使う準備ができました。次の<B>第3章</B>では、アカウント（鍵とアドレス）を作り、Nileのフォーセットでテストのトークンを受け取ります。</P>
    </>
  );
}
