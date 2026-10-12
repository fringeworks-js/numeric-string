import type { RoundingMode } from '../limitDecimal/types';

export type ToFixedDecimalsOptions = {
  /**
   * 小数点以下の桁数を超えた桁の丸め方
   * デフォルトは'halfExpand'(四捨五入。Number.prototype.toFixedと同じ)
   */
  roundingMode?: RoundingMode;

  /**
   * 数値として扱えない時に返す値
   * デフォルトは空文字
   */
  nanValue?: string | null;
};
