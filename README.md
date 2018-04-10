# eslint-plugin-sonarjs [![Build Status](https://travis-ci.org/SonarSource/eslint-plugin-sonarjs.svg?branch=master)](https://travis-ci.org/SonarSource/eslint-plugin-sonarjs)

SonarJS rules for ESLint

## Rules

### Bug Detection :bug:

* All branches in a conditional structure should not have exactly the same implementation ([`no-all-duplicated-branches`])
* Function calls should not pass extra arguments ([`no-extra-arguments`])
* Related "if/else if" statements should not have the same condition ([`no-identical-conditions`])
* Identical expressions should not be used on both sides of a binary operator ([`no-identical-expressions`])
* The output of functions that don't return anything should not be used ([`no-use-of-empty-return-value`])

### Code Smell Detection :pig:

* Cognitive Complexity of functions should not be too high ([`cognitive-complexity`])
* Two branches in a conditional structure should not have exactly the same implementation ([`no-duplicated-branches`])
* Functions should not have identical implementations ([`no-identical-functions`])
* Boolean literals should not be redundant ([`no-redundant-boolean`])
* "switch" statements should have at least 3 "case" clauses ([`no-small-switch`])

[`cognitive-complexity`]: ./docs/rules/cognitive-complexity.md
[`no-all-duplicated-branches`]: ./docs/rules/no-all-duplicated-branches.md
[`no-duplicated-branches`]: ./docs/rules/no-duplicated-branches.md
[`no-extra-arguments`]: ./docs/rules/no-extra-arguments.md
[`no-identical-conditions`]: ./docs/rules/no-identical-conditions.md
[`no-identical-expressions`]: ./docs/rules/no-identical-expressions.md
[`no-identical-functions`]: ./docs/rules/no-identical-functions.md
[`no-redundant-boolean`]: ./docs/rules/no-redundant-boolean.md
[`no-small-switch`]: ./docs/rules/no-small-switch.md
[`no-use-of-empty-return-value`]: ./docs/rules/no-use-of-empty-return-value.md
