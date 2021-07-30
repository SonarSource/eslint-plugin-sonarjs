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
import { TSESTree } from '@typescript-eslint/experimental-utils';
import { isRequiredParserServices } from '../../src/utils/parser-services';
import { Rule } from '../../src/utils/types';
import { RuleTester } from '../rule-tester';

const MISSING_TYPE_INFORMATION = 'Missing type information';
const AVAILABLE_TYPE_INFORMATION = 'Available type information';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
  },
  create(context: Rule.RuleContext) {
    return {
      Program: (node: TSESTree.Node) => {
        const services = context.parserServices;
        const hasTypeInformation = isRequiredParserServices(services);
        const message = hasTypeInformation ? AVAILABLE_TYPE_INFORMATION : MISSING_TYPE_INFORMATION;
        context.report({
          message,
          node,
        });
      },
    };
  },
};

const typeAgnosticRuleTester = new RuleTester();
typeAgnosticRuleTester.run('Type information is missing with default configuration', rule, {
  valid: [],
  invalid: [
    {
      code: `console.log('Hello, world!');`,
      errors: [
        {
          message: MISSING_TYPE_INFORMATION,
        },
      ],
    },
  ],
});

const partiallyTypeAwareRuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});
partiallyTypeAwareRuleTester.run(
  'Type informaton is missing with typescript-eslint parser only',
  rule,
  {
    valid: [],
    invalid: [
      {
        code: `console.log('Hello, world!');`,
        errors: [
          {
            message: MISSING_TYPE_INFORMATION,
          },
        ],
      },
    ],
  },
);

const typeAwareRuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
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
            message: AVAILABLE_TYPE_INFORMATION,
          },
        ],
      },
    ],
  },
);
