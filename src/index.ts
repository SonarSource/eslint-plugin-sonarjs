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
import * as fs from 'fs';
import * as path from 'path';
import { TSESLint } from '@typescript-eslint/experimental-utils';

const sonarjsRules: string[] = fs
  .readdirSync(path.join(__dirname, 'rules'))
  .map(filename => filename.substr(0, filename.lastIndexOf('.ts')));

const sonarjsRuleModules: { [key: string]: any } = {};

const configs: { recommended: TSESLint.Linter.Config & { plugins: string[] } } = {
  recommended: { plugins: ['sonarjs'], rules: {} },
};

sonarjsRules.forEach(rule => {
  sonarjsRuleModules[rule] = require(`./rules/${rule}`);
  const {
    meta: {
      docs: { recommended },
    },
  } = sonarjsRuleModules[rule];
  configs.recommended.rules![`sonarjs/${rule}`] = recommended === false ? 'off' : recommended;
});

export { sonarjsRuleModules as rules, configs };
