# prefer-single-boolean-return

💼 This rule is enabled in the ✅ `recommended` config.

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

<!-- end auto-generated rule header -->

Return of boolean literal statements wrapped into `if-then-else` flow should be simplified.

## Noncompliant Code Example

```javascript
if (expression) {
  return true;
} else {
  return false;
}
```

or

```javascript
if (expression) {
  return true;
}
return false;
```

## Compliant Solution

```javascript
return expression;
```
