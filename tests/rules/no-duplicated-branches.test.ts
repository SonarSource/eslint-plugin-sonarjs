import { RuleTester } from "eslint";

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });
import rule = require("../../src/rules/no-duplicated-branches");

ruleTester.run("no-duplicated-branches if", rule, {
  valid: [
    {
      code: `
      if (a) { 
        first('const'); 
        first('foo'); 
      } else { 
        first('var'); 
        first('foo'); 
      }`,
    },
    {
      // small branches
      code: `
      if (a) {
        first();
      } else {
        first();
      }`,
    },
    {
      code: `
      if (a) {
        first();
        first();
      } else {
        second();
        second();
      }`,
    },
    {
      code: `
      if (a) {
        first();
        second();
      } else {
        second();
        first();
      }`,
    },
    {
      code: `
      if (a) {
        first();
        second();
      } else {
        first();
        third();
      }`,
    },
    {
      code: `
      if (a) {
        first();
        second();
      } else {
        first();
      }`,
    },
  ],
  invalid: [
    {
      code: `
      if (a) {
        first();
        second();
      } else {
        first();
        second();
      }`,
      errors: [
        {
          message: "This branch's code block is the same as the block for the branch on line 2.",
          line: 5,
          endLine: 8,
          column: 14,
          endColumn: 8,
        },
      ],
    },
    {
      code: `
      if (a) {
        first();
        second();
      } else if (b) {
        first();
        second();
      }`,
      errors: [{ line: 5 }],
    },
    {
      code: `
      if (a) {
        first();
        second();
      } else if (b) {
        second();
        third();
      } else {
        first();
        second();
      }`,
      errors: [{ line: 8 }],
    },
  ],
});

ruleTester.run("no-duplicated-branches switch", rule, {
  valid: [
    {
      code: `
      function foo() {
        switch (a) {
          case 1:
            return first();
          default:
            return first();
        }
      }`,
    },
    {
      // small branches
      code: `
      switch (a) {
        case 1: {
          // comment
          break;
        }
        case 2: {
          // comment
          break;
        }
      }`,
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        default:
          second();
          first();
      }`,
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        case 2:
          third();
      }`,
    },
  ],
  invalid: [
    {
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        default:
          first();
          second();
      }`,
      errors: [
        {
          message: "This case's code block is the same as the block for the case on line 3.",
          line: 7,
          endLine: 9,
          column: 9,
          endColumn: 20,
        },
      ],
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        case 2:
          first();
          second();
          break;
      }`,
      errors: [{ line: 7 }],
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          first();
          break;
        case 2:
          second();
          second();
          break;
        case 3:
          first();
          first();
          break;
      }`,
      errors: [{ line: 11 }],
    },
    {
      code: `
      switch (a) {
        case 1: {
          first();
          second();
          break;
        }
        default: {
          first();
          second();
        }
      }`,
      errors: [{ line: 8 }],
    },
    {
      // check that for each branch we generate only one issue
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        case 2:
          first();
          second();
          break;
        case 3:
          first();
          second();
          break;
        case 4:
          first();
          second();
          break;
      }`,
      errors: [{ line: 7 }, { line: 11 }, { line: 15 }],
    },
  ],
});
