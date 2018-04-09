# no-identical-functions

When two functions have the same implementation, either it was a mistake - something else was intended - or the
duplication was intentional, but may be confusing to maintainers. In the latter case, the code should be refactored.

## Noncompliant Code Example

```javascript
function calculateCode() {
  doTheThing();
  doOtherThing();
  return code;
}

function getName() { // Noncompliant
  doTheThing();
  doOtherThing();
  return code;
}
```

## Compliant Solution

```javascript
function calculateCode() {
  doTheThing();
  doOtherThing();
  return code;
}
  
function getName() {
  return calculateCode();
}
```

## Exceptions

Functions with fewer than 3 lines are ignored.
