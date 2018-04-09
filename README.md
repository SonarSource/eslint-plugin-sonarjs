# eslint-plugin-sonarjs [![Build Status](https://travis-ci.org/SonarSource/eslint-plugin-sonarjs.svg?branch=master)](https://travis-ci.org/SonarSource/eslint-plugin-sonarjs)

SonarJS rules for ESLint

## Rules

### Bug Detection :bug:

* Identical expressions should not be used on both sides of a binary operator ([`no-identical-expressions`])
* The output of functions that don't return anything should not be used  ([`no-use-of-empty-return-value`])

### Code Smell Detection :pig:

* Two branches in a conditional structure should not have exactly the same implementation ([`no-duplicated-branches`])
* Boolean literals should not be redundant ([`no-redundant-boolean`])
* "switch" statements should have at least 3 "case" clauses ([`no-small-switch`])

[`no-duplicated-branches`]: ./docs/rules/no-duplicated-branches.md
[`no-identical-expressions`]: ./docs/rules/no-identical-expressions.md
[`no-redundant-boolean`]: ./docs/rules/no-redundant-boolean.md
[`no-small-switch`]: ./docs/rules/no-small-switch.md
[`no-use-of-empty-return-value`]: ./docs/rules/no-use-of-empty-return-value.md
