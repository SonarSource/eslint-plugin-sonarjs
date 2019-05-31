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

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });
import rule = require("../../src/rules/no-collapsible-if");

ruleTester.run("no-collapsible-if", rule, {
  valid: [
    {
      code: `
      if (x) {
        console.log(x);
      }`,
    },
    {
      code: `
      if (x) {
        if (y) {}
          console.log(x);
      }`,
    },
    {
      code: `
      if (x) {
        console.log(x);
        if (y) {}
      }`,
    },
    {
      code: `
      if (x) {
        if (y) {}
      } else {}`,
    },
    {
      code: `
      if (x) {
        if (y) {} else {}
      }`,
    },
  ],

  invalid: [
    {
      code: `
      if (x) {
    //^^ > {{Enclosing "if" statement}}
        if (y) {}
      //^^ {{Merge this if statement with the enclosing one.}}
      }`,
      options: ["sonar-runtime"],
      errors: [
        {
          message: JSON.stringify({
            secondaryLocations: [
              {
                line: 2,
                column: 6,
                endLine: 2,
                endColumn: 8,
                message: `Enclosing "if" statement`,
              },
            ],
            message: "Merge this if statement with the enclosing one.",
          }),
          line: 4,
          column: 9,
          endLine: 4,
          endColumn: 11,
        },
      ],
    },
    {
      code: `
      if (x)
        if(y) {}`,
      errors: [{ message: "Merge this if statement with the enclosing one." }],
    },
    {
      code: `
      if (x) {
        if(y) {
          if(z) {
          }
        }
      }`,
      errors: 2,
    },
  ],
});
