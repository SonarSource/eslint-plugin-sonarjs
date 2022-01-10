# prefer-single-boolean-return

Return of boolean literal statements should be simplified.

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
