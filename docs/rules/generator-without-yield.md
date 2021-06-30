# generator-without-yield

A generator without a `yield` statement is at best confusing, and at worst a bug in your code, since the iterator produced by your code will always be empty.

## Noncompliant Code Example

```javascript
function* myGen(a, b) {  // Noncompliant
  let answer = 0;
  answer += a * b;
}
```

## Compliant Solution

```javascript
function* myGen(a, b) {
  let answer = 0;
  while (answer < 42) {
    answer += a * b;
    yield answer;
  }
}
```
