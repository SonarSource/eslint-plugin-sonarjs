# no-redundant-jump

:wrench: *fixable*

Jump statements, such as `return`, `break` and `continue` let you change the default flow of program execution, but jump statements that direct the control flow to the original direction are just a waste of keystrokes.

## Noncompliant Code Example

```javascript
function redundantJump(x) {
  if (x == 1) {
    console.log("x == 1");
    return; // Noncompliant
  }
}
```

## Compliant Solution

```javascript
function redundantJump(x) {
  if (x == 1) {
    console.log("x == 1");
  }
}
```

## Exceptions

`break` and `return` inside switch statement are ignored, because they are often used for consistency. continue with label is also ignored, because label is usually used for clarity. Also a jump statement being a single statement in a block is ignored.
