import Big from 'big.js';
import * as R from 'remeda';
import type { LimitDecimalOptions } from './types';

/**
 * 入力中の状態をチェックする為のパターン
 */
const INTERACTIVE_LIMITATION = /^-?\d*\.?\d*$/;

/**
 * 小数点まで入力した状態をチェックする為のパターン
 */
const INTERACTIVE_PRECISION_LIMITATION = /^-?\d+\.$/;

/**
 * 入力が完了したときの状態をチェックする為のパターン
 */
const BATCH_LIMITATION = /^-?\d+(\.\d+)?$/;

/**
 * 正の指数値のデフォルト
 */
const DEFAULT_PE = Big.PE;

/**
 * 負の指数値のデフォルト
 */
const DEFAULT_NE = Big.NE;

/**
 * 戻り値用の指数値
 */
const E = 1000;

const _toReturnValue = (
  value: Big | number | string | null | undefined,
): string | null => {
  if (R.isNumber(value)) {
    value = new Big(value);
  }
  if (value instanceof Big) {
    // Bigの場合はフル桁の数値を文字列で返す
    Big.PE = E;
    Big.NE = -E;
    const returnValue = value.toString();
    Big.PE = DEFAULT_PE;
    Big.NE = DEFAULT_NE;
    return returnValue;
  } else {
    // それ以外の場合はそのまま返す
    return value;
  }
};

const _isNegative = (value: number | string) => {
  if (R.isNumber(value)) {
    return value < 0;
  } else {
    return value.startsWith('-');
  }
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
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
    decimals,
    interactive = false,
    clampToMin,
    clampToMax,
  } = options;

  if (value == null || value === '') {
    // 値が無い場合
    return _toReturnValue(emptyValue);
  }

  if (!R.isNumber(value)) {
    // 文字列の場合
    if (interactive) {
      // 入力中の為に数値の形式になっていない状態をチェックする
      if (!INTERACTIVE_LIMITATION.test(value)) {
        // 完全に数値ではない場合
        return _toReturnValue(nanValue);
      } else if (_isNegative(min) && value === '-') {
        // 負数が入力可能な場合
        return value;
      } else if (
        (decimals == null || 0 < decimals) &&
        INTERACTIVE_PRECISION_LIMITATION.test(value)
      ) {
        // 小数の入力が可能な場合
        return value;
      }
    } else if (!BATCH_LIMITATION.test(value)) {
      // 入力完了時の状態をチェックする
      return _toReturnValue(nanValue);
    }
  }

  if (isNaN(Number(value))) {
    return _toReturnValue(nanValue);
  }

  let numberValue = new Big(value);
  if (decimals != null) {
    // 小数点以下の桁数が制限されている場合
    numberValue = numberValue.round(decimals, Big.roundDown);
  }

  if ((R.isString(min) || Number.isFinite(min)) && numberValue.lt(min)) {
    // 最小値よりも小さい場合
    if (clampToMin) {
      return _toReturnValue(min);
    } else {
      return _toReturnValue(outOfRangeValue);
    }
  }

  if ((R.isString(max) || Number.isFinite(max)) && numberValue.gt(max)) {
    // 最大値よりも大きい場合
    if (clampToMax) {
      return _toReturnValue(max);
    } else {
      return _toReturnValue(outOfRangeValue);
    }
  }

  return _toReturnValue(numberValue);
}
