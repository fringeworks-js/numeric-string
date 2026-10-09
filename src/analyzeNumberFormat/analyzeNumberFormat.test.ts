import analyzeNumberFormat from './analyzeNumberFormat';

describe('analyzeNumberFormat', () => {
  it('undefinedを渡した場合はundefinedを返す', () => {
    expect(analyzeNumberFormat(undefined)).toBeUndefined();
  });

  it('整数フォーマット "#,##0" を正しく解析する', () => {
    const result = analyzeNumberFormat('#,##0');
    expect(result).toBeDefined();
    expect(result!.hasDecimalPoint).toBe(false);
    expect(result!.hasThousandsSeparator).toBe(true);
    expect(result!.integerDigits).toBe(4);
    expect(result!.decimalDigits).toBe(0);
    expect(result!.prefix).toBeUndefined();
    expect(result!.suffix).toBeUndefined();
  });

  it('小数フォーマット "#,##0.00" を正しく解析する', () => {
    const result = analyzeNumberFormat('#,##0.00');
    expect(result).toBeDefined();
    expect(result!.hasDecimalPoint).toBe(true);
    expect(result!.hasThousandsSeparator).toBe(true);
    expect(result!.integerDigits).toBe(4);
    expect(result!.decimalDigits).toBe(2);
  });

  it('prefix付きフォーマット "¥#,##0" を正しく解析する', () => {
    const result = analyzeNumberFormat('"¥"#,##0');
    expect(result!.prefix).toBe('¥');
  });

  it('suffix付きフォーマット "#,##0.00"円"" を正しく解析する', () => {
    const result = analyzeNumberFormat('#,##0.00"円"');
    expect(result!.suffix).toBe('円');
  });

  it('桁区切りなしフォーマット "0.000" を正しく解析する', () => {
    const result = analyzeNumberFormat('0.000');
    expect(result!.hasThousandsSeparator).toBe(false);
    expect(result!.hasDecimalPoint).toBe(true);
    expect(result!.decimalDigits).toBe(3);
  });

  it('シンプルな "0" フォーマットを解析する', () => {
    const result = analyzeNumberFormat('0');
    expect(result!.hasDecimalPoint).toBe(false);
    expect(result!.hasThousandsSeparator).toBe(false);
    expect(result!.integerDigits).toBe(1);
  });

  it('整数フォーマットのsuffixを解析する', () => {
    const result = analyzeNumberFormat('#,##0"円"');
    expect(result!.hasDecimalPoint).toBe(false);
    expect(result!.suffix).toBe('円');
  });

  it('連続するラベルをまとめて解析する', () => {
    const result = analyzeNumberFormat('"¥""yen"0');
    expect(result!.prefix).toBe('¥yen');
  });

  it('数値パターンがない場合は空の結果を返す', () => {
    const result = analyzeNumberFormat('xyz');
    expect(result).toBeDefined();
    expect(result!.integerDigits).toBe(0);
    expect(result!.decimalDigits).toBe(0);
  });
});
