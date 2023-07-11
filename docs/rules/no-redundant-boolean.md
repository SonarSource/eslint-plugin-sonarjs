# no-redundant-boolean

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

Redundant Boolean literals should be removed from expressions to improve readability.

## Noncompliant Code Example

```javascript
if (booleanMethod() == true) { /* ... */ }
if (booleanMethod() == false) { /* ... */ }
if (booleanMethod() || false) { /* ... */ }
doSomething(!false);
doSomething(booleanMethod() == true);
```

## Compliant Solution

```javascript
if (booleanMethod()) { /* ... */ }
if (!booleanMethod()) { /* ... */ }
if (booleanMethod()) { /* ... */ }
doSomething(true);
doSomething(booleanMethod());
```

