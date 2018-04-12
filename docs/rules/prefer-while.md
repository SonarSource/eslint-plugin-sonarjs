# prefer-while

:wrench: *fixable*

When only the condition expression is defined in a `for` loop, and the initialization and increment expressions are missing, a `while` loop should be used instead to increase readability.

## Noncompliant Code Example

```javascript
for (;condition;) { /*...*/ }
```

## Compliant Solution

```javascript
while (condition) { /*...*/ }
```
