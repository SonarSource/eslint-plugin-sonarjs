# cognitive-complexity

Cognitive Complexity is a measure of how hard the control flow of a function is to understand. Functions with high Cognitive Complexity will be difficult to maintain.

## How can I calculate the CC of my method at the time of development?

Follow below rules to get your CC of any method or class as:

- Increment when there is a break in the linear (top-to-bottom, left-to-right) flow of the code
- Increment when structures that break the flow are nested
- Ignore "shorthand" structures that readably condense multiple lines of code into one

So whenever above rules matches, just add `+1` count to your CC and remember count will be increased according to level of code break, as example "if" condition gets `+1` if it is the first code break but if you have used one more nested if then it will be a `+2` and so on.

```js
function onResponse(res, callback) {
  if(res.isSuccess) { // +1 CC
    
    if(res.data.body) { // nested level 2 if +2 CC
      if(res.data.body.annualRevenue) {  // nested level 3 if +3 CC
        appConfig.revenueData = utils.convertToKeyValueList(res.data.body);
      }

      if(res.data.body.mainMarket) {  // nested level 3 if +3 CC
        if(res.data.body.mainMarket.totalLeads > 10) {  // nested level 4 if +4 CC
          appConfig.leadsData = utils.convertToKeyValueList(res.data.body);
        }
      }
    }
  }
}
```

## See

- [Cognitive Complexity](https://www.sonarsource.com/resources/cognitive-complexity/)
- [Cognitive complexity because testability is understandability](https://www.sonarsource.com/blog/cognitive-complexity-because-testability-understandability/)

## Configuration

The maximum authorized complexity can be provided. Default is 15.

```json
{
  "sonarjs/cognitive-complexity": "error",
  "sonarjs/cognitive-complexity": ["error", 15]
}
```