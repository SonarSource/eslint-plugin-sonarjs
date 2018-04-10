import { RuleTester } from "eslint";

const ruleTester = new RuleTester();
import rule = require("../../src/rules/no-identical-conditions");

ruleTester.run("no-identical-conditions", rule, {
  valid: [
    {
      code: "if (a) {} else if (b) {}",
    },
    {
      code: "if (a) {} else {}",
    },
  ],
  invalid: [
    {
      code: `
        if (a) {} 
        else if (a) {}
      `,
      errors: [{ message: "This branch duplicates the one on line 2", line: 3, column: 18, endColumn: 19 }],
    },
    {
      code: `
        if (b) {} 
        else if (a) {}
        else if (a) {}
      `,
      errors: [{ message: "This branch duplicates the one on line 3", line: 4, column: 18, endColumn: 19 }],
    },
    {
      code: `
        if (a) {} 
        else if (b) {}
        else if (a) {}
      `,
      errors: [{ message: "This branch duplicates the one on line 2", line: 4, column: 18, endColumn: 19 }],
    },
  ],
});
