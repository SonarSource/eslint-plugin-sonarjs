# no-duplicated-branches

Having two `case`s in a `switch` statement or two branches in an `if` chain with the same implementation is at best
duplicate code, and at worst a coding error. If the same logic is truly needed for both instances, then in an `if`
chain they should be combined, or for a `switch`, one should fall through to the other.

## Noncompliant Code Example

```javascript
switch (i) {
  case 1:
    doFirstThing();
    doSomething();
    break;
  case 2:
    doSomethingDifferent();
    break;
  case 3: // Noncompliant; duplicates case 1's implementation
    doFirstThing();
    doSomething();
    break;
  default:
    doTheRest();
}

if (a >= 0 && a < 10) {
  doFirstThing();
  doTheThing();
} else if (a >= 10 && a < 20) {
  doTheOtherThing();
} else if (a >= 20 && a < 50) {
  // Noncompliant; duplicates first condition
  doFirstThing();
  doTheThing();
} else {
  doTheRest();
}
```

## Compliant Solution

```javascript
switch (i) {
  case 1:
  case 3:
    doFirstThing();
    doSomething();
    break;
  case 2:
    doSomethingDifferent();
    break;
  default:
    doTheRest();
}

if ((a >= 0 && a < 10) || (a >= 20 && a < 50)) {
  doFirstThing();
  doTheThing();
} else if (a >= 10 && a < 20) {
  doTheOtherThing();
} else {
  doTheRest();
}
```

or

```javascript
switch (i) {
  case 1:
    doFirstThing();
    doSomething();
    break;
  case 2:
    doSomethingDifferent();
    break;
  case 3:
    doFirstThing();
    doThirdThing();
    break;
  default:
    doTheRest();
}

if (a >= 0 && a < 10) {
  doFirstThing();
  doTheThing();
} else if (a >= 10 && a < 20) {
  doTheOtherThing();
} else if (a >= 20 && a < 50) {
  doFirstThing();
  doTheThirdThing();
} else {
  doTheRest();
}
```

## Exceptions

Blocks in an `if` chain that contain a single line of code are ignored, as are blocks in a `switch` statement that
contain a single line of code with or without a following break.
