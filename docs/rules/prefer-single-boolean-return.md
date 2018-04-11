# prefer-single-boolean-return

Return of boolean literal statements wrapped into `if-then-else` ones should be simplified.

## Noncompliant Code Example

```javascript
if (expression) {
  return true;
} else {
  return false;
}
```

## Compliant Solution

```javascript
return expression;
```
