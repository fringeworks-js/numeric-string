import normalizeNumericString from './normalizeNumericString';

describe('normalizeNumericString', () => {
  it('全角の数字を半角にする', () => {
    expect(normalizeNumericString('０１２３４５６７８９')).toBe('0123456789');
  });

  it.each(['－', '−', 'ー', 'ｰ', '‐', '‑', '‒', '–', '﹣'])(
    'マイナス記号"%s"を"-"にする',
    (minus) => {
      expect(normalizeNumericString(`${minus}１`)).toBe('-1');
    },
  );

  it.each(['．', '。', '｡'])('小数点として使われる"%s"を"."にする', (point) => {
    expect(normalizeNumericString(`１${point}５`)).toBe('1.5');
  });

  it('桁区切りを取り除く', () => {
    expect(normalizeNumericString('1,234,567')).toBe('1234567');
    expect(normalizeNumericString('１，２３４、５６７')).toBe('1234567');
  });

  it('空白を取り除く', () => {
    expect(normalizeNumericString(' 1 234　')).toBe('1234');
  });

  it('先頭の"+"を取り除く', () => {
    expect(normalizeNumericString('+1')).toBe('1');
    expect(normalizeNumericString('＋１')).toBe('1');
  });

  it('組み合わせ', () => {
    expect(normalizeNumericString('　－１，２３４．５　')).toBe('-1234.5');
  });

  it('入力途中の形はそのまま残す', () => {
    expect(normalizeNumericString('－')).toBe('-');
    expect(normalizeNumericString('１．')).toBe('1.');
  });

  it('数値として正しい形かどうかは検証しない', () => {
    expect(normalizeNumericString('ａｂｃ')).toBe('ａｂｃ');
    expect(normalizeNumericString('1-2')).toBe('1-2');
  });
});
