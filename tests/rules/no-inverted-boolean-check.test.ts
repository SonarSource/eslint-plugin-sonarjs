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
import { RuleTester } from 'eslint';

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
import rule = require('../../src/rules/no-inverted-boolean-check');

ruleTester.run('no-inverted-boolean-check', rule, {
  valid: [
    {
      code: `if (!x) {}`,
    },
    {
      code: `if (x == 1) {}`,
    },
    {
      code: `if (!(x + 1)) {}`,
    },
    {
      code: `if (+(x == 1)) {}`,
    },
    {
      code: `!x ? 2 : 3`,
    },
  ],
  invalid: [
    // `==` => `!=`
    {
      code: `if (!(x == 1)) {}`,
      errors: [
        {
          message: message('!='),
          line: 1,
          endLine: 1,
          column: 5,
          endColumn: 14,
        },
      ],
      output: `if (x != 1) {}`,
    },
    // `!=` => `==`
    {
      code: `if (!(x != 1)) {}`,
      errors: [message('==')],
      output: `if (x == 1) {}`,
    },
    // `===` => `!==`
    {
      code: `if (!(x === 1)) {}`,
      errors: [message('!==')],
      output: `if (x !== 1) {}`,
    },
    // `!==` => `===`
    {
      code: `if (!(x !== 1)) {}`,
      errors: [message('===')],
      output: `if (x === 1) {}`,
    },
    // `>` => `<=`
    {
      code: `if (!(x > 1)) {}`,
      errors: [message('<=')],
      output: `if (x <= 1) {}`,
    },
    // `<` => `>=`
    {
      code: `if (!(x < 1)) {}`,
      errors: [message('>=')],
      output: `if (x >= 1) {}`,
    },
    // `>=` => `<`
    {
      code: `if (!(x >= 1)) {}`,
      errors: [message('<')],
      output: `if (x < 1) {}`,
    },
    // `<=` => `>`
    {
      code: `if (!(x <= 1)) {}`,
      errors: [message('>')],
      output: `if (x > 1) {}`,
    },
    // ternary operator
    {
      code: `!(x != 1) ? 1 : 2`,
      errors: [message('==')],
      output: `x == 1 ? 1 : 2`,
    },
    // not conditional
    {
      code: `foo(!(x === 1))`,
      errors: [message('!==')],
      output: `foo(x !== 1)`,
    },
    {
      code: `let foo = !(x <= 4)`,
      errors: [message('>')],
      output: `let foo = x > 4`,
    },
  ],
});

function message(oppositeOperator: string) {
  return `Use the opposite operator (${oppositeOperator}) instead.`;
}
