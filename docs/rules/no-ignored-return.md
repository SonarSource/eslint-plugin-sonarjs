# no-ignored-return

When the call to a function doesn’t have any side effects, what is the point of making the call if the results are ignored? In such case, either the function call is useless and should be dropped or the source code doesn’t behave as expected.

To prevent generating any false-positives, this rule triggers an issues only on a predefined list of known objects &amp; functions.

## Noncompliant Code Example

```javascript
'hello'.lastIndexOf('e'); // Noncompliant
```

## Compliant Solution

```javascript
let char = 'hello'.lastIndexOf('e');
```

## Note

The rule relies on type information and requires the use of `typescript-eslint/parser`.

## See

<ul>
  <li> <a href="https://wiki.sei.cmu.edu/confluence/x/mtYxBQ">CERT, EXP12-C.</a> - Do not ignore values returned by functions</li>
  <li> <a href="https://wiki.sei.cmu.edu/confluence/x/xzdGBQ">CERT, EXP00-J.</a> - Do not ignore values returned by methods</li>
</ul>
