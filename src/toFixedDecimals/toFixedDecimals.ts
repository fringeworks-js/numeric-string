import { _roundBig, _toBig } from '../_internal/_roundBig';
import type { ToFixedDecimalsOptions } from './types';

/**
 * 小数点以下の桁数をそろえた文字列にする
 *
 * Number.prototype.toFixedと同様に、足りない桁は0で埋め、超えた桁は丸める。
 * 値を文字列のまま扱うため、精度が落ちず、指数表記にもならない。
 * @param value 値
 * @param decimals 小数点以下の桁数。0以上の整数でない場合は、切り捨てて0以上にする
 * @param options オプション
 * @returns
 */
export default function toFixedDecimals(
  value: number | string,
  decimals: number,
  options: ToFixedDecimalsOptions = {},
): string | null {
  const { roundingMode = 'halfExpand', nanValue = '' } = options;
  const numberValue = _toBig(value);
  if (numberValue == null) {
    return nanValue;
  }
  const digits = Number.isFinite(decimals)
    ? Math.max(Math.trunc(decimals), 0)
    : 0;
  return _roundBig(numberValue, digits, roundingMode).toFixed(digits);
}
