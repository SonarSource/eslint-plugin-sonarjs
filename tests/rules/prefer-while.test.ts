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
import { RuleTester } from "eslint";

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
import rule = require("../../src/rules/prefer-while");

ruleTester.run("prefer-while", rule, {
  valid: [
    { code: "for(;;) { }" },
    { code: "for(var i = 0; condition;) { }" },
    { code: "for(var i = 0; condition; i++) { }" },
    { code: "for(var i = 0;; i++) { }" },
    { code: "for (i; condition; ) { }" },
    { code: "for ( ; i < length; i++ ) { }" },
    { code: "while (i < length) { }" },
    { code: "for (a in b) { }" },
    { code: "for (a of b) { }" },
  ],
  invalid: [
    {
      code: "for(;condition;) {}",
      errors: [{ message: 'Replace this "for" loop with a "while" loop.', line: 1, column: 1, endColumn: 4 }],
    },
    {
      code: "for(;i < 10;) {}",
      errors: [{ message: 'Replace this "for" loop with a "while" loop.', line: 1, column: 1, endColumn: 4 }],
    },
  ],
});
