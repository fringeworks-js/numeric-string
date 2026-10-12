import { createNumberFormatter } from '../createNumberFormatter';
import createNumberParser from './createNumberParser';

describe('createNumberParser', () => {
  it('桁区切りを取り除く', () => {
    expect(createNumberParser('#,##0.00')('1,234,567.80')).toBe('1234567.80');
  });

  it('prefix/suffixを取り除く', () => {
    const parse = createNumberParser('"¥"#,##0"円"');
    expect(parse('¥1,234円')).toBe('1234');
  });

  it('prefix/suffixが無くても戻せる', () => {
    expect(createNumberParser('"¥"#,##0"円"')('1,234')).toBe('1234');
  });

  it('符号はprefixの前・後のどちらにあってもよい', () => {
    const parse = createNumberParser('"¥"#,##0');
    expect(parse('-¥1,234')).toBe('-1234');
    expect(parse('¥-1,234')).toBe('-1234');
    expect(parse('−¥1,234')).toBe('-1234');
  });

  it('前後や固定文字列との間の空白を取り除く', () => {
    const parse = createNumberParser('_("$"#,##0_)');
    expect(parse(' $1,234 ')).toBe('1234');
    expect(parse('  -  $ 1,234  ')).toBe('-1234');
  });

  it('ロケールの桁区切りと小数点を扱う', () => {
    expect(createNumberParser('#,##0.00', 'de-DE')('1.234,50')).toBe('1234.50');
  });

  it('createNumberFormatterで整形した文字列を戻せる', () => {
    const format = '"¥"#,##0.00"円"';
    const formatter = createNumberFormatter(format);
    const parse = createNumberParser(format);
    expect(parse(formatter(-1234567.8))).toBe('-1234567.80');
    expect(parse(formatter('0.5'))).toBe('0.50');
  });

  it('数値として正しい形かどうかは検証しない', () => {
    expect(createNumberParser('0')('abc')).toBe('abc');
    expect(createNumberParser('0')('')).toBe('');
  });
});
