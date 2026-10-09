# @fringeworks/number-input

`@fringeworks/number-input` は、数値の入力値の制限や、数値の書式の解析を行う、誰かにとっては便利なライブラリです。

**[English README is available here](./README.md)**

## インストール

```bash
npm install @fringeworks/number-input
# または
pnpm add @fringeworks/number-input
```

## 使い方

関数・型・定数は、ルートと関数単位のパスのどちらからでも同じ名前で import できます。関数単位のパスでは、その関数を default import することもできます。

```ts
import { limitDecimal } from '@fringeworks/number-input';
import limitDecimal from '@fringeworks/number-input/limitDecimal';
```

### Data Last

`dataLast` を持つ関数は、データ以外の引数を先に受け取り、データを受け取る関数を返します。パイプライン処理や、`Array.prototype.map` などのコールバックに渡す場合に使えます。`dataLast` を持つ関数は、シグネチャに `dataLast` を併記しています。

```ts
const fn = limitPositiveNumber.dataLast({ negativeValue: 'abs' });
```

---

## API

| 関数                                   | 説明                                             |
| -------------------------------------- | ------------------------------------------------ |
| `analyzeNumberFormat(format)`          | 数値の書式の文字列を解析する                     |
| `limitDecimal(value, options?)`        | 入力値を10進数の文字列にし、桁数や範囲を制限する |
| `limitNaturalNumber(value, options?)`  | 値を自然数（1 以上の整数）に制限する             |
| `limitPositiveNumber(value, options?)` | 値を正の数に制限する                             |

### `analyzeNumberFormat`

```ts
analyzeNumberFormat(format: string | undefined): AnalyzeNumberFormatResult | undefined
```

`#,##0.00` のような数値の書式の文字列を解析し、桁数や桁区切りの有無などを返します。書式では `0`・`#`（数字）、`,`（桁区切り）、`.`（小数点）と、`"` で囲んだ固定の文字列を使えます。`format` が `null` / `undefined` の場合は `undefined` を返します。

```ts
analyzeNumberFormat('"¥"#,##0.00"円"');
// {
//   integerPattern: ['0', '#', '#', ',', '#'],
//   integerDigits: 4,
//   decimalPattern: ['0', '0'],
//   decimalDigits: 2,
//   hasDecimalPoint: true,
//   hasThousandsSeparator: true,
//   prefix: '¥',
//   suffix: '円',
// }
```

| プロパティ              | 型                    | 説明                                       |
| ----------------------- | --------------------- | ------------------------------------------ |
| `integerPattern`        | `NumberFormatPattern` | 整数部のパターン（末尾の桁から並べた逆順） |
| `integerDigits`         | `number`              | 整数部の数字（`0`・`#`）の数               |
| `decimalPattern`        | `NumberFormatPattern` | 小数部のパターン                           |
| `decimalDigits`         | `number`              | 小数部の数字（`0`・`#`）の数               |
| `hasDecimalPoint`       | `boolean`             | 小数点があるか                             |
| `hasThousandsSeparator` | `boolean`             | 整数部に桁区切りがあるか                   |
| `prefix?`               | `string`              | 先頭の固定の文字列                         |
| `suffix?`               | `string`              | 末尾の固定の文字列                         |

### `limitDecimal`

```ts
limitDecimal(value: number | string | null | undefined, options?: LimitDecimalOptions): string | null
```

入力欄の値などを10進数の文字列にし、小数点以下の桁数や最小値・最大値を制限します。指数表記にならない全桁の文字列を返します。条件に合わない場合は、オプションで指定した値（デフォルトは空文字）を返します。返す値に数値を指定した場合は文字列にして返します。

文字列は、`interactive` が `false` の場合は `-123` や `1.5` のような完成した形だけを受け付けます。`interactive` が `true` の場合は、入力途中の `-` や `1.` も受け付けてそのまま返します。

```ts
limitDecimal('3.14159', { decimals: 2 }); // '3.14'（切り捨て）
limitDecimal('999', { max: 100 }); // ''
limitDecimal('999', { max: 100, clampToMax: true }); // '100'
limitDecimal('abc'); // ''
limitDecimal('1.', { interactive: true }); // '1.'
limitDecimal(1e21); // '1000000000000000000000'
```

| オプション         | 型                         | 説明                                                                                 |
| ------------------ | -------------------------- | ------------------------------------------------------------------------------------ |
| `decimals?`        | `number`                   | 小数点以下の桁数。超えた桁は切り捨てる。デフォルトは制限なし                         |
| `min?`             | `number \| string`         | 最小値。デフォルトは制限なし                                                         |
| `max?`             | `number \| string`         | 最大値。デフォルトは制限なし                                                         |
| `clampToMin?`      | `boolean`                  | `true` の場合、最小値を下回ったときは最小値を返す                                    |
| `clampToMax?`      | `boolean`                  | `true` の場合、最大値を上回ったときは最大値を返す                                    |
| `interactive?`     | `boolean`                  | `true` の場合、入力途中の値（`-`、`.`、`1.` など）を受け付ける。デフォルトは `false` |
| `emptyValue?`      | `number \| string \| null` | 値が空文字・`null`・`undefined` の場合に返す値。デフォルトは `''`                    |
| `nanValue?`        | `number \| string \| null` | 値が数値として扱えない場合に返す値。デフォルトは `''`                                |
| `outOfRangeValue?` | `number \| string \| null` | 値が最小値〜最大値の範囲外の場合に返す値。デフォルトは `''`                          |

### `limitNaturalNumber`

```ts
limitNaturalNumber(value: number | null | undefined, options?: LimitNaturalNumberOptions): number | null | undefined
```

値を自然数（1 以上の整数）にします。小数は切り捨てます。切り捨てた結果が `0` になる場合は `zeroValue` を返します。それ以外のオプションは `limitPositiveNumber` と同じです。

```ts
limitNaturalNumber(3.7); // 3
limitNaturalNumber(0.5); // null
limitNaturalNumber(0, { zeroValue: 0 }); // 0
limitNaturalNumber(-3.5, { negativeValue: 'abs' }); // 3
```

### `limitPositiveNumber`

```ts
limitPositiveNumber(value: number | null | undefined, options?: LimitPositiveNumberOptions): number | null | undefined
limitPositiveNumber.dataLast(options?: LimitPositiveNumberOptions): (value: number | null | undefined) => number | null | undefined
```

値を正の数（0 より大きい数）にします。正の数はそのまま返し、それ以外の場合はオプションで指定した値を返します。

```ts
limitPositiveNumber(1.5); // 1.5
limitPositiveNumber(-1); // null
limitPositiveNumber(-1, { negativeValue: 'abs' }); // 1
limitPositiveNumber(0, { zeroValue: 0 }); // 0
```

| オプション       | 型                                     | 説明                                                                        |
| ---------------- | -------------------------------------- | --------------------------------------------------------------------------- |
| `negativeValue?` | `number \| null \| undefined \| 'abs'` | 値が負の数の場合に返す値。`'abs'` の場合は絶対値を返す。デフォルトは `null` |
| `zeroValue?`     | `number \| null \| undefined`          | 値が `0` の場合に返す値。デフォルトは `null`                                |
| `nanValue?`      | `number \| null \| undefined`          | 値が `NaN` の場合に返す値。デフォルトは `null`                              |
| `defaultValue?`  | `number`                               | 値が `null` / `undefined` の場合に返す値。デフォルトは値をそのまま返す      |

### 型

| 型                           | 説明                                                                |
| ---------------------------- | ------------------------------------------------------------------- |
| `AnalyzeNumberFormatResult`  | `analyzeNumberFormat` の戻り値                                      |
| `NumberFormatPattern`        | 書式のパターン。数字・記号は文字列、固定の文字列は1要素の配列で表す |
| `LimitDecimalOptions`        | `limitDecimal` のオプション                                         |
| `LimitPositiveNumberOptions` | `limitPositiveNumber` のオプション                                  |
| `LimitNaturalNumberOptions`  | `LimitPositiveNumberOptions` と同じ                                 |

## ライセンス

MIT
