import { createNumberFormatOptions } from '../createNumberFormatOptions';

/**
 * ロケールのデフォルト
 * フォーマット文字列に書いた','と'.'がそのまま桁区切りと小数点になるロケール
 */
const DEFAULT_LOCALE = 'en-US';

/**
 * 符号を除いた値を返す
 */
const _abs = (value: number | bigint | string) => {
  if (typeof value === 'string') {
    return value.trim().replace(/^-/, '');
  }
  if (typeof value === 'number') {
    // -0も0にする
    return Math.abs(value);
  }
  return value < 0n ? -value : value;
};

/**
 * 負の数かを返す
 */
const _isNegative = (value: number | bigint | string) =>
  typeof value === 'string' ? value.trim().startsWith('-') : value < 0;

/**
 * `#,##0.00`のような文字列で定義されたフォーマットで数値を整形する関数を作る
 *
 * 整形はIntl.NumberFormatで行い、Intl.NumberFormatでは表せない
 * 先頭・末尾の固定文字列を付ける。負の数の符号は先頭の固定文字列の前に付ける(`-¥1,234`)。
 * 文字列の値は、対応するブラウザーでは精度を保ったまま整形し、それ以外では数値に変換して整形する。
 * @param format フォーマット文字列
 * @param locales ロケール。デフォルトは'en-US'
 * @returns
 */
export default function createNumberFormatter(
  format: string,
  locales: Intl.LocalesArgument = DEFAULT_LOCALE,
): (value: number | bigint | string) => string {
  const { prefix, suffix, ...options } = createNumberFormatOptions(format);
  const numberFormat = new Intl.NumberFormat(locales, options);
  // 丸めた結果が0になる負の数('-0')に符号を付けないよう、0を整形した結果と比べる
  const zero = numberFormat.format(0);
  const minusSign =
    numberFormat.formatToParts(-1).find(({ type }) => type === 'minusSign')
      ?.value ?? '-';

  return (value) => {
    // 文字列の型はIntl.StringNumericLiteralだが、数値の形でない場合はNaNとして整形される
    const body = numberFormat.format(_abs(value) as number | bigint);
    const sign = _isNegative(value) && body !== zero ? minusSign : '';
    return sign + prefix + body + suffix;
  };
}
