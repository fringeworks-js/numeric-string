import limitDecimal from './limitDecimal';

describe('limitDecimal', () => {
  describe('null/undefined/空文字', () => {
    it('nullはデフォルトで空文字を返す', () => {
      expect(limitDecimal(null)).toBe('');
    });

    it('undefinedはデフォルトで空文字を返す', () => {
      expect(limitDecimal(undefined)).toBe('');
    });

    it('空文字はデフォルトで空文字を返す', () => {
      expect(limitDecimal('')).toBe('');
    });

    it('emptyValue オプションで null 時の値を変更できる', () => {
      expect(limitDecimal(null, { emptyValue: '0' })).toBe('0');
    });
  });

  describe('数値の変換', () => {
    it('整数はそのまま文字列で返す', () => {
      expect(limitDecimal(42)).toBe('42');
    });

    it('小数はそのまま文字列で返す', () => {
      expect(limitDecimal(3.14)).toBe('3.14');
    });

    it('負数はそのまま文字列で返す', () => {
      expect(limitDecimal(-5)).toBe('-5');
    });
  });

  describe('精度(decimals)', () => {
    it('decimalsで小数点以下の桁数を制限する(切り捨て)', () => {
      expect(limitDecimal(3.14159, { decimals: 2 })).toBe('3.14');
    });

    it('decimals: 0 で整数に丸める', () => {
      expect(limitDecimal(3.9, { decimals: 0 })).toBe('3');
    });
  });

  describe('範囲制限', () => {
    it('minより小さい場合はoutOfRangeValueを返す', () => {
      expect(limitDecimal(-1, { min: 0, outOfRangeValue: 'NG' })).toBe('NG');
    });

    it('maxより大きい場合はoutOfRangeValueを返す', () => {
      expect(limitDecimal(101, { max: 100, outOfRangeValue: 'NG' })).toBe('NG');
    });

    it('clampToMinでmin値に丸める', () => {
      expect(limitDecimal(-5, { min: 0, clampToMin: true })).toBe('0');
    });

    it('clampToMaxでmax値に丸める', () => {
      expect(limitDecimal(200, { max: 100, clampToMax: true })).toBe('100');
    });
  });

  describe('NaN', () => {
    it('数値でない文字列はnanValueを返す', () => {
      expect(limitDecimal('abc')).toBe('');
    });

    it('nanValueオプションでNaN時の値を変更できる', () => {
      expect(limitDecimal('abc', { nanValue: '無効' })).toBe('無効');
    });

    it('NaN数値はnanValueを返す', () => {
      expect(limitDecimal(NaN)).toBe('');
    });
  });

  describe('interactive モード', () => {
    it('入力途中の"-"を許可する(minが負の場合)', () => {
      expect(limitDecimal('-', { interactive: true, min: -100 })).toBe('-');
    });

    it('minが文字列の負数でも"-"入力を許可する', () => {
      expect(limitDecimal('-', { interactive: true, min: '-100' as any })).toBe(
        '-',
      );
    });

    it('入力途中の"3."を許可する', () => {
      expect(limitDecimal('3.', { interactive: true })).toBe('3.');
    });

    it('数字でない入力はnanValueを返す', () => {
      expect(limitDecimal('abc', { interactive: true, nanValue: 'NG' })).toBe(
        'NG',
      );
    });

    it('decimals: 0 のとき小数点以下は切り捨て', () => {
      expect(limitDecimal('3.', { interactive: true, decimals: 0 })).toBe('3');
    });
  });
});
