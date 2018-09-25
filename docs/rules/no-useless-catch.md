# no-useless-catch

A catch clause that only rethrows the caught exception has the same effect as omitting the catch altogether and letting it bubble up automatically, but with more code and the additional detriment of leaving maintainers scratching their heads.

Such clauses should either be eliminated or populated with the appropriate logic.

## Noncompliant Code Example

```javascript
try {
  doSomething();
} catch (ex) { // Noncompliant
  throw ex;
}
```

## Compliant Solution

```javascript
try {
  doSomething();
} catch (ex) {
  console.err(ex);
  throw ex;
}
```

or

```javascript
doSomething();
```
