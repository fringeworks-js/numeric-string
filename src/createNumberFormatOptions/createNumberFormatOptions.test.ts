import createNumberFormatOptions from './createNumberFormatOptions';

describe('createNumberFormatOptions', () => {
  it('整数フォーマット "#,##0" を変換する', () => {
    expect(createNumberFormatOptions('#,##0')).toEqual({
      minimumIntegerDigits: 1,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
      prefix: '',
      suffix: '',
    });
  });

  it('小数フォーマット "#,##0.0#" を変換する', () => {
    expect(createNumberFormatOptions('#,##0.0#')).toMatchObject({
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
      useGrouping: true,
    });
  });

  it('整数部の"0"の数をminimumIntegerDigitsにする', () => {
    expect(createNumberFormatOptions('000').minimumIntegerDigits).toBe(3);
  });

  it('整数部に"0"が無い場合もminimumIntegerDigitsは1にする', () => {
    expect(createNumberFormatOptions('#.00').minimumIntegerDigits).toBe(1);
  });

  it('桁区切りが無い場合はuseGroupingをfalseにする', () => {
    expect(createNumberFormatOptions('0.000').useGrouping).toBe(false);
  });

  it('小数部の桁区切りは無視する', () => {
    expect(createNumberFormatOptions('0.0,0')).toMatchObject({
      useGrouping: false,
      maximumFractionDigits: 2,
    });
  });

  it('2つ目以降の小数点は無視する', () => {
    expect(createNumberFormatOptions('0.0.0').maximumFractionDigits).toBe(2);
  });

  it('桁数はIntl.NumberFormatの上限に収める', () => {
    const options = createNumberFormatOptions(
      `${'0'.repeat(30)}.${'0'.repeat(30)}`,
    );
    expect(options.minimumIntegerDigits).toBe(21);
    expect(options.minimumFractionDigits).toBe(20);
    expect(options.maximumFractionDigits).toBe(20);
  });

  describe('prefix/suffix', () => {
    it('"で囲んだ固定文字列を取り出す', () => {
      expect(createNumberFormatOptions('"¥"#,##0.00"円"')).toMatchObject({
        prefix: '¥',
        suffix: '円',
      });
    });

    it('引用符の外の文字も固定文字列として扱う', () => {
      expect(createNumberFormatOptions('¥#,##0円')).toMatchObject({
        prefix: '¥',
        suffix: '円',
      });
    });

    it('連続する固定文字列はまとめる', () => {
      expect(createNumberFormatOptions('US"$ "0" ""ドル"')).toMatchObject({
        prefix: 'US$ ',
        suffix: ' ドル',
      });
    });

    it('閉じていない引用符は末尾までを固定文字列として扱う', () => {
      expect(createNumberFormatOptions('0"円.00')).toMatchObject({
        maximumFractionDigits: 0,
        suffix: '円.00',
      });
    });

    it('数値の間にある固定文字列は無視する', () => {
      expect(createNumberFormatOptions('000"-"0000')).toMatchObject({
        minimumIntegerDigits: 7,
        prefix: '',
        suffix: '',
      });
    });

    it('Intl.NumberFormatにそのまま渡せる', () => {
      const options = createNumberFormatOptions('"¥"#,##0.00');
      expect(new Intl.NumberFormat('en-US', options).format(1234.5)).toBe(
        '1,234.50',
      );
    });
  });

  describe('Excelの表示形式', () => {
    it('"?"は"#"と同じに扱う', () => {
      expect(createNumberFormatOptions('??0.0??')).toMatchObject({
        minimumIntegerDigits: 1,
        minimumFractionDigits: 1,
        maximumFractionDigits: 3,
      });
    });

    it('"\\"の後の1文字を固定文字列として扱う', () => {
      expect(createNumberFormatOptions('\\0#,##0\\.\\円')).toMatchObject({
        minimumIntegerDigits: 1,
        maximumFractionDigits: 0,
        prefix: '0',
        suffix: '.円',
      });
    });

    it('"_"の後の文字は空白1つにする', () => {
      expect(createNumberFormatOptions('_(#,##0_)')).toMatchObject({
        prefix: ' ',
        suffix: ' ',
      });
    });

    it('"*"による埋め文字は無視する', () => {
      expect(createNumberFormatOptions('"¥"* #,##0')).toMatchObject({
        prefix: '¥',
        suffix: '',
        useGrouping: true,
      });
    });

    it('"[$¥-411]"の通貨記号を固定文字列として扱う', () => {
      expect(createNumberFormatOptions('[$¥-411]#,##0')).toMatchObject({
        prefix: '¥',
      });
      expect(createNumberFormatOptions('#,##0[$円]')).toMatchObject({
        suffix: '円',
      });
    });

    it('色や条件の指定は無視する', () => {
      expect(createNumberFormatOptions('[Red][>100]#,##0"円"')).toMatchObject({
        useGrouping: true,
        prefix: '',
        suffix: '円',
      });
    });

    it('末尾の","は桁区切りにせず無視する', () => {
      expect(createNumberFormatOptions('0,')).toMatchObject({
        useGrouping: false,
        suffix: '',
      });
      expect(createNumberFormatOptions('#,##0,"千円"')).toMatchObject({
        useGrouping: true,
        suffix: '千円',
      });
      expect(createNumberFormatOptions('0.0,,')).toMatchObject({
        useGrouping: false,
        maximumFractionDigits: 1,
      });
    });

    it('"%"は値を変えずに固定文字列として扱う', () => {
      expect(createNumberFormatOptions('0.0%')).toMatchObject({
        maximumFractionDigits: 1,
        suffix: '%',
      });
    });

    it('最初のセクションだけを使う', () => {
      expect(
        createNumberFormatOptions('#,##0.00"円";[Red]-#,##0"円";"-"'),
      ).toMatchObject({
        maximumFractionDigits: 2,
        prefix: '',
        suffix: '円',
      });
    });

    it('引用符の中の記号はそのまま固定文字列にする', () => {
      expect(createNumberFormatOptions('0"_;[\\"')).toMatchObject({
        suffix: '_;[\\',
      });
    });
  });

  it('数値の記号が無い場合は全て固定文字列として扱う', () => {
    expect(createNumberFormatOptions('xyz')).toMatchObject({
      minimumIntegerDigits: 1,
      maximumFractionDigits: 0,
      prefix: 'xyz',
      suffix: '',
    });
  });
});
