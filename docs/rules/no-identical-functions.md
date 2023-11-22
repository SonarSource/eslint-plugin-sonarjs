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

## Configuration

This rule has a numeric option (defaulted to 3) to specify the minimum number of lines to trigger an issue. Lines between curly braces are taken into consideration.

```json
{
  "no-identical-functions": "error",
  "no-identical-functions": ["error", 5]
}
```
