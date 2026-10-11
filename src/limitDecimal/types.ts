export type LimitDecimalOptions = {
  /**
   * 空文字、null、undefinedの場合に返す値
   * デフォルトは空文字
   */
  emptyValue?: number | string | null;

  /**
   * 数値に変換できない時に返す値
   * デフォルトは空文字
   */
  nanValue?: number | string | null;

  /**
   * 最小値～最大値に収まっていない時に返す値
   * デフォルトは空文字
   */
  outOfRangeValue?: number | string | null;

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
