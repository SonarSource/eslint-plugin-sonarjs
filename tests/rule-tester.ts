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

import { RuleTester as ESLintRuleTester } from 'eslint';
import { TSESLint } from '@typescript-eslint/experimental-utils';
import { Rule } from '../src/utils/types';

// see https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/experimental-utils/src/ts-eslint/RuleTester.ts
export type TestCaseError = Omit<TSESLint.TestCaseError<string>, 'messageId'> & {
  message?: string;
};

type ValidTestCase = TSESLint.ValidTestCase<unknown[]>;

export interface RunTests {
  // RuleTester.run also accepts strings for valid cases
  readonly valid: readonly (ValidTestCase | string)[];
  readonly invalid: readonly InvalidTestCase[];
}

interface InvalidTestCase extends ValidTestCase {
  readonly errors: readonly TestCaseError[] | number;

  readonly output?: string | null;
}

declare class RuleTesterBase {
  constructor(testerConfig?: TSESLint.RuleTesterConfig);

  run(ruleName: string, rule: Rule.RuleModule, tests: RunTests): void;
}

class RuleTester extends (ESLintRuleTester as typeof RuleTesterBase) {}

const defaultParserOptions: TSESLint.RuleTesterConfig = {
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2018, sourceType: 'module', ecmaFeatures: { jsx: true } },
};

const ruleTester = new RuleTester(defaultParserOptions);

const ruleTesterScript = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2018, sourceType: 'script' },
});

export { ruleTester, ruleTesterScript, RuleTester };
