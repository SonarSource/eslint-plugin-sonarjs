import { RuleTester } from "eslint";

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
import rule = require("../../src/rules/no-identical-functions");

ruleTester.run("no-identical-functions", rule, {
  valid: [
    {
      // different body
      code: `
      function foo() {
        console.log("Hello");
        console.log("World");
        return 42;
      }

      function bar() {
        if (x) {
          console.log("Hello");
        }
        return 42;
      }`,
    },
    {
      // few lines
      code: `
      function foo() {
        console.log("Hello");
        return 42;
      }

      function bar() {
        console.log("Hello");
        return 42;
      }`,
    },
    {
      // ignore not block statement body
      code: `
      let foo = (a, b) => {
        [
          a,
          b
        ]
      }

      let bar = (a, b) => (
        [
          a,
          b
        ]
      )
      `,
    },
  ],
  invalid: [
    {
      // basic case
      code: `
      function foo() {
        console.log("Hello");
        console.log("World");
        return 42;
      }

      function bar() {
        console.log("Hello");
        console.log("World");
        return 42;
      }`,
      errors: [message(2, 8)],
    },
    {
      // different kinds of functions
      code: `
      function foo() {
        console.log("Hello");
        console.log("World");
        return 42;
      }

      let funcExpression = function () {
        console.log("Hello");
        console.log("World");
        return 42;
      }

      let arrowFunction = () => {
        console.log("Hello");
        console.log("World");
        return 42;
      }

      class A {
        constructor() { // Noncompliant
          console.log("Hello");
          console.log("World");
          return 42;
        }

        method() { // Noncompliant
          console.log("Hello");
          console.log("World");
          return 42;
        }

        set setter(p) { // Noncompliant
          console.log("Hello");
          console.log("World");
          return 42;
        }

        get getter() {// Noncompliant
          console.log("Hello");
          console.log("World");
          return 42;
        }
      }`,
      errors: [
        // prettier-ignore
        message(2, 8),
        message(2, 14),
        message(2, 21),
        message(2, 27),
        message(2, 33),
        message(2, 39),
      ],
    },
    {
      // few nodes, but many lines
      code: `
      function foo1() {
        return [
          1,
        ];
      }

      function bar1() { // Noncompliant
        return [
          1,
        ];
      }`,
      errors: [message(2, 8)],
    },
  ],
});

function message(originalLine: number, duplicationLine: number): RuleTester.TestCaseError {
  return {
    message: `Update this function so that its implementation is not identical to the one on line ${originalLine}.`,
    line: duplicationLine,
    endLine: duplicationLine,
  };
}
