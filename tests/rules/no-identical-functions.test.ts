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
import { TSESLint } from '@typescript-eslint/experimental-utils';
import { ruleTester } from '../rule-tester';
import { IssueLocation } from '../../src/utils/locations';
import rule = require('../../src/rules/no-identical-functions');

ruleTester.run('no-identical-functions', rule, {
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
    {
      code: `
      const x = {
        foo() {
          console.log("Hello");
          console.log("World");
          return 42;
        },

        bar() {
          console.log("Hello");
          console.log("World");
          return 42;
        },
      };`,
      options: [4],
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

      let funcExpression = function () { // Noncompliant
        console.log("Hello");
        console.log("World");
        return 42;
      }

      let arrowFunction = () => { // Noncompliant
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

        get getter() { // Noncompliant
          console.log("Hello");
          console.log("World");
          return 42;
        }
      }

      async function asyncFunction() { // Noncompliant
        console.log("Hello");
        console.log("World");
        return 42;
      }

      let asyncExpression = async function () { // Noncompliant
        console.log("Hello");
        console.log("World");
        return 42;
      }`,
      errors: [
        // prettier-ignore
        message(2, 8),
        message(2, 14),
        {
          messageId: 'identicalFunctions',
          data: {
            line: 2,
          },
          line: 21,
          column: 9,
          endColumn: 20,
        }, // constructor
        {
          messageId: 'identicalFunctions',
          data: {
            line: 2,
          },
          line: 27,
          column: 9,
          endColumn: 15,
        }, // method
        {
          messageId: 'identicalFunctions',
          data: {
            line: 2,
          },
          line: 33,
          column: 13,
          endColumn: 19,
        }, // setter
        {
          messageId: 'identicalFunctions',
          data: {
            line: 2,
          },
          line: 39,
          column: 13,
          endColumn: 19,
        }, // getter
        {
          messageId: 'identicalFunctions',
          data: {
            line: 2,
          },
          line: 46,
          column: 22,
          endColumn: 35,
        }, // async declaration
        {
          messageId: 'identicalFunctions',
          data: {
            line: 2,
          },
          line: 52,
          column: 35,
          endColumn: 43,
        }, // async expression
      ],
    },
    {
      code: `
      let foo = () => (
        [
          1,
        ]
      )

      let bar = () => (
        [
          1,
        ]
      )`,
      errors: [message(2, 8)],
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
    {
      code: `
      const x = {
        data: function () {
          return {
            a: 2
          }
        }
      }

      const y = {
        data: function () {
          return {
            a: 2
          }
        }
      }`,
      errors: [message(3, 11)],
    },
    {
      code: `
      const x = {
        foo() {
          console.log("Hello");
          console.log("World");
          return 42;
        },

        bar() {
          console.log("Hello");
          console.log("World");
          return 42;
        },
      };`,
      errors: [
        {
          messageId: 'identicalFunctions',
          data: {
            line: 3,
          },
          line: 9,
          column: 9,
          endColumn: 12,
        },
      ],
    },
    {
      code: `
      const x = {
        foo() {
      //^^^>
          console.log("Hello");
          console.log("World");
          return 42;
        },

        bar() {
      //^^^
          console.log("Hello");
          console.log("World");
          return 42;
        },
      };`,
      options: [3, 'sonar-runtime'],
      errors: [
        encodedMessage(3, 10, [
          { line: 3, column: 8, endLine: 3, endColumn: 11, message: 'Original implementation' },
        ]),
      ],
    },
    {
      // few nodes, but many lines
      code: `
      function foo1() {
        //     ^^^^>
        return [
          1,
        ];
      }
      function bar1() {
    //         ^^^^
        return [
          1,
        ];
      }`,
      options: [3, 'sonar-runtime'],
      errors: [
        encodedMessage(2, 8, [
          { line: 2, column: 15, endLine: 2, endColumn: 19, message: 'Original implementation' },
        ]),
      ],
    },
  ],
});

function message(originalLine: number, duplicationLine: number): TSESLint.TestCaseError<string> {
  return {
    messageId: 'identicalFunctions',
    data: {
      line: originalLine,
    },
    line: duplicationLine,
    endLine: duplicationLine,
  };
}

function encodedMessage(
  originalLine: number,
  duplicationLine: number,
  secondaries: IssueLocation[],
): TSESLint.TestCaseError<string> {
  return {
    messageId: 'sonarRuntime',
    data: {
      line: originalLine,
      sonarRuntimeData: JSON.stringify({
        secondaryLocations: secondaries,
        message: `Update this function so that its implementation is not identical to the one on line ${originalLine}.`,
      }),
    },
    line: duplicationLine,
    endLine: duplicationLine,
  };
}
