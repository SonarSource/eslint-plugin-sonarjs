# no-identical-expressions

Using the same value on either side of a binary operator is almost always a mistake. In the case 
of logical operators, it is either a copy/paste error and therefore a bug, or it is simply wasted 
code, and should be simplified. In the case of bitwise operators and most binary mathematical 
operators, having the same value on both sides of an operator yields predictable results, and 
should be simplified.

This rule ignores `*`, `+`, and `=`.

## Noncompliant Code Example

```javascript
if (a == b && a == b) { // if the first one is true, the second one is too
  doX();
}
if (a > a) { // always false
  doW();
}

var j = 5 / 5; //always 1
var k = 5 - 5; //always 0
```

## Exceptions

The specific case of testing one variable against itself is a valid test for `NaN` and is therefore ignored.

Similarly, left-shifting 1 onto 1 is common in the construction of bit masks, and is ignored.

Moreover comma operator , and `instanceof` operator are ignored as there are use-cases when there usage is valid.

```javascript
if (f !== f) { // test for NaN value
  console.log("f is NaN");
}

var i = 1 << 1; // Compliant
var j = a << a; // Noncompliant
```