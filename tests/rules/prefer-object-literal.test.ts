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
import rule = require("../../src/rules/prefer-object-literal");

ruleTester.run("prefer-literal", rule, {
  valid: [
    {
      code: `var x = {a: 2}`,
    },
    {
      code: `
      function Foo(a) { 
        this.a = a; 
      };
      var x = new Foo(2);`,
    },
    {
      code: `
      var x = {a: 2};
      y = "foo";`,
    },
    // FN
    {
      code: `
      var x;
      x = {};
      x.a = 2`,
    },
    // FN
    {
      code: `var x = {a: 2}; doSomething(); x.b = 3;`,
    },
    {
      code: `
      function foo() { 
        var x = {a: 2};
        doSomething();
      }`,
    },
    {
      code: `var x = {}; x["a"] = 2;`,
    },
    // No issue on multiline expressions, may be done for readibility
    {
      code: `
      var x = {};
      x.foo = function () {
        doSomething();
      }
      var y = {};
      y.prop = {
        a: 1,
        b: 2
      }`,
    },
    // OK, report only when empty object
    {
      code: `var x = {a: 2}; x.b = 5;`,
    },
  ],
  invalid: [
    {
      code: `var x = {}; x.a = 2;`,
      errors: [
        {
          message:
            "Declare one or more properties of this object inside of the object literal syntax instead of using separate statements.",
          line: 1,
          endLine: 1,
          column: 5,
          endColumn: 11,
        },
      ],
    },
    {
      code: `
        var x = {},
            y = "hello";
        x.a = 2;`,
      errors: [
        {
          message:
            "Declare one or more properties of this object inside of the object literal syntax instead of using separate statements.",
          line: 2,
          endLine: 2,
          column: 13,
          endColumn: 19,
        },
      ],
    },
    {
      code: `var x = {}; x.a = 2; x.b = 3`,
      errors: 1,
    },
    {
      code: `let x = {}; x.a = 2;`,
      errors: 1,
    },
    {
      code: `const x = {}; x.a = 2;`,
      errors: 1,
    },
    {
      code: `{ var x = {}; x.a = 2; }`,
      errors: 1,
    },
    {
      code: `if (a) { var x = {}; x.a = 2; }`,
      errors: 1,
    },
    {
      code: `function foo() {
        var x = {};
        x.a = 2;
      }`,
      errors: 1,
    },
  ],
});
