import createNumberFormatter from './createNumberFormatter';

describe('createNumberFormatter', () => {
  it('フォーマットに従って整形する', () => {
    const format = createNumberFormatter('#,##0.00');
    expect(format(1234567.891)).toBe('1,234,567.89');
    expect(format(0.5)).toBe('0.50');
  });

  it('"#"の桁は必要な場合だけ表示する', () => {
    const format = createNumberFormatter('0.0#');
    expect(format(1)).toBe('1.0');
    expect(format(1.25)).toBe('1.25');
  });

  it('整数部の"0"の数だけゼロで埋める', () => {
    expect(createNumberFormatter('000')(7)).toBe('007');
  });

  it('prefix/suffixを付ける', () => {
    const format = createNumberFormatter('"¥"#,##0"円"');
    expect(format(1234)).toBe('¥1,234円');
  });

  it('負の数の符号はprefixの前に付ける', () => {
    const format = createNumberFormatter('"¥"#,##0"円"');
    expect(format(-1234)).toBe('-¥1,234円');
    expect(format(-1234n)).toBe('-¥1,234円');
    expect(format('-1234')).toBe('-¥1,234円');
  });

  it('丸めた結果が0になる負の数には符号を付けない', () => {
    const format = createNumberFormatter('0');
    expect(format(-0.1)).toBe('0');
    expect(format(-0)).toBe('0');
    expect(format('-0.1')).toBe('0');
  });

  it('文字列の値を整形する', () => {
    expect(createNumberFormatter('#,##0.00')('1234.5')).toBe('1,234.50');
  });

  it('bigintの値を整形する', () => {
    expect(createNumberFormatter('#,##0')(12345678901234567890n)).toBe(
      '12,345,678,901,234,567,890',
    );
  });

  it('ロケールを指定できる', () => {
    expect(createNumberFormatter('#,##0.00', 'de-DE')(1234.5)).toBe('1.234,50');
  });
});
