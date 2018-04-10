# no-extra-arguments

You can easily call a JavaScript function with more arguments than the function needs, but the extra arguments will be just ignored by function execution.

## Noncompliant Code Example

```javascript
function say(a, b) {
  print(a + " " + b);
}

say("hello", "world", "!"); // Noncompliant; last argument is not used
```

## Exceptions

No issue is reported when `arguments` is used in the body of the function being called.

```javascript
function doSomething(a, b) {
  compute(arguments);
}

doSomething(1, 2, 3); // Compliant
```
