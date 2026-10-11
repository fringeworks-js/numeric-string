import * as R from 'remeda';
import { limitPositiveNumber } from '../limitPositiveNumber';
import type { LimitNaturalNumberOptions } from './types';

/**
 * 自然数に変換する。
 * 小数は切り捨て、切り捨てた結果が0の場合はzeroValue（未指定の場合はnull）を返す。
 * オプションのzeroValueに0を指定することで非負整数にも対応
 * オプションで指定した値は切り捨てずにそのまま返す。
 * @param value 値
 * @param options オプション
 * @returns
 */
export default function limitNaturalNumber(
  value: number | null | undefined,
  options: LimitNaturalNumberOptions = {},
): number | null | undefined {
  // 正の数に変換
  const positive = limitPositiveNumber(value, options);
  // 正の数(またはその絶対値)に変換された場合のみ切り捨てる
  // オプションで指定された値はそのまま返す
  const isConverted =
    value != null &&
    (value > 0 || (value < 0 && options.negativeValue === 'abs'));
  if (!isConverted || !R.isNumber(positive)) {
    return positive;
  }
  // 小数以下を切り捨て
  const natural = Math.floor(positive);
  if (natural === 0) {
    // 切り捨てて0になった場合
    return 'zeroValue' in options ? options.zeroValue : null;
  }
  return natural;
}
