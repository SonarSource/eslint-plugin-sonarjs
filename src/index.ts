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
import type { TSESLint } from '@typescript-eslint/utils';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

const sonarjsRules: string[] = [
  'cognitive-complexity',
  'elseif-without-else',
  'max-switch-cases',
  'no-all-duplicated-branches',
  'no-collapsible-if',
  'no-collection-size-mischeck',
  'no-duplicate-string',
  'no-duplicated-branches',
  'no-element-overwrite',
  'no-empty-collection',
  'no-extra-arguments',
  'no-gratuitous-expressions',
  'no-identical-conditions',
  'no-identical-expressions',
  'no-identical-functions',
  'no-ignored-return',
  'no-inverted-boolean-check',
  'no-nested-switch',
  'no-nested-template-literals',
  'no-one-iteration-loop',
  'no-redundant-boolean',
  'no-redundant-jump',
  'no-same-line-conditional',
  'no-small-switch',
  'no-unused-collection',
  'no-use-of-empty-return-value',
  'no-useless-catch',
  'non-existent-operator',
  'prefer-immediate-return',
  'prefer-object-literal',
  'prefer-single-boolean-return',
  'prefer-while',
];

const sonarjsRuleModules: { [key: string]: any } = {};

const plugin = {
  configs: {},
  rules: {},
};

const recommendedLegacyConfig: TSESLint.Linter.Config = { plugins: ['sonarjs'], rules: {} };
const recommendedConfig: FlatConfig.Config = {
  plugins: {
    sonarjs: plugin,
  },
  rules: {},
};

sonarjsRules.forEach(rule => {
  sonarjsRuleModules[rule] = require(`./rules/${rule}`);
  const {
    meta: {
      docs: { recommended },
    },
  } = sonarjsRuleModules[rule];
  recommendedConfig.rules![`sonarjs/${rule}`] = recommended === undefined ? 'off' : 'error';
});
recommendedLegacyConfig.rules = recommendedConfig.rules;

const configs = {
  recommended: recommendedConfig,
  'recommended-legacy': recommendedLegacyConfig,
};
plugin.configs = configs;

export { sonarjsRuleModules as rules, configs };
