## max-switch-cases

When `switch` statements have large sets of `case` clauses, it is usually an attempt to map two sets of data. A real map structure would be more readable and maintainable, and should be used instead.

## Configuration

This rule has a numeric option (defaulted to 30) to specify the maximum number of switch cases.

```json
{
  "max-switch-cases": "error",
  "max-switch-cases": ["error", 10]
}
```
