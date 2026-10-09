/**
 * オプション
 */
export type LimitPositiveNumberOptions = {
  /**
   * 負の数だった場合に返す値
   * 未指定の場合はnullを返す
   * `abs`を指定した場合は絶対値を返す
   */
  negativeValue?: number | null | undefined | 'abs';
  /**
   * 値が0だった場合に返す値
   * 未指定の場合はnullを返す
   */
  zeroValue?: number | null | undefined;
  /**
   * 値がNaNだった場合に返す値
   * 未指定の場合はnullを返す
   */
  nanValue?: number | null | undefined;
  /**
   * 値がnull,undefinedだった場合に返す値
   * 未指定の場合はnull,undefinedをそのまま返す
   */
  defaultValue?: number;
};
