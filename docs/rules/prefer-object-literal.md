# prefer-object-literal

Object literal syntax, which initializes an object's properties inside the object declaration is cleaner and clearer than the alternative: creating an empty object, and then giving it properties one by one.

An issue is raised when the following pattern is met:

* An empty object is created.
* A consecutive single-line statement adds a property to the created object.

## Noncompliant Code Example

```javascript
var person = {}; // Noncompliant
person.firstName = "John";
person.middleInitial = "Q";
person.lastName = "Public";
```

## Compliant Solution

```javascript
var person = {
  firstName: "John",
  middleInitial: "Q",
  lastName: "Public",
};
```
