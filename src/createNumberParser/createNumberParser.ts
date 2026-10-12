import { createNumberFormatOptions } from '../createNumberFormatOptions';

/**
 * ロケールのデフォルト(createNumberFormatterと同じ)
 */
const DEFAULT_LOCALE = 'en-US';

/**
 * 先頭のマイナス記号(半角のハイフンマイナスと、ロケールによって使われるマイナス記号)
 */
const LEADING_MINUS = /^[-−]/;

/**
 * createNumberFormatterで整形した文字列を、数値の文字列('-1234.5'の形)に戻す関数を作る
 *
 * 書式の先頭・末尾の固定文字列とロケールの桁区切りを取り除き、小数点を'.'にする。
 * 符号は先頭の固定文字列の前・後のどちらにあってもよい。
 * 数値として正しい形かどうかの検証はしないため、必要に応じてlimitDecimalと組み合わせる。
 * 数字はASCIIの0-9のみを扱う(他の数字を使うロケールには対応しない)。
 * @param format フォーマット文字列
 * @param locales ロケール。デフォルトは'en-US'
 * @returns
 */
export default function createNumberParser(
  format: string,
  locales: Intl.LocalesArgument = DEFAULT_LOCALE,
): (text: string) => string {
  const { prefix, suffix } = createNumberFormatOptions(format);
  const trimmedPrefix = prefix.trim();
  const trimmedSuffix = suffix.trim();
  const parts = new Intl.NumberFormat(locales).formatToParts(-12345.6);
  const group = parts.find(({ type }) => type === 'group')?.value ?? ',';
  const decimal = parts.find(({ type }) => type === 'decimal')?.value ?? '.';

  return (text) => {
    let isNegative = false;
    let value = text.trim();
    // 符号は先頭の固定文字列の前・後のどちらにあってもよい
    const takeSign = () => {
      if (LEADING_MINUS.test(value)) {
        isNegative = true;
        value = value.slice(1).trim();
      }
    };
    takeSign();
    if (trimmedPrefix && value.startsWith(trimmedPrefix)) {
      value = value.slice(trimmedPrefix.length).trim();
    }
    takeSign();
    if (trimmedSuffix && value.endsWith(trimmedSuffix)) {
      value = value.slice(0, -trimmedSuffix.length).trim();
    }
    // 桁区切りを取り除いてから小数点を置き換える(桁区切りが'.'のロケールがあるため)
    value = value.split(group).join('').split(decimal).join('.');
    return (isNegative ? '-' : '') + value;
  };
}
