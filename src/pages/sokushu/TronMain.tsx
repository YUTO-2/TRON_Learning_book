import type { ComponentType } from 'react';
import { TronOverview } from './Tron';
import TronCh02 from './TronCh02';
import TronCh03 from './TronCh03';
import TronCh04 from './TronCh04';
import TronCh05 from './TronCh05';
import TronCh06 from './TronCh06';
import TronCh07 from './TronCh07';
import TronCh08 from './TronCh08';
import TronCh09 from './TronCh09';
import TronCh10 from './TronCh10';
import type { TronSetup } from './TronCh02';

export type { TronSetup };

// TRON開発概論の章。内部番号は 200 + 章番号（章の識別に使う）。
// 章を追加するときは、ここに足す（Sokushu.tsx・Title.tsx は、この一覧を見て表示する）。
// 第1章（TRON概説）は読み取りだけでSDKを使わないので、環境構築（第2章）が済んでいなくても読める。
export const TRON_MAIN: readonly { no: number; title: string; desc: string; Body: ComponentType<{ setup: TronSetup }> }[] = [
  { no: 201, title: 'TRON概説', desc: 'TRONの設計・アカウントとアドレス・トランザクション・手数料・スマートコントラクト（TRC-20）を、ノードのデータを読みながら説明できるようになる。', Body: TronOverview },
  { no: 202, title: '環境構築', desc: 'TronWebを読み込み、テストネットのNileに接続して、コンソールでコードを動かせる状態にする。', Body: TronCh02 },
  { no: 203, title: 'アカウント', desc: 'アカウント（鍵とアドレス）をSDKで作り、第1章の手計算と照合して、フォーセットで受け取ったテストTRXの残高とアカウント情報を取得する。', Body: TronCh03 },
  { no: 204, title: 'TRXの送金', desc: '送金を、組み立て・署名・アナウンスの3段階に分けて実行し、第1章で手作業で並べたraw_dataと照合して、送金の結果と手数料を台帳から確かめる。', Body: TronCh04 },
  { no: 205, title: '署名と検証', desc: 'ノードが作った取引を、署名の前に自分で点検し、書き換えを見つける。確定済みの台帳で、入金を確かめる。', Body: TronCh05 },
  { no: 206, title: 'リソース', desc: 'TRXをステークして帯域幅とエネルギーを得て、他のアカウントへ委任し、解除して引き出すまでを、SDKで実行する。取引は、署名の前に自分で点検する。', Body: TronCh06 },
  { no: 207, title: 'Solidity入門', desc: 'Solidityで最小のコントラクト（Counter）を読み書きし、msg.sender・require・イベントの意味を、セレクタやログのバイト列と対応させて確かめる。TRONでの違い（単位・アドレス・コンパイラ）を押さえる。', Body: TronCh07 },
  { no: 208, title: 'デプロイ', desc: 'Counterをコンパイルして、ABIとバイトコードにし、デプロイの項目を決めて、署名の前に点検してから、Nileにデプロイする。デプロイ後のコントラクトと費用を、台帳で確かめる。', Body: TronCh08 },
  { no: 209, title: '呼び出し', desc: 'Counterの関数を、読み取りと書き込みに分けて呼ぶ。dataを手で組み立ててSDKの結果と比べ、書き込みは署名の前に点検する。戻り値と失敗の理由を、バイト列から読む。', Body: TronCh09 },
  { no: 210, title: 'イベント', desc: 'コントラクトが残したイベントを、取引の結果のログから手で読み、取引ごと・コントラクトごとに取り出す。ポーリングで新しいイベントを見張り、確定前と確定済みの違いを確かめる。', Body: TronCh10 },
];
