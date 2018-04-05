import { RuleTester } from "eslint";

const ruleTester = new RuleTester();
import rule = require("../../src/rules/no-redundant-boolean");

ruleTester.run("no-redundant-boolean", rule, {
  valid: [
    { code: "a === false;" },
    { code: "a === true;" },
    { code: "a !== false;" },
    { code: "a !== true;" },
    { code: "a == foo(true);" },
    { code: "true < 0;" },
    { code: "~true;" },
    { code: "!foo;" },
    { code: "if (foo(mayBeSomething || false)) {}" },
    { code: "x ? y || false : z" },
  ],
  invalid: [
    {
      code: "if (x == true) {}",
      errors: [{ message: "Remove the unnecessary boolean literal.", column: 10, endColumn: 14 }],
    },
    { code: "if (x == false) {}", errors: 1 },
    { code: "if (x || false) {}", errors: 1 },
    { code: "if (x && false) {}", errors: 1 },

    { code: "x || false ? 1 : 2", errors: 1 },

    { code: "fn(!false)", errors: 1 },

    { code: "a == true == b;", errors: 1 },
    { code: "a == b == false;", errors: 1 },
    { code: "a == (true == b) == b;", errors: 1 },

    { code: "!(true);", errors: 1 },
    { code: "a == (false);", errors: 1 },

    { code: "true && a;", errors: 1 },
  ],
});
