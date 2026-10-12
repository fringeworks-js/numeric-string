import toFixedDecimals from './toFixedDecimals';

describe('toFixedDecimals', () => {
  it('足りない桁を0で埋める', () => {
    expect(toFixedDecimals('1.5', 2)).toBe('1.50');
    expect(toFixedDecimals(1, 3)).toBe('1.000');
  });

  it('超えた桁はデフォルトで四捨五入する', () => {
    expect(toFixedDecimals('1.235', 2)).toBe('1.24');
    expect(toFixedDecimals('-1.235', 2)).toBe('-1.24');
  });

  it('Number.prototype.toFixedと違い、10進数として正確に丸める', () => {
    expect((1.005).toFixed(2)).toBe('1.00');
    expect(toFixedDecimals('1.005', 2)).toBe('1.01');
  });

  it('roundingModeで丸め方を指定できる', () => {
    expect(toFixedDecimals('1.239', 2, { roundingMode: 'trunc' })).toBe('1.23');
    expect(toFixedDecimals('-1.231', 2, { roundingMode: 'floor' })).toBe(
      '-1.24',
    );
  });

  it('decimals: 0 で整数にする', () => {
    expect(toFixedDecimals('2.5', 0)).toBe('3');
  });

  it('丸めた結果が0になる負の数に符号を付けない', () => {
    expect(toFixedDecimals('-0.001', 2)).toBe('0.00');
  });

  it('精度を落とさず、指数表記にもしない', () => {
    expect(toFixedDecimals('12345678901234567890.1', 2)).toBe(
      '12345678901234567890.10',
    );
    expect(toFixedDecimals(1e21, 1)).toBe('1000000000000000000000.0');
    expect(toFixedDecimals('1e-7', 8)).toBe('0.00000010');
  });

  it('decimalsが0以上の整数でない場合は切り捨てて0以上にする', () => {
    expect(toFixedDecimals('1.25', 1.9)).toBe('1.3');
    expect(toFixedDecimals('1.5', -1)).toBe('2');
    expect(toFixedDecimals('1.5', NaN)).toBe('2');
  });

  it('数値として扱えない場合はnanValueを返す', () => {
    expect(toFixedDecimals('abc', 2)).toBe('');
    expect(toFixedDecimals(NaN, 2, { nanValue: null })).toBeNull();
    expect(toFixedDecimals(Infinity, 2, { nanValue: 'NG' })).toBe('NG');
  });
});
