# no-empty-collection

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

When a collection is empty it makes no sense to access or iterate it. Doing so anyway is surely an error; either population was accidentally omitted or the developer doesn’t understand the situation.

## Noncompliant Code Example

```javascript
let strings = [];

if (strings.includes("foo")) {}  // Noncompliant

for (str of strings) {}  // Noncompliant

strings.forEach(str => doSomething(str)); // Noncompliant
```
