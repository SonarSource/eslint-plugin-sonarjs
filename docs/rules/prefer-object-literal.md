# prefer-object-literal

Object literal syntax, which initializes an object's properties inside the object declaration is cleaner and clearer than the alternative: creating an empty object, and then giving it properites one by one.

## Noncompliant Code Example

```javascript
var person = {}; // Noncompliant
person.firstName = "John";
person.middleInitial = "Q";
person.lastName = "Public";
```

## Compliant Solution

```javascript
function Person(firstName, middleInitial, lastName) {
  this.firstName = firstName;
  this.middleInitial = middleInitial;
  this.lastName = lastName;
}

var person = new Person("John", "Q", "Public");
```

or

```javascript
var person = {
  firstName: "John",
  middleInitial: "Q",
  lastName: "Public",
};
```
