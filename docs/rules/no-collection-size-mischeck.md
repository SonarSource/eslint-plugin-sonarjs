# no-collection-size-mischeck

:wrench: *fixable*

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

## Note

The rule behaves differently depending on which parser is used. With the default parser, the rule performs syntactic analysis and considers only the property of the target object. With `typescript-eslint/parser`, and if correctly configured, the rule relies on type information and checks also that the target object is indeed a collection to avoid false-positives.
