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
import * as fs from "fs";

const outputPath = process.argv[2];

const meta = [];

const readmeContent = fs.readFileSync("README.md", "utf-8");

const lines = readmeContent.split(/\n/);
let state: "before-bug" | "bug" | "between" | "code-smell" = "before-bug";
for (const line of lines) {
  if (state === "before-bug" && line.startsWith("*")) {
    state = "bug";
  }

  if (state === "bug") {
    if (line.startsWith("*")) {
      addRule(line, "BUG");
    } else {
      state = "between";
    }
  }

  if (state === "between" && line.startsWith("*")) {
    state = "code-smell";
  }

  if (state === "code-smell") {
    if (line.startsWith("*")) {
      addRule(line, "CODE_SMELL");
    } else {
      break;
    }
  }
}

function addRule(line: string, type: string) {
  const name = line
    .substr(2)
    .split("([")[0]
    .trim();
  const key = "sonarjs/" + line.split("`")[1].trim();

  meta.push({
    key,
    name,
    type,
    description: `See description of ESLint rule <code>sonarjs/${key}</code> at the <a href="https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/${key}.md">eslint-plugin-sonarjs website</a>.`,
  });
}

fs.writeFileSync(outputPath, JSON.stringify(meta));
