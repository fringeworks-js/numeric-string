import { _toBig } from '../_internal/_roundBig';
import type { ExpandExponentOptions } from './types';

/**
 * 指数表記の数値を、指数表記を使わない全桁の文字列にする
 *
 * 指数表記でない値もそのまま受け付け、余分な0を取り除いた形('1.50'→'1.5'、'007'→'7')にする。
 * @param value 値
 * @param options オプション
 * @returns
 */
export default function expandExponent(
  value: number | string,
  options: ExpandExponentOptions = {},
): string | null {
  const { nanValue = '' } = options;
  // 引数なしのtoFixedは指数表記にならない
  return _toBig(value)?.toFixed() ?? nanValue;
}
