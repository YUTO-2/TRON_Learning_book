import { tronExplain } from './tronmain/explain';

// コードの意味の解説。コード文字列をキーにして、tronmain/explain.ts の一覧から引く。
// 解説が無いコードにはアイコンが出ない。
export const explainOf = (code: string): string | undefined => tronExplain.get(code);
