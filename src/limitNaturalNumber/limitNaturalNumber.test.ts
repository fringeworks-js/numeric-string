import limitNaturalNumber from './limitNaturalNumber';

describe('limitNaturalNumber', () => {
  it('正の整数はそのまま返す', () => {
    expect(limitNaturalNumber(5)).toBe(5);
  });

  it('小数は切り捨てる', () => {
    expect(limitNaturalNumber(3.9)).toBe(3);
  });

  it('負の数はnullを返す', () => {
    expect(limitNaturalNumber(-5)).toBeNull();
  });

  it('nullはnullを返す', () => {
    expect(limitNaturalNumber(null)).toBeNull();
  });

  it('undefinedはundefinedを返す', () => {
    expect(limitNaturalNumber(undefined)).toBeUndefined();
  });

  describe('0の扱い', () => {
    it('デフォルトでは0はnullを返す', () => {
      expect(limitNaturalNumber(0)).toBeNull();
    });

    it('zeroValueを指定すると0のときにその値を返す', () => {
      expect(limitNaturalNumber(0, { zeroValue: 0 })).toBe(0);
    });

    it('切り捨てて0になる場合も0と同じ扱い', () => {
      expect(limitNaturalNumber(0.5)).toBeNull();
      expect(limitNaturalNumber(0.5, { zeroValue: 0 })).toBe(0);
      expect(limitNaturalNumber(-0.5, { negativeValue: 'abs' })).toBeNull();
    });
  });

  it('NaNはデフォルトでnullを返す', () => {
    expect(limitNaturalNumber(NaN)).toBeNull();
  });

  describe('negativeValue', () => {
    it('negativeValue: "abs"で絶対値の整数を返す', () => {
      expect(limitNaturalNumber(-3.5, { negativeValue: 'abs' })).toBe(3);
    });
  });

  it('オプションで指定した値は切り捨てずにそのまま返す', () => {
    expect(limitNaturalNumber(NaN, { nanValue: 0.5 })).toBe(0.5);
    expect(limitNaturalNumber(-1, { negativeValue: 2.5 })).toBe(2.5);
    expect(limitNaturalNumber(0, { zeroValue: 0.5 })).toBe(0.5);
    expect(limitNaturalNumber(null, { defaultValue: 1.5 })).toBe(1.5);
  });
});
