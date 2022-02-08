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
          ...error('!=', `if (x != 1) {}`),
          line: 1,
          endLine: 1,
          column: 5,
          endColumn: 14,
        },
      ],
    },
    // `!=` => `==`
    {
      code: `if (!(x != 1)) {}`,
      errors: [error('==', `if (x == 1) {}`)],
    },
    // `===` => `!==`
    {
      code: `if (!(x === 1)) {}`,
      errors: [error('!==', `if (x !== 1) {}`)],
    },
    // `!==` => `===`
    {
      code: `if (!(x !== 1)) {}`,
      errors: [error('===', `if (x === 1) {}`)],
    },
    // `>` => `<=`
    {
      code: `if (!(x > 1)) {}`,
      errors: [error('<=', `if (x <= 1) {}`)],
    },
    // `<` => `>=`
    {
      code: `if (!(x < 1)) {}`,
      errors: [error('>=', `if (x >= 1) {}`)],
    },
    // `>=` => `<`
    {
      code: `if (!(x >= 1)) {}`,
      errors: [error('<', `if (x < 1) {}`)],
    },
    // `<=` => `>`
    {
      code: `if (!(x <= 1)) {}`,
      errors: [error('>', `if (x > 1) {}`)],
    },
    // ternary operator
    {
      code: `!(x != 1) ? 1 : 2`,
      errors: [error('==', `x == 1 ? 1 : 2`)],
    },
    // not conditional
    {
      code: `foo(!(x === 1))`,
      errors: [error('!==', `foo(x !== 1)`)],
    },
    {
      code: `let foo = !(x <= 4)`,
      errors: [error('>', `let foo = x > 4`)],
    },
    {
      code: `let foo = !!(a < b)`,
      errors: [error('>=', 'let foo = !(a >= b)')],
    },
  ],
});

function error(invertedOperator: string, output: string): TSESLint.TestCaseError<string> {
  return {
    messageId: 'useOppositeOperator',
    data: { invertedOperator },
    suggestions: [
      {
        messageId: 'suggestOperationInversion',
        output,
      },
    ],
  };
}
