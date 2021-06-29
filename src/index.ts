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

const sonarjsRules: [string, TSESLint.Linter.RuleLevel][] = [
  ['cognitive-complexity', 'error'],
  ['elseif-without-else', 'error'],
  ['generator-without-yield', 'error'],
  ['max-switch-cases', 'error'],
  ['no-all-duplicated-branches', 'error'],
  ['no-collapsible-if', 'error'],
  ['no-collection-size-mischeck', 'error'],
  ['no-duplicate-string', 'error'],
  ['no-duplicated-branches', 'error'],
  ['no-element-overwrite', 'error'],
  ['no-empty-collection', 'error'],
  ['no-extra-arguments', 'error'],
  ['no-identical-conditions', 'error'],
  ['no-identical-functions', 'error'],
  ['no-identical-expressions', 'error'],
  ['no-inverted-boolean-check', 'error'],
  ['no-nested-switch', 'error'],
  ['no-nested-template-literals', 'error'],
  ['no-one-iteration-loop', 'error'],
  ['no-redundant-boolean', 'error'],
  ['no-redundant-jump', 'error'],
  ['no-same-line-conditional', 'error'],
  ['no-small-switch', 'error'],
  ['no-unused-collection', 'error'],
  ['no-use-of-empty-return-value', 'error'],
  ['no-useless-catch', 'error'],
  ['non-existent-operator', 'error'],
  ['prefer-immediate-return', 'error'],
  ['prefer-object-literal', 'error'],
  ['prefer-single-boolean-return', 'error'],
  ['prefer-while', 'error'],
];

const sonarjsRuleModules: { [key: string]: any } = {};

const configs: { recommended: TSESLint.Linter.Config & { plugins: string[] } } = {
  recommended: { plugins: ['sonarjs'], rules: {} },
};

sonarjsRules.forEach(rule => (sonarjsRuleModules[rule[0]] = require(`./rules/${rule[0]}`)));
sonarjsRules.forEach(rule => (configs.recommended.rules![`sonarjs/${rule[0]}`] = rule[1]));

export { sonarjsRuleModules as rules, configs };
