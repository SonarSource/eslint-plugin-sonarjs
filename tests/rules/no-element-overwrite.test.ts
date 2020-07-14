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
import rule = require("../../src/rules/no-element-overwrite");

const ruleTester = new RuleTester();

ruleTester.run("no-element-overwrite", rule, {
  valid: [
    {
      code: `
      fruits[1] = "banana";
      fruits[2] = "apple";`,
    },
    {
      code: `
      fruits[1] = "banana";
      vegerables[1] = "tomato";`,
    },
    {
      code: `
      fruits[1] = "banana";
      console.log("Hello");
      fruits[1] = "apple"; // FN`,
    },
    {
      code: `
      fruits[1] = "banana";
      foo(fruits);
      fruits[1] = "apple";`,
    },
    {
      code: `
      fruits[1] = "banana";
      if (cond) {
        fruits[1] = "apple";
      }`,
    },
    {
      code: `
      fruits[2] = "orange";
      fruits[2] = fruits[2] + ";";`,
    },
    {
      code: `
      this.fruits[2] = "orange";
      this.fruits[2] = foo(this.fruits) + ";";`,
    },
    {
      code: `
      this.fruits[2] = "orange";
      this.fruits[2] = foo(this.bar, this.fruits);`,
    },
    {
      code: `
      function anotherCollection() {
        var x = [1,], y = [1, ];
        x[1] = 3;
        y[1] = x[1];
        x[1] = 43; // Compliant
      }`,
    },
    {
      code: `
      function indexChanges() {
        var nums = [];
        var i = 1;
        nums[i++] = 42;
        nums[i++] = 43;
        i += 1;
        nums[i] = 2;
        i += 1;
        nums[i] = 2;
      }`,
    },
  ],
  invalid: [
    {
      code: `
      fruits[1] = "banana";
      fruits[1] = "apple";`,
      errors: [
        {
          message: `Verify this is the index that was intended; "1" was already set on line 2.`,
          line: 3,
          column: 7,
          endColumn: 26,
        },
      ],
    },
    {
      code: `
      fruits[1] = "banana";
    //^^^^^^^^^^^^^^^^^^^^>
      fruits[1] = "apple";
    //^^^^^^^^^^^^^^^^^^^`,
      options: ["sonar-runtime"],
      errors: [
        JSON.stringify({
          secondaryLocations: [{ line: 2, column: 6, endLine: 2, endColumn: 26, message: "Original value" }],
          message: `Verify this is the index that was intended; "1" was already set on line 2.`,
        }),
      ],
    },
    {
      code: `
      fruits[1] = "banana";
      fruits[2] = "orange";
      fruits[1] = "apple";`,
      errors: [{ message: `Verify this is the index that was intended; "1" was already set on line 2.` }],
    },
    {
      code: `
      this.fruits[1] = "banana";
      this.fruits[1] = "apple";`,
      errors: [{ message: `Verify this is the index that was intended; "1" was already set on line 2.` }],
    },
    {
      code: `
      this.fruits[1] = "banana";
      this.fruits[1] = foo(this.bar);`,
      errors: [{ message: `Verify this is the index that was intended; "1" was already set on line 2.` }],
    },
    {
      code: `
      for (var i = 0; i < 10; i++) {
        fruits[i] = "melon";
        fruits[i] = "pear";
        fruits[i++] = "another";
      }`,
      errors: [{ message: `Verify this is the index that was intended; "i" was already set on line 3.` }],
    },
    {
      code: `
        myMap.set("key", 1);
        myMap.set("key", 2);
        myMap.clear();
        myMap.set("key", 1);`,
      errors: [{ message: `Verify this is the index that was intended; "key" was already set on line 2.` }],
    },
    {
      code: `
        mySet.add(1);
        mySet.add(2);
        mySet.add(3);
        mySet.add(2);
        mySet.clear();
        mySet.add(2);`,
      errors: [{ message: `Verify this is the index that was intended; "2" was already set on line 3.` }],
    },
    {
      code: `
      function switchTest(kind) {
        var result = [];
        switch (kind) {
          case 1:
            result[1] = 1;
            result[1] = 2;
            break;
          case 2:
            result[2] = 1;
            result[2] = 2;
            break;
        }
      }`,
      errors: [
        { message: `Verify this is the index that was intended; "1" was already set on line 6.` },
        { message: `Verify this is the index that was intended; "2" was already set on line 10.` },
      ],
    },
    {
      code: `
        fruits[''] = "banana";
        fruits[''] = "apple";`,
      errors: [{ message: `Verify this is the index that was intended; "" was already set on line 2.` }],
    },
  ],
});
