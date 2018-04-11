# eslint-plugin-sonarjs [![Build Status](https://travis-ci.org/SonarSource/eslint-plugin-sonarjs.svg?branch=master)](https://travis-ci.org/SonarSource/eslint-plugin-sonarjs) [![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=eslint-plugin-sonarjs&metric=alert_status)](https://sonarcloud.io/dashboard?id=eslint-plugin-sonarjs) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=eslint-plugin-sonarjs&metric=coverage)](https://sonarcloud.io/dashboard?id=eslint-plugin-sonarjs)

SonarJS rules for ESLint

## Rules

### Bug Detection :bug:

* All branches in a conditional structure should not have exactly the same implementation ([`no-all-duplicated-branches`])
* Function calls should not pass extra arguments ([`no-extra-arguments`])
* Related "if/else if" statements should not have the same condition ([`no-identical-conditions`])
* Identical expressions should not be used on both sides of a binary operator ([`no-identical-expressions`])
* Loops with at most one iteration should be refactored ([`no-one-iteration-loop`])
* The output of functions that don't return anything should not be used ([`no-use-of-empty-return-value`])

### Code Smell Detection :pig:

* Cognitive Complexity of functions should not be too high ([`cognitive-complexity`])
* Two branches in a conditional structure should not have exactly the same implementation ([`no-duplicated-branches`])
* Functions should not have identical implementations ([`no-identical-functions`])
* Boolean literals should not be redundant ([`no-redundant-boolean`])
* "switch" statements should have at least 3 "case" clauses ([`no-small-switch`])
* Local variables should not be declared and then immediately returned or thrown ([`prefer-immediate-return`])
* Return of boolean expressions should not be wrapped into an "if-then-else" statement ([`prefer-single-boolean-return`])

[`cognitive-complexity`]: ./docs/rules/cognitive-complexity.md
[`no-all-duplicated-branches`]: ./docs/rules/no-all-duplicated-branches.md
[`no-duplicated-branches`]: ./docs/rules/no-duplicated-branches.md
[`no-extra-arguments`]: ./docs/rules/no-extra-arguments.md
[`no-identical-conditions`]: ./docs/rules/no-identical-conditions.md
[`no-identical-expressions`]: ./docs/rules/no-identical-expressions.md
[`no-identical-functions`]: ./docs/rules/no-identical-functions.md
[`no-one-iteration-loop`]: ./docs/rules/no-one-iteration-loop.md
[`no-redundant-boolean`]: ./docs/rules/no-redundant-boolean.md
[`no-small-switch`]: ./docs/rules/no-small-switch.md
[`no-use-of-empty-return-value`]: ./docs/rules/no-use-of-empty-return-value.md
[`prefer-immediate-return`]: ./docs/rules/prefer-immediate-return.md
[`prefer-single-boolean-return`]: ./docs/rules/prefer-single-boolean-return.md
