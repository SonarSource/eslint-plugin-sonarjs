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

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
import rule = require("../../src/rules/prefer-immediate-return");

ruleTester.run("prefer-immediate-return", rule, {
  valid: [
    {
      code: `
        function thrown_ok() {
          throw new Error();
        }
      `,
    },
    {
      code: `
        function thrown_expression() {
          const x = new Error();
          throw foo(x);
        }
      `,
    },
    {
      code: `
        function thrown_different_variable(y) {
          const x = new Error();
          throw y;
        }
      `,
    },
    {
      code: `
        function code_between_declaration_and_return() {
          let x = 42;
          foo();
          return x;
        }
      `,
    },
    {
      code: `
        function return_expression() {
          let x = 42;
          return x + 5;
        }
      `,
    },
    {
      code: `
        function return_without_value() {
          let x = 42;
          return;
        }
      `,
    },
    {
      code: `
        function not_return_statement() {
          let x = 42;
          foo(x);
        }
      `,
    },
    {
      code: `
        function no_init_value() {
          let x;
          return x;
        }
      `,
    },
    {
      code: `
        function pattern_declared() {
          let { x } = foo();
          return x;
        }
      `,
    },
    {
      code: `
        function two_variables_declared() {
          let x = 42,
            y;
          return x;
        }
      `,
    },
    {
      code: `
        function different_variable_returned(y) {
          let x = 42;
          return y;
        }
      `,
    },
    {
      code: `
        function only_return() {
          return 42;
        }
      `,
    },
    {
      code: `
        function one_statement() {
          foo();
        }
      `,
    },
    {
      code: `
        function empty_block() {}
      `,
    },
    {
      code: `
        let arrow_function_ok = (a, b) => {
          return a + b;
        };
      `,
    },
    {
      code: `
        let arrow_function_no_block = (a, b) => a + b;
      `,
    },
    {
      code: `
        function variable_is_used() {
          var bar = {
            doSomethingElse(p) {},
            doSomething() {
              bar.doSomethingElse(1);
            },
          };
          return bar;
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        function var_returned() {
          var x = 42;
          return x;
        }`,
      errors: [
        {
          message: 'Immediately return this expression instead of assigning it to the temporary variable "x".',
          line: 3,
          column: 19,
          endColumn: 21,
        },
      ],
      output: `
        function var_returned() {
          return 42;
        }`,
    },
    {
      code: `
        function let_returned() {
          let x = 42;
          return x;
        }
      `,
      errors: [{ line: 3, column: 19, endColumn: 21 }],
    },
    {
      code: `
        function const_returned() {
          const x = 42;
          return x;
        }
      `,
      errors: [{ line: 3, column: 21, endColumn: 23 }],
    },
    {
      code: `
        function code_before_declaration() {
          foo();
          var x = 42;
          return x;
        }
      `,
      errors: [{ line: 4, column: 19, endColumn: 21 }],
    },
    {
      code: `
        function thrown_nok() {
          const x = new Error();
          throw x;
        }`,
      errors: [{ line: 3, column: 21, endColumn: 32 }],
      output: `
        function thrown_nok() {
          throw new Error();
        }`,
    },
    {
      code: `
        function different_blocks() {
          if (foo) {
            let x = foo();
            return x;
          }
          
          try {
            let x = foo();
            return x;
          } catch (e) {
            let x = foo();
            return x;
          } finally {
            let x = foo();
            return x;
          }
        }
      `,
      errors: [
        { line: 4, column: 21, endColumn: 26 },
        { line: 9, column: 21, endColumn: 26 },
        { line: 12, column: 21, endColumn: 26 },
        { line: 15, column: 21, endColumn: 26 },
      ],
    },
    {
      code: `
        function two_declarations(a) {
          if (a) {
            let x = foo();
            return x;
          } else {
            let x = bar();
            return x + 42;
          }
        }
      `,
      errors: [{ line: 4, column: 21, endColumn: 26 }],
    },
    {
      code: `
        function homonymous_is_used() {
          const bar = {
            doSomethingElse(p) {
              var bar = 2;
              return p + bar;
            },
            doSomething() {
              return this.doSomethingElse(1);
            },
          };
          return bar;
        }
      `,
      errors: [{ line: 3, column: 23, endLine: 11, endColumn: 12 }],
    },
    {
      code: `
        function inside_switch(x) {
          switch (x) {
            case 1:
              const y = 3;
              return y;
            default:
              const z = 2;
              return z;
          }
        }
      `,
      errors: [{ line: 5, column: 25, endColumn: 26 }, { line: 8, column: 25, endColumn: 26 }],
    },
    {
      code: `
        function var_returned() {
          var x = 42;
          return x
        }`,
      errors: 1,
      output: `
        function var_returned() {
          return 42
        }`,
    },
    {
      // hoisted variables
      code: `
      function foo() {
        if (cond) {
          var x = 42;
          return x;
      }
      }
      `,
      errors: [
        {
          message: 'Immediately return this expression instead of assigning it to the temporary variable "x".',
        },
      ],
    },
  ],
});
