# elseif-without-else

This rule applies whenever an `if` statement is followed by one or more `else if` statements; the final `else if` should be followed by an `else` statement.

The requirement for a final `else` statement is defensive programming.

The `else` statement should either take appropriate action or contain a suitable comment as to why no action is taken. This is consistent with the requirement to have a final `default` clause in a `switch` statement.

## Noncompliant Code Example

```javascript
if (x == 0) {
  doSomething();
} else if (x == 1) {
  doSomethingElse();
}
```
## Compliant Solution

```javascript
if (x == 0) {
  doSomething();
} else if (x == 1) {
  doSomethingElse();
} else {
  throw "Unexpected value for x";
}
```

## See

<ul>
  <li> <a href="https://wiki.sei.cmu.edu/confluence/display/c/MSC01-C.+Strive+for+logical+completeness">CERT, MSC01-C.</a> - Strive for logical completeness </li>
  <li> <a href="https://wiki.sei.cmu.edu/confluence/display/java/MSC57-J.+Strive+for+logical+completeness">CERT, MSC57-J.</a> - Strive for logical completeness </li>
</ul>
