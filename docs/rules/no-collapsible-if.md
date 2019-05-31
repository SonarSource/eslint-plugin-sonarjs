# no-collapsible-if

Merging collapsible if statements increases the code's readability.

## Noncompliant Code Example

```javascript
if (x != undefined) {
  if (y === 2) {
    // ...
  }
}
```

## Compliant Solution

```javascript
if (x != undefined && y === 2) {
  // ...
}
```
