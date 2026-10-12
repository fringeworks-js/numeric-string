# @fringeworks/numeric-string

`@fringeworks/numeric-string` is a library some will find handy, for normalizing, limiting, and formatting numeric strings without losing precision.

**[日本語のREADMEはこちら](./README.ja.md)**

## Installation

```bash
npm install @fringeworks/numeric-string
# or
pnpm add @fringeworks/numeric-string
```

## Usage

Functions, types, and constants can be imported by the same name from the root or from a per-function path. A per-function path also provides its function as the default export.

```ts
import { limitDecimal } from '@fringeworks/numeric-string';
import limitDecimal from '@fringeworks/numeric-string/limitDecimal';
```

---

## API

| Function                                     | Description                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `createNumberFormatOptions(format)`          | Converts an Excel number format to options for `Intl.NumberFormat`                               |
| `createNumberFormatter(format, locales?)`    | Returns a function that formats numbers according to a format string                             |
| `createNumberParser(format, locales?)`       | Returns a function that converts a formatted string back to a numeric string                     |
| `expandExponent(value, options?)`            | Converts a number in exponent notation to a string with all digits                               |
| `limitDecimal(value, options?)`              | Converts input to a decimal string and limits its decimal places and range                       |
| `normalizeNumericString(value)`              | Normalizes full-width characters and symbols into the form accepted by `limitDecimal` and others |
| `toFixedDecimals(value, decimals, options?)` | Returns a string with a fixed number of decimal places                                           |

### `createNumberFormatOptions`

```ts
createNumberFormatOptions(format: string): NumberFormatOptions
```

Converts an Excel number format such as `#,##0.00` to options for `Intl.NumberFormat`. Fixed text at the start and end, which `Intl.NumberFormat` cannot express, is returned as `prefix` and `suffix`. Since `Intl.NumberFormat` ignores unknown properties, the return value can be passed as is.

It does not fully reproduce Excel number formats. It only formats strings and does not support elements that change the value (multiplying by 100 with `%`, or dividing by 1,000 with a trailing `,`). Convert the value before formatting if needed.

The supported elements are as follows.

| Element              | Handling                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| `0`                  | A digit always shown                                                                                         |
| `#`                  | A digit shown only when needed                                                                               |
| `?`                  | Same as `#` (padding with spaces cannot be expressed)                                                        |
| `,`                  | A thousands separator when followed by integer digits. Otherwise (in the decimal part or at the end) ignored |
| `.`                  | The decimal point. The second and later ones are ignored                                                     |
| `"..."`              | Fixed text (an unclosed `"` encloses everything up to the end)                                               |
| `\x`                 | A single character of fixed text                                                                             |
| `[$¥-411]`           | The currency symbol (`¥`) becomes fixed text                                                                 |
| `_x`                 | A space as wide as `x`. Becomes a single space                                                               |
| Any other characters | Fixed text                                                                                                   |

Fixed text before the digits becomes `prefix`, and fixed text after them becomes `suffix`. Fixed text between digits (the `-` in `000"-"0000`) cannot be expressed and is ignored.

The following elements are not supported.

| Element                                                                   | Handling                                                                                                             |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Sections separated by `;` (formats for negative numbers, zero, and so on) | Only the first section is used                                                                                       |
| `*x` (fill with `x`)                                                      | Ignored                                                                                                              |
| Colors such as `[Red]` and conditions such as `[>100]`                    | Ignored                                                                                                              |
| `%` (multiply by 100), a trailing `,` (divide by 1,000)                   | The value is not changed; `%` is treated as fixed text and a trailing `,` is ignored                                 |
| `E+00` (scientific notation)                                              | Not formatted correctly (`E+` is ignored as fixed text between digits, and the following `0`s are counted as digits) |
| Omitting the integer `0` as in `#.00`                                     | Due to a limitation of `Intl.NumberFormat`, at least one integer digit is always shown                               |
| Dates and times, `@`, `General`, fractions                                | Out of scope because they are not number formats                                                                     |

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

| Property                | Type      | Description                                                                                     |
| ----------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| `minimumIntegerDigits`  | `number`  | The minimum number of integer digits: the number of `0` in the integer part (1 to 21)           |
| `minimumFractionDigits` | `number`  | The minimum number of fraction digits: the number of `0` in the decimal part (up to 20)         |
| `maximumFractionDigits` | `number`  | The maximum number of fraction digits: the number of `0` and `#` in the decimal part (up to 20) |
| `useGrouping`           | `boolean` | Whether the integer part has a thousands separator                                              |
| `prefix`                | `string`  | The fixed text at the start. Added because `Intl.NumberFormat` cannot express it                |
| `suffix`                | `string`  | The fixed text at the end. Added because `Intl.NumberFormat` cannot express it                  |

### `createNumberFormatter`

```ts
createNumberFormatter(format: string, locales?: Intl.LocalesArgument): (value: number | bigint | string) => string
```

Returns a function that formats numbers according to a format string. Formatting is done by `Intl.NumberFormat` with the result of `createNumberFormatOptions`, and `prefix` and `suffix` are added. The minus sign of a negative number is placed before `prefix` (`-¥1,234`), and no sign is added to a negative number that rounds to `0`.

String values are formatted without losing precision in browsers that support it, and are converted to numbers in other browsers.

```ts
const format = createNumberFormatter('"¥"#,##0"円"');
format(1234); // '¥1,234円'
format(-1234); // '-¥1,234円'
createNumberFormatter('#,##0.00', 'de-DE')(1234.5); // '1.234,50'
```

| Parameter  | Type                   | Description                                                                                                      |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `format`   | `string`               | The format string                                                                                                |
| `locales?` | `Intl.LocalesArgument` | The locale passed to `Intl.NumberFormat`. Defaults to `'en-US'`, which uses the format's `,` and `.` as they are |

### `createNumberParser`

```ts
createNumberParser(format: string, locales?: Intl.LocalesArgument): (text: string) => string
```

Returns a function that converts a string formatted by `createNumberFormatter` back to a numeric string such as `-1234.5`. It removes the fixed text at the start and end of the format and the locale's thousands separators, and replaces the decimal separator with `.`. The sign may come before or after the fixed text at the start.

It does not validate that the result is a valid number; combine it with `limitDecimal` if needed. Only the ASCII digits `0`–`9` are handled.

```ts
const parse = createNumberParser('"¥"#,##0.00"円"');
parse('¥1,234.50円'); // '1234.50'
parse('-¥1,234.50円'); // '-1234.50'
createNumberParser('#,##0.00', 'de-DE')('1.234,50'); // '1234.50'
```

| Parameter  | Type                   | Description                                                             |
| ---------- | ---------------------- | ----------------------------------------------------------------------- |
| `format`   | `string`               | The format string. The same one passed to `createNumberFormatter`       |
| `locales?` | `Intl.LocalesArgument` | The locale that determines the separator symbols. Defaults to `'en-US'` |

### `expandExponent`

```ts
expandExponent(value: number | string, options?: ExpandExponentOptions): string | null
```

Converts a number in exponent notation to a string with all digits and no exponent. Values without an exponent are also accepted and returned without extra zeros.

```ts
expandExponent(1e21); // '1000000000000000000000' (String(1e21) is '1e+21')
expandExponent('1.5e-7'); // '0.00000015'
expandExponent('1.50'); // '1.5'
expandExponent('abc'); // ''
```

| Option      | Type             | Description                                                                       |
| ----------- | ---------------- | --------------------------------------------------------------------------------- |
| `nanValue?` | `string \| null` | The value returned when the input cannot be treated as a number. Defaults to `''` |

### `limitDecimal`

```ts
limitDecimal(value: number | string | null | undefined, options?: LimitDecimalOptions): string | null
```

Converts a value such as form input to a decimal string and limits its decimal places and its minimum and maximum. Returns the full digits without exponent notation. When the value does not meet the conditions, returns the value set in the options (an empty string by default).

When `interactive` is `false`, only complete numbers such as `-123` or `1.5` are accepted. The numbers `NaN` and `Infinity` are treated as values that cannot be treated as numbers. When `min` or `max` cannot be treated as a number, it is treated as unlimited.

When `interactive` is `true`, values still being typed such as `-`, `.`, and `1.` are also accepted. Values in range are returned as typed, such as `1.0` or `007`, with only the digits beyond `decimals` truncated. Since typing more digits only makes the absolute value larger, only the maximum is checked for positive values and only the minimum for negative values (with `min: 10`, typing `1` is not treated as out of range).

```ts
limitDecimal('3.14159', { decimals: 2 }); // '3.14' (truncated)
limitDecimal('3.145', { decimals: 2, roundingMode: 'halfExpand' }); // '3.15' (rounded half away from zero)
limitDecimal('999', { max: 100 }); // ''
limitDecimal('999', { max: 100, clampToMax: true }); // '100'
limitDecimal('abc'); // ''
limitDecimal('1.', { interactive: true }); // '1.'
limitDecimal('1.0', { interactive: true }); // '1.0'
limitDecimal('007', { interactive: true, trimLeadingZeros: true }); // '7'
limitDecimal(1e21); // '1000000000000000000000'
```

| Option              | Type               | Description                                                                                                                                                                 |
| ------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `decimals?`         | `number`           | The number of decimal places. Extra digits are rounded according to `roundingMode`. Unlimited by default                                                                    |
| `roundingMode?`     | `RoundingMode`     | How to round digits beyond `decimals`. When `interactive` is `true`, values are always truncated so that values being typed do not change. Defaults to `'trunc'` (truncate) |
| `min?`              | `number \| string` | The minimum. Unlimited by default                                                                                                                                           |
| `max?`              | `number \| string` | The maximum. Unlimited by default                                                                                                                                           |
| `clampToMin?`       | `boolean`          | If `true`, returns the minimum when the value is below it. A minimum with more decimal places than `decimals` is rounded up to stay in range                                |
| `clampToMax?`       | `boolean`          | If `true`, returns the maximum when the value is above it. A maximum with more decimal places than `decimals` is rounded down to stay in range                              |
| `interactive?`      | `boolean`          | If `true`, accepts values still being typed (`-`, `.`, `1.`, ...). Defaults to `false`                                                                                      |
| `trimLeadingZeros?` | `boolean`          | When `interactive` is `true`, removes extra leading zeros (`007` → `7`). Defaults to `false`                                                                                |
| `emptyValue?`       | `string \| null`   | The value returned for an empty string, `null`, or `undefined`. Defaults to `''`                                                                                            |
| `nanValue?`         | `string \| null`   | The value returned when the input cannot be treated as a number. Defaults to `''`                                                                                           |
| `outOfRangeValue?`  | `string \| null`   | The value returned when the input is outside the minimum–maximum range. Defaults to `''`                                                                                    |

### `normalizeNumericString`

```ts
normalizeNumericString(value: string): string
```

Normalizes a numeric string into the form accepted by `limitDecimal` and others. Useful for cleaning up text typed with a Japanese input method before passing it to `limitDecimal`. It does not validate that the result is a valid number.

- Converts full-width digits to half-width
- Converts characters used as minus signs (`－` `−` `ー` `ｰ` `‐`, ...) to `-`
- Converts characters used as decimal points (`．` `。` `｡`) to `.`
- Removes thousands separators (`,` `，` `、`) and whitespace (including full-width)
- Removes a leading `+` / `＋`

```ts
normalizeNumericString('－１，２３４．５'); // '-1234.5'
normalizeNumericString('１。'); // '1.'
limitDecimal(normalizeNumericString(input), { interactive: true });
```

### `toFixedDecimals`

```ts
toFixedDecimals(value: number | string, decimals: number, options?: ToFixedDecimalsOptions): string | null
```

Returns a string with a fixed number of decimal places. Like `Number.prototype.toFixed`, missing digits are filled with `0` and extra digits are rounded. Because the value is handled as a string, no precision is lost and no exponent notation is used.

```ts
toFixedDecimals('1.5', 2); // '1.50'
toFixedDecimals('1.005', 2); // '1.01' ((1.005).toFixed(2) is '1.00')
toFixedDecimals('1.239', 2, { roundingMode: 'trunc' }); // '1.23'
```

| Parameter  | Type                     | Description                                                                                        |
| ---------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
| `value`    | `number \| string`       | The value                                                                                          |
| `decimals` | `number`                 | The number of decimal places. A value that is not a non-negative integer is truncated to 0 or more |
| `options?` | `ToFixedDecimalsOptions` | The options below                                                                                  |

| Option          | Type             | Description                                                                       |
| --------------- | ---------------- | --------------------------------------------------------------------------------- |
| `roundingMode?` | `RoundingMode`   | How to round extra digits. Defaults to `'halfExpand'` (round half away from zero) |
| `nanValue?`     | `string \| null` | The value returned when the input cannot be treated as a number. Defaults to `''` |

### Types

| Type                     | Description                                                                                                                                                                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NumberFormatOptions`    | The return value of `createNumberFormatOptions`                                                                                                                                                                                                                            |
| `ExpandExponentOptions`  | Options for `expandExponent`                                                                                                                                                                                                                                               |
| `LimitDecimalOptions`    | Options for `limitDecimal`                                                                                                                                                                                                                                                 |
| `RoundingMode`           | A rounding mode, named as in the `roundingMode` of `Intl.NumberFormat`: `'trunc'` (toward zero), `'expand'` (away from zero), `'floor'` (toward negative infinity), `'ceil'` (toward positive infinity), `'halfExpand'` (half away from zero), `'halfEven'` (half to even) |
| `ToFixedDecimalsOptions` | Options for `toFixedDecimals`                                                                                                                                                                                                                                              |

## License

MIT
