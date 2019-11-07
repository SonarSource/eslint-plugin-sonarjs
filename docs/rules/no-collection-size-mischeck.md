# no-collection-size-mischeck

The size of a collection and the length of an array are always greater than or equal to zero. So testing that a size or length is greater than or equal to zero doesn't make sense, since the result is always `true`. Similarly testing that it is less than zero will always return `false`. Perhaps the intent was to check the non-emptiness of the collection or array instead.

## Noncompliant Code Example

```javascript
if (someSet.size >= 0) {...} // Noncompliant

if (someMap.size < 0) {...} // Noncompliant

const result = someArray.length >= 0;  // Noncompliant
```

## Compliant Solution

```javascript
if (someSet.size > 0) {...}

if (someMap.size == 0) {...}

const result = someArray.length > 0;
```
