import Big from 'big.js';
import limitDecimal from './limitDecimal';
import type { RoundingMode } from './types';

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

    it('指数表記にならない全桁の文字列で返す', () => {
      expect(limitDecimal(1e21)).toBe('1000000000000000000000');
      expect(limitDecimal(1e-7)).toBe('0.0000001');
    });

    it('Big.jsのグローバル設定を変更しない', () => {
      const pe = Big.PE;
      const ne = Big.NE;
      Big.PE = 30;
      Big.NE = -30;
      try {
        limitDecimal(1);
        expect(Big.PE).toBe(30);
        expect(Big.NE).toBe(-30);
      } finally {
        Big.PE = pe;
        Big.NE = ne;
      }
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

  describe('丸め方(roundingMode)', () => {
    const round = (value: string, roundingMode: RoundingMode) =>
      limitDecimal(value, { decimals: 1, roundingMode });

    it.each<[RoundingMode, string[]]>([
      ['trunc', ['1.2', '1.2', '-1.2', '-1.2']],
      ['expand', ['1.3', '1.3', '-1.3', '-1.3']],
      ['floor', ['1.2', '1.2', '-1.3', '-1.3']],
      ['ceil', ['1.3', '1.3', '-1.2', '-1.2']],
      ['halfExpand', ['1.3', '1.3', '-1.3', '-1.3']],
      ['halfEven', ['1.2', '1.3', '-1.2', '-1.3']],
    ])('%s', (roundingMode, expected) => {
      expect(
        ['1.25', '1.26', '-1.25', '-1.26'].map((value) =>
          round(value, roundingMode),
        ),
      ).toEqual(expected);
    });

    it('割り切れる値は丸めない', () => {
      expect(round('1.2', 'expand')).toBe('1.2');
      expect(round('-1.2', 'floor')).toBe('-1.2');
    });

    it('未知の丸め方はtruncとして扱う', () => {
      expect(round('1.29', 'unknown' as RoundingMode)).toBe('1.2');
    });

    it('丸めた後の値で範囲をチェックする', () => {
      expect(
        limitDecimal('9.96', {
          decimals: 1,
          roundingMode: 'halfExpand',
          max: 9.99,
          outOfRangeValue: 'OUT',
        }),
      ).toBe('OUT');
    });

    it('interactiveでは常に切り捨てる', () => {
      expect(
        limitDecimal('1.29', {
          decimals: 1,
          roundingMode: 'halfExpand',
          interactive: true,
        }),
      ).toBe('1.2');
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

    it('clampToMinはdecimalsに合わせて範囲の内側へ切り上げる', () => {
      expect(
        limitDecimal(-1, { min: '0.005', decimals: 2, clampToMin: true }),
      ).toBe('0.01');
      expect(
        limitDecimal(-1, { min: '-0.005', decimals: 2, clampToMin: true }),
      ).toBe('0');
    });

    it('clampToMaxはdecimalsに合わせて範囲の内側へ切り捨てる', () => {
      expect(
        limitDecimal(2, { max: '1.239', decimals: 2, clampToMax: true }),
      ).toBe('1.23');
      expect(
        limitDecimal(0, { max: '-1.231', decimals: 2, clampToMax: true }),
      ).toBe('-1.24');
    });

    it('outOfRangeValueにnullを指定できる', () => {
      expect(limitDecimal(101, { max: 100, outOfRangeValue: null })).toBeNull();
    });

    it('数値として扱えないmin/maxは制限なしとして扱う', () => {
      expect(limitDecimal('1', { min: 'abc' })).toBe('1');
      expect(limitDecimal('1', { max: 'abc' })).toBe('1');
      expect(limitDecimal('1', { min: NaN, max: NaN })).toBe('1');
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

    it('Infinity/-InfinityはnanValueを返す', () => {
      expect(limitDecimal(Infinity, { nanValue: 'NG' })).toBe('NG');
      expect(limitDecimal(-Infinity, { nanValue: 'NG' })).toBe('NG');
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

    it('"-"はminが0以上の場合nanValueを返す', () => {
      expect(
        limitDecimal('-', { interactive: true, min: 0, nanValue: 'NG' }),
      ).toBe('NG');
    });

    it('"."と"-."を許可する', () => {
      expect(limitDecimal('.', { interactive: true })).toBe('.');
      expect(limitDecimal('-.', { interactive: true })).toBe('-.');
      expect(limitDecimal('-.', { interactive: true, min: -1 })).toBe('-.');
      expect(
        limitDecimal('-.', { interactive: true, min: 0, nanValue: 'NG' }),
      ).toBe('NG');
    });

    it('decimals: 0 のとき"."は取り除く', () => {
      expect(limitDecimal('.', { interactive: true, decimals: 0 })).toBe('');
      expect(limitDecimal('-.', { interactive: true, decimals: 0 })).toBe('-');
    });

    it('範囲内の値は入力された形のまま返す', () => {
      expect(limitDecimal('1.0', { interactive: true })).toBe('1.0');
      expect(limitDecimal('0.00', { interactive: true })).toBe('0.00');
      expect(limitDecimal('-0', { interactive: true })).toBe('-0');
      expect(limitDecimal('007', { interactive: true })).toBe('007');
      expect(limitDecimal('.5', { interactive: true })).toBe('.5');
    });

    it('decimalsを超えた桁は文字列のまま切り捨てる', () => {
      expect(limitDecimal('1.2390', { interactive: true, decimals: 2 })).toBe(
        '1.23',
      );
      expect(limitDecimal('1.00', { interactive: true, decimals: 1 })).toBe(
        '1.0',
      );
    });

    it('trimLeadingZerosで先頭の余分なゼロを取り除く', () => {
      const options = { interactive: true, trimLeadingZeros: true };
      expect(limitDecimal('007', options)).toBe('7');
      expect(limitDecimal('-00.5', options)).toBe('-0.5');
      expect(limitDecimal('000', options)).toBe('0');
      expect(limitDecimal('-0', options)).toBe('-0');
      expect(limitDecimal('0.', options)).toBe('0.');
    });

    it('桁を足して範囲内に届く可能性がある場合は範囲外にしない', () => {
      const options = { interactive: true, outOfRangeValue: 'OUT' };
      expect(limitDecimal('1', { ...options, min: 10 })).toBe('1');
      expect(limitDecimal('-1', { ...options, max: -10 })).toBe('-1');
    });

    it('桁を足しても範囲内に届かない場合は範囲外にする', () => {
      const options = { interactive: true, outOfRangeValue: 'OUT' };
      expect(limitDecimal('5.', { ...options, max: 1 })).toBe('OUT');
      expect(limitDecimal('-5.', { ...options, min: -1 })).toBe('OUT');
      expect(limitDecimal('5', { ...options, max: -10 })).toBe('OUT');
      expect(limitDecimal('-0', { ...options, min: 0 })).toBe('OUT');
    });

    it('範囲外でclampが指定されている場合は境界値を返す', () => {
      expect(
        limitDecimal('5.', { interactive: true, max: 1, clampToMax: true }),
      ).toBe('1');
    });
  });
});
