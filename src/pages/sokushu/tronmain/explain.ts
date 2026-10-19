import load from './ch02/load.js?raw';
import common from './ch02/common.js?raw';
import check from './ch02/check.js?raw';
import compare from './ch02/compare.js?raw';
import apikey from './ch02/apikey.js?raw';
import create from './ch03/create.js?raw';
import restore from './ch03/restore.js?raw';
import convert from './ch03/convert.js?raw';
import verify3 from './ch03/verify.js?raw';
import balance from './ch03/balance.js?raw';
import account3 from './ch03/account.js?raw';
import bob4 from './ch04/bob.js?raw';
import build4 from './ch04/build.js?raw';
import rawcheck4 from './ch04/rawcheck.js?raw';
import sign4 from './ch04/sign.js?raw';
import broadcast4 from './ch04/broadcast.js?raw';
import confirm4 from './ch04/confirm.js?raw';
import bobafter4 from './ch04/bobafter.js?raw';
import solid4 from './ch04/solid.js?raw';
import oneliner4 from './ch04/oneliner.js?raw';
import decode5 from './ch05/decode.js?raw';
import verifytx5 from './ch05/verifytx.js?raw';
import tamper5 from './ch05/tamper.js?raw';
import safesend5 from './ch05/safesend.js?raw';
import confirmed5 from './ch05/confirmed.js?raw';
import status6 from './ch06/status.js?raw';
import ops6 from './ch06/ops.js?raw';
import stake6 from './ch06/stake.js?raw';
import usage6 from './ch06/usage.js?raw';
import delegate6 from './ch06/delegate.js?raw';
import unstake6 from './ch06/unstake.js?raw';
import withdraw6 from './ch06/withdraw.js?raw';
import counter1Sol7 from './ch07/Counter1.sol?raw';
import counterSol7 from './ch07/Counter.sol?raw';
import selector7 from './ch07/selector.js?raw';
import revert7 from './ch07/revert.js?raw';
import event7 from './ch07/event.js?raw';
import units7 from './ch07/units.js?raw';
import address7 from './ch07/address.js?raw';
import abi8 from './ch08/abi.js?raw';
import bytecode8 from './ch08/bytecode.js?raw';
import build8 from './ch08/build.js?raw';
import address8 from './ch08/address.js?raw';
import check8 from './ch08/check.js?raw';
import deploy8 from './ch08/deploy.js?raw';
import verify8 from './ch08/verify.js?raw';
import cost8 from './ch08/cost.js?raw';
import encode9 from './ch09/encode.js?raw';
import read9 from './ch09/read.js?raw';
import write9 from './ch09/write.js?raw';
import check9 from './ch09/check.js?raw';
import send9 from './ch09/send.js?raw';
import dryrun9 from './ch09/dryrun.js?raw';
import fail9 from './ch09/fail.js?raw';
import contract9 from './ch09/contract.js?raw';
import log10 from './ch10/log.js?raw';
import txevents10 from './ch10/txevents.js?raw';
import contractevents10 from './ch10/contractevents.js?raw';
import watch10 from './ch10/watch.js?raw';
import confirmed10 from './ch10/confirmed.js?raw';
import sdk10 from './ch10/sdk.js?raw';

// TRON本編のコードの意味の解説。コード文字列をキーにしている（explain.ts の explainOf から引く）。
export const tronExplain = new Map<string, string>([
  // ---------- 第2章 ----------
  [load, `・script要素を作り、TronWeb（ブラウザ用にまとめたJSファイル）のURLを src に設定します。\n・バージョンは 6.3.0 に固定しています。\n・それを <head> に追加すると、SDKが読み込まれます。`],
  [common, `・SDKが読み込まれていなければ、エラーで止めます。\n・TronWeb: SDKのクラスを、グローバルの TronWeb という名前にそろえます（読み込み方によって、クラスの入る場所が違うため）。\n・NILE: 接続先ノード（テストネットのNile）のURLです。\n・tronWeb: SDKの本体です。fullHost にノードのURLを渡すだけで、HTTP API・Solidity ノード・イベントサーバーを、すべて同じ接続先にします。秘密鍵は渡していないので、読み取りだけができます。\n・clog(): トランザクションのIDから、Nileのエクスプローラー（TRONSCAN）のURLを表示する関数です。`],
  [check, `・getCurrentBlock で、最新のブロックを取得します（HTTP API の /wallet/getnowblock に対応）。\n・ブロック高（number）、ブロックID（blockID）、ブロックの時刻（timestamp はミリ秒のUnix時刻）を表示します。\n・値が出れば、ノードとの通信ができています。`],
  [compare, `・最新のブロック高から10を引いて、少し前（確定済み）のブロックを選びます。\n・viaSdk: SDKの getBlockByNumber で取得します。\n・viaHttp: fetch で HTTP API（/wallet/getblockbynum）を直接呼んで取得します。\n・2つのブロックIDを表示し、一致するかを確かめます。SDKは、HTTP API の呼び出しを包んでいるだけだと分かります。`],
  [apikey, `・TronGrid に登録して発行したAPIキーを、リクエストのヘッダー（TRON-PRO-API-KEY）に付けます。\n・回数制限（429エラー）に当たりにくくなります。\n・APIキーは、公開するページやコードに書かないでください。`],
  // ---------- 第3章 ----------
  [create, `・createAccount(): 乱数から秘密鍵を作り、公開鍵とアドレスを計算して返します。ノードには問い合わせず、手元だけで動きます。\n・privateKey: 秘密鍵（16進で64桁）。誰にも見せません。\n・publicKey: 公開鍵（16進で130桁。先頭の 04 のあとに、x座標とy座標が続く）。\n・address.base58 / address.hex: アドレス（Tで始まる34文字 / 41で始まる42桁）。\n・結果を alice に入れておき、以降の章でも使います。`],
  [restore, `・控えておいた秘密鍵を alicePriv に書き込みます（実行前に、この行を書き換えます）。\n・16進で64桁になっていなければ、エラーで止めます。\n・fromPrivateKey: 秘密鍵からアドレスを求めます。toHex: それを16進にします。\n・createAccount の結果と同じ形の alice を作り直すので、以降の章のコードがそのまま動きます。`],
  [convert, `・toHex: Base58を、41付きの16進にします。fromHex: 16進をBase58に戻します。\n・fromPrivateKey: 秘密鍵から、直接アドレスを求めます。\n・EVM形式: 16進から先頭の 41 を除いた20バイトです。\n・isAddress: 形式とチェックサムが正しいかを返します。broken は、最後の1文字だけを変えたアドレスで、false になります。`],
  [verify3, `・testPriv: 第1章の1.7のステップ2と同じ練習用の鍵（00…01）です。\n・getPubKeyFromPriKey: SDKで公開鍵を求めます（65バイト。先頭は 04）。fromPrivateKey / toHex: アドレスと21バイトを求めます。\n・manualX、manualY、manualHex、manualAddr: 第1章で手計算した結果の値です。\n・公開鍵は、先頭の 04 を除いて、x（32バイト）とy（32バイト）に分けて比べます。すべて true なら、SDKの結果と手計算が一致しています。`],
  [balance, `・getBalance: 確定済みの台帳（solidityノード）から、残高をsunで取得します。\n・getUnconfirmedBalance: 最新の台帳（fullノード）から取得します。まだ確定していない取引も含みます。\n・fromSun: sunをTRXに直します（文字列で返ります）。\n・フォーセットの直後は、最新だけが増えていて、確定済みはまだ0のことがあります。`],
  [account3, `・tmp: 作ったばかりで、誰からも受け取っていないアカウントです。getUnconfirmedAccount で取得すると、台帳に存在しないので {} が返ります。\n・alice: 有効化されていれば、アドレス（16進）、残高、作成時刻、権限が返ります。存在しなければ、空のオブジェクトが返ります。\n・owner_permission / active_permission: 権限です。しきい値（threshold）と、鍵の数を表示します。\n・getUnconfirmedAccount は、HTTP API の /wallet/getaccount に対応します。`],
  // ---------- 第4章 ----------
  [bob4, `・alice が無ければ、エラーで止めます（第3章で作ります）。\n・createAccount(): 送金の相手のBobを作ります。ノードには問い合わせません。\n・getUnconfirmedAccount: Bobのアカウント情報を取得します。台帳に存在しなければ {} が返るので、キーの数が0かどうかで存在を調べます（3.7と同じ）。\n・getUnconfirmedBalance: 送る前のAliceの残高を取得します。\n・残高が5 TRX未満なら、エラーで止めます（この章の送金で、2.1 TRXと2 TRXが減るため）。`],
  [build4, `・sendTrx(宛先, 量, 送り主): 署名前の取引を、ノードに作らせます（HTTP API の /wallet/createtransaction に対応）。引数の順番は、宛先、量、送り主です。\n・量は sun の整数です（1 TRX ＝ 1,000,000 sun）。\n・送り主を明示しているのは、tronWeb が秘密鍵も既定のアドレスも持たないためです。\n・tx.signature がまだ無いこと、txID、raw_data_hex（バイト列）を表示します。\n・raw_data の中の、種類、送り主・宛先（16進）、量、参照ブロック、作成時刻、有効期限を表示します。有効期限は、作成の約60秒後です。`],
  [rawcheck4, `・hexToU8 / u8hex: 16進の文字列とバイト列を、相互に変換します。\n・varint: protobufの可変長の整数です。fVar は数値の欄（番号と値）、fLen はバイト列の欄（番号と長さと中身）を作ります。\n・transfer → any → contract: 1.10と同じ手順で、送金の中身を、入れ子に並べます（送り主・宛先・量 → 種類の名前を付ける → type=1）。\n・parts: raw_data を5つの欄（1・4・8・11・14）に並べます。値は、4.3の取引（ノードが決めた値）から取ります。\n・SHA-256 を計算して、ノードの raw_data_hex と txID に一致するかを比べます。両方が true なら、ノードの返したバイト列は、手組みと同じです。`],
  [sign4, `・structuredClone(tx): 取引をコピーします。sign() は、渡した取引に署名の欄を書き足すので、元の tx を署名なしのまま残すためです。\n・trx.sign(取引, 秘密鍵): Aliceの秘密鍵で、txID に署名します。計算は手元だけで行います。\n・署名の数（1）、長さ（65バイト）、先頭の部分を表示します。\n・署名の前後で、txID と raw_data が同じこと（署名は raw_data の外にあること）を確かめます。`],
  [broadcast4, `・signed が無ければ、エラーで止めます。有効期限が切れていれば、4.3からやり直すよう、エラーで止めます。\n・balBefore: 送る前のAliceの残高です（4.7で、残高の減りを求めるために使います）。\n・sendRawTransaction: 署名済みの取引を、ノードに送ります（HTTP API の /wallet/broadcasttransaction に対応）。result: true は、ノードが受け付けたという意味で、成功の意味ではありません。\n・失敗したときは、code と message（16進の文字列を、文字に直して表示）が返ります。\n・clog(): TRONSCAN（Nile）のURLを表示します。`],
  [confirm4, `・showResult(txid, before): 取引がブロックに入るまで、3秒おきに最大10回（30秒）調べる関数です。\n・fullNode.request(パス, 本体, "post"): SDKが包んでいるHTTP APIを、そのまま呼びます。gettransactioninfobyid は入ったブロックと手数料、gettransactionbyid は実行結果（contractRet）を返します。\n・fee: 焼却されたTRXの合計（sun）。net_usage: 無料枠やステークから使った帯域幅（バイト）。net_fee: 帯域幅の代わりに焼却したTRX（sun）。\n・Aliceの残高の減り: 送る前（before）と、いまの残高の差です。送った量と手数料の合計になります。`],
  [bobafter4, `・getUnconfirmedAccount で、Bobのアカウント情報を取得します。\n・台帳に存在すれば、4.6の送金でBobが有効化されています。\n・残高は、受け取った1 TRX（1,000,000 sun）になります。`],
  [solid4, `・solidityNode.request: 確定済みの台帳（solidityノード）に問い合わせます（HTTP API の /walletsolidity/gettransactionbyid に対応）。\n・19人以上のSRが確認すると、取引が取れて「あり（確定）」になります。ブロックに入った直後は「まだなし」で、約1分後に変わります。`],
  [oneliner4, `・showResult が無ければ、エラーで止めます（4.7で作る関数です）。\n・sendTransaction(宛先, 量, 秘密鍵): 組み立て・署名・アナウンスを、内部で順に行います。送り主は、秘密鍵から求められます。量は2 TRX（2,000,000 sun）です。\n・Bobはもう有効化されているので、手数料（fee）は0で、帯域幅は無料枠（net_usage）から使われます。`],
  // ---------- 第5章 ----------
  [decode5, `・hexToU8 / u8hex / sha256hex: 16進の文字列とバイト列の変換と、SHA-256を求める関数です。\n・varint / fVar / fLen: protobufの欄を並べる関数です（4.4と同じ）。\n・readPb: バイト列を、欄の一覧（番号と値）に分けます（1.10の読み取り器と同じ）。\n・decodeTx: raw_data_hex を読み解きます。contract（欄11）の中の、種類・送り主・宛先・量まで読みます。JSONの表示は使いません。\n・encodeTx: 項目から、raw_data_hex を組み立て直します。\n・newTx: ノードに、AliceからBobへ1 TRXの取引を作らせます。\n・最後に、組み立て直した結果が元と同じこと、JSONの宛先がバイト列の宛先と同じことを確かめます。`],
  [verifytx5, `・checkTx(t, expect): 取引 t を点検して、問題のある項目の一覧を返します。expect は、頼んだ内容（送り主・宛先・量）です。\n・点検するのは、JSONではなく、バイト列を読み解いた値です。\n・txIDがSHA-256と一致するか、種類がTransferContractか、送り主・宛先・量が頼んだとおりか、欄が5つだけか、JSONの表示とバイト列が同じか、有効期限が約60秒以内かを確かめます。\n・参照ブロックは、下位2バイトが同じ最新のブロックの高さ（back ブロック前）を求め、そのブロックのIDの9〜16バイト目が、取引の ref_block_hash と一致するかを確かめます。\n・expect は、取引とは別に、自分で用意します。`],
  [tamper5, `・mallory: 攻撃者のアカウント（練習用）です。\n・攻撃A: JSONはそのままで、バイト列の宛先を mallory に差し替え、txIDも計算し直します。\n・攻撃B: バイト列の量を100倍にします。\n・どちらも checkTx に通すと、宛先（または量）と、JSONの表示が NG になります。txID の点検は OK のままです。\n・最後に、点検せずに署名するとどうなるかを試します。署名するだけで、送りません。`],
  [safesend5, `・safeSend(宛先, 量): 組み立て → 点検 → 署名 → アナウンス → 結果の確認を、続けて行います。\n・want は、頼んだ内容です。checkTx で NG があれば、署名せずに止まります。\n・署名は、コピーに行い、アナウンスのあと、showResult（4.7）で結果を表示します。\n・取引のIDを safeTxid に入れて、5.6で使います。`],
  [confirmed5, `・confirmPayment(txid, expect): 確定済みの台帳（solidityノード）に取引が入るまで、5秒おきに最大2分待ちます。\n・入ったら、実行結果、種類、宛先、量、txIDを確かめます。宛先と量は、JSONではなく、raw_data_hex を読み解いた値です。\n・量は「以上」で比べます（代金より多く払われていてもよい）。\n・全部 OK なら true を返します。`],
  // ---------- 第6章 ----------
  [status6, `・showRes(アドレス, 表示名): アカウントのリソースを取得して表示する関数です。getAccountResources は、HTTP API の /wallet/getaccountresource に対応します。\n・freeNetLimit / freeNetUsed: 無料の帯域幅の、1日の枠と使った量です。NetLimit / NetUsed: ステークで得た帯域幅（委任で受け取った分を含む）と使った量です。EnergyLimit / EnergyUsed: エネルギーの同じ値です。\n・値が0のときは、応答に項目が無いので、?? 0 で0にそろえます。\n・TotalNetLimit / TotalNetWeight: ネットワーク全体の、1日の帯域幅の合計と、ステークされたTRXの合計（TRX単位）です。エネルギーも同じ形です。\n・合計の比（Limit ÷ Weight）が、1 TRXのステークで1日に使える量の目安になります。`],
  [ops6, `・checkOp(t, typeNo, want): ステークや委任などの取引 t を、署名の前に点検します。typeNo は取引の種類の番号、want は頼んだ内容（契約の欄の番号 → 値）です。\n・点検するのは、JSONではなく、raw_data_hex を readPb で読み解いた値です（5.2の関数を使います）。\n・txID、種類、契約の中身（欄の番号と値が、want とすべて同じか）、欄が5つだけか、有効期限が約60秒以内か、参照ブロックがチェーンの最近のブロックと一致するか、を確かめます。\n・want の値は、数値の欄は数値、バイト列の欄（送り主・受け取り側）は16進の小文字です。\n・sendOp(t, typeNo, want): checkOp で NG があれば、署名せずに止まります。なければ、署名 → アナウンス → 結果の確認（showResult）を、続けて行います。`],
  [stake6, `・STAKE: ステークする量（sun）です。帯域幅に200 TRX、エネルギーに100 TRXです。\n・残高が足りなければ、エラーで止めます。\n・A: Aliceのアドレス（16進の小文字）。以降の節でも使います。\n・freezeBalanceV2(量, リソース, 送り主): ステークの取引を組み立てます。TronWeb v6.3.0では、SDKが手元で組み立てます。\n・want: 頼んだ内容です。欄1が送り主、欄2が量、欄3がリソースです。リソースが帯域幅（0）のときは、欄3が省かれます。\n・sendOp(t, 54, want): 54 は FreezeBalanceV2Contract の番号です。点検して、署名して送ります。\n・最後に、frozenV2（ステーク中の量）を表示します。帯域幅は、type が省かれます。`],
  [usage6, `・safeSend が無ければ、エラーで止めます（5.5で作る関数です）。\n・r0: 送る前のリソースです。r1: 送ったあとのリソースです。\n・safeSend(宛先, 量): BobへのTRXの送金を、点検して送ります。\n・NetUsed: ステークした帯域幅の使用です。freeNetUsed: 無料枠の使用です。EnergyUsed: エネルギーの使用です。\n・NetUsed だけが増えれば、ステークした帯域幅が、無料枠より先に使われたことになります。`],
  [delegate6, `・getCanDelegatedMaxSize: 委任できる上限（sun）を、リソースごとに調べます。{ confirmed: false } で、最新の台帳から読みます（指定しないと、確定済みの台帳から読みます）。\n・DELEG: 委任する量（sun）です。50 TRXと、上限の小さいほうです。1 TRX未満なら、エラーで止めます。\n・Bhex: Bobのアドレス（16進の小文字）です。\n・delegateResource(量, 受け取り側, リソース, 送り主): 委任の取引を組み立てます。量は、リソースの量ではなく、委任するステークのTRX（sun）です。\n・want: 欄1が送り主、欄2がリソース（帯域幅のときは省かれる）、欄3が量、欄4が受け取り側です。\n・sendOp(t, 57, want): 57 は DelegateResourceContract の番号です。\n・委任の前後で、BobとAliceのリソースを表示します。getDelegatedResourceV2 は、AliceからBobへの委任の記録を返します。`],
  [unstake6, `・undelegateResource(量, 受け取り側, リソース, 送り主): 委任を取り戻す取引を組み立てます。量は、委任したときと同じです（58 は UnDelegateResourceContract の番号）。\n・unfreezeBalanceV2(量, リソース, 送り主): ステークの解除です。委任中の分は解除できないので、先に取り戻します（55 は UnfreezeBalanceV2Contract の番号）。\n・getUnconfirmedAccount の unfrozenV2: 解除待ちの量と、引き出せる時刻（ミリ秒のUnix時刻）です。\n・getChainParameters の getUnfreezeDelayDays: 解除してから引き出せるまでの日数です。\n・getAvailableUnfreezeCount: あと何回、解除できるかを返します。\n・最後に、解除後の NetLimit（帯域幅）と EnergyLimit（残したステーク）を表示します。`],
  [withdraw6, `・getCanWithdrawUnfreezeAmount(アドレス, 時刻): 指定した時刻に引き出せる量（sun）を返します。待ち時間が過ぎていなければ0です。\n・0なら、何もせずに終わります。\n・引き出せるときは、withdrawExpireUnfreeze で取引を組み立て、sendOp（56 は WithdrawExpireUnfreezeContract の番号）で点検して送ります。\n・引き出したあとの残高を表示します。`],
  // ---------- 第7章 ----------
  [counter1Sol7, `・// SPDX-License-Identifier: MIT: ソースコードのライセンスを書くコメントです。書かないと、コンパイラが警告を出します。動きには関係しません。\n・pragma solidity 0.8.20: このコードを、Solidity 0.8.20 でコンパイルすると決めます。^ を付けないので、この版だけです（7.6）。\n・contract Counter: コントラクトの宣言です。デプロイすると、1つのアカウント（アドレス）になります。\n・uint256 public count: 状態変数です。0以上の整数（256ビット）で、台帳に残ります。初期値は0です。public を付けると、読み取り用の関数 count() が自動で作られます。\n・function increment() public: 状態を変える関数です。呼ぶ取引が成功すると、count が1増えます。`],
  [counterSol7, `・MAX: constant は、コンパイルのときに決まる定数です。台帳には置かれず、コードに埋め込まれます。public なので、MAX() で読めます。\n・owner: このコントラクトを作った人のアドレスです。状態変数なので、台帳に残ります。\n・event Incremented / Reset: イベントの宣言です。indexed を付けた by は、topic（探す目印）に入ります。付けない newCount は、data に入ります（7.5）。\n・constructor: デプロイのときに、1度だけ動きます。msg.sender は、デプロイの取引を送った人なので、owner にその人が入ります。\n・increment: require で、count が上限（MAX）未満かを確かめます。違えば、理由 "limit reached" を返して失敗します。通ったら、count を1増やして、Incremented を emit します。\n・reset: require で、呼んだ人（msg.sender）が owner かを確かめます。違えば "not owner" で失敗します。通ったら、count を0に戻して、Reset を emit します。\n・remaining: view は、状態を読むだけで、変えない関数に付けます。取引なしで呼べます。MAX から count を引いた、あと何回数えられるかを返します。`],
  [selector7, `・selOf(sig): 関数の署名（関数名と、引数の型。空白なし）から、セレクタを求めます。tronWeb.sha3 は Keccak-256 で、false を渡すと 0x が付きません。先頭の8文字（4バイト）がセレクタです。\n・sigs: Counter の公開された関数です。MAX・owner・count は、public な状態変数の読み取り用の関数です。\n・引数のない関数（increment()）を呼ぶ data は、セレクタの4バイトだけです。`],
  [revert7, `・sel(sig): セレクタを求める関数です（7.3の selOf と同じ）。\n・reason: require の、理由の文字列です。\n・revData: 失敗のときに返るバイト列です。Error(string) のセレクタ ＋ 文字列の並べ方です。encodeParams は、型と値から、引数のバイト列（位置・長さ・文字）を作ります。\n・Panic(uint256) は、assert の失敗や、桁あふれなどで返る形のセレクタです。\n・位置は、長さの欄が何バイト目にあるか（0x20 ＝ 32）です。長さは、文字列のバイト数です。文字は、UTF-8のバイト列に、右をゼロで埋めたものです。\n・decodeParams で、バイト列から文字列に読み戻します。セレクタの4バイトは、取り除いて渡します。`],
  [event7, `・topicOf(sig): イベントの署名のKeccak-256です。32バイト全体を、目印（topics[0]）に使います。署名は、引数の型だけを並べます（名前と indexed は入れません）。\n・pad32: 32バイトに、左をゼロで埋めます。\n・aliceHex: Aliceのアドレスから、41を取り除いた20バイトです。\n・indexed の by は topics[1] に、indexed でない newCount は data に入ります。\n・Reset は、indexed の by だけなので、data は空です。`],
  [units7, `・SUN: 1 TRX ＝ 1,000,000 sun です。Solidityの 1 trx は、この数（1000000）を表します。\n・toSun / fromSun: TRXとsunを変換する、SDKの関数です。\n・1 ether: イーサリアムの単位で、10の18乗を表します。TRONで、これをsunとして扱うと、1兆TRXです。ether は使いません。`],
  [address7, `・hex41: Aliceのアドレスを、16進（41 ＋ 20バイト）にしたものです。ノードのAPIは、この形です。\n・inVm: 41を取り除いた20バイトです。コントラクトの中の address（msg.sender など）は、この形です。\n・owner() のような、address を返す関数の戻り値は、32バイトに、左をゼロで埋めて返ります（1.18）。\n・41を付けて fromHex に渡すと、Base58のアドレスに戻ります。`],
  // ---------- 第8章 ----------
  [abi8, `・COUNTER_ABI: Counter のABIです。コンパイラの出力と同じ形（type、name、inputs、outputs、stateMutability）で、コンストラクタ1つ、イベント2つ、関数6つです。\n・sigOf: 関数名と引数の型を、空白なしでつなぎます（7.3と同じ）。\n・selOf: 署名のKeccak-256の先頭4バイト（8文字）を求めます。sha3 は Keccak-256 です。\n・known: 7.3で求めた6つのセレクタです。ABIから求めた値と比べて、OK か NG を表示します。\n・イベントは、署名のKeccak-256の先頭4バイトを表示します（7.5の topics[0] の、先頭と同じです）。\n・ABIは、実行には使われません。呼び出す側が、セレクタと引数を組み立てる材料です。`],
  [bytecode8, `・COUNTER_BYTECODE: コンパイルで得たバイトコード（作成用）を貼る変数です。実行の前に、"" の中に貼ります。\n・COUNTER_BC: 先頭の 0x を取り、小文字にした16進です。以降の節は、これを使います。\n・空、または16進（0-9 と a-f の偶数桁）でなければ、エラーで止めます。\n・sels: ABIの関数ごとに、セレクタを求めます。\n・関数の呼び分けのコードには、セレクタが PUSH4（63）の直後に入るので、"63" + セレクタ が、バイトコードの中にあるかを調べます。\n・6つすべてあれば、ABIと対応するバイトコードです。コードの動きまでは、保証しません。`],
  [build8, `・DEPLOY: デプロイの項目です。name はコントラクトの名前、feeLimit は焼却してよいTRXの上限（sun）、callValue は一緒に送るTRX、userFeePercentage は呼ぶ人が負担する割合、originEnergyLimit は作成者が負担する上限です。\n・createSmartContract: 署名前のデプロイの取引を、ノードに作らせます（HTTP API の /wallet/deploycontract に対応）。parameters は、コンストラクタの引数で、Counter は無いので空です。\n・第2引数: 作成者のアドレス（Alice）です。tronWeb が既定のアドレスを持たないので、明示します。\n・取引の種類（type）、署名がまだ無いこと、raw_data_hex の大きさ、fee_limit を表示します。\n・contract_address: 送る前から、コントラクトのアドレスが決まっています。次の節で、手作業で求めて、照合します。\n・この取引は、送りません。8.6で作り直します。`],
  [address8, `・keccak: バイト列（16進）のKeccak-256を求めます。tronWeb.sha3 は文字列を渡す関数なので、バイト列には、ethersUtils の keccak256 を使います。\n・payload: txID（32バイト）と、作成者のアドレス（41付きの21バイト）を、並べたものです。\n・manualHex: ハッシュの下位20バイトに、41 を付けます。1.7のアドレスの求め方と、同じ形です。\n・ノードが返した contract_address と比べます。true なら、アドレスは、txID と作成者から決まっています。\n・other: 同じ内容で、取引を作り直します。作成時刻などが違うので、txID も、アドレスも、変わります。`],
  [check8, `・checkDeploy(t, want): デプロイの取引を、署名の前に点検する関数です（5.3の checkTx、6.2の checkOp と同じ考え方）。\n・点検するのは、JSONの表示ではなく、raw_data_hex（署名されるバイト列）です。\n・欄11（contract）→ 欄2（any）→ 欄2（CreateSmartContract）→ 欄2（コントラクトの定義）の順に、入れ子を読み進めます。\n・コントラクトの定義の欄: 1 作成者、2 アドレス（空）、3 ABI、4 バイトコード、5 callValue、6 userFeePercentage、7 名前、8 originEnergyLimit です。値が0の欄は、省かれます。\n・取引の欄18が fee_limit です。送金とは違って、欄は、1・4・8・11・14・18 の6つです。\n・ABI（欄3）は、実行に使われないので、名前の一覧を表示するだけです。\n・NGが1つでもあれば、署名してはいけません。`],
  [deploy8, `・取引を作り直します。有効期限が約60秒なので、作ってから、すぐに、点検・署名・送信まで進めます。\n・want: 頼んだ内容です。owner と bytecode は16進、ほかは DEPLOY と同じ名前です。\n・checkDeploy で点検し、NGがあれば、署名せずに止めます。\n・sign: Aliceの秘密鍵で、txID に署名します。structuredClone で、元の取引を、署名なしのまま残します。\n・sendRawTransaction: 署名済みの取引を、ノードに送ります。result: true は、受け付けたという意味で、成功の意味ではありません。\n・showResult（4.7）: ブロックに入るまで待って、実行結果（contractRet）と手数料を表示します。\n・counterAddr、counterHex: コントラクトのアドレスを残します。第9章以降で使います。`],
  [verify8, `・deployInfo.contract_address: 取引の結果が示すコントラクトのアドレスです。送る前に分かっていたアドレスと、比べます。\n・getContract: 台帳のコントラクトの情報を取得します（HTTP API の /wallet/getcontract に対応。1.16）。\n・origin_address: 作成者です。Aliceと同じになります。consume_user_resource_percent と origin_energy_limit は、デプロイの項目が、そのまま残っています。\n・bytecode: 台帳に残るコードです。実行時のコードなので、デプロイに使ったバイトコードとは、長さが違うことがあります。\n・getUnconfirmedAccount: コントラクトも、アカウントです。台帳が返す type を表示します。\n・callRead: triggerConstantContract で、読み取りの関数を呼びます（1.18。署名も手数料も要りません）。戻り値は、32バイトの16進です。\n・owner() の戻り値の下位20バイトが、Aliceと同じなら、コンストラクトの owner = msg.sender が、Aliceで動いています。`],
  [cost8, `・getchainparameters: そのときの、エネルギーの単価（getEnergyFee）を取得します。単価は、委員会の提案で変わります。\n・receipt: 取引の結果に残る、費用の内訳です。\n・energy_usage_total: 使ったエネルギーの合計。energy_usage はステークで払った分、energy_fee は焼却で払った分（sun）、origin_energy_usage は作成者が負担した分です。\n・energy_fee を単価で割ると、焼却で払ったエネルギーの量になります。\n・net_usage、net_fee: 帯域幅の使用量と、焼却で払った分です。\n・fee: 焼却されたTRXの合計（sun）です。\n・最後に、エネルギーの内訳の合計が、energy_usage_total と一致するかを確かめます。`],
  // ---------- 第9章 ----------
  [encode9, `・selOf: 関数名と引数の型から、セレクタ（Keccak-256の先頭4バイト、8文字）を求めます（7.3・8.2と同じ）。\n・pad32: 左をゼロで埋めて、32バイト（64文字）にします。\n・引数がない関数（count()、increment()）の data は、セレクタだけです。\n・transfer(address,uint256): Counter には無い関数で、引数の並べ方を確かめる例です。ノードには、何も送りません。\n・to20: アドレスは、41を除いた20バイトを使います。amount は、BigInt で、32バイトの整数にします。\n・manualData: セレクタ ＋ 引数1 ＋ 引数2 です（4 + 32 + 32 ＝ 68バイト）。\n・encodeParams: SDKの並べ方です。引数の部分が、手組みと同じになることを確かめます。\n・decodeParams: 型を指定して、引数の部分を読み戻します。address は、41付きの16進で返るので、fromHex でBase58にします。`],
  [read9, `・callRaw: /wallet/triggerconstantcontract に、owner_address・contract_address・data をそのまま渡します。SDKを通さず、署名も手数料も要りません。\n・triggerConstantContract: SDKで同じ呼び出しをします。返ってきた取引の data は、SDKがノードに渡した data です。\n・手組みの data と、SDKの data を比べます。同じなら、SDKは、ABIの規則でバイト列を作っているだけです。\n・constant_result: 戻り値です。16進の文字列で、1つの値が32バイトです。\n・energy_used: 予行で使ったエネルギーです。手数料は、かかりません。\n・uint256: BigInt("0x" + 16進) で、整数に読みます。\n・address: 32バイトのうち、後ろ20バイトです。41を付けて、fromHex でBase58にします。\n・decodeParams: 戻り値が2つなら、32バイトが2つ並びます。型を並べて渡すと、まとめて読めます。`],
  [write9, `・CALL: 呼び出しの項目です。feeLimit は焼却してよいTRXの上限（sun）、callValue は一緒に送るTRX（sun）です。\n・triggerSmartContract: 書き込みの関数を呼ぶ、署名前の取引を作ります（HTTP API の /wallet/triggersmartcontract に対応）。引数は、呼び先・関数の署名・項目・引数の配列・呼ぶ人です。\n・result: 取引を作れたかどうかです。関数が成功するかどうかは、含みません。書き込みの関数は、この時点では、実行されません。\n・cv: 取引の中の、呼び出しの定義です。owner_address が呼ぶ人、contract_address が呼び先、data が セレクタ＋引数、call_value が送るTRXです。\n・この取引は、送りません。9.6で作り直します。`],
  [check9, `・checkCall(t, want): 呼び出しの取引を、署名の前に点検する関数です（8.5の checkDeploy と同じ考え方）。\n・点検するのは、JSONの表示ではなく、raw_data_hex（署名されるバイト列）です。\n・欄11（contract）→ 欄2（any）→ 欄2（TriggerSmartContract）の順に、入れ子を読み進めます。\n・TriggerSmartContract の欄: 1 送り主、2 呼び先、3 call_value、4 data です。値が0の欄は、省かれます。トークンの送付の欄（5・6）は、あってはいけません。\n・取引の欄18が fee_limit です。欄は、1・4・8・11・14・18 の6つです。\n・種類の番号は31（TriggerSmartContract）です。\n・fn: data の先頭4バイトを、ABIの関数と引き合わせて、呼ぶ関数の名前を表示します。これは、読む人への参考です。判断は、頼んだ data と一致するかで行います。\n・NGが1つでもあれば、署名してはいけません。`],
  [send9, `・readCount: count() を、読み取りで呼びます。呼ぶ前と後の、状態の変化を見るために使います。\n・取引を作り直します。有効期限が約60秒なので、作ってから、すぐに、点検・署名・送信まで進めます。\n・want: 頼んだ内容です。owner と contract は41付きの16進、data は16進です。\n・checkCall で点検し、NGがあれば、署名せずに止めます。\n・sign: Aliceの秘密鍵で、txID に署名します。structuredClone で、元の取引を、署名なしのまま残します。\n・sendRawTransaction: 署名済みの取引を、ノードに送ります。result: true は、受け付けたという意味で、成功の意味ではありません。\n・showResult（4.7）: ブロックに入るまで待って、実行結果（contractRet）と手数料を表示します。\n・contractResult: 関数が返したバイト列です。increment() は、何も返さないので、空です。\n・log: 関数が emit したイベントです。topics[0] は、イベントの署名のKeccak-256です（7.5）。topics[1] は indexed の引数、data は indexed でない引数です。\n・最後に、count() を読み直して、状態が変わったことを確かめます。`],
  [dryrun9, `・callRaw（9.4）: triggerconstantcontract に data を渡します。書き込みの関数も、これに渡すと、状態を変えずに、実行だけを試せます（予行）。\n・第2引数: 呼ぶ人です。reset() は、作成者だけが成功するので、Alice（成功）と Bob（失敗）で、結果を比べます。\n・hexText: 16進のバイト列を、文字にします。message は、16進で返ります。\n・constant_result: 失敗したときは、コントラクトが返した、理由のバイト列が入ります。\n・先頭4バイトで、失敗の種類を見分けます。08c379a0 は Error(string)（require・revert の理由）、4e487b71 は Panic(uint256)（assert・桁あふれなど）です（7.4）。\n・Error(string) なら、セレクタを除いた残りを、string として読み戻します。\n・最後に、count() を読みます。予行は、状態を変えません。`],
  [fail9, `・waitInfo: ブロックに入るまで、3秒おきに、最大30秒待ちます（showResult と同じ待ち方）。\n・FAILCALL: 失敗してもよい練習なので、feeLimit を 10 TRX に下げます。\n・Bob が reset() を呼ぶ取引を作ります。呼ぶ人が Bob なので、署名も Bob の秘密鍵で行います。\n・checkCall: 取引が、頼んだとおりかを点検します。実行が失敗することは、点検では見つかりません。\n・アナウンスの result: true は、受け付けられただけです。\n・contractRet: 取引の結果です。実行が失敗すると、REVERT になります。\n・info.result と receipt.result: 失敗したことが、ここにも残ります。\n・resMessage: ノードの短い説明です。16進の文字列を、文字にして表示します。\n・contractResult: コントラクトが返した理由です。Error(string) なら、読み戻せます。\n・fee と energy_fee: 失敗しても、使った分は焼却されます。\n・最後に、count() を読み直します。失敗した取引は、状態を変えません。`],
  [contract9, `・num: 戻り値の整数は、SDKの版によって、BigInt などで返ります。いったん文字にして、数へ戻します。\n・tronWeb.contract(COUNTER_ABI, counterAddr): ABIを渡すと、関数が、メソッドになります。\n・call(): 読み取りの関数を呼びます（triggerconstantcontract に対応）。署名も手数料も要りません。\n・owner(): アドレスの形は、版で違います。比べるときは、下位20バイト（40桁）だけを使います。\n・send(): 書き込みの関数を呼びます。組み立て・署名・アナウンスを、1回の呼び出しで行います。第2引数は、署名する秘密鍵です。署名の前に、点検を挟めません。\n・戻り値は、txID です。版によっては、配列やオブジェクトで返るので、取り出し方を分けています。\n・showResult（4.7）で、結果を読みます。`],
  // ---------- 第10章 ----------
  [log10, `・topicOf: イベントの署名のKeccak-256です。32バイト全体が、topics[0]（目印）になります（7.5と同じ）。\n・h20: アドレスを、下位20バイト（40桁の小文字の16進）にそろえます。Base58・41付き・0x付きの、どの形でも比べられます。\n・EVENTS: ABI（8.2）のイベントから、署名と目印を作った一覧です。署名は、引数の型だけを並べます（名前と indexed は入れません）。\n・decodeLog: ログを、値に戻します。topics[0] でイベントが決まり、indexed の引数は topics[1] から、そうでない引数は data から、宣言の順に取ります。address は下位20バイトに41を付けて Base58 にし、uint256 は BigInt にします。\n・gettransactioninfobyid の log: address は、イベントを発行したコントラクトです（41なしの20バイト）。呼んだ人（msg.sender）ではありません。`],
  [txevents10, `・getJson: TronGridの v1 に GET して、JSONを返します。接続先は、第2章の NILE です。\n・evByTx: /v1/transactions/{txID}/events です。取引ごとに、ログを、ABIで読んだ形（result）で返します。\n・そのままの形: event_name、event（署名）、result（引数の名前と値）、block_number、block_timestamp、event_index などが入ります。\n・手読みとの照合: 10.3の decodeLog の結果と、TronGridの result を比べます。アドレスの形は版で違うことがあるので、h20 でそろえます。\n・失敗した取引: 9.7で Bob が送った取引（failInfo.id）には、イベントがありません。REVERT で、状態と一緒に、ログも取り消されます。`],
  [contractevents10, `・getAll: /v1/contracts/{アドレス}/events から、続きがある限り取ります。続きは、meta の fingerprint を、次の問い合わせに付けて取ります。limit は1回の上限です。\n・order_by=block_timestamp,asc: 古い順に並べます。\n・名前ごとの件数: event_name で数えます。\n・event_name=Incremented: サーバー側で、イベントの名前で絞ります。\n・by ごとの件数: indexed の引数でも、サーバーで絞れるとは限らないので、ここでは取ってから、手元で絞ります。\n・replay: イベントを古い順に適用して、count を組み立て直します。Incremented は newCount に、Reset は 0 にします。読み取りの count() と一致すれば、イベントが、状態の変化を、漏れなく記録していることになります。`],
  [watch10, `・seen: 処理済みのイベントの印（txID と event_index）です。\n・baseline / cursor: 監視の起点です。いまあるイベントを、見たことにし、いちばん新しい時刻を cursor にします。\n・poll: cursor 以降のイベントを問い合わせ、まだ見ていないものだけを返します。min_block_timestamp は、同じ時刻のものも返ることがあるので、seen で重複を除きます。\n・increment() を送る部分は、9.6と同じです（作る → 点検 → 署名 → アナウンス）。\n・ループ: 3秒おきに poll します。ブロックは約3秒おきにできます。送った取引のイベントが見つかったら、終わります。\n・見つかるまでの時間は、ブロックに入るまでと、TronGridが取り込むまでの、合計です。`],
  [confirmed10, `・only_unconfirmed=true: まだ確定していない（巻き戻る可能性がある）ブロックのイベントだけを返します。\n・only_confirmed=true: 確定済み（19人以上のSRが確認。1.13）のブロックのイベントだけを返します。\n・6秒おきに、両方へ問い合わせ、件数を見比べます。確定すると、「確定前」が0件になり、「確定済み」が1件になります。\n・確定済みの数が1以上になったら、終わります。`],
  [sdk10, `・tronWeb.event: イベントを取るSDKの部品です。getEventsByTransactionID は取引ごと、getEventsByContractAddress はコントラクトごとです。\n・list: SDKの版によって、配列そのものか、{ data: [...] } の形で返ります。どちらでも、配列として扱えるようにします。\n・オプション名（eventName、orderBy、limit など）は、SDKの版で違うことがあります。\n・HTTPの結果と、件数・取引の並びを比べます。SDKは、同じAPIを呼んでいるだけです。`],
]);
