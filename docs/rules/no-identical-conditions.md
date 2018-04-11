# no-identical-conditions

A chain of `if`/`else if` statements is evaluated from top to bottom. At most, only
one branch will be executed: the first one with a condition that evaluates to `true`.

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
```
