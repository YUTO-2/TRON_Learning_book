import { Code, H, Out, P } from './ui';
import { B, Note, Tbl, Ul } from './introParts';
import counterSol from './tronmain/ch07/Counter.sol?raw';
import abiJs from './tronmain/ch08/abi.js?raw';
import bytecodeJs from './tronmain/ch08/bytecode.js?raw';
import buildJs from './tronmain/ch08/build.js?raw';
import addressJs from './tronmain/ch08/address.js?raw';
import checkJs from './tronmain/ch08/check.js?raw';
import deployJs from './tronmain/ch08/deploy.js?raw';
import verifyJs from './tronmain/ch08/verify.js?raw';
import costJs from './tronmain/ch08/cost.js?raw';

// 出力例のうち、txID・アドレス・ブロック番号・エネルギーの量は見本。バイトコードの長さは、コンパイラで決まる。
const abiOut = `--- 関数（セレクタ） ---
MAX()        d49d5181 OK（7.3と同じ）
count()      06661abd OK（7.3と同じ）
increment()  d09de08a OK（7.3と同じ）
owner()      8da5cb5b OK（7.3と同じ）
remaining()  55234ec0 OK（7.3と同じ）
reset()      d826f88f OK（7.3と同じ）
--- イベント（topics[0] の先頭4バイト） ---
Incremented(address,uint256)   38ac789e
Reset(address)                 162f4678
コンストラクタの引数の数: 0`;

const bytecodeOut = `バイトコードの長さ: （コンパイラで決まる）バイト
先頭の16バイト    : 6080604052…
MAX()        d49d5181 あり
count()      06661abd あり
increment()  d09de08a あり
owner()      8da5cb5b あり
remaining()  55234ec0 あり
reset()      d826f88f あり
→ Counter のバイトコードのようです`;

const buildOut = `txID               : 9f2c…（64桁）
種類 type          : CreateSmartContract
署名 signature     : （まだ無い）
raw_data_hex       : （バイトコードの分）バイト（バイトコードを含むので、送金より、ずっと大きい）
fee_limit          : 100000000 sun
contract_address   : 41…（42桁） → T…（34文字）`;

const addressOut = `手計算        : 41…（42桁） → T…（34文字）
ノードの答え  : 41…（手計算と同じ） → T…（同じ）
一致          : true
作り直した取引のアドレス: T…（上と違う） （上と違う: true ）`;

const checkOut = `checkDeploy を定義しました`;

const deployOut = `OK  txID ＝ SHA-256(raw_data_hex)
OK  種類が、コントラクトの作成（30）
OK  送り主と作成者が、Alice
OK  バイトコードが、頼んだものと同じ
OK  callValue が、頼んだとおり（0）
OK  userFeePercentage が、頼んだとおり（100）
OK  originEnergyLimit が、頼んだとおり（10000000）
OK  名前が、頼んだとおり（Counter）
OK  アドレスの欄が、空（アドレスは、txID から決まる）
OK  コントラクトの定義に、想定外の欄がない
OK  fee_limit が、頼んだとおり（100000000 sun）
OK  取引の欄が、6つだけ（18 は fee_limit）
OK  有効期限が、これから約60秒以内
OK  参照ブロックが、このチェーンの最近のブロック（1ブロック前）
参考  ABIの項目: (constructor), Incremented, Reset, MAX, count, increment, owner, remaining, reset
→ 点検を通りました。署名してよい取引です
result: true  txid: 4a7d…
実行結果 contractRet : SUCCESS
入ったブロック       : （ブロック番号）  時刻: （時刻）
手数料 fee           : （焼却された合計）sun（焼却された合計）
（帯域幅・Aliceの残高の減りが続く）
Counter のアドレス: T…（34文字）`;

const verifyOut = `--- 取引の結果から ---
contract_address（結果）: 41… → T…
送る前に分かっていたアドレスと一致: true
--- /wallet/getcontract ---
名前 name                    : Counter
作成者 origin_address        : TT365…（Alice） （Alice: true ）
consume_user_resource_percent: 100  origin_energy_limit: 10000000
台帳のコードの長さ           : （バイト数）バイト（デプロイに使ったバイトコード: （バイト数）バイト）
台帳のコードに、7.3の6つのセレクタ: true
ABIの項目数                  : 9
アカウントの type            : （台帳が返す値）
--- 読み取りの関数を、1回ずつ呼ぶ（署名・手数料なし。詳しくは第9章） ---
owner()     : 000000000000000000000000bb3605a39e7febadf055da74a2425d364feec4d0 → Alice: true
count()     : 0
MAX()       : 10
remaining() : 10`;

const costOut = `実行結果 result            : SUCCESS
エネルギーの単価           : 100 sun / エネルギー
エネルギー（合計）         : （エネルギーの量）
  ステークから（Alice）    : （ステークで払った分）
  TRXの焼却で払った        : （足りなかった分）（ （焼却したsun） sun）
  作成者が負担（呼び出し用）: 0
帯域幅 net_usage           : （バイト数） バイト  net_fee: （sun） sun
手数料 fee（焼却の合計）   : （sun） sun = （TRX） TRX
fee_limit                  : 100000000 sun（焼却してよい上限）
合計の内訳が合う           : true`;

// TRON開発概論: 第8章 デプロイ。
export default function TronCh08() {
  return (
    <>
      <P>第7章で書いた Counter は、まだ、手元のソースコードです。この章では、これを<B>コンパイル</B>して、<B>ABI</B>と<B>バイトコード</B>にし、<B>デプロイ</B>の項目を決めて、Nileに送ります。デプロイも、取引の1つです。第5章・第6章と同じく、<B>署名の前に、取引の中身を自分で点検</B>してから送ります。デプロイしたあとは、台帳から、コントラクトの情報と、費用を読みます。</P>

      <H>8.1 この章の進め方</H>
      <Note kind="goal">ABIとバイトコードを用意して、Counter をNileにデプロイし、デプロイ後のコントラクトと費用を、台帳で確かめられる。</Note>
      <Tbl head={['節', 'やること', '使うもの', '第1章との対応']} rows={[
        ['8.2', 'コンパイルでできるもの（ABIとバイトコード）を知り、ABIを、第7章のセレクタと照合する', 'COUNTER_ABI、sha3', '1.16、1.17'],
        ['8.3', 'バイトコードを用意して、Counter のものかを確かめる', 'COUNTER_BC', '1.15'],
        ['8.4', 'デプロイの項目を決めて、署名前の取引を作る。コントラクトのアドレスを、手作業で求める', 'createSmartContract、keccak', '1.7、1.10'],
        ['8.5', 'デプロイの取引を、署名の前に点検する関数を作る', 'checkDeploy', '1.13'],
        ['8.6', '点検して、署名して、デプロイする', 'sign、sendRawTransaction', '1.12、1.13'],
        ['8.7', 'デプロイ後のコントラクトの情報を読み、読み取りの関数を1回、呼ぶ', 'getContract、triggerConstantContract', '1.16、1.18'],
        ['8.8', 'デプロイの費用を、結果から読む', 'receipt', '1.12'],
      ]} />
      <Note kind="point">この章のコードは、<B>Nileに取引を送ります</B>（8.6）。第2章の2.5の①②、3.2までの Alice、第4章の4.7（<code>showResult</code>）、5.2（<code>readPb</code> など）、6.2（<code>showRes</code>）を、先に済ませておいてください。Aliceには、第6章で残した、エネルギーのステークがあります。足りない分は、TRXが焼却されるので、テストのTRXも、残しておいてください。コンソールの変数は、ページを再読み込みすると消えるので、そのときは、順にやり直してください。</Note>
      <Note kind="warn">デプロイしたコードは、<B>あとから書き換えられません</B>（1.15）。直すときは、新しくデプロイし直します。そのときは、アドレスが変わります（8.4）。練習は、テストネットのNileで行い、<B>メインネットには、練習用の鍵を使わない</B>でください。</Note>

      <H>8.2 コンパイル：ABIとバイトコード</H>
      <Note kind="goal">コンパイルでできるものと、デプロイに必要なものを説明し、ABIを、第7章のセレクタと照合できる。</Note>
      <P>コンパイルすると、次の2つが得られます。デプロイの取引には、この両方を入れます。</P>
      <Code lang="solidity" code={counterSol} />
      <Tbl head={['できるもの', '中身', '使いどころ']} rows={[
        ['ABI', '関数・イベント・コンストラクタの一覧（JSON）。名前、引数の型、戻り値の型、変更の有無（stateMutability）', 'ノードに記録される。呼び出す側が、セレクタと引数のバイト列を組み立てる材料になる（第9章）。実行には使われない'],
        ['バイトコード（作成用）', 'コンストラクタと、実行時のコードを合わせた、16進のバイト列', 'デプロイの取引に入れる。TVMが、これを1度実行し、返ってきた実行時のコードを、台帳に残す'],
        ['実行時のコード', '台帳に残る、コントラクトのコード', '呼び出しのたびに、TVMが実行する。getcontract で読める（1.16）'],
      ]} />
      <P>この章では、<B>コンパイル済みのABIとバイトコードを、コンソールに貼る</B>方式にします。ソースコードをブラウザで書き換えて試す仕組みは、用意していません。ソースを変えるときは、自分でコンパイルし直して、貼り直します。コンパイルは、たとえば次のどれかで行えます。</P>
      <Ul items={[
        'TronIDE（ブラウザ）：Counter.sol を貼り、使うコンパイラの版を選んでコンパイルします。ABIとバイトコード（Bytecode）を、コピーできます。',
        '手元のコンパイラ：solc の --abi --bin で、ABIとバイトコードを出力します。TRON版のコンパイラを使ってください（7.6）。',
      ]} />
      <Note kind="warn">コンパイラの版は、ソースの <code>pragma solidity 0.8.20;</code> と合わせます（7.6）。TRON版のコンパイラが、その版に対応しているかは、TRONの公式資料で確かめてください。コンパイラの出力の形（ABIの項目の順番など）は、版によって、少し違うことがあります。違っても、関数名と引数の型が同じなら、セレクタは同じです。</Note>
      <P>ABIは、Counter のソースから決まるので、ここでは、コンソールに直接書きます。7.3で求めたセレクタと、7.5のイベントの目印が、ABIから求めても同じになることを確かめます。</P>
      <Code code={abiJs} />
      <Out code={abiOut} />
      <Note kind="point">コンパイラが出力するABIは、ここに書いた形（<code>type</code>、<code>name</code>、<code>inputs</code>、<code>outputs</code>、<code>stateMutability</code> など）が基本です。コンパイラの出力をそのまま使うときは、<code>COUNTER_ABI</code> を、それに置き換えてください。8.3から先は、同じように動きます。</Note>

      <H>8.3 バイトコードを用意する</H>
      <Note kind="goal">バイトコードをコンソールに貼り、Counter のものであることを、セレクタで確かめられる。</Note>
      <P>コンパイルで得た<B>バイトコード</B>（作成用）を、次のコードの <code>COUNTER_BYTECODE</code> の <code>""</code> の中に貼ります。コードの上の「入力」を押すとコンソールの入力欄に入るので、そこで貼り付けてから実行します。先頭の <code>0x</code> は、あってもなくても構いません。</P>
      <Code code={bytecodeJs} />
      <Out code={bytecodeOut} />
      <P>コントラクトは、受け取ったバイト列の先頭4バイト（セレクタ）を見て、動かす関数を決めます（7.3）。そのため、バイトコードの中には、各関数のセレクタが、命令 <code>PUSH4</code>（<code>63</code>）の直後に、そのまま入っています。7.3で求めた6つのセレクタが、すべて見つかれば、バイトコードと、ABI・ソースが、対応していると言えます。</P>
      <Note kind="ex">この確認で分かるのは、「ABIにある関数の、セレクタがある」ことです。コードの中身が、ソースと同じ動きをすることまでは、保証しません。他人から受け取ったバイトコードを、そのままデプロイしてはいけません（第13章）。</Note>

      <H>8.4 デプロイの項目を決めて、取引を作る</H>
      <Note kind="goal">デプロイの項目の意味を説明し、署名前の取引を作って、コントラクトのアドレスが、txID から決まることを確かめられる。</Note>
      <P>デプロイは、<code>transactionBuilder.createSmartContract</code> に、次の項目を渡して、署名前の取引を作ります。</P>
      <Tbl head={['項目', '意味', 'この章の値']} rows={[
        ['abi', '8.2のABI', 'COUNTER_ABI'],
        ['bytecode', '8.3のバイトコード（16進）', 'COUNTER_BC'],
        ['parameters', 'コンストラクタの引数。ABIの規則で、バイトコードの末尾に付く（1.17と同じ並べ方）', '[]（Counter のコンストラクタに、引数はない）'],
        ['name', 'コントラクトの名前。台帳に残る。動きには関係しない', 'Counter'],
        ['feeLimit', 'エネルギーが足りないとき、TRXを焼却して払ってよい上限（sun）。実際に焼却されるのは、使った分だけ', '100 TRX（100,000,000 sun）。エネルギーの単価（1.12）で、100万エネルギー分'],
        ['callValue', 'デプロイと一緒に送るTRX（sun）。コンストラクタが payable のときだけ、受け取れる', '0（Counter のコンストラクタは payable ではない）'],
        ['userFeePercentage', '呼び出した人が負担するエネルギーの割合（0〜100）。残りを、作成者が負担する', '100（呼び出した人が、すべて負担する）'],
        ['originEnergyLimit', '作成者が負担する場合の、1回の呼び出しあたりの上限（エネルギー）', '10,000,000（USDT（1.16）と同じ）'],
      ]} />
      <Note kind="point"><code>userFeePercentage</code> と <code>originEnergyLimit</code> は、デプロイのときに決まり、<B>コントラクトの属性として、台帳に残ります</B>。あとから、呼び出す人が決める値ではありません。たとえば 100 なら、呼ぶ人が、すべてを負担します。30 なら、呼ぶ人が30%、作成者が70%（<code>originEnergyLimit</code> が上限）を負担します。Counter は、作成者が負担する理由がないので、100にします。費用の使い方は、第12章で、詳しく扱います。</Note>
      <Note kind="warn"><code>feeLimit</code> の上限は、チェーンのパラメータ <code>getMaxFeeLimit</code> で決まります（1.12の出力例は、15,000 TRX）。範囲を外れた値を渡すと、TronWebが、エラーにします。</Note>
      <Code code={buildJs} />
      <Out code={buildOut} />
      <P>返ってきた取引の <code>contract_address</code> に注目してください。デプロイの取引は、まだ送っていないのに、<B>コントラクトのアドレスが、すでに決まっています</B>。コントラクトのアドレスは、<B>取引の txID と、作成者のアドレス</B>から求められるからです。txID（32バイト）と、作成者のアドレス（41付きの21バイト）を並べて、Keccak-256を計算し、下位20バイトに <code>41</code> を付けると、アドレスになります。1.7のアドレスの求め方と、同じ形です。</P>
      <Code code={addressJs} />
      <Out code={addressOut} />
      <Note kind="point">アドレスが txID から決まるので、<B>同じコードを、同じ人が、もう一度デプロイしても、別のコントラクトになります</B>（txID が違うため）。逆に、送る前の取引について、アドレスは分かりますが、<B>取引の中身を1バイトでも変えると、txID も、アドレスも変わります</B>。8.4で作った取引は、送らずに捨てます。8.6で、作り直します。</Note>

      <H>8.5 署名の前に点検する</H>
      <Note kind="goal">デプロイの取引を、バイト列で点検し、頼んだ内容と違う取引に、署名しないようにできる。</Note>
      <P>5.3の <code>checkTx</code>、6.2の <code>checkOp</code> と同じ考え方で、デプロイの取引を点検する関数 <code>checkDeploy</code> を作ります。点検するのは、JSONの表示ではなく、<code>raw_data_hex</code>（署名されるバイト列）です。ノードが、頼んだものと違う取引（別のバイトコード、別の作成者、大きすぎる <code>fee_limit</code> など）を返しても、署名の前に、見つけられます。</P>
      <Tbl head={['点検', '見るところ', '違うと、どうなるか']} rows={[
        ['txID', 'raw_data_hex の SHA-256 が、txID と一致', '別の取引に、署名してしまう（1.10）'],
        ['種類', 'contract の type が、30（CreateSmartContract）', '別の操作に署名してしまう'],
        ['送り主と作成者', '欄1が、どちらもAlice', '別のアカウントの名義で、デプロイされる'],
        ['バイトコード', 'コントラクトの定義の欄4が、貼ったバイトコードと同じ', '別のコードが、Aliceの名義でデプロイされる'],
        ['callValue・userFeePercentage・originEnergyLimit・名前', '欄5・6・8・7が、頼んだ値', '費用の負担や、送るTRXが、変わる'],
        ['fee_limit', '取引の欄18が、頼んだ値', '焼却してよいTRXの上限が、変わる'],
        ['欄', '取引の欄が 1・4・8・11・14・18 だけ。コントラクトの定義に、想定外の欄がない', '余計な内容が、混ざる'],
        ['有効期限・参照ブロック', '5.3と同じ', '期限切れ、別のチェーンの取引'],
      ]} />
      <Code code={checkJs} />
      <Out code={checkOut} />
      <Note kind="ex">ABI（欄3）は、実行に使われず、台帳に残る説明です。そのため、ここでは、名前の一覧を表示するだけにしています。<B>実際に動くのは、バイトコード</B>です。点検の対象は、バイトコードです。</Note>

      <H>8.6 デプロイする</H>
      <Note kind="goal">点検・署名・アナウンスを順に行い、デプロイの結果を、台帳で確かめられる。</Note>
      <P>取引の有効期限は、約60秒です。そこで、このコードは、取引を<B>作り直してから</B>、点検・署名・アナウンスを、続けて行います（8.4で作った取引は、使いません）。点検でNGが1つでもあれば、署名しないで止まります。成功すると、<code>counterAddr</code>（Base58）と <code>counterHex</code> に、アドレスを残します。第9章以降で使います。</P>
      <Code code={deployJs} />
      <Out code={deployOut} />
      <Note kind="point">アナウンスの <code>result: true</code> は、ノードが受け付けたという意味で、成功ではありません（4.6）。成功かどうかは、<code>contractRet</code> が <code>SUCCESS</code> であることで、確かめます。<code>REVERT</code>（コンストラクタが失敗した）や <code>OUT_OF_ENERGY</code>（エネルギーが足りず、<code>feeLimit</code> も尽きた）のときは、<B>取引は台帳に残りますが、コントラクトは作られません</B>。焼却された分は、戻りません。</Note>
      <Note kind="warn"><code>counterAddr</code> は、コンソールの変数なので、ページを再読み込みすると消えます。<B>Base58のアドレスを、控えておいてください</B>。消えたときは、<code>counterAddr = "T…"; counterHex = tronWeb.address.toHex(counterAddr).toLowerCase();</code> で、戻せます。</Note>

      <H>8.7 デプロイ後の確認</H>
      <Note kind="goal">台帳から、コントラクトの情報を読み、コンストラクタが、意図どおりに動いたことを確かめられる。</Note>
      <P>デプロイした Counter を、3つの面から確かめます。</P>
      <Ul items={[
        '取引の結果：gettransactioninfobyid の contract_address が、8.6で、送る前に分かっていたアドレスと、一致すること。',
        '台帳のコントラクト：getcontract（1.16）で、作成者、名前、userFeePercentage、originEnergyLimit、コード、ABIを読みます。作成者が Alice、userFeePercentage が 100 になっていることを、確かめます。',
        '動き：読み取りの関数を、1回ずつ呼びます。owner() が Alice を返すことは、コンストラクタの owner = msg.sender（7.4）が、デプロイした Alice で動いた証拠です。',
      ]} />
      <Code code={verifyJs} />
      <Out code={verifyOut} />
      <P>読み取りの関数は、1.18の <code>triggerconstantcontract</code> で呼んでいます。署名もトランザクションも要らず、手数料もかかりません（7.3）。<code>owner()</code> の戻り値は、32バイトで、アドレスの20バイトの左を、ゼロで埋めた形です（7.6）。<code>count()</code> は 0、<code>MAX()</code> は 10、<code>remaining()</code> は 10 です。関数の呼び出しと、戻り値の読み方は、第9章で扱います。</P>
      <Note kind="ex">台帳のコードの長さは、デプロイに使ったバイトコードと、同じになるとは限りません。台帳に残るのは、TVMがコンストラクタを実行して返した、<B>実行時のコード</B>です（8.2）。作成用のバイトコードより短いことが、ふつうです。</Note>

      <H>8.8 デプロイの費用を読む</H>
      <Note kind="goal">デプロイの費用が、何から払われたかを、結果（receipt）から読める。</Note>
      <P>デプロイは、帯域幅（取引のサイズ。バイトコードを含むので大きい）と、エネルギー（コンストラクタの実行と、コードを台帳に残す分）を使います。エネルギーは、1.12のとおり、<B>ステークで得た分 → TRXの焼却</B>の順に払われます。結果には、その内訳が残ります。</P>
      <Tbl head={['項目', '意味']} rows={[
        ['energy_usage_total', '使ったエネルギーの合計'],
        ['energy_usage', 'そのうち、Aliceのステークで払った分'],
        ['energy_fee', 'そのうち、TRXを焼却して払った分（sun）。エネルギーの単価で割ると、エネルギーの量になる'],
        ['origin_energy_usage', 'コントラクトの作成者が負担した分。デプロイでは、呼び出しではないので、0'],
        ['net_usage、net_fee', '帯域幅の使用量（バイト）と、焼却して払った分（sun）'],
        ['fee', '焼却されたTRXの合計（sun）。energy_fee と net_fee の合計'],
      ]} />
      <Code code={costJs} />
      <Out code={costOut} />
      <Note kind="point">コードを台帳に残す費用は、<B>実行時のコードの長さに比例</B>します（1バイトあたり、一定のエネルギー）。コードが大きいほど、デプロイは高くなります。使わない関数や、長い文字列は、費用に直結します（7.2）。エネルギーの見積りと、<code>feeLimit</code> の決め方は、第12章で扱います。</Note>
      <Note kind="warn">この章の数値は、<B>見本</B>です。エネルギーの単価（<code>getEnergyFee</code>）は、委員会の提案で変わります（1.12）。ステークの量や、Nileの状況でも、焼却される量が変わります。自分の結果を読んでください。</Note>

      <H>8.9 つまずきやすい点</H>
      <Ul items={[
        '「第2章の2.5の①②を先に実行してください」などと出る：tronWeb、alice、readPb、showResult などの変数が、定義されていません。8.1に書いた章を、順に実行してください。ページを再読み込みすると、消えます。',
        '「バイトコードが空です」と出る：8.3の COUNTER_BYTECODE の "" の中に、バイトコードを貼っていません。「入力」を押して、貼り付けてから、実行してください。',
        '「ABIと合っていません」と出る：別のコントラクトのバイトコードです。7.2の最小の Counter（Counter1.sol）ではなく、7.3の完成形の Counter（Counter.sol）を、コンパイルしてください。',
        'ABIだけをコピーして、バイトコードに、ABIを貼ってしまう：バイトコードは、0-9 と a-f の、偶数桁の文字列です。JSON（{ や " を含む）は、ABIです。',
        '点検で、有効期限や参照ブロックがNGになる：取引を作ってから、60秒以上たっています。8.6は、取引を作り直すので、もう一度、実行してください。',
        'createSmartContract が、項目の範囲のエラーを返す：feeLimit、originEnergyLimit、userFeePercentage が、範囲の外です。feeLimit の上限は、getMaxFeeLimit です（1.12）。',
        'contractRet が OUT_OF_ENERGY になる：エネルギーが足りず、feeLimit も尽きました。Aliceの残高（TRX）と、feeLimit を確かめてください。取引は台帳に残り、コントラクトは作られません。焼却された分は、戻りません。',
        'contractRet が REVERT になる：コンストラクタが失敗しました。callValue に、0以外を渡していませんか（Counter のコンストラクタは、payable ではありません）。',
        '8.7で、getContract の結果が空になる：取引が、ブロックに入る前です。少し待って、もう一度、実行してください。',
        'keccak256 が見つからない（8.4）：tronWeb.utils.ethersUtils が、ない版です。TronWeb v6.3.0（第2章）を使ってください。',
        '8.4で作った取引の contract_address と、8.6のアドレスが違う：正しい動きです。取引を作り直したので、txID も、アドレスも、変わります（8.4）。',
        'コンソールの変数が消えて、コントラクトのアドレスが分からない：デプロイの結果の txID から、contract_address を、gettransactioninfobyid で読めます（8.7）。',
      ]} />

      <H>8.10 次のステップ</H>
      <P>これで、Counter を、コンパイルして、ABIとバイトコードにし、デプロイの項目を決め、署名の前に点検して、Nileにデプロイできました。デプロイ後のコントラクトの情報と、費用も、台帳から読めます。次の<B>第9章</B>では、デプロイした Counter を<B>呼び出し</B>ます。読み取り（<code>call</code>）と書き込み（<code>send</code>）の違いを押さえ、1.17のセレクタの手組みと、SDKの結果を比べ、戻り値と失敗の理由を、読みます。</P>
    </>
  );
}
