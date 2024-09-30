/*
 * eslint-plugin-sonarjs
 * Copyright (C) 2018-2024 SonarSource SA
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
import { valid } from 'semver';
import { configs, rules, meta } from '../src';

const rulesPath = path.join(__dirname, '../src/rules');
const existingRules = fs.readdirSync(rulesPath).map(file => file.substring(0, file.indexOf('.ts')));

it('should declare all rules in recommended config', () => {
  existingRules.forEach(rule => {
    expect(configs.recommended.rules).toHaveProperty(`sonarjs/${rule}`);
  });
  expect(Object.keys(configs.recommended.rules!)).toHaveLength(existingRules.length);
  expect(new Set(Object.values(configs.recommended.rules!))).toEqual(new Set(['off', 'error']));
  existingRules.forEach(rule => {
    expect(configs.recommended.plugins!['sonarjs'].rules).toHaveProperty(rule);
  });
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
    expect(rules[rule as keyof typeof rules].meta.docs!.url).toBe(
      `https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/${rule}.md`,
    );
  });
});

it('should export legacy config', () => {
  const legacyConfig = configs['recommended-legacy'];
  expect(legacyConfig.plugins).toEqual(['sonarjs']);
  expect(legacyConfig.rules).toEqual(configs.recommended.rules);
});

it('should export meta', () => {
  expect(meta.name).toEqual('eslint-plugin-sonarjs');
  expect(valid(meta.version)).toBeTruthy();
});
