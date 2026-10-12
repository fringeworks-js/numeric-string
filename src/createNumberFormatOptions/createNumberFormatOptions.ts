import type { NumberFormatOptions } from './types';

/**
 * フォーマットを分解するための正規表現
 * - quoted: '"'で囲んだ固定文字列(閉じていない場合は末尾まで)
 * - escaped: '\'の後の1文字の固定文字列
 * - space: '_'の後の文字の幅の空白(空白1つにする)
 * - '*'の後の文字で埋める指定(表せないため無視する)
 * - currency: '[$¥-411]'のような通貨記号とロケールの指定(通貨記号を固定文字列にする)
 * - '[Red]'や'[>100]'のような色や条件の指定(無視する)
 * - section: セクションの区切り(最初のセクションだけを使う)
 * - symbol: 数値 or 桁区切り or 小数点
 * - text: 引用符の外の固定文字列
 */
const REGEXP_FORMAT_TOKEN =
  /"(?<quoted>[^"]*)"?|\\(?<escaped>.?)|_(?<space>.?)|\*.?|\[\$(?<currency>[^\]-]*)[^\]]*\]?|\[[^\]]*\]?|(?<section>;)|(?<symbol>[0#?.,])|(?<text>[^"\\_*[;0#?.,]+)/gsu;

/**
 * Intl.NumberFormatで指定できる小数部の桁数の上限
 * (ES2023で100に引き上げられたが、対応ブラウザーに合わせて20にする)
 */
const MAX_FRACTION_DIGITS = 20;

/**
 * Intl.NumberFormatで指定できる整数部の桁数の上限
 */
const MAX_INTEGER_DIGITS = 21;

/**
 * Excelの数値の表示形式(`#,##0.00`など)のパターンを、
 * Intl.NumberFormatに渡せるオプションに変換する
 *
 * Excelの表示形式を完全に再現するものではなく、文字列の整形に関わる次の要素に対応する。
 * 値を変える要素(`%`の100倍、末尾の`,`の1000分の1)には対応しない。
 * `%`は固定文字列として扱い、末尾の`,`は無視する。
 * - `0`・`#`・`?`(桁。`?`は空白での桁揃えを表せないため`#`と同じに扱う)、`,`(桁区切り)、`.`(小数点)
 * - 固定文字列: `"`で囲んだ文字列、`\`の後の1文字、`[$¥-411]`の通貨記号、それ以外の文字
 * - `_`の後の文字の幅の空白(空白1つにする)
 *
 * Intl.NumberFormatでは表せない先頭・末尾の固定文字列はprefix・suffixとして返す。
 * 数値の間にある固定文字列(`000"-"0000`の'-')は表せないため無視する。
 * セクション(`;`で区切った負の数・0の書式など)は最初のセクションだけを使い、
 * `*`による埋め文字、`[Red]`などの色や条件の指定は無視する。
 * @param format フォーマット文字列
 * @returns
 */
export default function createNumberFormatOptions(
  format: string,
): NumberFormatOptions {
  let prefix = '';
  let suffix = '';
  let hasSymbol = false;
  let hasDecimalPoint = false;
  let integerZeros = 0;
  let fractionZeros = 0;
  let fractionDigits = 0;
  let useGrouping = false;
  let hasComma = false;

  for (const { groups } of format.matchAll(REGEXP_FORMAT_TOKEN)) {
    const { quoted, escaped, space, currency, section, symbol, text } = groups!;
    if (section != null) {
      // 最初のセクションだけを使う
      break;
    }
    const label =
      quoted ??
      escaped ??
      (space != null ? ' ' : undefined) ??
      currency ??
      text;
    if (label != null) {
      // 固定文字列は数値の前ならprefix、後ならsuffix
      // 数値の間にある場合は、後ろに数値が続いた時点で捨てる
      if (hasSymbol) {
        suffix += label;
      } else {
        prefix += label;
      }
      continue;
    }
    if (symbol == null) {
      // 埋め文字や色・条件の指定
      continue;
    }
    hasSymbol = true;
    suffix = '';
    if (symbol === '.') {
      // 2つ目以降の小数点は無視する
      hasDecimalPoint = true;
    } else if (symbol === ',') {
      // 後ろに整数部の桁が続く場合だけ桁区切りにする
      // 小数部の','と、末尾の','(Excelでは1000で割る。値の変換になるため対応しない)は無視する
      hasComma = !hasDecimalPoint;
    } else if (hasDecimalPoint) {
      fractionDigits++;
      if (symbol === '0') {
        fractionZeros++;
      }
    } else {
      useGrouping ||= hasComma;
      if (symbol === '0') {
        integerZeros++;
      }
    }
  }

  return {
    minimumIntegerDigits: Math.min(
      Math.max(integerZeros, 1),
      MAX_INTEGER_DIGITS,
    ),
    minimumFractionDigits: Math.min(fractionZeros, MAX_FRACTION_DIGITS),
    maximumFractionDigits: Math.min(fractionDigits, MAX_FRACTION_DIGITS),
    useGrouping,
    prefix,
    suffix,
  };
}
