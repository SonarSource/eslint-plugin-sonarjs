# no-inverted-boolean-check

🚫 This rule is _disabled_ in the ✅ `recommended` config.

🔧💡 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) and manually fixable by [editor suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

<!-- end auto-generated rule header -->

It is needlessly complex to invert the result of a boolean comparison. The opposite comparison should be made instead.

## Noncompliant Code Example

```javascript
if (!(a === 2)) { ... }  // Noncompliant
```

## Compliant Solution

```javascript
if (a !== 2) { ... }
```
