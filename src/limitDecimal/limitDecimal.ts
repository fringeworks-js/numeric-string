import Big from 'big.js';
import * as R from 'remeda';
import { _roundBig, _toBig } from '../_internal/_roundBig';
import type { LimitDecimalOptions } from './types';

/**
 * 入力中の状態をチェックする為のパターン
 */
const INTERACTIVE_LIMITATION = /^-?\d*\.?\d*$/;

/**
 * 入力が完了したときの状態をチェックする為のパターン
 */
const BATCH_LIMITATION = /^-?\d+(\.\d+)?$/;

/**
 * 先頭の余分なゼロを取り除く為のパターン
 */
const LEADING_ZEROS = /^(-?)0+(?=\d)/;

/**
 * 数字を含むかをチェックする為のパターン
 */
const HAS_DIGIT = /\d/;

const _toReturnValue = (value: Big | string | null): string | null => {
  if (value instanceof Big) {
    // Bigの場合はフル桁の数値を文字列で返す(引数なしのtoFixedは指数表記にならない)
    return value.toFixed();
  } else {
    // それ以外の場合はそのまま返す
    return value;
  }
};

/**
 * 最小値・最大値をBigに変換する
 * 数値として扱えない場合は制限なしとしてundefinedを返す
 */
const _toBound = (value: number | string | undefined): Big | undefined =>
  value == null ? undefined : _toBig(value);

/**
 * 文字列のまま小数点以下を切り捨てる
 * @param value 値
 * @param decimals 小数点以下の桁数
 */
const _truncateString = (value: string, decimals: number | undefined) => {
  const dpIndex = value.indexOf('.');
  if (decimals == null || dpIndex < 0) {
    return value;
  }
  return value.slice(0, decimals === 0 ? dpIndex : dpIndex + 1 + decimals);
};

/**
 * 10進数の文字列に変換する
 * @param value 値
 * @param options オプション
 * @returns
 */
export default function limitDecimal(
  value: number | string | null | undefined,
  options: LimitDecimalOptions = {},
): string | null {
  const {
    emptyValue = '',
    nanValue = '',
    outOfRangeValue = '',
    decimals,
    roundingMode = 'trunc',
    interactive = false,
    trimLeadingZeros = false,
    clampToMin,
    clampToMax,
  } = options;
  const min = _toBound(options.min);
  const max = _toBound(options.max);

  if (value == null || value === '') {
    // 値が無い場合
    return _toReturnValue(emptyValue);
  }

  if (R.isString(value) && interactive) {
    return _limitInteractive(value);
  }

  if (
    typeof value === 'number'
      ? !Number.isFinite(value)
      : !BATCH_LIMITATION.test(value)
  ) {
    // NaN、Infinity、または入力完了時の形になっていない場合
    return _toReturnValue(nanValue);
  }

  const numberValue = _roundBig(new Big(value), decimals, roundingMode);
  const outOfRange = _limitRange(numberValue, {
    checkMin: true,
    checkMax: true,
  });
  return outOfRange !== undefined ? outOfRange : _toReturnValue(numberValue);

  /**
   * 入力中の文字列を制限する
   * 範囲内の場合は入力された文字列の形のまま返す
   */
  function _limitInteractive(value: string): string | null {
    if (!INTERACTIVE_LIMITATION.test(value)) {
      // 完全に数値ではない場合
      return _toReturnValue(nanValue);
    }
    let result = _truncateString(value, decimals);
    if (trimLeadingZeros) {
      result = result.replace(LEADING_ZEROS, '$1');
    }
    const isNegative = result.startsWith('-');
    const canBeNegative = min == null || min.lt(0);
    if (!HAS_DIGIT.test(result)) {
      // '-'、'.'、'-.'などの数字の無い入力途中の状態
      if (result === '') {
        return _toReturnValue(emptyValue);
      }
      return isNegative && !canBeNegative ? _toReturnValue(nanValue) : result;
    }
    // 入力を続けると絶対値は大きくなる一方なので、
    // 桁を足して範囲内に届く可能性がある側の境界はチェックしない
    const outOfRange = _limitRange(new Big(result), {
      checkMin: isNegative,
      checkMax: !isNegative,
      forceUnderMin: isNegative && !canBeNegative,
    });
    return outOfRange !== undefined ? outOfRange : result;
  }

  /**
   * 範囲外の場合に返す値を返す
   * 範囲内の場合はundefinedを返す
   */
  function _limitRange(
    numberValue: Big,
    {
      checkMin,
      checkMax,
      forceUnderMin = false,
    }: { checkMin: boolean; checkMax: boolean; forceUnderMin?: boolean },
  ): string | null | undefined {
    if (min != null && ((checkMin && numberValue.lt(min)) || forceUnderMin)) {
      // 最小値よりも小さい場合
      return clampToMin
        ? _toReturnValue(_roundBig(min, decimals, 'ceil'))
        : _toReturnValue(outOfRangeValue);
    }
    if (max != null && checkMax && numberValue.gt(max)) {
      // 最大値よりも大きい場合
      return clampToMax
        ? _toReturnValue(_roundBig(max, decimals, 'floor'))
        : _toReturnValue(outOfRangeValue);
    }
    return;
  }
}
