import { Code, H, H3, Out, P } from './ui';
import { B, Note, Tbl, Ul } from './introParts';
import counter1Sol from './tronmain/ch07/Counter1.sol?raw';
import counterSol from './tronmain/ch07/Counter.sol?raw';
import selectorJs from './tronmain/ch07/selector.js?raw';
import revertJs from './tronmain/ch07/revert.js?raw';
import eventJs from './tronmain/ch07/event.js?raw';
import unitsJs from './tronmain/ch07/units.js?raw';
import addressJs from './tronmain/ch07/address.js?raw';

// 出力例のうち、Aliceのアドレス（TT365…、bb3605…）は見本。Aliceのアドレスは、人によって違う。
const selectorOut = `MAX()        → d49d5181
owner()      → 8da5cb5b
count()      → 06661abd
increment()  → d09de08a
reset()      → d826f88f
remaining()  → 55234ec0
increment() を呼ぶ data（引数がないので、セレクタだけ）: 0xd09de08a`;

const revertOut = `Error(string) のセレクタ  : 08c379a0
Panic(uint256) のセレクタ : 4e487b71
revert のバイト列（100 バイト）:
  セレクタ: 08c379a0
  位置    : 0000000000000000000000000000000000000000000000000000000000000020
  長さ    : 0000000000000000000000000000000000000000000000000000000000000009 → 9 バイト
  文字    : 6e6f74206f776e65720000000000000000000000000000000000000000000000
読み戻した理由: not owner`;

const eventOut = `emit Incremented(Alice, 3) のログ:
  topics[0] 目印          : 38ac789ed44572701765277c4d0970f2db1c1a571ed39e84358095ae4eaa5420
  topics[1] by（indexed） : 000000000000000000000000bb3605a39e7febadf055da74a2425d364feec4d0
  data      newCount      : 0000000000000000000000000000000000000000000000000000000000000003
emit Reset(Alice) のログ:
  topics[0] 目印          : 162f46783fcc741c289a7af5bd16474ace09d7e8a9d5fe1ac0d37b12afc0ccac
  topics[1] by（indexed） : 000000000000000000000000bb3605a39e7febadf055da74a2425d364feec4d0
  data                    : （空）`;

const unitsOut = `1 trx            → 1000000 sun
5 trx            → 5000000 sun
toSun(1.5)       → 1500000 sun
fromSun(2500000) → 2.5 TRX
1 ether          → 1000000000000000000 （これを sun として扱うと 1000000000000 TRX）`;

const addressOut = `Base58（ウォレット・画面）    : TT365SuwZ55mSNPe2yxtR8Nbje3m6cecNy
16進（ノードのAPI）           : 41bb3605a39e7febadf055da74a2425d364feec4d0 （21 バイト）
コントラクトの中の address    : 0xbb3605a39e7febadf055da74a2425d364feec4d0 （20 バイト）
owner() の戻り値（32バイト）  : 0x000000000000000000000000bb3605a39e7febadf055da74a2425d364feec4d0
41 を付けて戻すと Alice       : true`;

// TRON開発概論: 第7章 Solidity入門。
export default function TronCh07() {
  return (
    <>
      <P>この章から、後半の<B>スマートコントラクト</B>です。1.15で、TVMがSolidityで書いたコントラクトを動かすことを、1.16〜1.20で、既存のコントラクト（USDT）を<B>読む側</B>から見ました。この章では、コントラクトを<B>書く側</B>に回ります。Solidityで最小のコントラクトを書き、関数・<code>msg.sender</code>・<code>require</code>・イベントの意味を押さえ、TRONで気をつける点（単位・アドレス・コンパイラ）を確かめます。</P>

      <H>7.1 この章の進め方</H>
      <Note kind="goal">Solidityの最小のコントラクトを読み書きでき、TRONで違う点（単位・アドレス・コンパイラ）を説明できる。</Note>
      <P>この章で使うコントラクトは、数を数えるだけの<B>Counter</B>です。小さなコントラクトですが、状態変数・読み取りと書き込みの関数・呼んだ人の確認・失敗・イベントという、あとの章で使う部品が、ひととおり入っています。第8章で、これをNileにデプロイします。</P>
      <Tbl head={['節', 'やること', '使うもの', '第1章との対応']} rows={[
        ['7.2', '最小のコントラクトを、1行ずつ読む', 'Counter（最小版）', '1.15'],
        ['7.3', '状態変数と、読み取り・書き込みの関数。関数が、セレクタに対応することを確かめる', 'view、selOf', '1.17、1.18'],
        ['7.4', '呼んだ人の確認と、失敗。失敗の理由が、バイト列として返ることを確かめる', 'msg.sender、require', '1.17、1.18'],
        ['7.5', 'イベントが、ログとして残る形を確かめる', 'event、emit', '1.20'],
        ['7.6', 'TRONでの違い（単位・アドレス・コンパイラ）', 'trx、sun、address', '1.7、1.8、1.15'],
      ]} />
      <Note kind="point">この章の<B>Solidityのコードは、コンソールでは実行しません</B>（コードの上の帯に、実行ボタンがありません）。Solidityは、<B>コンパイル</B>してバイトコードにしてから、デプロイします（第8章）。この章のJavaScriptは、Solidityのコードが生み出す<B>バイト列</B>（セレクタ・失敗の理由・ログ）を計算して、コードの意味を確かめるためのものです。</Note>
      <Note kind="point">この章のJavaScriptは、第2章の2.5の①②（<code>tronWeb</code>）を済ませていれば動きます。7.5と7.6のアドレスの確認には、3.2までのAlice（<code>alice</code>）も使います。コンソールの変数は、ページを再読み込みすると消えるので、そのときは、順にやり直してください。この章のコードは、<B>ノードに何も送りません</B>。テストネットのTRXも使いません。</Note>
      <Note kind="ex">Solidityは、イーサリアムのために作られた言語です。TRONのコンパイラは、それを土台にしています（7.6）。そのため、イーサリアム向けの資料やコードを読んで学んだことの、ほとんどが、そのまま使えます。</Note>

      <H>7.2 最小のコントラクトを読む</H>
      <Note kind="goal">最小のコントラクトの、各行の意味を説明できる。</Note>
      <P>次のコードが、最小の Counter です。数を1つ持ち、呼ばれるたびに1増やします。</P>
      <Code lang="solidity" code={counter1Sol} />
      <Tbl head={['行', '意味']} rows={[
        ['// SPDX-License-Identifier: MIT', 'ソースコードのライセンスを書くコメント。書かないと、コンパイラが警告を出す。コードの動きには関係しない'],
        ['pragma solidity 0.8.20;', 'このコードをコンパイルするコンパイラの版。^ を付けないので、この版だけ（7.6）'],
        ['contract Counter { … }', 'コントラクトの宣言。デプロイすると、1つのアカウント（アドレス）になる（1.15）'],
        ['uint256 public count;', '状態変数。0以上の整数（256ビット）で、台帳に残る。値を入れないと0。public を付けると、読むための関数 count() が自動で作られる'],
        ['function increment() public { … }', '状態を変える関数。呼ぶ取引が成功すると、count が1増えて、台帳に残る'],
      ]} />
      <P><B>状態変数</B>は、コントラクトのアカウントが持つ<B>データ</B>です。1.15の「コードとデータを持つ、特別なアカウント」の、データにあたります。これに対して、関数の中だけで使う変数（ローカル変数）は、実行が終わると消えます。台帳に残るのは、状態変数だけです。</P>
      <Note kind="point">状態変数への書き込みは、計算に比べて、エネルギーを多く使います（第12章）。「何を状態変数にして、何を計算で求めるか」は、費用に直結します。</Note>
      <Note kind="ex">Solidity 0.8 からは、足し算・引き算の桁あふれが、自動で失敗になります。<code>count += 1</code> が、256ビットの上限を超えると、実行が止まります（7.4の <code>Panic</code>）。0.7以前は、何も言わずに一周していました。古い資料を読むときは、版に注意してください。</Note>

      <H>7.3 状態変数と関数：読み取りと書き込み</H>
      <Note kind="goal">関数の「読み取り」と「書き込み」の違いと、公開された関数が、セレクタに対応することを説明できる。</Note>
      <P>7.2の Counter に、上限・作った人・イベント・失敗の条件を足したものが、次のコードです。この章では、これを Counter と呼びます。<code>increment</code> は、上限（10）まで数えられ、<code>reset</code> は、作った人だけが呼べます。</P>
      <Code lang="solidity" code={counterSol} />
      <Tbl head={['公開された関数', '種類', '呼べる人', '何をするか']} rows={[
        ['MAX()', '読み取り（view）', '誰でも', '上限（10）を返す'],
        ['owner()', '読み取り（view）', '誰でも', '作った人のアドレスを返す'],
        ['count()', '読み取り（view）', '誰でも', 'いまのカウントを返す'],
        ['remaining()', '読み取り（view）', '誰でも', 'あと何回、数えられるか（MAX − count）を返す'],
        ['increment()', '書き込み', '誰でも', 'count を1増やして、イベントを残す。上限なら失敗'],
        ['reset()', '書き込み', 'owner だけ', 'count を0に戻して、イベントを残す。owner 以外なら失敗'],
      ]} />
      <P><code>view</code> は、<B>状態を読むだけで、変えない</B>関数に付けます。<code>public</code> な状態変数の読み取り用の関数（<code>count()</code> など）も、<code>view</code> です。読み取りの関数は、1.18の <code>triggerconstantcontract</code> で呼べて、<B>署名もトランザクションも要らず、手数料もかかりません</B>。書き込みの関数は、<B>取引</B>として署名して送り、実行されたあとの状態が、台帳に残ります。エネルギーが要ります。</P>
      <Ul items={[
        'constant（MAX）：コンパイルのときに決まる定数です。コードに埋め込まれるので、状態変数のようには、台帳に置かれません。',
        'view と pure：view は状態を読むだけ、pure は状態も読まない（引数だけで計算する）関数に付けます。どちらも、状態を変えてはいけません。',
        'public：コントラクトの外から呼べる関数にします。状態変数に付けると、読み取り用の関数が自動で作られます。',
      ]} />
      <P>1.17で、関数の呼び出しは、<B>セレクタ（4バイト）＋ 引数</B>のバイト列だと見ました。<code>public</code> な関数と、<code>public</code> な状態変数の読み取り用の関数は、それぞれ、<B>関数名と引数の型</B>から決まるセレクタを持ちます。コントラクトは、受け取ったバイト列の先頭4バイトを見て、どの関数を動かすかを決めます。次のコードで、Counter のセレクタを求めます。</P>
      <Code code={selectorJs} />
      <Out code={selectorOut} />
      <Note kind="point"><code>tronWeb.sha3</code> は、標準のSHA3-256ではなく、<B>Keccak-256</B>です（1.17と同じ関数）。1.10の txID に使う SHA-256 とも、別物です。この値は、コンパイラが出力する関数の一覧（第8章のABI）と一致します。<B>関数名と引数の型が同じなら、どのコントラクトでも、セレクタは同じ値</B>です（<code>increment()</code> の <code>d09de08a</code> は、EVM系で共通です）。</Note>
      <Note kind="warn">セレクタを求める文字列は、<B>空白なし</B>で、型は<B>正式な名前</B>で書きます。Solidityでは、<code>uint</code> と書いても、セレクタは <code>uint256</code> として計算します。<code>transfer(address,uint)</code> ではなく、<code>transfer(address,uint256)</code> です。</Note>

      <H>7.4 msg.sender と require</H>
      <Note kind="goal">msg.sender が「呼んだ人」であることと、require で条件を確かめることを説明し、失敗の理由が、バイト列として返ることを確かめられる。</Note>
      <P><code>msg.sender</code> は、<B>いま、この関数を呼んでいるアドレス</B>です。Aliceが署名した取引で呼べば、Aliceです。別のコントラクトを経由して呼ばれたときは、その、呼んだコントラクトになります。取引の署名で、送り主が証明されているので、「作った人だけ」のような<B>権限の仕組み</B>を、コードで書けます。Counter では、次の2か所です。</P>
      <Ul items={[
        'constructor：デプロイのときに、1度だけ動きます。ここで owner = msg.sender とすると、デプロイした人（デプロイの取引を送ったアカウント）が、owner になります。',
        'reset：先頭の require(msg.sender == owner, "not owner"); で、呼んだ人が owner かを確かめます。違えば、ここで止まります。',
      ]} />
      <P><code>require(条件, "理由")</code> は、条件が偽なら、<B>そこで実行を止め、その呼び出しで行った状態の変更を、すべて取り消します</B>（revert）。取引そのものは、失敗の結果つきで、台帳に残ります。実行した分のリソースは使われます（詳しくは第12章）。</P>
      <Tbl head={['書き方', '何が起きるか', '使いどころ']} rows={[
        ['require(条件, "理由")', '偽なら revert。理由の文字列を返す', '入力の確認、呼んだ人の確認（ふつうは、これ）'],
        ['revert("理由")', '無条件で revert。理由の文字列を返す', 'if の分岐の中で、失敗させたいとき'],
        ['assert(条件)', '偽なら Panic で失敗する', '起きてはいけない状態の確認。ふつうの入力の確認には使わない'],
      ]} />
      <P>失敗の理由は、文字列のまま返るのではなく、<B>バイト列</B>で返ります。<code>require</code> や <code>revert</code> の理由は、<code>Error(string)</code> という形で、<B>セレクタ ＋ 文字列の並べ方</B>（1.18で見た、位置・長さ・文字）です。次のコードで、<code>"not owner"</code> のバイト列を組み立てて、読み戻します。</P>
      <Code code={revertJs} />
      <Out code={revertOut} />
      <Ul items={[
        '先頭の 08c379a0 が、Error(string) のセレクタです。理由の文字列が付いている目印になります。',
        '位置（0x20）は、文字列の長さの欄が、先頭から何バイト目にあるかです。長さは 9 バイトで、"not owner" の文字数と同じです。',
        '文字は、UTF-8のバイト列を、32バイトの倍数になるまで、右側をゼロで埋めたものです。',
        '4e487b71 は、Panic(uint256) のセレクタです。assert の失敗や、0.8の桁あふれ・ゼロでの割り算など、コンパイラが入れる検査の失敗で返ります。',
      ]} />
      <Note kind="point">実際の取引で、この理由が、取引の結果のどこに入って返るかは、第9章で、失敗する呼び出しを実行して確かめます。<code>REVERT</code> と <code>OUT_OF_ENERGY</code> の読み分けは、第12章です。</Note>
      <Note kind="warn"><code>tx.origin</code>（取引を最初に送ったアカウント）は、<code>msg.sender</code> と違い、途中のコントラクトを飛び越えて、最初の送り主を指します。<B>権限の確認に <code>tx.origin</code> を使うと、危険</B>です。権限の確認は、<code>msg.sender</code> で行います（第13章）。</Note>
      <Note kind="ex"><code>require</code> の理由の文字列は、コードの中に入ります。長い文章にすると、コードが大きくなり、デプロイの費用も増えます（第8章、第12章）。短く書くのがふつうです。</Note>

      <H>7.5 イベント</H>
      <Note kind="goal">event と emit の役割を説明し、イベントが、ログとして残る形を確かめられる。</Note>
      <P>状態変数の値は、外から、いつでも読めます。でも、<code>count</code> を読んでも、分かるのは<B>いまの値</B>だけです。「いつ、誰が、数えたのか」という<B>履歴</B>は、残りません。履歴を残したいときに使うのが、<B>イベント</B>です。</P>
      <Ul items={[
        '宣言：event Incremented(address indexed by, uint256 newCount); のように、名前と引数を決めておきます。',
        '発行：emit Incremented(msg.sender, count); と書くと、取引の結果に、ログとして残ります（1.20）。',
        'ログは、コントラクトの中からは読めません。外のアプリが、監視や集計のために読みます（第10章）。',
        'indexed を付けた引数は、topic（探すときの目印）に入ります。付けない引数は、data に入ります。indexed は、1つのイベントに3つまでです。',
      ]} />
      <P>次のコードは、Aliceが <code>increment</code> を呼んで count が 3 になったときと、<code>reset</code> を呼んだときの、ログの形を、手作業で並べます。</P>
      <Code code={eventJs} />
      <Out code={eventOut} />
      <Ul items={[
        'topics[0] は、イベントの署名（Incremented(address,uint256)。引数の名前と indexed は入れない）のKeccak-256で、32バイト全体を使います。関数のセレクタ（4バイト）とは、長さが違います（1.17）。',
        'topics[1] は、indexed の by です。アドレスは、41を除いた20バイトを、32バイトに、左をゼロで埋めて入れます。',
        'data は、indexed でない newCount です。数値は、32バイトの整数（ビッグエンディアン）です。',
        'Reset は、indexed の引数だけなので、data は空です。',
      ]} />
      <Note kind="point">1.17の Transfer の topic（<code>ddf252ad…</code>）と、同じ作りです。第10章で、Counter のイベントを、取引ごと・コントラクトごとに取得します。</Note>
      <Note kind="warn">イベントの署名は、<B>引数の型を並べた文字列</B>で、引数の名前や <code>indexed</code> は入りません。型を変える（<code>uint256</code> を <code>uint128</code> にする、など）と、topic が変わり、外のアプリが、その種類のイベントを見つけられなくなります。</Note>

      <H>7.6 TRONでの違い</H>
      <Note kind="goal">イーサリアム向けのSolidityの知識を、TRONで使うときに気をつける点（単位・アドレス・コンパイラ）を説明できる。</Note>
      <P>TVMは、EVMと互換です（1.15）。Solidityの書き方は、ほとんど同じで、ここまでの Counter も、そのままです。違いが出るのは、次の点です。</P>
      <Tbl head={['観点', 'イーサリアム', 'TRON', '気をつけること']} rows={[
        ['金額の単位', 'wei（1 ETH ＝ 10の18乗 wei）', 'sun（1 TRX ＝ 1,000,000 sun）', 'TRXの量は、sun の整数。小数は使えない'],
        ['単位の書き方', 'wei、gwei、ether', 'sun、trx（TRON版のコンパイラが追加）', 'ether や gwei は使わない（1 ether は、1兆TRX）'],
        ['アドレス', '20バイト（0x…）', 'コントラクトの中は20バイト。外では、41を付けた21バイトや、Base58（T…）', '引数や比較に使うのは、41を除いた20バイト'],
        ['手数料', 'ガス', 'エネルギーと帯域幅（1.12）', '費用の見積りは、第12章'],
        ['コンパイラ', 'solc', 'TRON版のsolc（tronprotocol/solidity）', 'TRONの資料が挙げる版を、TRON版で使う'],
      ]} />

      <H3>単位：sun</H3>
      <P>TRXの量は、コントラクトの中でも、<B>sun</B>の整数です。呼び出しに添えたTRXの量（<code>msg.value</code>）や、コントラクトが持つTRXの量（<code>address(this).balance</code>）も、sunです。TRON版のコンパイラは、数値に付ける単位として、<code>trx</code>（<code>1 trx</code> は 1,000,000）と <code>sun</code>（<code>1 sun</code> は 1）を使えるようにしています。イーサリアムの <code>ether</code> や <code>gwei</code> は、数値を、10の18乗や10の9乗にするだけです。TRONで使うと、桁を間違えます。</P>
      <Code code={unitsJs} />
      <Out code={unitsOut} />
      <Note kind="warn">イーサリアム向けのコードを持ち込むときは、<code>1 ether</code> のような書き方が残っていないかを確かめます。TRONでは、<B>1 ether は、1兆TRX</B>です。トークン（TRC-20）の可分性（<code>decimals</code>）は、TRXとは別の話です（1.8）。</Note>

      <H3>アドレス：20バイト</H3>
      <P>コントラクトの中では、アドレスは、<B>20バイト</B>です。<code>msg.sender</code>、<code>address(this)</code>、<code>address</code> 型の引数は、すべてこの形で、イーサリアムと同じです。先頭の<B>41</B>は、アドレスが、コントラクトの外へ出るとき（ノードのAPI、Base58への変換）に付きます。1.7で見た、鍵からアドレスを作る手順の最後の部分です。</P>
      <Code code={addressJs} />
      <Out code={addressOut} />
      <Note kind="point"><code>owner()</code> の戻り値は、32バイトで返ります（1.18）。後ろの20バイトが、アドレスです。<B>41を含めた21バイトのまま、引数や戻り値の比較に使うと、一致しません</B>。外のコードで、アドレスを、コントラクトの引数に並べるときは、41を除いた20バイトを使います（1.17）。</Note>

      <H3>コンパイラ</H3>
      <P>TRONでスマートコントラクトを動かすには、Solidityのコードを、TVMで動くバイトコードに、<B>コンパイル</B>します。TRONには、イーサリアムの <code>solc</code> を土台にした、<B>TRON版のコンパイラ</B>（GitHubの <code>tronprotocol/solidity</code>）があります。上の <code>trx</code>・<code>sun</code> のほか、TRC-10の送金（<code>transferToken</code>）など、TRON固有の機能は、この版で使えます（付録E）。</P>
      <Ul items={[
        '対応する版：TRONの公式資料によると、0.4系から0.8系までが、TVMで使えます。新しく書くなら、0.8系が基準です。',
        'pragma は、^ を付けずに、版を1つに固定します。この章の Counter は、公式資料の例に合わせて、0.8.20 にしています。',
        'イーサリアム側のコンパイラが新しくなっても、その出力が、TVMで動くとは限りません。TRONの資料が挙げる範囲で、TRON版のコンパイラを使います。',
        'TRON固有の機能（trx・sun、TRC-10など）を使わないコードは、イーサリアムのコンパイラでも、コンパイルできます。',
      ]} />
      <Note kind="warn">対応する版は、TRONのアップデートで変わります。デプロイの前に（第8章）、TRONの公式資料で、使う版を確かめてください。また、<code>CREATE2</code> でアドレスを事前に計算する、イーサリアム向けのコードは、前に付けるバイトが違います（TRONは <code>0x41</code>、イーサリアムは <code>0xff</code>）。Solidityの <code>new Contract{'{ salt: … }'}()</code> の書き方なら、コンパイラが吸収します。</Note>

      <H>7.7 つまずきやすい点</H>
      <Ul items={[
        '「第2章の2.5の①②を先に実行してください」と出る：tronWeb が定義されていません。①②を、実行してください。ページを再読み込みすると、消えます。',
        '「3.2 までを先に実行してください（alice が必要です）」と出る：alice が定義されていません。3.1で作るか、3.2で復元してください。',
        'Solidityのコードに、実行ボタンがない：コンソールで動くのは、JavaScriptだけです。Solidityは、コンパイルして、デプロイします（第8章）。',
        'セレクタが、ほかの資料と違う：署名の文字列を確かめてください。空白なし、型は正式な名前（uint ではなく uint256）、大文字と小文字は区別されます。',
        'セレクタを、SHA-256やSHA3-256で求めてしまう：求めるのは、Keccak-256です（tronWeb.sha3）。txID に使う SHA-256 とは別です（1.10）。',
        '16進の文字の、大文字と小文字が、第1章の出力と違う：第1章のコードは大文字、この章はSDKの出力（小文字）です。値は、同じです。',
        'アドレスが、20バイトでなく21バイトになる：41を、取り除いていません。コントラクトの引数や戻り値には、41を除いた20バイトを使います。',
        '金額の桁が、100万倍や1兆倍違う：TRXの単位は sun です。1 trx ＝ 1,000,000 sun です。ether は使いません。',
      ]} />

      <H>7.8 次のステップ</H>
      <P>これで、Solidityの最小のコントラクトを読み、状態変数・関数・<code>msg.sender</code>・<code>require</code>・イベントの意味を、バイト列と対応させて説明できるようになりました。次の<B>第8章</B>では、この Counter を、コンパイルして、<B>ABI</B>と<B>バイトコード</B>にし、デプロイの項目（<code>feeLimit</code>・<code>originEnergyLimit</code>・<code>userFeePercentage</code>・<code>callValue</code>）を決めて、Nileにデプロイします。Aliceには、第6章で残した、エネルギーのステークがあります。</P>
    </>
  );
}
