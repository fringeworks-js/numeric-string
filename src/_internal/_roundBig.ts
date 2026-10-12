import Big from 'big.js';
import type { RoundingMode } from '../limitDecimal/types';

/**
 * 丸め方をBigの丸め方に変換する
 * 'floor'/'ceil'は符号によって0方向・0から離れる方向を切り替える
 * 未知の丸め方は'trunc'として扱う
 * @param mode 丸め方
 * @param sign 値の符号
 */
const _toBigRoundingMode = (mode: RoundingMode, sign: number) => {
  switch (mode) {
    case 'expand':
      return Big.roundUp;
    case 'floor':
      return sign < 0 ? Big.roundUp : Big.roundDown;
    case 'ceil':
      return sign < 0 ? Big.roundDown : Big.roundUp;
    case 'halfExpand':
      return Big.roundHalfUp;
    case 'halfEven':
      return Big.roundHalfEven;
    default:
      return Big.roundDown;
  }
};

/**
 * 小数点以下を指定した桁数で丸める
 * @param value 値
 * @param decimals 小数点以下の桁数。未指定の場合は丸めない
 * @param mode 丸め方
 */
export const _roundBig = (
  value: Big,
  decimals: number | undefined,
  mode: RoundingMode,
): Big => {
  if (decimals == null) {
    return value;
  }
  return value.round(decimals, _toBigRoundingMode(mode, value.s));
};

/**
 * 値をBigに変換する
 * NaN、Infinityや数値として扱えない文字列の場合はundefinedを返す
 * @param value 値
 */
export const _toBig = (value: number | string): Big | undefined => {
  try {
    return new Big(value);
  } catch {
    return;
  }
};
