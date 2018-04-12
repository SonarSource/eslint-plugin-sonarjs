# prefer-immediate-return

:wrench: *fixable*

Declaring a variable only to immediately return or throw it is a bad practice.

Some developers argue that the practice improves code readability, because it enables them to explicitly name what is being returned. However, this variable is an internal implementation detail that is not exposed to the callers of the method. The method name should be sufficient for callers to know exactly what will be returned.

## Noncompliant Code Example

```javascript
function ms(hours, minutes, seconds) {
  const duration = ((hours * 60 + minutes) * 60 + seconds) * 1000;
  return duration;
}
```

## Compliant Solution

```javascript
function ms(hours, minutes, seconds) {
  return ((hours * 60 + minutes) * 60 + seconds) * 1000;
}
```
