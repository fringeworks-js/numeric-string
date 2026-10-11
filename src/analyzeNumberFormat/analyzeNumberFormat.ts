import * as R from 'remeda';
import type { AnalyzeNumberFormatResult, NumberFormatPattern } from './types';

/**
 * フォーマットを分解するための正規表現
 * 1: '"'で囲んだ固定文字列(閉じていない場合は末尾まで)
 * 2: 引用符の外の固定文字列
 * それ以外: 数値 or 桁区切り or 小数点
 */
const REGEXP_FORMAT_TO_PATTERN = /"([^"]*)"?|([^"0#.,]+)|[0#.,]/g;

/**
 * フォーマット文字列からパターン情報を作成する
 * @param format フォーマット文字列
 * @returns
 */
export default function analyzeNumberFormat(
  format: string | undefined,
): AnalyzeNumberFormatResult | undefined {
  if (format == null) {
    return;
  }
  const pattern = tokenizeFormat(format, REGEXP_FORMAT_TO_PATTERN);
  const dpIndex = pattern.indexOf('.');
  // 小数点の有無
  const hasDecimalPoint = dpIndex > -1;
  // 整数部のパターン(prefix,suffixを含む)
  const integerPattern = hasDecimalPoint
    ? pattern.slice(0, dpIndex).reverse()
    : pattern.reverse();
  const integerDigits = integerPattern.filter(
    (token) => token === '0' || token === '#',
  ).length;
  // 小数部のパターン(prefix,suffixを含む & 余分な'.'は除外)
  const decimalPattern = hasDecimalPoint
    ? pattern.slice(dpIndex + 1).filter((token) => token !== '.')
    : [];
  const decimalDigits = decimalPattern.filter(
    (token) => token === '0' || token === '#',
  ).length;
  // 桁区切りの有無
  const hasThousandsSeparator = integerPattern.includes(',');

  // prefix
  const prefix = getXfix(R.last(integerPattern));
  if (prefix != null) {
    integerPattern.pop();
  }
  let suffix;
  if (hasDecimalPoint) {
    // 小数点あり
    // suffix
    suffix = getXfix(R.last(decimalPattern));
    if (suffix != null) {
      decimalPattern.pop();
    }
  } else {
    // 小数点なし
    // suffix
    if (integerPattern.length > 1) {
      suffix = getXfix(integerPattern[0]);
      if (suffix != null) {
        integerPattern.shift();
      }
    }
  }

  return {
    integerPattern,
    integerDigits,
    decimalPattern,
    decimalDigits,
    hasDecimalPoint,
    hasThousandsSeparator,
    prefix,
    suffix,
  };
}

/**
 * tokenがlabelだった場合、ラベル文字列を返す
 * @param token パターントークン
 * @returns
 */
function getXfix(token: unknown): string | undefined {
  return Array.isArray(token) ? token[0] : undefined;
}

/**
 * フォーマット文字列をパターンに変換する
 * @param format フォーマット文字列
 * @param regex パターン正規表現
 * @returns
 */
function tokenizeFormat(format: string, regex: RegExp): NumberFormatPattern {
  const result: NumberFormatPattern = [];
  for (const [token, quotedLabel, unquotedLabel] of format.matchAll(regex)) {
    const label = quotedLabel ?? unquotedLabel;
    if (label == null) {
      // 数値 or 桁区切り or 小数点
      result.push(token);
      continue;
    }
    // 固定文字列(label)
    const lastItem = R.last(result);
    if (Array.isArray(lastItem)) {
      // 1つ前もlabelの場合は纏める
      lastItem[0] += label;
    } else {
      result.push([label]);
    }
  }
  return result;
}
