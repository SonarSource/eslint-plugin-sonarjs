# no-inverted-boolean-check

:wrench: *fixable*

It is needlessly complex to invert the result of a boolean comparison. The opposite comparison should be made instead.

## Noncompliant Code Example

```javascript
if (!(a === 2)) { ... }  // Noncompliant
```

## Compliant Solution

```javascript
if (a !== 2) { ... }
```
