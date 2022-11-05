# no-collapsible-if

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

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
