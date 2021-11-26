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

/* eslint-disable no-template-curly-in-string */
import { ruleTester } from '../rule-tester';
import * as rule from '../../src/rules/no-nested-template-literals';

ruleTester.run('Template literals should not be nested', rule, {
  valid: [
    {
      code: 'let nestedMessage = `${count} ${color}`;',
    },
    {
      code: 'let message = `I have ${color ? nestedMessage : count} apples`;',
    },
  ],
  invalid: [
    {
      code: 'let message = `I have ${color ? `${x ? `indeed 0` : count} ${color}` : count} apples`;',
      errors: [
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 33,
          endColumn: 69,
        },
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 40,
          endColumn: 50,
        },
      ],
    },
    {
      code: 'let message = `I have ${color ? `${count} ${color}` : count} apples`;',
      errors: [
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 33,
          endColumn: 52,
        },
      ],
    },
    {
      code: 'let message = `I have ${color ? `${x ? `indeed ${0}` : count} ${color}` : count} apples`;',
      errors: [
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 33,
          endColumn: 72,
        },
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 40,
          endColumn: 53,
        },
      ],
    },
    {
      code:
        'function tag(strings, ...keys) {console.log(strings[2]);}\n' +
        'let message1 = tag`I have ${color ? `${count} ${color}` : count} apples`;\n' +
        'let message2 = tag`I have ${color ? tag`${count} ${color}` : count} apples`;',
      errors: [
        {
          messageId: 'nestedTemplateLiterals',
          line: 2,
          endLine: 2,
          column: 37,
          endColumn: 56,
        },
        {
          messageId: 'nestedTemplateLiterals',
          line: 3,
          endLine: 3,
          column: 40,
          endColumn: 59,
        },
      ],
    },
    {
      code: 'let message = `I have ${color ? `${count} ${color}` : `this is ${count}`} apples`;',
      errors: [
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 33,
          endColumn: 52,
        },
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 55,
          endColumn: 73,
        },
      ],
    },
    {
      code: 'let message = `I have ${`${count} ${color}`} ${`this is ${count}`} apples`;',
      errors: [
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 25,
          endColumn: 44,
        },
        {
          messageId: 'nestedTemplateLiterals',
          line: 1,
          endLine: 1,
          column: 48,
          endColumn: 66,
        },
      ],
    },
  ],
});
