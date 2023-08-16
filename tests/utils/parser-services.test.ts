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
import * as path from 'path';
import type { TSESTree, TSESLint } from '@typescript-eslint/utils';
import { isRequiredParserServices } from '../../src/utils/parser-services';
import { RuleTester } from '../rule-tester';

const rule: TSESLint.RuleModule<string, string[]> = {
  meta: {
    type: 'problem',
    messages: {
      missingTypeInformation: 'Missing type information',
      availableTypeInformation: 'Available type information',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context: TSESLint.RuleContext<string, string[]>) {
    return {
      Program: (node: TSESTree.Node) => {
        const services = context.parserServices;
        const hasTypeInformation = isRequiredParserServices(services);
        const message = hasTypeInformation ? 'availableTypeInformation' : 'missingTypeInformation';
        context.report({
          messageId: message,
          node,
        });
      },
    };
  },
};

const typeAgnosticRuleTester = new RuleTester({
  // eslint-disable-next-line sonarjs/no-duplicate-string
  parser: '@typescript-eslint/parser',
});
typeAgnosticRuleTester.run('Type information is missing with default configuration', rule, {
  valid: [],
  invalid: [
    {
      code: `console.log('Hello, world!');`,
      errors: [
        {
          messageId: 'missingTypeInformation',
        },
      ],
    },
  ],
});

const partiallyTypeAwareRuleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});
partiallyTypeAwareRuleTester.run(
  'Type information is missing with typescript-eslint parser only',
  rule,
  {
    valid: [],
    invalid: [
      {
        code: `console.log('Hello, world!');`,
        errors: [
          {
            messageId: 'missingTypeInformation',
          },
        ],
      },
    ],
  },
);

const typeAwareRuleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: { project: path.resolve(`${__dirname}/../resources/tsconfig.json`) },
});
typeAwareRuleTester.run(
  'Type information is available with typescript-eslint parser and tsconfig',
  rule,
  {
    valid: [],
    invalid: [
      {
        code: `console.log('Hello, world!');`,
        filename: path.resolve(`${__dirname}/../resources/file.ts`),
        errors: [
          {
            messageId: 'availableTypeInformation',
          },
        ],
      },
    ],
  },
);
