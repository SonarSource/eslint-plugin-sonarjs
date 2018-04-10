# no-one-iteration-loop

A loop with at most one iteration is equivalent to the use of an `if` statement to conditionally execute one piece of code. No developer expects to find such a use of a loop statement. If the initial intention of the author was really to conditionally execute one piece of code, an `if` statement should be used instead.
 
At worst that was not the initial intention of the author and so the body of the loop should be fixed to use the nested `return`, `break` or `throw` statements in a more appropriate way.

## Noncompliant Code Example

```javascript
for (int i = 0; i < 10; i++) { // noncompliant, loop only executes once
  console.log("i is " + i);
  break;
}
...
for (int i = 0; i < 10; i++) { // noncompliant, loop only executes once
  if (i == x) {
    break;
  } else {
    console.log("i is " + i);
    return;
  }
}
```

## Compliant Solution

```javascript
for (int i = 0; i < 10; i++) {
  console.log("i is " + i);
}
...
for (int i = 0; i < 10; i++) {
  if (i == x) {
    break;
  } else {
    console.log("i is " + i);
  }
}
```