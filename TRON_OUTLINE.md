# TRON開発概論の構成

第1章（TRON概説。旧・入門講座の第5章・第6章を1章にまとめたもの）は、台帳を**読む**ところまで。第2章以降は、TronWeb（SDK）で**書く**ところと、スマートコントラクトを扱う。

- 前半（第2〜6章）：SDKとTRONの標準機能
- 後半（第7〜14章）：スマートコントラクト
- 選択章（付録A〜E）：余力があれば

## 方針

| 項目 | 内容 |
| --- | --- |
| 言語 | JavaScript（コンソールで実行） |
| SDK | TronWeb v6.3.0（ブラウザ用の dist/TronWeb.js を読み込む） |
| 接続先 | Nile（テストネット）。メインネットは読み取りだけ |
| 秘密鍵 | 練習用に作ったものだけを使う。メインネットの資産には使い回さない |
| 金額の単位 | sun（1 TRX = 1,000,000 sun） |
| 同期・非同期 | await を使う（TronWebの関数の多くはPromiseを返す） |
| 第1章との関係 | 第1章で自分で計算した結果（アドレス、txID、セレクタ、エネルギーの単価）を、SDKの結果と見比べる |
| 章の構成 | 説明・コード・出力例・コンソール。第14章に演習 |

## 章立て

| 章 | 題 | 区分 | 第1章の節との対応 | 状況 |
| --- | --- | --- | --- | --- |
| 第1章 | TRON概説 | 読み取り（SDKなし） | — | **作成済み** |
| 第2章 | 環境構築 | 前半 | 1.3、1.14 | **作成済み** |
| 第3章 | アカウント | 前半 | 1.7 | **作成済み** |
| 第4章 | TRXの送金 | 前半 | 1.10 | **作成済み** |
| 第5章 | 署名と検証 | 前半 | 1.13、1.14 | **作成済み** |
| 第6章 | リソース | 前半 | 1.12 | **作成済み** |
| 第7章 | Solidity入門 | 後半 | 1.15 | **作成済み** |
| 第8章 | デプロイ | 後半 | 1.16 | **作成済み（バイトコードは未設定）** |
| 第9章 | 呼び出し | 後半 | 1.17、1.18 | **作成済み（Nileでの通し確認は未）** |
| 第10章 | イベント | 後半 | 1.20 | **作成済み（Nileでの通し確認は未）** |
| 第11章 | TRC-20 | 後半 | 1.19 | 未着手 |
| 第12章 | エネルギー | 後半 | 1.21 | 未着手 |
| 第13章 | セキュリティ | 後半 | 1.14 | 未着手 |
| 第14章 | 演習 | 後半 | — | 未着手 |

## 各章の内容

関数名は予定。実装するときに、TronWeb v6.3.0 で動くかを確かめる（第9章は、まだNileで通していない。「決まっていないこと」を参照）。

### 前半：SDK編

**第1章 TRON概説**（作成済み）
設計、ノードとHTTP API、アカウントとアドレス、トランザクション、手数料、スマートコントラクトとTRC-20を、ノードのデータを読みながら説明する。台帳を読むだけで、SDKは使わない。

**第2章 環境構築**（作成済み）
TronWebの読み込み、Nileへの接続、最新ブロックの取得。SDKとHTTP APIの対応（同じブロックを両方で取得して比べる）。TronWebの部品（`trx`、`transactionBuilder`、`address`、`utils`、`contract()`、`event`）と、登場する章の対応。

**第3章 アカウント**（作成済み）
アカウントの生成（Aliceを作り、秘密鍵を控えて復元できるようにする）。鍵とアドレスの変換。1.7で自分で計算したアドレス・公開鍵と、SDKの結果の照合。Nileのフォーセットでテストのトークンを受け取る。残高（確定済みと最新）とアカウント情報の取得。

**第4章 TRXの送金**（作成済み）
Bobを作り、AliceからBobへの送金を、組み立て（`transactionBuilder.sendTrx`）→ 署名（`trx.sign`）→ アナウンス（`trx.sendRawTransaction`）の3段階に分けて実行する。ノードが返した取引の `raw_data` を、1.10と同じ手順で手作業で並べ直し、`raw_data_hex` とtxIDが一致することを確かめる（参照ブロック・作成時刻・有効期限はノードが決めるので、その値を使う）。送金後は、`fullNode.request` でブロックへの取り込み・実行結果・手数料を読み、Bobの有効化と確定済みの台帳も確かめる。最後に `trx.sendTransaction` で1行で送り、有効化を伴う1回目（fee 1.1 TRX）と、2回目（無料枠、fee 0）の手数料を見比べる。

**第5章 署名と検証**（作成済み）
ノードが返した取引の、JSON（raw_data）とバイト列（raw_data_hex）の違いを押さえ、バイト列を読み解く `decodeTx` と、組み立て直す `encodeTx` を作る（JSONとバイト列の変換）。署名の前の点検 `checkTx`（txID、種類、送り主・宛先・量、欄、JSONとの一致、有効期限、参照ブロックのチェーンとの照合）。宛先の差し替えと量の書き換えを真似て、見つかることを確かめる（書き換えた取引は送らない）。点検を挟んだ `safeSend`。受け取る側の `confirmPayment`（確定済みの台帳で、バイト列から宛先と量を確かめる）。

**第6章 リソース**（作成済み）
アカウントとネットワーク全体のリソースを読み（`getAccountResources`）、ステークで得られる量の見当をつける（1 TRXあたり ＝ TotalLimit ÷ TotalWeight）。署名前の点検を、送金以外の取引へ広げる `checkOp`・`sendOp`（取引の種類の番号と、契約の欄の番号→値で、頼んだ内容を書く。TronWeb v6.3.0では、ステーク系の取引はSDKが手元で組み立てる）。Stake 2.0を、ステーク（`freezeBalanceV2`。帯域幅200 TRX・エネルギー100 TRX）→ 帯域幅がステーク→無料枠→焼却の順に使われることの確認 → 委任（`delegateResource`。Bobへ各50 TRX分）→ 委任の取り戻し（`undelegateResource`）→ 解除（`unfreezeBalanceV2`。帯域幅の200 TRXだけ。エネルギーは第9章以降のために残す）→ 引き出し（`withdrawExpireUnfreeze`。待ち時間の前は何も起きない）の順に実行する。読み取り系（`getCanDelegatedMaxSize` など）は、既定が確定済みの台帳なので、`{ confirmed: false }` を渡す。解除の待ち時間は `getUnfreezeDelayDays` で取得する（約14日）。

### 後半：スマートコントラクト編

**第7章 Solidity入門**（作成済み）
最小のコントラクト Counter（7.2。`count` と `increment()` だけ）を1行ずつ読み、完成形の Counter（7.3。`MAX`・`owner`・`count`・`remaining()`・`increment()`・`reset()`・イベント `Incremented`／`Reset`）で、状態変数、`view`、`constant`、`public` を説明する。公開された関数が、セレクタに対応することを、`tronWeb.sha3` で確かめる。`msg.sender` と `constructor`（`owner = msg.sender`）、`require` と `revert`・`assert`、失敗の理由が `Error(string)`（セレクタ `08c379a0` ＋ 位置・長さ・文字）で返ることを、手作業で組み立てて読み戻す（`Panic(uint256)` は `4e487b71`）。`tx.origin` は注意だけ（詳しくは第13章）。イベントは、`topics[0]`（署名のKeccak-256）、indexed の引数（topic）、indexed でない引数（data）を、手作業で並べる。TRONでの違いは、単位（sun、`trx`・`sun` の単位、`ether` は使わない）、アドレス（コントラクトの中は20バイト、外は41付き）、コンパイラ（TRON版solc。0.8系が基準。`^` なしで版を固定）。**この章のSolidityはコンソールで実行しない**（`<Code lang="solidity">` で、実行ボタンなし）。JavaScriptは、ノードに何も送らず、計算だけ。コントラクトは、Solidity 0.8.20（TRONの公式資料の例）でコンパイルして、警告なし・セレクタとtopicが本文と一致することを確かめてある。

**第8章 デプロイ**（作成済み。ただし、Counterのバイトコードは未設定）
コンパイルでできるもの（ABI、作成用のバイトコード、実行時のコード）。ABIは、Counter.solから決まるので、コンソールに直接書き、7.3のセレクタ・7.5のイベントの目印と照合する（`COUNTER_ABI`）。バイトコードは、コンパイル済みのものを貼る方式（`COUNTER_BYTECODE`。`tronmain/ch08/bytecode.js` の `""` が空のまま）。貼ったあと、7.3の6つのセレクタが `63`（PUSH4）の直後にあるかで、Counterのものかを確かめる。デプロイの項目（`name`・`feeLimit` 100 TRX・`callValue` 0・`userFeePercentage` 100・`originEnergyLimit` 10,000,000）を決め、`createSmartContract` で署名前の取引を作る。コントラクトのアドレスが、txIDと作成者から決まること（Keccak-256の下位20バイト＋41）を手作業で確かめ、同じコードを作り直すとアドレスが変わることを見る。署名前の点検 `checkDeploy`（種類30、作成者、バイトコード、欄5・6・7・8、`fee_limit`＝取引の欄18、欄の一覧、期限、参照ブロック）。取引を作り直して、点検 → 署名 → アナウンス → `showResult`（`counterAddr`・`counterHex` を残す）。デプロイ後は、取引の結果の `contract_address`、`getContract`、`triggerConstantContract` での読み取り（`owner()` がAlice）で確かめ、`receipt` から費用の内訳を読む。

**第9章 呼び出し**（作成済み。ただし、Nileでの通しの確認は、まだ）
読み取り（`triggerconstantcontract`）と書き込み（`triggerSmartContract`→署名→アナウンス）の違いを、6つの観点で整理し、Counter の6関数を分ける（9.2）。`data`（セレクタ＋引数）を手で組み立て、`encodeParams` と比べる（9.3。Counter の関数は引数がないので、引数の並べ方は `transfer(address,uint256)` を例にする。ノードには送らない）。読み取りは、手組みの `data` を `wallet/triggerconstantcontract` に直接渡し、SDKの `triggerConstantContract` が作った `data`・戻り値と比べる。戻り値は、uint256＝32バイトの整数、address＝後ろ20バイトで読む（9.4）。書き込みは、`increment()` の署名前の取引を作り（種類31、`data`、`fee_limit`＝欄18）、点検関数 `checkCall` で、送り主・呼び先・`data`・`call_value`・欄・`fee_limit`・期限・参照ブロックを、バイト列で点検する（9.5）。点検 → 署名 → アナウンス → `showResult` で `increment()` を呼び、`contractResult`・`log`（`Incremented` の topics と data）・`count()` の変化を読む（9.6）。失敗は、予行（Bob が `reset()` を `triggerconstantcontract` で試し、`Error(string)` の `not owner` を読む）と、実際に失敗した取引（Bob が `reset()` を送り、`contractRet` が REVERT、`resMessage`・`contractResult`・焼却された手数料を読む）の両方で読む（9.7）。最後に `contract()`（`call()`・`send()`）の近道を使い、HTTP API／`transactionBuilder`／`contract()` の3層の役割を整理する。`send()` は署名の前に点検を挟めない（9.8）。第10章のために、`Incremented` が2回分（9.6と9.8）、台帳に残る。

**第10章 イベント**（作成済み。ただし、Nileでの通しの確認は、まだ）
ログの形（`address`・`topics`・`data`）と、取り出す3つの道（取引の結果の `log`、TronGrid v1の取引ごと、同コントラクトごと）を整理する（10.2）。取引の結果の `log` を、ABIのイベントから作った目印の一覧と引き合わせ、indexed は topics、そうでないものは data から、型に合わせて値に戻す `decodeLog` を作る（10.3。address・数・bool だけ）。TronGrid v1の `/v1/transactions/{txID}/events` をHTTPで直接呼び、手読みと照合し、9.7で失敗した取引にはイベントが無いことを確かめる（10.4）。`/v1/contracts/{addr}/events` は、`fingerprint` で続きまで取り切る `getAll`、`event_name` での絞り込み、`by` ごとの集計（手元で絞る）、イベントを古い順に適用して `count` を組み立て直す（10.5）。ポーリングは、`cursor`（`min_block_timestamp`）と `seen`（txID＋event_index）で、取りこぼしと二重処理を避け、途中で `increment()` を1回送って拾う（10.6。点検 → 署名 → アナウンス）。`only_unconfirmed`・`only_confirmed` で、確定前から確定済みへ移るのを見る（10.7）。最後に `tronWeb.event` と比べる（10.8）。第11章のために、`getAll`・`evByTx`・`decodeLog` が使える。10.6で `increment()` が1回増える（count が上限なら、先に `reset()`）。


**第11章 TRC-20**
トークンの自作。`transfer`、`approve`、`transferFrom`、`allowance`。USDTなどの既存のTRC-20を使うときの注意。

**第12章 エネルギー**
`estimateEnergy` による見積り。`feeLimit` の決め方。`OUT_OF_ENERGY`、`REVERT` など失敗の読み方。エネルギーの委任で費用を下げる。

**第13章 セキュリティ**
`approve` の上限、署名前にABIと宛先を確かめる、再入攻撃、`tx.origin`。

**第14章 演習**
小さなコントラクト（例：簡易エスクロー）を、デプロイ → 呼び出し → イベント確認まで通しで作る。クイズとハンズオン演習。

### 選択章（付録）

| 付録 | 題 |
| --- | --- |
| A | 権限とマルチシグ（permission、しきい値と重み） |
| B | オフライン署名 |
| C | メッセージ署名と検証 |
| D | SRへの投票 |
| E | TRC-10 |

## 決まっていないこと

- **第9章のNileでの通しの確認**：コードは、構文と、`checkCall` のバイト列の読み取り（疑似の取引で、正常と7種類の書き換え）を、手元で確かめた。ノードには繋げなかったので、**Nileでは、まだ動かしていない**。確かめるとき、特に見るところは、次の4つ。(1) 9.4の `data` を `wallet/triggerconstantcontract` に直接渡せるか（`function_selector` を使わない形）。(2) 9.7の予行で、失敗したときの `result`（`code`・`message`）と `constant_result` の形。(3) 9.8の `contract()` の `call()` の戻り値の型と、`send()` の戻り値（txIDか、配列か）。(4) 9.4の注意に書いた `walletsolidity/triggerconstantcontract` が使えるか。出力例の形は、これらの確認のあとで、直す
- **第8章のコンパイル方法**：案A（コンパイル済みのABIとバイトコードを貼る）で進めた。ソースの改変を試す仕組み（案B）は作らない。**Counterのバイトコードは、まだ貼っていない**（`tronmain/ch08/bytecode.js`）。TRON版solcでコンパイルして貼ったあと、8.3〜8.8を、Nileで通しで動かして確かめる
- 付録のうち、どれを作るか
- **第7章の `pragma solidity 0.8.20;` と、第8章のコンパイラ**：第7章は、TRONの公式資料の例に合わせて 0.8.20 に固定した。バイトコードを貼るとき、使うコンパイラ（TRON版solc）がその版に対応しているかを確かめ、合わなければ、第7章の pragma と本文（7.2、7.6）、第8章の8.2の注意を直す

- **第10章のNileでの通しの確認**：コードは、構文と、手読み（`decodeLog`）・取引ごと・コントラクトごと・SDK比較の流れを、疑似の台帳（モックのfetch）で、手元で確かめた。**Nileでは、まだ動かしていない**。確かめるとき、特に見るところは、次の5つ。(1) 10.4・10.5の `result` の形（アドレスがBase58・0x付き・41付きのどれか、`newCount` が文字列か）。(2) `order_by=block_timestamp,asc`・`min_block_timestamp`・`fingerprint` が、Nileで効くか、`min_block_timestamp` が境界を含むか。(3) 10.6の、送ってから拾えるまでの時間（出力例は見本）。(4) 10.7の、`only_unconfirmed` が確定後に0件になるか、確定までの時間（出力例は約60秒の見本）。(5) 10.8の、`tronWeb.event` の戻り値の形とオプション名（v6.3.0）

## 実装のルール（アプリ側）

- 章の内部番号は、**200 + 章番号**（第1章は201、第2章は202）。章の識別に使う
- プロファイルと学習の進捗の記録は**廃止**した（ブラウザには何も保存しない。保存するのはコンソールの高さだけ）。起動すると、すぐ目次ページ（章の選択）が開く
- **テスト用ウォレット**（`Wallet.tsx`（画面）・`walletCore.ts`（計算と保存。大文字小文字だけ違う名前はMacで衝突するので避ける））：目次ページの右上と、章のサイドバーの下の「ウォレット」から開く。秘密鍵（64桁の16進）を貼ってアカウントを作り、3つまで持てる。アドレス（Base58・16進）・公開鍵・秘密鍵は、隠さずに常に表示する（コピーボタン付き）。公開鍵とアドレスは、第1章と同じ手順を依存なしで計算する（TronWebは要らない）。保存先は localStorage の `sokushu-wallets`（平文。練習用の鍵だけを使う）。コンソールの変数とは、まだつながっていない
- **テーマ（ダーク／ホワイト）**：目次ページのバナーとサイドバーの下の切り替えで選ぶ。選んだほうは localStorage の `sokushu-theme` に保存する（初期値はダーク）。配色は `ThemeMode.tsx` の `makeTheme` で決め、コンポーネントは、色をテーマの名前（`text.primary`・`divider`・`action.hover` など）で指定する。コードブロックとコンソールは、どちらのテーマでも黒地。第1章の図解の色は CSS変数（`--fig-*`）で、`ThemeMode.tsx` が値を入れる
- 見た目は、黒地に TRON の赤（`#ff060a`）と白。ロゴ（赤い円と白い線のひし形）は SVG で描く（`TronMark`、`ui.tsx`。画像ファイルは使わない）。タイトル画面は赤い地に白いロゴ、背景にグリッドと赤い光、コードブロックの上辺に赤い線。色は `ThemeMode.tsx` のテーマで決める
- 章の登録は `src/pages/sokushu/TronMain.tsx` の `TRON_MAIN` に足す。タイトル画面・タブ・環境構築の判定は、この一覧を見て動く
- 章の本文は `TronChNN.tsx`、コードは `src/pages/sokushu/tronmain/chNN/` に置く。コードの意味の解説は `tronmain/explain.ts` に、コード文字列をキーにして足す
- コンソールに「ノードURL」欄や「アカウント」ボタンは設けない。第2章以降の接続先は、第2章②の `NILE` で決まる。第1章のコードは、コード中の `base` で決まる
- 環境構築の判定（第2章以降）は、グローバルの `TronWeb`（①）と、`tronWeb`・`NILE`（②）が揃っているかで行う（`Sokushu.tsx` の `checkTron`）
- Solidityのソースは、`tronmain/chNN/*.sol` に置き、`?raw` で読み込んで `<Code lang="solidity" code={...} />` で表示する（実行・入力ボタンは出ない）。解説は、JavaScriptと同じく `tronmain/explain.ts` に、コード文字列をキーにして足す
- 第7章の Counter（`tronmain/ch07/Counter.sol`）は、第8章以降（デプロイ・呼び出し・イベント・エネルギー）で使い続ける。関数のセレクタは、`MAX()`＝d49d5181、`owner()`＝8da5cb5b、`count()`＝06661abd、`increment()`＝d09de08a、`reset()`＝d826f88f、`remaining()`＝55234ec0。イベントの topic は、`Incremented(address,uint256)`＝38ac789e…、`Reset(address)`＝162f4678…
- 第8章のデプロイで使う変数：`COUNTER_ABI`、`COUNTER_BC`（8.2・8.3）、`DEPLOY`（8.4）、`checkDeploy`（8.5）、`deployInfo`・`counterTxid`・`counterHex`・`counterAddr`（8.6）。第9章以降は、`counterAddr`（Base58）と `counterHex`（41付きの16進、小文字）を使う
- 第9章の変数：`selOf`・`pad32`（9.3）、`callRaw`・`aliceHex`・`ret`（9.4）、`CALL`・`callRes`・`callTx`（9.5）、`checkCall`（9.5）、`callInfo`・`callTxid`・`readCount`（9.6）、`bobHex`・`hexText`（9.7）、`failInfo`・`waitInfo`（9.7）。第10章以降は、`counterAddr`・`counterHex`・`COUNTER_ABI` に加えて、`callTxid`（9.6の `increment()` の txID）を、イベントの取得の例に使える
- 第10章の変数：`topicOf`・`h20`・`EVENTS`・`decodeLog`（10.3）、`getJson`・`evByTx`（10.4）、`getAll`・`ORDER`（10.5）、`seen`・`cursor`・`poll`・`watchTxid`（10.6）。第11章以降は、`decodeLog` の `EVENTS` を、TRC-20のABIに差し替えれば、`Transfer`・`Approval` も読める（address・数・bool のみ）
