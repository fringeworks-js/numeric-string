# @fringeworks/number-input

`@fringeworks/number-input` is a library some will find handy, for limiting numeric input and analyzing number formats.

**[日本語のREADMEはこちら](./README.ja.md)**

## Installation

```bash
npm install @fringeworks/number-input
# or
pnpm add @fringeworks/number-input
```

## Usage

Functions, types, and constants can be imported by the same name from the root or from a per-function path. A per-function path also provides its function as the default export.

```ts
import { limitDecimal } from '@fringeworks/number-input';
import limitDecimal from '@fringeworks/number-input/limitDecimal';
```

### Data Last

Functions with `dataLast` take every argument except the data first and return a function that receives the data. This is useful in pipelines and as a callback for methods such as `Array.prototype.map`. Functions that have `dataLast` show it alongside their signatures.

```ts
const fn = limitPositiveNumber.dataLast({ negativeValue: 'abs' });
```

---

## API

| Function                               | Description                                                                |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `analyzeNumberFormat(format)`          | Analyzes a number format string                                            |
| `limitDecimal(value, options?)`        | Converts input to a decimal string and limits its decimal places and range |
| `limitNaturalNumber(value, options?)`  | Limits a value to a natural number (an integer of 1 or more)               |
| `limitPositiveNumber(value, options?)` | Limits a value to a positive number                                        |

### `analyzeNumberFormat`

```ts
analyzeNumberFormat(format: string | undefined): AnalyzeNumberFormatResult | undefined
```

Analyzes a number format string such as `#,##0.00` and returns information like the number of digits and whether a thousands separator is used. The format can use `0` and `#` (digits), `,` (thousands separator), `.` (decimal point), and fixed text enclosed in `"`. Returns `undefined` when `format` is `null` or `undefined`.

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

| Property                | Type                  | Description                                                     |
| ----------------------- | --------------------- | --------------------------------------------------------------- |
| `integerPattern`        | `NumberFormatPattern` | The pattern of the integer part (reversed, from the last digit) |
| `integerDigits`         | `number`              | The number of digits (`0` and `#`) in the integer part          |
| `decimalPattern`        | `NumberFormatPattern` | The pattern of the decimal part                                 |
| `decimalDigits`         | `number`              | The number of digits (`0` and `#`) in the decimal part          |
| `hasDecimalPoint`       | `boolean`             | Whether the format has a decimal point                          |
| `hasThousandsSeparator` | `boolean`             | Whether the integer part has a thousands separator              |
| `prefix?`               | `string`              | The fixed text at the start                                     |
| `suffix?`               | `string`              | The fixed text at the end                                       |

### `limitDecimal`

```ts
limitDecimal(value: number | string | null | undefined, options?: LimitDecimalOptions): string | null
```

Converts a value such as form input to a decimal string and limits its decimal places and its minimum and maximum. Returns the full digits without exponent notation. When the value does not meet the conditions, returns the value set in the options (an empty string by default). A number given as a return value is returned as a string.

When `interactive` is `false`, only complete numbers such as `-123` or `1.5` are accepted. When `interactive` is `true`, values still being typed such as `-` and `1.` are also accepted and returned as is.

```ts
limitDecimal('3.14159', { decimals: 2 }); // '3.14' (truncated)
limitDecimal('999', { max: 100 }); // ''
limitDecimal('999', { max: 100, clampToMax: true }); // '100'
limitDecimal('abc'); // ''
limitDecimal('1.', { interactive: true }); // '1.'
limitDecimal(1e21); // '1000000000000000000000'
```

| Option             | Type                       | Description                                                                              |
| ------------------ | -------------------------- | ---------------------------------------------------------------------------------------- |
| `decimals?`        | `number`                   | The number of decimal places. Extra digits are truncated. Unlimited by default           |
| `min?`             | `number \| string`         | The minimum. Unlimited by default                                                        |
| `max?`             | `number \| string`         | The maximum. Unlimited by default                                                        |
| `clampToMin?`      | `boolean`                  | If `true`, returns the minimum when the value is below it                                |
| `clampToMax?`      | `boolean`                  | If `true`, returns the maximum when the value is above it                                |
| `interactive?`     | `boolean`                  | If `true`, accepts values still being typed (`-`, `.`, `1.`, ...). Defaults to `false`   |
| `emptyValue?`      | `number \| string \| null` | The value returned for an empty string, `null`, or `undefined`. Defaults to `''`         |
| `nanValue?`        | `number \| string \| null` | The value returned when the input cannot be treated as a number. Defaults to `''`        |
| `outOfRangeValue?` | `number \| string \| null` | The value returned when the input is outside the minimum–maximum range. Defaults to `''` |

### `limitNaturalNumber`

```ts
limitNaturalNumber(value: number | null | undefined, options?: LimitNaturalNumberOptions): number | null | undefined
```

Converts a value to a natural number (an integer of 1 or more). Decimals are truncated, and `zeroValue` is returned when the result is `0`. The other options are the same as `limitPositiveNumber`.

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

Limits a value to a positive number (greater than 0). Positive numbers are returned as is; otherwise the value set in the options is returned.

```ts
limitPositiveNumber(1.5); // 1.5
limitPositiveNumber(-1); // null
limitPositiveNumber(-1, { negativeValue: 'abs' }); // 1
limitPositiveNumber(0, { zeroValue: 0 }); // 0
```

| Option           | Type                                   | Description                                                                                      |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `negativeValue?` | `number \| null \| undefined \| 'abs'` | The value returned for a negative number. `'abs'` returns the absolute value. Defaults to `null` |
| `zeroValue?`     | `number \| null \| undefined`          | The value returned for `0`. Defaults to `null`                                                   |
| `nanValue?`      | `number \| null \| undefined`          | The value returned for `NaN`. Defaults to `null`                                                 |
| `defaultValue?`  | `number`                               | The value returned for `null` or `undefined`. The value is returned as is by default             |

### Types

| Type                         | Description                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `AnalyzeNumberFormatResult`  | The return value of `analyzeNumberFormat`                                           |
| `NumberFormatPattern`        | A format pattern. Digits and symbols are strings; fixed text is a one-element array |
| `LimitDecimalOptions`        | Options for `limitDecimal`                                                          |
| `LimitPositiveNumberOptions` | Options for `limitPositiveNumber`                                                   |
| `LimitNaturalNumberOptions`  | Same as `LimitPositiveNumberOptions`                                                |

## License

MIT
