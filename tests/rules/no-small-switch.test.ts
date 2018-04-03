import { RuleTester } from "eslint";

const ruleTester = new RuleTester();
import rule = require("../../src/rules/no-small-switch");

ruleTester.run("no-small-switch", rule, {
  valid: [
    { code: "switch (a) { case 1: case 2: break; default: doSomething(); break; }" },
    { code: "switch (a) { case 1: break; default: doSomething(); break; case 2: }" },
    { code: "switch (a) { case 1: break; case 2: }" },
  ],
  invalid: [
    {
      code: "switch (a) { case 1: doSomething(); break; default: doSomething(); }",
      errors: [{ message: '"switch" statements should have at least 3 "case" clauses', column: 1, endColumn: 7 }],
    },
    {
      code: "switch (a) { case 1: break; }",
      errors: 1,
    },
    {
      code: "switch (a) {}",
      errors: 1,
    },
  ],
});
