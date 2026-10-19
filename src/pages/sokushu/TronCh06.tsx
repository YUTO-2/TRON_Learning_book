import { Code, H, Out, P } from './ui';
import { B, Note, Tbl, Ul } from './introParts';
import statusJs from './tronmain/ch06/status.js?raw';
import opsJs from './tronmain/ch06/ops.js?raw';
import stakeJs from './tronmain/ch06/stake.js?raw';
import usageJs from './tronmain/ch06/usage.js?raw';
import delegateJs from './tronmain/ch06/delegate.js?raw';
import unstakeJs from './tronmain/ch06/unstake.js?raw';
import withdrawJs from './tronmain/ch06/withdraw.js?raw';

// 出力例の数値は、見本。ネットワーク全体のステーク量（TotalNetWeight など）や、取引のサイズ・時刻・txID は、実行のたびに変わる。
const statusOut = `--- Alice ---
無料の帯域幅    : 66 / 600 （残り / 1日の枠）
帯域幅 NetLimit : 0  使用済み: 0
エネルギー      : 0  使用済み: 0
--- Bob ---
無料の帯域幅    : 600 / 600 （残り / 1日の枠）
帯域幅 NetLimit : 0  使用済み: 0
エネルギー      : 0  使用済み: 0
--- ネットワーク全体 ---
帯域幅     TotalNetLimit   : 43200000000  TotalNetWeight   : 3979452118 （TRX）
エネルギー TotalEnergyLimit: 180000000000  TotalEnergyWeight: 10953298145 （TRX）
1 TRXのステークで、1日に使える帯域幅   ≈ 10.856 バイト
1 TRXのステークで、1日に使えるエネルギー ≈ 16.433`;

const opsOut = `checkOp と sendOp を定義しました`;

const stakeOut = `--- ステーク前 ---
無料の帯域幅    : 66 / 600 （残り / 1日の枠）
帯域幅 NetLimit : 0  使用済み: 0
エネルギー      : 0  使用済み: 0
=== BANDWIDTH を、200 TRXステークする ===
OK  txID ＝ SHA-256(raw_data_hex)
OK  種類が、頼んだ操作（54）
OK  契約の中身が、頼んだとおり
OK  欄が、5つだけ（余計な欄がない）
OK  有効期限が、これから約60秒以内
OK  参照ブロックが、このチェーンの最近のブロック（0ブロック前）
→ 点検を通りました。署名してよい取引です
result: true  txid: 5e0c9a41b7d2…（64桁）
実行結果 contractRet : SUCCESS
入ったブロック       : 66012471  時刻: 2026-10-19T04:31:12.000Z
手数料 fee           : 252000 sun（焼却された合計）
帯域幅 net_usage     : 0 バイト（無料枠・ステークから）
帯域幅 net_fee       : 252000 sun（TRXを焼却して払った分）
Aliceの残高の減り    : 200252000 sun = 200.252 TRX
=== ENERGY を、100 TRXステークする ===
（点検は同じ形。結果は、手数料 fee: 0 sun、net_usage: 254 バイト、Aliceの残高の減り: 100 TRX）
--- ステーク後 ---
無料の帯域幅    : 66 / 600 （残り / 1日の枠）
帯域幅 NetLimit : 2171  使用済み: 254
エネルギー      : 1643  使用済み: 0
ステーク中: BANDWIDTH 200000000 sun
ステーク中: ENERGY 100000000 sun`;

const usageOut = `（safeSend の点検と結果の表示は、5.5と同じ形で出る。net_usage は 267、fee は 0 になる）
ステークした帯域幅の使用 NetUsed     : 254 → 521
無料の帯域幅の使用       freeNetUsed : 534 → 534
エネルギーの使用         EnergyUsed  : 0 → 0`;

const delegateOut = `委任できる上限 BANDWIDTH : 152003684 sun → 委任する量: 50000000 sun
委任できる上限 ENERGY : 100000000 sun → 委任する量: 50000000 sun
--- 委任前のBob ---
無料の帯域幅    : 600 / 600 （残り / 1日の枠）
帯域幅 NetLimit : 0  使用済み: 0
エネルギー      : 0  使用済み: 0
=== BANDWIDTH を、Bobに委任する ===
（点検は、6.4と同じ形で、種類が 57 と表示される。net_usage は 276）
=== ENERGY を、Bobに委任する ===
（同じ形。net_usage は 278）
--- 委任後のBob ---
無料の帯域幅    : 600 / 600 （残り / 1日の枠）
帯域幅 NetLimit : 542  使用済み: 0
エネルギー      : 821  使用済み: 0
--- 委任後のAlice ---
無料の帯域幅    : 66 / 600 （残り / 1日の枠）
帯域幅 NetLimit : 1628  使用済み: 1075
エネルギー      : 822  使用済み: 0
委任の記録: 帯域幅 50000000 sun  エネルギー 50000000 sun`;

const unstakeOut = `=== BANDWIDTH の委任を、取り戻す ===
（点検は、種類が 58 と表示される。net_usage は 278）
=== ENERGY の委任を、取り戻す ===
（同じ形。net_usage は 278）
=== BANDWIDTH のステーク（200 TRX）を、解除する ===
（点検は、種類が 55 と表示される。net_usage は 254）
解除待ち: BANDWIDTH 200000000 sun  引き出せる時刻: 2026-11-02T04:47:33.000Z
解除してから引き出せるまでの日数 getUnfreezeDelayDays: 14
あと何回、解除できるか: 31
帯域幅 NetLimit      : 0 （解除した分の帯域幅は、すぐに無くなる）
エネルギー EnergyLimit: 1643 （ステークを残した分）`;

const withdrawOut = `いま引き出せる量: 0 sun
まだ引き出せるTRXがありません。待ち時間が過ぎてから、もう一度実行してください`;

// TRON開発概論: 第6章 リソース。
export default function TronCh06() {
  return (
    <>
      <P>この章では、TRXをステークして帯域幅とエネルギーを得て、他のアカウントへ委任し、解除して引き出すところまでを、SDKで実行します。1.12では、リソースの種類と、足りないときにTRXが焼却される仕組みを、読んで確かめました。この章では、リソースを<B>自分で得る側</B>に回ります。</P>

      <H>6.1 この章の進め方</H>
      <Note kind="goal">ステークで帯域幅とエネルギーを得て、委任・解除・引き出しまでの流れを、SDKで実行できる。</Note>
      <P>現在のステークの仕組みは、<B>ステーク2.0</B>です。TRXを預けると（ステーク）、預けた量に応じて、帯域幅かエネルギーを、毎日使えるようになります。預けたTRXは、失うのではなく、預けているだけです。得たリソースは、他のアカウントに貸す（委任）こともできます。預けたTRXを取り戻すときは、<B>解除</B>してから、待ち時間が過ぎたあとに<B>引き出し</B>ます。</P>
      <Tbl head={['操作', '何が起きるか', 'TronWebの関数（transactionBuilder）', '取引の種類（番号）']} rows={[
        ['ステーク', 'TRXを預けて、帯域幅かエネルギーを得る', 'freezeBalanceV2', 'FreezeBalanceV2Contract（54）'],
        ['委任', '得たリソースを、他のアカウントに貸す', 'delegateResource', 'DelegateResourceContract（57）'],
        ['委任の取り戻し', '貸したリソースを、取り戻す', 'undelegateResource', 'UnDelegateResourceContract（58）'],
        ['解除', '預けたTRXを、引き出し待ちにする', 'unfreezeBalanceV2', 'UnfreezeBalanceV2Contract（55）'],
        ['引き出し', '待ち時間が過ぎたTRXを、残高に戻す', 'withdrawExpireUnfreeze', 'WithdrawExpireUnfreezeContract（56）'],
        ['解除の取り消し', '待っている解除を、すべて取り消す', 'cancelUnfreezeBalanceV2', 'CancelAllUnfreezeV2Contract（59）'],
      ]} />
      <Tbl head={['節', 'やること', '使うもの', '第1章・第4章・第5章との対応']} rows={[
        ['6.2', 'アカウントとネットワークのリソースを読む', 'getAccountResources', '1.12'],
        ['6.3', '署名の前の点検を、送金以外の取引へ広げる', 'checkOp、sendOp', '5.3、5.5'],
        ['6.4', 'TRXをステークして、リソースを得る', 'freezeBalanceV2', '1.12、4.3〜4.7'],
        ['6.5', 'ステークした帯域幅が、先に使われることを確かめる', 'safeSend', '1.12、5.5'],
        ['6.6', '得たリソースを、Bobに委任する', 'delegateResource', '1.12'],
        ['6.7', '委任を取り戻して、ステークを解除する', 'undelegateResource、unfreezeBalanceV2', '1.11'],
        ['6.8', '解除したTRXを、引き出す', 'withdrawExpireUnfreeze', '1.13'],
      ]} />
      <Note kind="point">この章のコードは、第2章の2.5の①②、第3章の3.2の復元、第4章の4.2（Bob）、5.2（<code>readPb</code> など）、5.5（<code>safeSend</code>）、第4章の4.7（<code>showResult</code>）までを済ませていることが前提です。Aliceには、<B>310 TRX以上</B>が必要です（フォーセットで受け取った分。3.5）。コンソールの変数は、ページを再読み込みすると消えるので、そのときは、順にやり直してください。</Note>
      <Note kind="warn">この章の操作は、<B>テストネット（Nile）の練習用のアカウント</B>だけで行います。ステークしたTRXは、解除してから引き出せるまで、<B>待ち時間</B>があります（6.7）。メインネットの資産では、試さないでください。</Note>
      <Note kind="ex">旧方式（ステーク1.0）の <code>freezeBalance</code>・<code>unfreezeBalance</code> という関数も、TronWebに残っています。この講座では、現在の方式である2.0（関数名の末尾が <code>V2</code>）だけを使います。</Note>

      <H>6.2 リソースの現状を読む</H>
      <Note kind="goal">アカウントのリソースと、ネットワーク全体の合計から、ステークで得られる量の見当をつけられる。</Note>
      <P><code>trx.getAccountResources(アドレス)</code> は、アカウントのリソースを返します（HTTP API の <code>/wallet/getaccountresource</code> に対応。1.12のコードと同じ情報です）。最新の台帳（fullノード）から取得します。</P>
      <Tbl head={['項目', '意味']} rows={[
        ['freeNetLimit、freeNetUsed', '無料の帯域幅の、1日の枠と、使った量'],
        ['NetLimit、NetUsed', 'ステークで得た帯域幅（委任で受け取った分を含む）と、使った量'],
        ['EnergyLimit、EnergyUsed', 'ステークで得たエネルギー（委任で受け取った分を含む）と、使った量'],
        ['TotalNetLimit、TotalNetWeight', 'ネットワーク全体の、1日の帯域幅の合計と、ステークされたTRXの合計（TRX単位）'],
        ['TotalEnergyLimit、TotalEnergyWeight', 'エネルギーの、同じ値'],
      ]} />
      <P>ステークで得られる量は、<B>ネットワーク全体のステークに占める、自分の割合</B>で決まります。目安は、次の式です。</P>
      <Note kind="point"><code>NetLimit ≈ ステークしたTRX × TotalNetLimit ÷ TotalNetWeight</code>（エネルギーも同じ形）。ほかの人がステークすると TotalNetWeight が増えるので、<B>同じTRXでも、得られる量は日々変わります</B>。</Note>
      <Code code={statusJs} />
      <Out code={statusOut} />
      <P>この時点で、AliceもBobも、NetLimit と EnergyLimit は 0 です。まだ、誰もステークしていないからです。Bobは送金を受け取っただけなので、無料の帯域幅も満額です。</P>

      <H>6.3 署名の前の点検を、送金以外の取引へ広げる</H>
      <Note kind="goal">ステークや委任の取引を、署名の前に、バイト列から点検する仕組みを説明できる。</Note>
      <P>第5章の <code>checkTx</code> は、<B>TransferContract（TRXの送金）だけ</B>を点検できます。ステークや委任は、契約の中身の欄が違います。TronWeb v6.3.0では、これらの取引は、ノードではなく<B>SDKが手元で組み立てます</B>（4.3の <code>sendTrx</code> とは違います）。ただし、有効期限と参照ブロックは、ノードの最新ブロックから決まります。</P>
      <P>それでも点検するのは、<B>単位の間違い</B>（TRXとsunの取り違えで、量が100万倍になる）、<B>リソースの取り違え</B>（帯域幅とエネルギー）、<B>相手の間違い</B>（委任の受け取り側）を、署名の前に見つけるためです。点検の方法は5.3と同じで、バイト列を読み解き、<B>頼んだ内容と比べます</B>。</P>
      <Tbl head={['取引の種類', '番号', '契約の欄（番号：中身）']} rows={[
        ['ステーク（FreezeBalanceV2）', '54', '1：送り主、2：量（sun）、3：リソース'],
        ['解除（UnfreezeBalanceV2）', '55', '1：送り主、2：量（sun）、3：リソース'],
        ['引き出し（WithdrawExpireUnfreeze）', '56', '1：送り主'],
        ['委任（DelegateResource）', '57', '1：送り主、2：リソース、3：量（sun）、4：受け取り側、5：ロック、6：ロック期間'],
        ['委任の取り戻し（UnDelegateResource）', '58', '1：送り主、2：リソース、3：量（sun）、4：受け取り側'],
      ]} />
      <Note kind="point">リソースの欄は、<B>帯域幅（0）のとき、省かれます</B>（protobufは、0を書きません）。エネルギーは 1、TRON Power は 2 です。頼んだ内容（<code>want</code>）は、欄の番号と値の対応で書きます。たとえば、エネルギーのステークなら <code>{'{ 1: 送り主, 2: 量, 3: 1 }'}</code> です。</Note>
      <Code code={opsJs} />
      <Out code={opsOut} />
      <P><code>sendOp</code> は、5.5の <code>safeSend</code> と同じ順序で、点検 → 署名 → アナウンス → 結果の確認を、続けて行います。NG があれば、署名せずに止まります。以降の節は、すべて <code>sendOp</code> で送ります。</P>
      <Note kind="warn">5.3の点検にあった「JSONの表示と、バイト列の照合」は、この章では省いています。SDKが、同じ値から、JSONとバイト列の両方を作るからです。<B>頼んだ内容そのもの</B>（量、リソース、委任先）は、<code>want</code> として、取引とは別に、自分で書いてください。取引から求めた値を頼んだ内容にしては、意味がありません。</Note>

      <H>6.4 ステークして、リソースを得る</H>
      <Note kind="goal">TRXをステークして、帯域幅とエネルギーが増えることを、確かめられる。</Note>
      <P><code>transactionBuilder.freezeBalanceV2(量, リソース, 送り主)</code> で、ステークの取引を組み立てます。量は<B>sun</B>の整数です（最小は1 TRX）。リソースは <code>"BANDWIDTH"</code> か <code>"ENERGY"</code> で、省くと帯域幅になります。次のコードは、帯域幅に200 TRX、エネルギーに100 TRXをステークします。</P>
      <Code code={stakeJs} />
      <Out code={stakeOut} />
      <Ul items={[
        '1回目の取引では、Aliceに、ステークした帯域幅がまだありません。無料の帯域幅の残り（出力例では66）が、取引のサイズ（252バイト）に足りないので、TRXが焼却されます（fee 252000 sun）。無料枠は、一部だけ使うことができず、足りなければ、全部を焼却で払います。',
        '2回目の取引からは、1回目でステークした帯域幅から使われるので、fee は 0 です。',
        'Aliceの残高は、ステークした量だけ減ります。減った分は、消えたのではなく、アカウントの frozenV2 に移っています（最後の2行）。',
        'ステーク後の NetLimit と EnergyLimit が、6.2の式の見当に近い値になります。出力例では、200 TRX × 10.856 ≈ 2171、100 TRX × 16.433 ≈ 1643 です。',
      ]} />
      <Note kind="point">ステークしたTRXは、<B>TRON Power（投票権）</B>にもなります（1.2、付録D）。ステークを解除すると、その分、リソースも投票権も減ります。</Note>

      <H>6.5 ステークした帯域幅が、先に使われることを確かめる</H>
      <Note kind="goal">帯域幅が、ステーク → 無料枠 → 焼却の順に使われることを、数値で確かめられる。</Note>
      <P>1.12で見た順番を、確かめます。5.5の <code>safeSend</code> で、BobへTRXを1回送り、前後で、<code>NetUsed</code>（ステークした帯域幅の使用）と <code>freeNetUsed</code>（無料枠の使用）を比べます。</P>
      <Code code={usageJs} />
      <Out code={usageOut} />
      <P><code>NetUsed</code> だけが、送金のサイズ（267バイト）の分、増えます。<code>freeNetUsed</code> は変わりません。ステークした帯域幅が、無料枠より先に使われたことが分かります。エネルギーは、TRXの送金では使わないので、変わりません。エネルギーを使うのは、スマートコントラクトを動かす取引です（第9章、第12章）。</P>
      <Note kind="ex">出力例の数値で計算すると、200 TRXのステークで、1日に使える帯域幅は約2,171バイトで、267バイトの送金が、約8回できます。同じ8回を、ステークなしで焼却だけで払うと、0.267 TRX × 8 ≈ 2.1 TRXです。ただし、ステークしたTRXは、預けているだけで、焼却されません。</Note>
      <Note kind="warn">取引のサイズが、残りのステークした帯域幅より大きいと、その取引は、無料枠、それも足りなければ焼却で払います（6.4の1回目）。<code>NetUsed</code> の増え方は、時間とともに回復する分が混ざるので、数バイトずれることがあります。</Note>

      <H>6.6 リソースを委任する</H>
      <Note kind="goal">ステークで得たリソースを、他のアカウントに委任して、受け取る側のリソースが増えることを確かめられる。</Note>
      <P><code>transactionBuilder.delegateResource(量, 受け取り側, リソース, 送り主)</code> で、リソースを貸します。<B>量は、リソースの量ではなく、委任するステークのTRX（sun）</B>です。受け取る側は、そのTRXをステークしたときと同じ計算で、リソースを得ます。<B>TRXの持ち主は、Aliceのまま</B>です。</P>
      <Tbl head={['引数', '意味']} rows={[
        ['量', '委任するステークの量（sun）。委任できる上限は、getCanDelegatedMaxSize で調べる'],
        ['受け取り側', 'リソースを受け取るアドレス。受け取り側の署名は要らない'],
        ['リソース', '"BANDWIDTH" か "ENERGY"'],
        ['送り主', 'Alice'],
        ['lock、lockPeriod', 'lock を true にすると、決めた期間（ブロック数）は、取り戻せない。この章では使わない（false）'],
      ]} />
      <Code code={delegateJs} />
      <Out code={delegateOut} />
      <Ul items={[
        '委任できる上限は、使っているリソースがあると、ステークした量より小さくなることがあります（帯域幅の出力例）。コードは、50 TRXと上限の小さいほうを委任します。',
        'Bobの NetLimit と EnergyLimit が増えます。Bobは、秘密鍵も、ステークも持っていませんが、このリソースで、取引を送れます。',
        'Aliceの NetLimit と EnergyLimit は、委任した分だけ減ります。',
        'getDelegatedResourceV2 は、AliceからBobへの委任の記録を返します。量は、委任したTRX（sun）です。',
      ]} />
      <Note kind="point">この章の読み取りの関数（<code>getCanDelegatedMaxSize</code>、<code>getDelegatedResourceV2</code>、<code>getAvailableUnfreezeCount</code>、<code>getCanWithdrawUnfreezeAmount</code>）は、何も指定しないと、<B>確定済みの台帳（solidityノード）</B>から読みます。取引の直後の値を見たいときは、最後の引数に <code>{'{ confirmed: false }'}</code> を渡して、最新の台帳から読みます（1.13）。</Note>

      <H>6.7 委任を取り戻して、ステークを解除する</H>
      <Note kind="goal">委任の取り戻し、ステークの解除、引き出し待ちの状態を、SDKで実行して確かめられる。</Note>
      <P>預けたTRXを取り戻す流れは、次のとおりです。</P>
      <Tbl head={['状態', '次へ進む操作', '備考']} rows={[
        ['ステーク中（委任中の分を含む）', '委任を取り戻す（undelegateResource）', '委任中の分は、解除できない。先に取り戻す'],
        ['ステーク中', '解除する（unfreezeBalanceV2）', '解除した分のリソースは、すぐに無くなる'],
        ['解除待ち', '待つ（約14日）', 'この間、TRXは使えない。待ち時間は、チェーンのパラメータ getUnfreezeDelayDays'],
        ['引き出せる', '引き出す（withdrawExpireUnfreeze）', '残高に戻る（6.8）'],
      ]} />
      <P>次のコードは、Bobへの2つの委任（帯域幅とエネルギー）を取り戻し、帯域幅のステーク（200 TRX）を解除します。<B>エネルギーのステークは、残します</B>。第9章以降で、コントラクトを動かすときに、使えるからです。</P>
      <Code code={unstakeJs} />
      <Out code={unstakeOut} />
      <Ul items={[
        '解除した200 TRXは、unfrozenV2 に「解除待ち」として入り、引き出せる時刻が付きます。待ち時間が終わるまで、残高には戻りません。',
        '同時に解除待ちにできる回数には、上限があります（32回）。getAvailableUnfreezeCount が、残りの回数を返します。',
        '待っている解除は、cancelUnfreezeBalanceV2（種類59）で、すべて取り消して、ステークに戻せます。',
      ]} />
      <Note kind="warn">待ち時間の日数は、委員会の提案で変わることがあります。コードは、チェーンのパラメータ <code>getUnfreezeDelayDays</code> を取得して表示します。パラメータが取得できないと、「取得できません」と表示します。</Note>

      <H>6.8 解除したTRXを、引き出す</H>
      <Note kind="goal">待ち時間が過ぎたTRXを、引き出せる。</Note>
      <P>解除の待ち時間が過ぎたら、<code>withdrawExpireUnfreeze</code> で、残高に戻します。次のコードは、いま引き出せる量を確かめて、0なら何もしません。<B>待ち時間の前に実行しても、何も起きません</B>。待ち時間が過ぎてから、もう一度実行してください。</P>
      <Code code={withdrawJs} />
      <Out code={withdrawOut} />
      <P>引き出せる量があるときは、点検（種類は56）、署名、アナウンスの順で実行して、引き出したあとの残高を表示します。</P>

      <H>6.9 つまずきやすい点</H>
      <Ul items={[
        '「第4章の4.2までを済ませてください」と出る：alice と bob が定義されていません。①②、3.2の復元、4.2を、順に実行してください。',
        '「5.2 と、第4章の4.7 を先に実行してください」「6.2 と 6.3 を先に実行してください」などと出る：関数や変数が定義されていません。ページを再読み込みすると、消えます。順に、やり直してください。',
        '「Aliceの残高が足りません」と出る：310 TRX以上が必要です。第3章の3.5で、フォーセットから受け取ってください。',
        '6.4で、量が小さすぎて失敗する：量はsunです。1 TRXは、1,000,000 sunで、ステークの最小は1 TRXです。TRXとsunを、取り違えないでください。',
        '点検で NG になる：「契約の中身」が NG なら、量・リソース・受け取り側のどれかが、頼んだ内容と違います。リソースの欄は、帯域幅のとき省かれます（6.3）。「有効期限」が NG なら、パソコンの時計のずれです（5.7）。',
        '実行結果が SUCCESS 以外になる：失敗の理由は、gettransactioninfobyid の resMessage（16進の文字列）に入っています。文字に直して読みます（4.5）。',
        '6.6で、「委任できる量が、1 TRX未満です」と出る：使っているリソースがあると、委任できる量が小さくなります。リソースは、約24時間かけて回復します。時間をおいて、実行してください。',
        '6.6で、読み取りの結果が、ステークの直後に古い：読み取りの関数は、既定で確定済みの台帳から読みます。{ confirmed: false } を付けてください（6.6）。',
        '6.7で、解除が失敗する：委任中の分は、解除できません。6.6の委任を、先に取り戻してください。',
        '「Failed to fetch」や、429エラーが出る：Nileが応答していないか、回数制限です。2.8を確認して、少し待ってから、もう一度実行してください。',
      ]} />

      <H>6.10 次のステップ</H>
      <P>これで、TRXをステークしてリソースを得て、委任し、解除して引き出す流れを、SDKで実行できるようになりました。第2章から第6章で、SDKとTRONの標準機能を一通り扱ったことになります。Aliceには、第9章以降で使える、エネルギーのステークが残っています。次の<B>第7章</B>からは、後半の<B>スマートコントラクト</B>です。まず、Solidityで、最小のコントラクトを書きます。</P>
    </>
  );
}
