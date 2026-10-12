# @fringeworks/numeric-string

`@fringeworks/numeric-string` は、数値を表す文字列を、精度を落とさずに正規化・制限・整形する、誰かにとっては便利なライブラリです。

**[English README is available here](./README.md)**

## インストール

```bash
npm install @fringeworks/numeric-string
# または
pnpm add @fringeworks/numeric-string
```

## 使い方

関数・型・定数は、ルートと関数単位のパスのどちらからでも同じ名前で import できます。関数単位のパスでは、その関数を default import することもできます。

```ts
import { limitDecimal } from '@fringeworks/numeric-string';
import limitDecimal from '@fringeworks/numeric-string/limitDecimal';
```

---

## API

| 関数                                         | 説明                                                                |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `createNumberFormatOptions(format)`          | Excel の数値の表示形式を `Intl.NumberFormat` のオプションに変換する |
| `createNumberFormatter(format, locales?)`    | 書式の文字列に従って数値を整形する関数を返す                        |
| `createNumberParser(format, locales?)`       | 整形した文字列を数値の文字列に戻す関数を返す                        |
| `expandExponent(value, options?)`            | 指数表記の数値を全桁の文字列にする                                  |
| `limitDecimal(value, options?)`              | 入力値を10進数の文字列にし、桁数や範囲を制限する                    |
| `normalizeNumericString(value)`              | 全角・記号を、`limitDecimal` などが受け付ける形にそろえる           |
| `toFixedDecimals(value, decimals, options?)` | 小数点以下の桁数をそろえた文字列にする                              |

### `createNumberFormatOptions`

```ts
createNumberFormatOptions(format: string): NumberFormatOptions
```

`#,##0.00` のような Excel の数値の表示形式を、`Intl.NumberFormat` に渡せるオプションに変換します。`Intl.NumberFormat` では表せない先頭・末尾の固定の文字列は `prefix` / `suffix` として返します。`Intl.NumberFormat` は知らないプロパティを無視するので、戻り値はそのまま渡せます。

Excel の表示形式を完全に再現するものではありません。行うのは文字列の整形だけで、値を変える要素（`%` の 100 倍や、末尾の `,` の 1000 分の 1）には対応しません。必要な場合は、値を変換してから整形してください。

対応する要素は次のとおりです。

| 要素           | 扱い                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| `0`            | 必ず表示する桁                                                           |
| `#`            | 必要な場合だけ表示する桁                                                 |
| `?`            | `#` と同じ（空白での桁揃えは表せないため）                               |
| `,`            | 後ろに整数部の桁が続く場合は桁区切り。それ以外（小数部、末尾）は無視する |
| `.`            | 小数点。2つ目以降は無視する                                              |
| `"..."`        | 固定の文字列（閉じていない `"` は末尾までを囲んだものとして扱う）        |
| `\x`           | 1文字の固定の文字列                                                      |
| `[$¥-411]`     | 通貨記号（`¥`）を固定の文字列にする                                      |
| `_x`           | `x` の幅の空白。空白1つにする                                            |
| 上記以外の文字 | 固定の文字列                                                             |

固定の文字列は数値の前なら `prefix`、後なら `suffix` になります。数値の間にある固定の文字列（`000"-"0000` の `-`）は表せないため無視します。

次の要素には対応しません。

| 要素                                             | 扱い                                                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `;` で区切ったセクション（負の数・0 などの書式） | 最初のセクションだけを使う                                                                         |
| `*x`（`x` で埋める）                             | 無視する                                                                                           |
| `[Red]` などの色、`[>100]` などの条件            | 無視する                                                                                           |
| `%`（100 倍）、末尾の `,`（1000 で割る）         | 値を変えないため、`%` は固定の文字列として扱い、末尾の `,` は無視する                              |
| `E+00`（指数表記）                               | 正しく整形されない（`E+` は数値の間の固定の文字列として無視され、後ろの `0` は桁として数えられる） |
| `#.00` で整数部の `0` を表示しない               | `Intl.NumberFormat` の制約により、整数部は常に1桁以上表示する                                      |
| 日付・時刻、`@`、`General`、分数                 | 数値の書式ではないため対象外                                                                       |

```ts
const { prefix, suffix, ...options } =
  createNumberFormatOptions('"¥"#,##0.0#"円"');
// options: {
//   minimumIntegerDigits: 1,
//   minimumFractionDigits: 1,
//   maximumFractionDigits: 2,
//   useGrouping: true,
// }
// prefix: '¥', suffix: '円'
```

| プロパティ              | 型        | 説明                                                         |
| ----------------------- | --------- | ------------------------------------------------------------ |
| `minimumIntegerDigits`  | `number`  | 整数部の最小桁数。整数部の `0` の数（1 以上、21 以下）       |
| `minimumFractionDigits` | `number`  | 小数部の最小桁数。小数部の `0` の数（20 以下）               |
| `maximumFractionDigits` | `number`  | 小数部の最大桁数。小数部の `0` と `#` の数（20 以下）        |
| `useGrouping`           | `boolean` | 整数部に桁区切りがあるか                                     |
| `prefix`                | `string`  | 先頭の固定の文字列。`Intl.NumberFormat` では表せないため追加 |
| `suffix`                | `string`  | 末尾の固定の文字列。`Intl.NumberFormat` では表せないため追加 |

### `createNumberFormatter`

```ts
createNumberFormatter(format: string, locales?: Intl.LocalesArgument): (value: number | bigint | string) => string
```

書式の文字列に従って数値を整形する関数を返します。整形は `createNumberFormatOptions` の結果を使って `Intl.NumberFormat` で行い、`prefix` / `suffix` を付けます。負の数の符号は `prefix` の前に付け（`-¥1,234`）、丸めた結果が `0` になる負の数には符号を付けません。

文字列の値は、対応するブラウザーでは精度を保ったまま整形し、それ以外のブラウザーでは数値に変換して整形します。

```ts
const format = createNumberFormatter('"¥"#,##0"円"');
format(1234); // '¥1,234円'
format(-1234); // '-¥1,234円'
createNumberFormatter('#,##0.00', 'de-DE')(1234.5); // '1.234,50'
```

| 引数       | 型                     | 説明                                                                                           |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| `format`   | `string`               | 書式の文字列                                                                                   |
| `locales?` | `Intl.LocalesArgument` | `Intl.NumberFormat` に渡すロケール。デフォルトは書式の `,` と `.` がそのまま使われる `'en-US'` |

### `createNumberParser`

```ts
createNumberParser(format: string, locales?: Intl.LocalesArgument): (text: string) => string
```

`createNumberFormatter` で整形した文字列を、`-1234.5` の形の数値の文字列に戻す関数を返します。書式の先頭・末尾の固定の文字列とロケールの桁区切りを取り除き、小数点を `.` にします。符号は先頭の固定の文字列の前・後のどちらにあってもかまいません。

数値として正しい形かどうかの検証はしないので、必要に応じて `limitDecimal` と組み合わせてください。数字は ASCII の `0`〜`9` だけを扱います。

```ts
const parse = createNumberParser('"¥"#,##0.00"円"');
parse('¥1,234.50円'); // '1234.50'
parse('-¥1,234.50円'); // '-1234.50'
createNumberParser('#,##0.00', 'de-DE')('1.234,50'); // '1234.50'
```

| 引数       | 型                     | 説明                                                           |
| ---------- | ---------------------- | -------------------------------------------------------------- |
| `format`   | `string`               | 書式の文字列。`createNumberFormatter` に渡したものと同じ       |
| `locales?` | `Intl.LocalesArgument` | 桁区切りと小数点の記号を決めるロケール。デフォルトは `'en-US'` |

### `expandExponent`

```ts
expandExponent(value: number | string, options?: ExpandExponentOptions): string | null
```

指数表記の数値を、指数表記を使わない全桁の文字列にします。指数表記でない値も受け付け、余分な `0` を取り除いた形にします。

```ts
expandExponent(1e21); // '1000000000000000000000'（String(1e21) は '1e+21'）
expandExponent('1.5e-7'); // '0.00000015'
expandExponent('1.50'); // '1.5'
expandExponent('abc'); // ''
```

| オプション  | 型               | 説明                                                  |
| ----------- | ---------------- | ----------------------------------------------------- |
| `nanValue?` | `string \| null` | 値が数値として扱えない場合に返す値。デフォルトは `''` |

### `limitDecimal`

```ts
limitDecimal(value: number | string | null | undefined, options?: LimitDecimalOptions): string | null
```

入力欄の値などを10進数の文字列にし、小数点以下の桁数や最小値・最大値を制限します。指数表記にならない全桁の文字列を返します。条件に合わない場合は、オプションで指定した値（デフォルトは空文字）を返します。

文字列は、`interactive` が `false` の場合は `-123` や `1.5` のような完成した形だけを受け付けます。数値の `NaN` と `Infinity` は数値として扱えない値になります。`min` / `max` に数値として扱えない値を指定した場合は、制限なしとして扱います。

`interactive` が `true` の場合は、入力途中の `-`、`.`、`1.` なども受け付けます。範囲内の値は `1.0` や `007` のように入力された形のまま返し、`decimals` を超えた桁だけを切り捨てます。また、入力を続けると絶対値は大きくなる一方なので、正の値は最大値だけ、負の値は最小値だけを確認します（`min: 10` で `1` を入力した段階では範囲外にしません）。

```ts
limitDecimal('3.14159', { decimals: 2 }); // '3.14'（切り捨て）
limitDecimal('3.145', { decimals: 2, roundingMode: 'halfExpand' }); // '3.15'（四捨五入）
limitDecimal('999', { max: 100 }); // ''
limitDecimal('999', { max: 100, clampToMax: true }); // '100'
limitDecimal('abc'); // ''
limitDecimal('1.', { interactive: true }); // '1.'
limitDecimal('1.0', { interactive: true }); // '1.0'
limitDecimal('007', { interactive: true, trimLeadingZeros: true }); // '7'
limitDecimal(1e21); // '1000000000000000000000'
```

| オプション          | 型                 | 説明                                                                                                                                            |
| ------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `decimals?`         | `number`           | 小数点以下の桁数。超えた桁は `roundingMode` に従って丸める。デフォルトは制限なし                                                                |
| `roundingMode?`     | `RoundingMode`     | `decimals` を超えた桁の丸め方。`interactive` が `true` の場合は、入力途中の値が変わらないよう常に切り捨てる。デフォルトは `'trunc'`（切り捨て） |
| `min?`              | `number \| string` | 最小値。デフォルトは制限なし                                                                                                                    |
| `max?`              | `number \| string` | 最大値。デフォルトは制限なし                                                                                                                    |
| `clampToMin?`       | `boolean`          | `true` の場合、最小値を下回ったときは最小値を返す。最小値が `decimals` の桁数を超える場合は、範囲内に収まるよう切り上げる                       |
| `clampToMax?`       | `boolean`          | `true` の場合、最大値を上回ったときは最大値を返す。最大値が `decimals` の桁数を超える場合は、範囲内に収まるよう切り捨てる                       |
| `interactive?`      | `boolean`          | `true` の場合、入力途中の値（`-`、`.`、`1.` など）を受け付ける。デフォルトは `false`                                                            |
| `trimLeadingZeros?` | `boolean`          | `interactive` が `true` の場合に、先頭の余分なゼロを取り除く（`007` → `7`）。デフォルトは `false`                                               |
| `emptyValue?`       | `string \| null`   | 値が空文字・`null`・`undefined` の場合に返す値。デフォルトは `''`                                                                               |
| `nanValue?`         | `string \| null`   | 値が数値として扱えない場合に返す値。デフォルトは `''`                                                                                           |
| `outOfRangeValue?`  | `string \| null`   | 値が最小値〜最大値の範囲外の場合に返す値。デフォルトは `''`                                                                                     |

### `normalizeNumericString`

```ts
normalizeNumericString(value: string): string
```

数値を表す文字列を、`limitDecimal` などが受け付ける形にそろえます。日本語入力などで入力された文字列を、`limitDecimal` に渡す前に整えるのに使えます。数値として正しい形かどうかの検証はしません。

- 全角の数字を半角にする
- マイナス記号として使われる文字（`－` `−` `ー` `ｰ` `‐` など）を `-` にする
- 小数点として使われる文字（`．` `。` `｡`）を `.` にする
- 桁区切り（`,` `，` `、`）と空白（全角を含む）を取り除く
- 先頭の `+` / `＋` を取り除く

```ts
normalizeNumericString('－１，２３４．５'); // '-1234.5'
normalizeNumericString('１。'); // '1.'
limitDecimal(normalizeNumericString(input), { interactive: true });
```

### `toFixedDecimals`

```ts
toFixedDecimals(value: number | string, decimals: number, options?: ToFixedDecimalsOptions): string | null
```

小数点以下の桁数をそろえた文字列にします。`Number.prototype.toFixed` と同様に、足りない桁は `0` で埋め、超えた桁は丸めます。値を文字列のまま扱うので、精度が落ちず、指数表記にもなりません。

```ts
toFixedDecimals('1.5', 2); // '1.50'
toFixedDecimals('1.005', 2); // '1.01'（(1.005).toFixed(2) は '1.00'）
toFixedDecimals('1.239', 2, { roundingMode: 'trunc' }); // '1.23'
```

| 引数       | 型                       | 説明                                                                |
| ---------- | ------------------------ | ------------------------------------------------------------------- |
| `value`    | `number \| string`       | 値                                                                  |
| `decimals` | `number`                 | 小数点以下の桁数。0 以上の整数でない場合は、切り捨てて 0 以上にする |
| `options?` | `ToFixedDecimalsOptions` | 下記のオプション                                                    |

| オプション      | 型               | 説明                                                      |
| --------------- | ---------------- | --------------------------------------------------------- |
| `roundingMode?` | `RoundingMode`   | 超えた桁の丸め方。デフォルトは `'halfExpand'`（四捨五入） |
| `nanValue?`     | `string \| null` | 値が数値として扱えない場合に返す値。デフォルトは `''`     |

### 型

| 型                       | 説明                                                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NumberFormatOptions`    | `createNumberFormatOptions` の戻り値                                                                                                                                                                                     |
| `ExpandExponentOptions`  | `expandExponent` のオプション                                                                                                                                                                                            |
| `LimitDecimalOptions`    | `limitDecimal` のオプション                                                                                                                                                                                              |
| `RoundingMode`           | 丸め方。`Intl.NumberFormat` の `roundingMode` と同じ名前で、`'trunc'`（切り捨て）・`'expand'`（切り上げ）・`'floor'`（負の無限大方向）・`'ceil'`（正の無限大方向）・`'halfExpand'`（四捨五入）・`'halfEven'`（銀行丸め） |
| `ToFixedDecimalsOptions` | `toFixedDecimals` のオプション                                                                                                                                                                                           |

## ライセンス

MIT
