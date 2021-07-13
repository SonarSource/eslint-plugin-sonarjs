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
import { configs, rules } from '../src/index';

const rulesPath = path.join(__dirname, '../src/rules');
const existingRules = fs.readdirSync(rulesPath).map(file => file.substring(0, file.indexOf('.ts')));

it('should declare all rules in recommended config', () => {
  existingRules.forEach(rule => {
    expect(configs.recommended.rules).toHaveProperty(`sonarjs/${rule}`);
  });
  expect(Object.keys(configs.recommended.rules!)).toHaveLength(existingRules.length);
});

it('should declare all rules', () => {
  existingRules.forEach(rule => {
    expect(rules).toHaveProperty(rule);
  });
  expect(Object.keys(rules)).toHaveLength(existingRules.length);
});

it('should document all rules', () => {
  const root = path.join(__dirname, '../');
  const README = fs.readFileSync(`${root}/README.md`, 'utf8');
  existingRules.forEach(rule => {
    expect(README.includes(rule)).toBe(true);
    expect(fs.existsSync(`${root}/docs/rules/${rule}.md`)).toBe(true);
    expect(rules[rule].meta.docs.url).toBe(
      `https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/${rule}.md`,
    );
  });
});
