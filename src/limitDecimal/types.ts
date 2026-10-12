/**
 * 丸め方
 * Intl.NumberFormatのroundingModeと同じ名前で、そのうちの主要なもの
 * - trunc: 0に近づける(切り捨て)
 * - expand: 0から遠ざける(切り上げ)
 * - floor: 負の無限大に近づける
 * - ceil: 正の無限大に近づける
 * - halfExpand: 四捨五入(ちょうど半分の場合は0から遠ざける)
 * - halfEven: 銀行丸め(ちょうど半分の場合は偶数にする)
 */
export type RoundingMode =
  'trunc' | 'expand' | 'floor' | 'ceil' | 'halfExpand' | 'halfEven';

export type LimitDecimalOptions = {
  /**
   * 空文字、null、undefinedの場合に返す値
   * デフォルトは空文字
   */
  emptyValue?: string | null;

  /**
   * 数値に変換できない時に返す値
   * デフォルトは空文字
   */
  nanValue?: string | null;

  /**
   * 最小値～最大値に収まっていない時に返す値
   * デフォルトは空文字
   */
  outOfRangeValue?: string | null;

  /**
   * 入力可能な最小値
   * デフォルトは制限なし(数値として扱えない場合も制限なし)
   */
  min?: number | string;

  /**
   * 入力可能な最大値
   * デフォルトは制限なし(数値として扱えない場合も制限なし)
   */
  max?: number | string;

  /**
   * 入力可能な小数点以下の桁数
   * デフォルトは制限なし
   */
  decimals?: number;

  /**
   * decimalsを超えた桁の丸め方
   * interactiveがtrueの場合は、入力途中の値が変わらないよう常に切り捨てる
   * デフォルトは'trunc'(切り捨て)
   */
  roundingMode?: RoundingMode;

  /**
   * 下限を下回った時には下限値を返す
   * 下限値がdecimalsの桁数を超える場合は、範囲内に収まるよう切り上げる
   */
  clampToMin?: boolean;

  /**
   * 上限を上回った時には上限値を返す
   * 上限値がdecimalsの桁数を超える場合は、範囲内に収まるよう切り捨てる
   */
  clampToMax?: boolean;

  /**
   * 入力中の数値に対する処理
   * trueの場合は、'-'、'.'のみや'1.'などの入力中の状態が許容され、
   * 範囲内の値は入力された文字列の形のまま返す
   * デフォルトはfalse
   */
  interactive?: boolean;

  /**
   * interactiveがtrueの場合に、先頭の余分なゼロを取り除く
   * ('007'→'7'、'-00.5'→'-0.5')
   * デフォルトはfalse
   */
  trimLeadingZeros?: boolean;
};
