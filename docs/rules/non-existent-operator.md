# non-existent-operator

:wrench: *fixable*

The use of operators pairs (`=+`, `=-` or `=!`) where the reversed, single operator was meant (`+=`, `-=` or `!=`) will compile and run, but not produce the expected results.

This rule raises an issue when `=+`, `=-` and `=!` are used without any space between the two operators and when there is at least one whitespace after.

## Noncompliant Code Example

```javascript
let target =-5;
let num = 3;

target =- num;  // Noncompliant; target = -3. Is that really what's meant?
target =+ num; // Noncompliant; target = 3
```

## Compliant Solution

```javascript
let target = -5;
let num = 3;

target = -num;  // Compliant; intent to assign inverse value of num is clear
target += num;
```
