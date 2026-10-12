/**
 * createNumberFormatOptionsの戻り値
 * Intl.NumberFormatにそのまま渡せるオプションに、
 * Intl.NumberFormatでは表せない情報を加えたもの
 * (Intl.NumberFormatは知らないプロパティを無視する)
 */
export type NumberFormatOptions = {
  /**
   * 整数部の最小桁数(整数部の'0'の数。1以上)
   */
  minimumIntegerDigits: number;

  /**
   * 小数部の最小桁数(小数部の'0'の数)
   */
  minimumFractionDigits: number;

  /**
   * 小数部の最大桁数(小数部の'0'と'#'の数)
   */
  maximumFractionDigits: number;

  /**
   * 桁区切りの有無
   */
  useGrouping: boolean;

  /**
   * 先頭に付ける文字列
   */
  prefix: string;

  /**
   * 末尾に付ける文字列
   */
  suffix: string;
};
