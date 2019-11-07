# no-duplicate-string
Duplicated string literals make the process of refactoring error-prone, since you must be sure to update all occurrences.
On the other hand, constants can be referenced from many places, but only need to be updated in a single place.

## Exceptions
To prevent generating some false-positives, literals having less than 10 characters are excluded as well as literals matching /^\w*$/. String literals inside import/export statements are also ignored. The same goes for statement-like string literals, e.g. `'use strict';`

## Configuration

Number of times a literal must be duplicated to trigger an issue. Default is 3.

```json
{
  "no-duplicate-string": "error",
  "no-duplicate-string": ["error", 5]
}
```
