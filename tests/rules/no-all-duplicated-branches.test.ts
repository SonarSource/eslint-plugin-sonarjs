import { RuleTester } from "eslint";

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });
import rule = require("../../src/rules/no-all-duplicated-branches");

ruleTester.run("no-all-duplicated-branches if", rule, {
  valid: [
    { code: "if (a) { first('const'); } else { first('var'); }" },
    { code: "if (a) { first(); } else { second(); }" },
    { code: "if (a) { first(); } else if (b) { first(); }" }, // ok, no `else`
    { code: "if (a) { first(); } else if (b) { second(); }" },
    { code: "if (a) { second(); } else if (b) { first(); } else { first(); }" },
    { code: "if (a) { first(); } else if (b) { second(); } else { first(); }" },
    { code: "if (a) { first(); } else if (b) { first(); } else { second(); }" },
    { code: "if (a) { first(); second(); } else { second(); first(); }" },
    { code: "if (a) { first(); second(); } else { first(); third(); }" },
    { code: "if (a) { first(); second(); } else { first(); }" },
    { code: "if (a) { first(); second(); } else if (b) { first(); second(); } else { first(); third(); }" },
    {
      code: `
      function render() {
        if (a) {
          return <p>foo</p>;
        } else {
          return <p>bar</p>;
        }
      }`,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  ],
  invalid: [
    {
      code: "if (a) { first(); } else { first(); }",
      errors: [
        {
          message: "Remove this conditional structure or edit its code blocks so that they're not all the same.",
          line: 1,
          column: 1,
          endColumn: 38,
        },
      ],
    },
    {
      code: "if (a) { first(); } else if (b) { first(); } else { first(); }",
      errors: 1,
    },
    {
      code: "if (a) { first(); second(); } else { first(); second(); }",
      errors: 1,
    },
    {
      code: "if (a) { first(); second(); } else if (b) { first(); second(); } else { first(); second(); }",
      errors: 1,
    },
  ],
});

ruleTester.run("no-all-duplicated-branches switch", rule, {
  valid: [
    {
      // Ok, no default
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        case 2:
        case 3:
          first();
          second();
      }`,
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          second();
          break;
        case 3:
          first();
          second();
          break;
        default:
          third();
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
          first();
          second();
          break;
        default:
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
          message: "Remove this conditional structure or edit its code blocks so that they're not all the same.",
          line: 2,
          endLine: 10,
          column: 7,
          endColumn: 8,
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
        default:
          first();
          second();
      }`,
      errors: 1,
    },
    {
      code: `
      switch (a) {
        case 1:
          first();
          break;
        case 2:
          first();
          break;
        default:
          first();
      }`,
      errors: 1,
    },
    {
      code: `
      switch (a) {
        case 1:
        case 2:
          first();
          second();
          break;
        case 3:
          first();
          second();
          break;
        default:
          first();
          second();
      }`,
      errors: 1,
    },
  ],
});

ruleTester.run("no-all-duplicated-branches conditional", rule, {
  valid: [{ code: "a ? first : second;" }],
  invalid: [
    {
      code: "a ? first : first;",
      errors: [
        {
          message: 'This conditional operation returns the same value whether the condition is "true" or "false".',
          line: 1,
          column: 1,
          endColumn: 18,
        },
      ],
    },
  ],
});
