# no-same-line-conditional

:wrench: _fixable_

Code is clearest when each statement has its own line. Nonetheless, it is a common pattern to combine on the same line an `if` and its resulting _then_ statement. However, when an `if` is placed on the same line as the closing `}` from a preceding _then_, _else_ or _else if_ part, it is either an error - `else` is missing - or the invitation to a future error as maintainers fail to understand that the two statements are unconnected.

## Noncompliant Code Example

```javascript
if (condition1) {
  // ...
} if (condition2) { // Noncompliant
  //...
}
```

## Compliant Solution

```javascript
if (condition1) {
  // ...
} else if (condition2) {
  //...
}
```

Or

```javascript
if (condition1) {
  // ...
}

if (condition2) {
  //...
}
```
