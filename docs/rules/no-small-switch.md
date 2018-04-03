# no-small-switch

`switch` statements are useful when there are many different cases depending on the value of the same expression.

For just one or two cases however, the code will be more readable with `if` statements.

## Noncompliant Code Example

```javascript
switch (variable) {
  case 0:
    doSomething();
    break;
  default:
    doSomethingElse();
    break;
}
```

## Compliant Solution

```javascript
if (variable == 0) {
  doSomething();
} else {
  doSomethingElse();
}
```

## See

<ul>
  <li> MISRA C:2004, 15.5 - Every switch statement shall have at least one case clause. </li>
  <li> MISRA C++:2008, 6-4-8 - Every switch statement shall have at least one case-clause. </li>
  <li> MISRA C:2012, 16.6 - Every switch statement shall have at least two switch-clauses </li>
</ul>
