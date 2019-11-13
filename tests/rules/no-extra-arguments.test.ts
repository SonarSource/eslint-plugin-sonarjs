/*
 * eslint-plugin-sonarjs
 * Copyright (C) 2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import { RuleTester } from "eslint";
import { IssueLocation } from "../../src/utils/locations";

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
        function foo(p1, p2) {}
        //           ^^^^^^>
        foo(1, 2, 3);
      //^^^^^^^^^^^^  
      `,
      errors: [
        encodedMessage(2, 3, [{ line: 2, column: 21, endLine: 2, endColumn: 27, message: "Formal parameters" }]),
      ],
      options: ["sonar-runtime"],
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
        foo(1);
      //^^^^^^
        var foo = function() {
          //      ^^^^^^^^>
          console.log('hello');
        }
      `,
      errors: [
        encodedMessage(0, 1, [{ line: 4, column: 18, endLine: 4, endColumn: 26, message: "Formal parameters" }]),
      ],
      options: ["sonar-runtime"],
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
    // eslint-disable-next-line no-nested-ternary
    expected === 0 ? "no arguments" : 
    expected === 1 ? "1 argument" : 
    `${expected} arguments`;

  // prettier-ignore
  const providedArguments = 
    // eslint-disable-next-line no-nested-ternary
    provided === 0 ? "none was" : 
    provided === 1 ? "1 was" : 
    `${provided} were`;

  return {
    message: `This function expects ${expectedArguments}, but ${providedArguments} provided.`,
    ...extra,
  };
}

function encodedMessage(expected: number, provided: number, secondaryLocations: IssueLocation[]) {
  return JSON.stringify({ secondaryLocations, message: message(expected, provided).message });
}
