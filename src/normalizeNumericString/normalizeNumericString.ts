/**
 * 全角の数字
 */
const FULL_WIDTH_DIGITS = /[０-９]/g;

/**
 * マイナス記号として扱う文字
 * 全角のハイフンマイナス、マイナス記号、長音記号(全角・半角)、各種ハイフン・ダッシュ
 */
const MINUS_SIGNS = /[－−ーｰ‐‑‒–﹣]/g;

/**
 * 小数点として扱う文字
 * 全角のピリオド、句点(全角・半角。日本語入力でピリオドを入力した場合)
 */
const DECIMAL_POINTS = /[．。｡]/g;

/**
 * 取り除く文字
 * 桁区切り(半角・全角のカンマ、読点)と空白(全角を含む)
 */
const REMOVABLES = /[,，、､\s]/g;

/**
 * 先頭のプラス記号(半角・全角)
 */
const LEADING_PLUS = /^[+＋]/;

/**
 * 数値を表す文字列を、limitDecimalなどが受け付ける形にそろえる
 *
 * 全角の数字・記号を半角にし、各種のマイナス記号を'-'に、小数点として使われる文字を'.'にする。
 * 桁区切り・空白・先頭の'+'は取り除く。
 * 数値として正しい形かどうかの検証はしない。
 * @param value 値
 * @returns
 */
export default function normalizeNumericString(value: string): string {
  return value
    .replace(FULL_WIDTH_DIGITS, (digit) =>
      String.fromCharCode(digit.charCodeAt(0) - 0xfee0),
    )
    .replace(MINUS_SIGNS, '-')
    .replace(DECIMAL_POINTS, '.')
    .replace(REMOVABLES, '')
    .replace(LEADING_PLUS, '');
}
