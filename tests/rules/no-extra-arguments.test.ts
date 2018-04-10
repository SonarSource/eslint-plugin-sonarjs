import { RuleTester } from "eslint";

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
import rule = require("../../src/rules/no-extra-arguments");

ruleTester.run("no-extra-arguments", rule, {
  valid: [
    {
      code: `
        function foo(p1, p2) {}
        foo(1, 2);
        foo(1);
      `,
    },
    {
      code: `
        function foo() {
          console.log(arguments);
        }
        foo(1, 2);
      `,
    },
    {
      code: `
        function foo(p1, ...p2) {}
        foo(1, 2, 3, 4);
      `,
    },
    {
      code: `
        let foo = function(...p1) {}
        foo(1, 2, 3, 4);
      `,
    },
    {
      code: `
        let foo = function(...p1) {}
        foo(1, 2, 3, 4);
      `,
    },
    {
      code: `
        let noop = () => {};
        function foo(callback = noop) {
          callback(42);
        }
      `,
    },
    {
      code: `
        let x = () => {}; 
        if (cond) {
          x = (p1, p2) => 1;
        } 
        x(1, 2);
      `,
    },
  ],
  invalid: [
    {
      code: `
        function foo(p1, p2) {}
        foo(1, 2, 3);
        foo(1, 2, 3, 4);
      `,
      errors: [
        message(2, 3, { line: 3, column: 9, endColumn: 21 }),
        message(2, 4, { line: 4, column: 9, endColumn: 24 }),
      ],
    },
    {
      code: `
        var foo = function() {
          console.log('hello');
        }
        foo(1);
      `,
      errors: [message(0, 1, { line: 5, column: 9, endColumn: 15 })],
    },
    {
      code: `
        function foo(arguments) {
          console.log(arguments);
        }
        foo(1, 2);
      `,
      errors: [message(1, 2, { line: 5, column: 9, endColumn: 18 })],
    },
    {
      code: `
        function foo() {
          let arguments = [3, 4];
          console.log(arguments);
        }
        foo(1, 2);
      `,
      errors: [message(0, 2, { line: 6, column: 9, endColumn: 18 })],
    },
    {
      code: `
        (function(p1, p2){
          doSomething1;
          doSomething2;
        })(1, 2, 3);
      `,
      errors: [message(2, 3, { line: 2, column: 9, endLine: 5, endColumn: 20 })],
    },
    {
      code: `
        let x = function(a, b) {
          return a + b;
        }(1, 2, 3);
      `,
      errors: [message(2, 3, { line: 2, column: 17, endLine: 4, endColumn: 19 })],
    },
    {
      code: `
        ((a, b) => {
          return a + b;
        })(1, 2, 3);
      `,
      errors: [message(2, 3, { line: 2, column: 9, endLine: 4, endColumn: 20 })],
    },
    {
      code: `
        let arrow_function = (a, b) => {};
        arrow_function(1, 2, 3);
      `,
      errors: [message(2, 3, { line: 3, column: 9, endColumn: 32 })],
    },
  ],
});

function message(
  expected: number,
  provided: number,
  extra: Partial<RuleTester.TestCaseError> = {},
): RuleTester.TestCaseError {
  // prettier-ignore
  const expectedArguments = 
    expected === 0 ? "no arguments" : 
    expected === 1 ? "1 argument" : 
    `${expected} arguments`;

  // prettier-ignore
  const providedArguments = 
    provided === 0 ? "none was" : 
    provided === 1 ? "1 was" : 
    `${provided} were`;

  return {
    message: `This function expects ${expectedArguments}, but ${providedArguments} provided.`,
    ...extra,
  };
}
