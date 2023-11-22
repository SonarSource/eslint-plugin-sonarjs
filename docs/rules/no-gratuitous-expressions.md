# no-gratuitous-expressions

If a boolean expression doesn’t change the evaluation of the condition, then it is entirely unnecessary, and can be removed. If it is gratuitous
because it does not match the programmer’s intent, then it’s a bug and the expression should be fixed.

## Noncompliant Code Example

```javascript
if (a) {
  if (a) { // Noncompliant
    doSomething();
  }
}
```

## Compliant Solution

```javascript
if (a) {
  if (b) {
    doSomething();
  }
}

// or
if (a) {
  doSomething();
}
```

## See

<ul>
  <li> <a href="http://cwe.mitre.org/data/definitions/571">MITRE, CWE-571</a> - Expression is Always True </li>
  <li> <a href="http://cwe.mitre.org/data/definitions/570">MITRE, CWE-570</a> - Expression is Always False </li>
</ul>
