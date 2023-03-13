# no-identical-conditions

A chain of `if-else-if` and `switch-case` statements is evaluated from top to bottom. At most, only
one branch will be executed: the first one with a condition that evaluates to `true` or that matches the discriminant of the `switch`.

Therefore, duplicating a condition automatically leads to dead code. Usually, this is due to a
copy/paste error. At best, it's simply dead code and at worst, it's a bug that is likely to induce
further bugs as the code is maintained, and obviously it could lead to unexpected behavior.

## Noncompliant Code Example

```javascript
if (param == 1) {
  openWindow();
} else if (param == 2) {
  closeWindow();
} else if (param == 1) { // Noncompliant
  moveWindowToTheBackground();
}

switch (param) {
  case 1:
    openWindow();
    break;
  case 2:
    closeWindow();
    break;
  case 1: // Noncompliant
    moveWindowToTheBackground();
    break;
}
```

## Compliant Solution

```javascript
if (param == 1)
  openWindow();
else if (param == 2)
  closeWindow();
else if (param == 3)
  moveWindowToTheBackground();

switch (param) {
  case 1:
    openWindow();
    break;
  case 2:
    closeWindow();
    break;
  case 3:
    moveWindowToTheBackground();
    break;
}
```
