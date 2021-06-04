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

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });
import rule = require('../../src/rules/no-identical-expressions');

ruleTester.run('no-identical-expressions', rule, {
  valid: [
    { code: `1 << 1;` },
    { code: `foo(), foo();` },
    { code: `if (Foo instanceof Foo) { }` },
    {
      code: `name === "any" || name === "string" || name === "number" || name === "boolean" || name === "never"`,
    },
    { code: `a != a;` },
    { code: `a === a;` },
    { code: `a !== a;` },

    { code: `node.text === "eval" || node.text === "arguments";` },
    { code: `nodeText === '"use strict"' || nodeText === "'use strict'";` },
    { code: `name.charCodeAt(0) === CharacterCodes._ && name.charCodeAt(1) === CharacterCodes._;` },
    { code: `if (+a !== +b) { }` },
    { code: 'first(`const`) || first(`var`);' },
    // eslint-disable-next-line no-template-curly-in-string
    {
      code: 'window[`${prefix}CancelAnimationFrame`] || window[`${prefix}CancelRequestAnimationFrame`];',
    },
    { code: '' },
    // eslint-disable-next-line no-useless-escape
    { code: `dirPath.match(/localhost:\d+/) || dirPath.match(/localhost:\d+\s/);` },
    { code: `a == b || a == c;` },
    { code: `a == b;` },
  ],
  invalid: [
    {
      code: 'a == b && a == b',
      errors: [
        {
          message: 'Correct one of the identical sub-expressions on both sides of operator "&&"',
          column: 1,
          endColumn: 17,
        },
      ],
    },
    {
      code: 'a == b || a == b',
      errors: 1,
    },
    {
      code: `a == b || a == b
      //     ^^^^^^>   ^^^^^^`,
      options: ['sonar-runtime'],
      errors: [
        {
          message: JSON.stringify({
            secondaryLocations: [
              {
                line: 1,
                column: 0,
                endLine: 1,
                endColumn: 6,
                message: '',
              },
            ],
            message: `Correct one of the identical sub-expressions on both sides of operator "||"`,
          }),
          line: 1,
          endLine: 1,
          column: 11,
          endColumn: 17,
        },
      ],
    },
    {
      code: 'a > a',
      errors: 1,
    },
    {
      code: 'a >= a',
      errors: 1,
    },
    {
      code: 'a < a',
      errors: 1,
    },
    {
      code: 'a <= a',
      errors: 1,
    },
    {
      code: '5 / 5',
      errors: 1,
    },
    {
      code: '5 - 5',
      errors: 1,
    },
    {
      code: 'a << a',
      errors: 1,
    },
    {
      code: 'a << a',
      errors: 1,
    },
    {
      code: 'a >> a',
      errors: 1,
    },
    {
      code: '1 >> 1',
      errors: 1,
    },
    {
      code: '5 << 5',
      errors: 1,
    },
    {
      code: 'obj.foo() == obj.foo()',
      errors: 1,
    },
    {
      code: 'foo(/*comment*/() => doSomething()) === foo(() => doSomething())',
      errors: 1,
    },
    {
      code: '(a == b) == (a == b)',
      errors: 1,
    },
    {
      code: 'if (+a !== +a);',
      errors: 1,
    },
  ],
});
