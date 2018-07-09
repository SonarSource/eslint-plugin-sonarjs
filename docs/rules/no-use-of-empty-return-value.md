# no-use-of-empty-return-value

If a function does not return anything, it makes no sense to use its output. Specifically, passing it to another function, or assigning its "result" to a variable is probably a bug because such functions return `undefined`, which is probably not what was intended.

## Noncompliant Code Example

```javascript
function foo() {
  console.log("Hello, World!");
}

a = foo();
```

## Compliant Solution

```javascript
function foo() {
  console.log("Hello, World!");
}

foo();
```
