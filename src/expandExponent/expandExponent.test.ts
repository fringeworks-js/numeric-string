import expandExponent from './expandExponent';

describe('expandExponent', () => {
  it('数値の指数表記を展開する', () => {
    expect(String(1e21)).toBe('1e+21');
    expect(expandExponent(1e21)).toBe('1000000000000000000000');
    expect(expandExponent(1.5e-7)).toBe('0.00000015');
  });

  it('文字列の指数表記を展開する', () => {
    expect(expandExponent('1.5e-7')).toBe('0.00000015');
    expect(expandExponent('-1.23E+25')).toBe('-12300000000000000000000000');
  });

  it('指数表記でない値は余分な0を取り除いて返す', () => {
    expect(expandExponent('1.50')).toBe('1.5');
    expect(expandExponent('007')).toBe('7');
    expect(expandExponent(-0)).toBe('0');
  });

  it('数値として扱えない場合はnanValueを返す', () => {
    expect(expandExponent('abc')).toBe('');
    expect(expandExponent(NaN, { nanValue: null })).toBeNull();
    expect(expandExponent(Infinity, { nanValue: 'NG' })).toBe('NG');
  });
});
