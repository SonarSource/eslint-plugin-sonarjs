/*
 * eslint-plugin-sonarjs
 * Copyright (C) 2018-2021 SonarSource SA
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
import { ruleTester, ruleTesterScript, TestCaseError } from '../rule-tester';
import { IssueLocation } from '../../src/utils/locations';

import rule = require('../../src/rules/no-extra-arguments');

ruleTester.run('no-extra-arguments', rule, {
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
        message(2, 3, { line: 3, column: 9, endColumn: 12 }),
        message(2, 4, { line: 4, column: 9, endColumn: 12 }),
      ],
    },
    {
      code: `
        function foo(p1, p2) {}
        //           ^^^^^^>
        foo(1, 2, 3);
      //^^^       ^
      `,
      errors: [
        {
          message: encodedMessage(2, 3, [
            { line: 2, column: 21, endLine: 2, endColumn: 27, message: 'Formal parameters' },
            { line: 4, column: 18, endLine: 4, endColumn: 19, message: 'Extra argument' },
          ]),
        },
      ],
      options: ['sonar-runtime'],
    },
    {
      code: `
        var foo = function() {
          console.log('hello');
        }
        foo(1);
      `,
      errors: [message(0, 1, { line: 5, column: 9, endColumn: 12 })],
    },
    {
      code: `
        foo(1);
      //    ^
        var foo = function() {
          //      ^^^^^^^^>
          console.log('hello');
        }
      `,
      errors: [
        {
          message: encodedMessage(0, 1, [
            { line: 4, column: 18, endLine: 4, endColumn: 26, message: 'Formal parameters' },
            { line: 2, column: 12, endLine: 2, endColumn: 13, message: 'Extra argument' },
          ]),
        },
      ],
      options: ['sonar-runtime'],
    },
    {
      code: `
        function foo(arguments) {
          console.log(arguments);
        }
        foo(1, 2);
      `,
      errors: [message(1, 2, { line: 5, column: 9, endColumn: 12 })],
    },
    {
      code: `
        function foo() {
          let arguments = [3, 4];
          console.log(arguments);
        }
        foo(1, 2);
      `,
      errors: [message(0, 2, { line: 6, column: 9, endColumn: 12 })],
    },

    {
      code: `
        (function(p1, p2){
          doSomething1;
          doSomething2;
        })(1, 2, 3);
      `,
      errors: [message(2, 3, { line: 2, column: 10, endLine: 5, endColumn: 10 })],
    },
    {
      code: `
        let x = function(a, b) {
          return a + b;
        }(1, 2, 3);
      `,
      errors: [message(2, 3, { line: 2, column: 17, endLine: 4, endColumn: 10 })],
    },
    {
      code: `
        ((a, b) => {
          return a + b;
        })(1, 2, 3);
      `,
      errors: [message(2, 3, { line: 2, column: 10, endLine: 4, endColumn: 10 })],
    },
    {
      code: `
        let arrow_function = (a, b) => {};
        arrow_function(1, 2, 3);
      `,
      errors: [message(2, 3, { line: 3, column: 9, endColumn: 23 })],
    },
  ],
});

ruleTesterScript.run('no-extra-arguments script', rule, {
  valid: [],
  invalid: [
    {
      code: `
        function foo(arguments) {
          console.log(arguments);
        }
        foo(1, 2);
      `,
      errors: [message(1, 2, { line: 5, column: 9, endColumn: 12 })],
    },
    {
      code: `
        function foo() {
          let arguments = [3, 4];
          console.log(arguments);
        }
        foo(1, 2);
      `,
      errors: [message(0, 2, { line: 6, column: 9, endColumn: 12 })],
    },
  ],
});

function message(
  expected: number,
  provided: number,
  extra: Partial<TestCaseError> = {},
): TestCaseError {
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
