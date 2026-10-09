/**
 * フォーマットパターン
 */
export type NumberFormatPattern = (string | [string])[];

/**
 * フォーマットパターン情報
 */
export type AnalyzeNumberFormatResult = {
  /**
   * 整数部のパターン(逆順)
   */
  integerPattern: NumberFormatPattern;

  /**
   * 整数部の数値のみの桁数
   */
  integerDigits: number;

  /**
   * 小数部のパターン
   */
  decimalPattern: NumberFormatPattern;

  /**
   * 小数部の数値のみの桁数
   */
  decimalDigits: number;

  /**
   * 小数点有無
   */
  hasDecimalPoint: boolean;

  /**
   * 整数部桁区切り有無
   */
  hasThousandsSeparator: boolean;

  /**
   * 先頭に付ける文字列
   */
  prefix?: string;

  /**
   * 末尾に付ける文字列
   */
  suffix?: string;
};
