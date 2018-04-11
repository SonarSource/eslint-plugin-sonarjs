# no-element-overwrite

It is highly suspicious when a value is saved for a key or index and then unconditionally overwritten. Such replacements are likely in error.

## Noncompliant Code Example

```javascript
fruits[1] = "banana";
fruits[1] = "apple";  // Noncompliant - value on index 1 is overwritten

myMap.set("key", 1);
myMap.set("key", 2); // Noncompliant - value for key "key" is replaced

mySet.add(1);
mySet.add(1); // Noncompliant - element is already in the set
```
