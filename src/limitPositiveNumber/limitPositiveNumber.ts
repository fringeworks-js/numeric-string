import type { LimitPositiveNumberOptions } from './types';

/**
 * 正の数に変換する。
 * デフォルトでは負の数だった場合にnullを返す。
 * @param value 値
 * @param options オプション
 * @returns
 */
const limitPositiveNumber = (
  value: number | null | undefined,
  options: LimitPositiveNumberOptions = {},
): number | null | undefined => _limitPositiveNumber(value, options);
limitPositiveNumber.dataLast =
  (options: LimitPositiveNumberOptions = {}) =>
  (value: number | null | undefined): number | null | undefined =>
    _limitPositiveNumber(value, options);
export default limitPositiveNumber;

function _limitPositiveNumber(
  value: number | null | undefined,
  options: LimitPositiveNumberOptions = {},
): number | null | undefined {
  if (value == null) {
    // null,undefinedの場合
    return 'defaultValue' in options ? options.defaultValue : value;
  } else if (Number.isNaN(value)) {
    // NaNの場合
    return 'nanValue' in options ? options.nanValue : null;
  } else if (value > 0) {
    // 正の数はそのまま
    return value;
  } else if (value === 0) {
    // 0の場合
    return 'zeroValue' in options ? options.zeroValue : null;
  } else {
    // 負の数の場合
    if ('negativeValue' in options) {
      if (options.negativeValue === 'abs') {
        return Math.abs(value);
      } else {
        return options.negativeValue;
      }
    } else {
      return null;
    }
  }
}
