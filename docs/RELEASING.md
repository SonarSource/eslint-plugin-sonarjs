## Releasing npm package

* Install or upgrade `np` package globally (`npm install -g np`)
* Login to npm with `npm adduser`
* Create new branch, e.g. `1.2.0`, add upstream
* Run this to publish package

```
yarn build
np --any-branch
```
