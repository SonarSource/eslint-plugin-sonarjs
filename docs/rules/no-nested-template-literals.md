# no-nested-template-literals

Template literals (previously named "template strings") are an elegant way to build a string without using the `+` operator to make strings concatenation more readable.

However, it’s possible to build complex string literals by nesting together multiple template literals, and therefore lose readability and maintainability.

In such situations, it’s preferable to move the nested template into a separate statement.

## Noncompliant Code Example

```javascript
let color = "red";
let count = 3;
let message = `I have ${color ? `${count} ${color}` : count} apples`; // Noncompliant; nested template strings not easy to read
```

## Compliant Solution

```javascript
let color = "red";
let count = 3;
let apples = color ? `${count} ${color}` : count;
let message = `I have ${apples} apples`;
```
