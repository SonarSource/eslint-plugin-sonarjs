# prefer-single-boolean-return

:wrench: *fixable*

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
