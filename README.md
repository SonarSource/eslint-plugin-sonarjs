# eslint-plugin-sonarjs [![npm version](https://badge.fury.io/js/eslint-plugin-sonarjs.svg)](https://badge.fury.io/js/eslint-plugin-sonarjs) [![Build Status](https://api.cirrus-ci.com/github/SonarSource/eslint-plugin-sonarjs.svg?branch=master)](https://cirrus-ci.com/github/SonarSource/eslint-plugin-sonarjs) [![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=eslint-plugin-sonarjs&metric=alert_status)](https://sonarcloud.io/dashboard?id=eslint-plugin-sonarjs) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=eslint-plugin-sonarjs&metric=coverage)](https://sonarcloud.io/dashboard?id=eslint-plugin-sonarjs)

SonarJS rules for ESLint to detect bugs and suspicious patterns in your code.

## Rules

<!-- begin auto-generated rules list -->

💼 Configurations enabled in.\
🚫 Configurations disabled in.\
✅ Set in the `recommended` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).

### problem

| Name                                                                       | Description                                                                             | 💼 | 🚫 | 🔧 | 💡 |
| :------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- | :- | :- | :- | :- |
| [no-all-duplicated-branches](docs/rules/no-all-duplicated-branches.md)     | All branches in a conditional structure should not have exactly the same implementation | ✅  |    |    |    |
| [no-collection-size-mischeck](docs/rules/no-collection-size-mischeck.md)   | Collection sizes and array length comparisons should make sense                         | ✅  |    |    | 💡 |
| [no-duplicated-branches](docs/rules/no-duplicated-branches.md)             | Two branches in a conditional structure should not have exactly the same implementation | ✅  |    |    |    |
| [no-element-overwrite](docs/rules/no-element-overwrite.md)                 | Collection elements should not be replaced unconditionally                              | ✅  |    |    |    |
| [no-empty-collection](docs/rules/no-empty-collection.md)                   | Empty collections should not be accessed or iterated                                    | ✅  |    |    |    |
| [no-extra-arguments](docs/rules/no-extra-arguments.md)                     | Function calls should not pass extra arguments                                          | ✅  |    |    |    |
| [no-identical-conditions](docs/rules/no-identical-conditions.md)           | Related "if-else-if" and "switch-case" statements should not have the same condition    | ✅  |    |    |    |
| [no-identical-expressions](docs/rules/no-identical-expressions.md)         | Identical expressions should not be used on both sides of a binary operator             | ✅  |    |    |    |
| [no-identical-functions](docs/rules/no-identical-functions.md)             | Functions should not have identical implementations                                     | ✅  |    |    |    |
| [no-ignored-return](docs/rules/no-ignored-return.md)                       | Return values from functions without side effects should not be ignored                 | ✅  |    |    |    |
| [no-one-iteration-loop](docs/rules/no-one-iteration-loop.md)               | Loops with at most one iteration should be refactored                                   | ✅  |    |    |    |
| [no-same-line-conditional](docs/rules/no-same-line-conditional.md)         | Conditionals should start on new lines                                                  | ✅  |    |    | 💡 |
| [no-unused-collection](docs/rules/no-unused-collection.md)                 | Collection and array contents should be used                                            | ✅  |    |    |    |
| [no-use-of-empty-return-value](docs/rules/no-use-of-empty-return-value.md) | The output of functions that don't return anything should not be used                   | ✅  |    |    |    |
| [non-existent-operator](docs/rules/non-existent-operator.md)               | Non-existent operators "=+", "=-" and "=!" should not be used                           | ✅  |    |    | 💡 |

### suggestion

| Name                                                                       | Description                                                                          | 💼 | 🚫 | 🔧 | 💡 |
| :------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- | :- | :- | :- | :- |
| [cognitive-complexity](docs/rules/cognitive-complexity.md)                 | Cognitive Complexity of functions should not be too high                             | ✅  |    |    |    |
| [elseif-without-else](docs/rules/elseif-without-else.md)                   | "if ... else if" constructs should end with "else" clauses                           |    | ✅  |    |    |
| [max-switch-cases](docs/rules/max-switch-cases.md)                         | "switch" statements should not have too many "case" clauses                          | ✅  |    |    |    |
| [no-collapsible-if](docs/rules/no-collapsible-if.md)                       | Collapsible "if" statements should be merged                                         | ✅  |    |    |    |
| [no-duplicate-string](docs/rules/no-duplicate-string.md)                   | String literals should not be duplicated                                             | ✅  |    |    |    |
| [no-gratuitous-expressions](docs/rules/no-gratuitous-expressions.md)       | Boolean expressions should not be gratuitous                                         | ✅  |    |    |    |
| [no-inverted-boolean-check](docs/rules/no-inverted-boolean-check.md)       | Boolean checks should not be inverted                                                |    | ✅  | 🔧 | 💡 |
| [no-nested-switch](docs/rules/no-nested-switch.md)                         | "switch" statements should not be nested                                             | ✅  |    |    |    |
| [no-nested-template-literals](docs/rules/no-nested-template-literals.md)   | Template literals should not be nested                                               | ✅  |    |    |    |
| [no-redundant-boolean](docs/rules/no-redundant-boolean.md)                 | Boolean literals should not be redundant                                             | ✅  |    |    |    |
| [no-redundant-jump](docs/rules/no-redundant-jump.md)                       | Jump statements should not be redundant                                              | ✅  |    |    | 💡 |
| [no-small-switch](docs/rules/no-small-switch.md)                           | "switch" statements should have at least 3 "case" clauses                            | ✅  |    |    |    |
| [no-useless-catch](docs/rules/no-useless-catch.md)                         | "catch" clauses should do more than rethrow                                          | ✅  |    |    |    |
| [prefer-immediate-return](docs/rules/prefer-immediate-return.md)           | Local variables should not be declared and then immediately returned or thrown       | ✅  |    | 🔧 |    |
| [prefer-object-literal](docs/rules/prefer-object-literal.md)               | Object literal syntax should be used                                                 | ✅  |    |    |    |
| [prefer-single-boolean-return](docs/rules/prefer-single-boolean-return.md) | Return of boolean expressions should not be wrapped into an "if-then-else" statement | ✅  |    |    | 💡 |
| [prefer-while](docs/rules/prefer-while.md)                                 | A "while" loop should be used instead of a "for" loop                                | ✅  |    | 🔧 |    |

<!-- end auto-generated rules list -->

## Prerequisites

* Node.js (>=12.x).
* ESLint 5.x, 6.x, 7.x or 8.x (peer dependency for the plugin).

## Usage

* If you don't have ESLint yet configured for your project, follow [these instructions](https://github.com/eslint/eslint#installation-and-usage).
* Install `eslint-plugin-sonarjs` using `npm` (or `yarn`) for you project or globally:

```sh
npm install eslint-plugin-sonarjs --save-dev # install for your project
npm install eslint-plugin-sonarjs -g         # or install globally
```

* Add `eslint-plugin-sonarjs` to the `plugins` option of your `.eslintrc`:

```json
{
  "plugins": ["sonarjs"]
}
```

* Add `plugin:sonarjs/recommended` to the `extends` option to enable all recommended rules:

```json
{
  "extends": ["plugin:sonarjs/recommended"]
}
```

* or enable only some rules manually:

```javascript
{
  "rules": {
    "sonarjs/cognitive-complexity": "error",
    "sonarjs/no-identical-expressions": "error"
    // etc.
  }
}
```

* To enable all rules of this plugin, use `@typescript-eslint/parser` as a parser for ESLint ([like we do](https://github.com/SonarSource/eslint-plugin-sonarjs/blob/6e06d59a233e07b28fbbd6398e08b9b0c63b18f9/.eslintrc.js#L4)) and set the [parserOptions.project](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#parseroptionsproject) option. Thanks to it, type information is available, which is beneficial or even essential for some rules.

## Available Configurations

This plugin provides only `recommended` configuration. Almost all rules are activated in this profile with a few exceptions (check `disabled` tag in the rules list). `recommended` configuration activates rules with `error` severity.

## ESLint and Sonar

This plugin exposes to ESLint users a subset of JS/TS rules from Sonar-* products (aka [SonarJS](https://github.com/SonarSource/SonarJS)). We extracted the rules which are not available in ESLint core or other ESLint plugins to be beneficial for ESLint community.

If you are a [SonarQube](https://www.sonarqube.org) or [SonarCloud](https://sonarcloud.io) user, to lint your code locally, we suggest to use [SonarLint](https://www.sonarlint.org) IDE extension (available for VSCode, JetBrains IDEs and Eclipse). You can connect SonarLint to your SonarQube/SonarCloud project to synchronize rules configuration, issue statuses, etc.

## Contributing

You want to participate in the development of the project? Have a look at our [contributing](./docs/CONTRIBUTING.md) guide!
