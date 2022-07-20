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
import * as fs from "fs";
import * as path from "path";
import { ESLint } from "eslint";
import * as lodash from "lodash";
import * as minimist from "minimist";

const rulesPath = path.join(__dirname, "../lib/rules");

run();

async function run() {
  const argv = minimist(process.argv.slice(2), {
    string: ["rule"],
    boolean: ["update"],
  });

  const rules = getRules(argv.rule);

  if (!rules.length) {
    console.error("No rules found!");
    process.exit(1);
  }

  console.log("Found rules:");
  rules.forEach(rule => {
    console.log("  *", rule);
  });
  console.log("");

  const sourcesPath = path.join(__dirname, "javascript-test-sources/src");
  if (!fs.existsSync(sourcesPath)) {
    console.error("No sources found!");
    process.exit(1);
  }

  const eslint = new ESLint({
    overrideConfig: {
      parser: "@babel/eslint-parser",
      parserOptions: {
        ecmaFeatures: { jsx: true, experimentalObjectRestSpread: true },
        ecmaVersion: 2018,
        sourceType: "module",
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          parserOpts: {
            allowReturnOutsideFunction: true,
          },
          presets: ["@babel/preset-env", "@babel/preset-flow", "@babel/preset-react"],
          plugins: ["@babel/plugin-proposal-function-bind", "@babel/plugin-proposal-export-default-from"]
        }
      },
      rules: getEslintRules(rules),
    },
    rulePaths: [rulesPath],
    useEslintrc: false,
    allowInlineConfig: false,
    ignorePath: path.join(__dirname, ".eslintignore"),
  });

  const reportResults = await eslint.lintFiles([sourcesPath]);

  const results: Results = {};
  rules.forEach(rule => (results[rule] = {}));

  reportResults.forEach(result => {
    result.messages.forEach(message => {
      if (message.ruleId) {
        addToResults(
          results,
          getFileNameForSnapshot(result.filePath),
          message.ruleId,
          message.line,
        );
      } else {
        throw new Error(
          `Unexpected error: ${JSON.stringify(message)} Filepath: ${result.filePath}`,
        );
      }
    });
  });

  if (argv.update) {
    writeResults(results);
  } else {
    const passed = checkResults(results);
    if (!passed) {
      process.exitCode = 1;
    }
  }
}

function getRules(rule?: string) {
  const rules = fs
    .readdirSync(rulesPath)
    .filter(file => file.endsWith(".js"))
    .map(file => file.substring(0, file.indexOf(".js")));

  if (rule) {
    return rules.includes(rule) ? [rule] : [];
  } else {
    return lodash.sortBy(rules);
  }
}

function getEslintRules(rules: string[]) {
  const eslintRules: { [rule: string]: "error" } = {};
  rules.forEach(rule => {
    eslintRules[rule] = "error";
  });
  return eslintRules;
}

function addToResults(results: Results, filePath: string, ruleId: string, line: number) {
  if (!results[ruleId]) {
    results[ruleId] = {};
  }
  if (!results[ruleId][filePath]) {
    results[ruleId][filePath] = [];
  }
  results[ruleId][filePath].push(line);
}

function getFileNameForSnapshot(path: string): string {
  const marker = "/javascript-test-sources/";
  const unixPath = path.replace(/\\+/g, '/');
  const pos = unixPath.indexOf(marker);
  return unixPath.substr(pos + marker.length);
}

interface Results {
  [rule: string]: {
    [file: string]: number[];
  };
}

function writeResults(results: Results) {
  Object.keys(results).forEach(rule => {
    const content: string[] = [];

    Object.keys(results[rule])
      .sort()
      .forEach(file => {
        const lines = results[rule][file];
        content.push(`${file}: ${lines.join()}`);
      });

    writeSnapshot(rule, content.join("\n") + "\n");
  });
}

function checkResults(actual: Results) {
  const actualRules = Object.keys(actual);
  const expected: Results = readSnapshots(actualRules);
  let passed = true;

  actualRules.forEach(rule => {
    const expectedFiles = expected[rule];
    const actualFiles = actual[rule] || {};
    const allFiles = lodash.union(Object.keys(actualFiles), Object.keys(expectedFiles));

    allFiles.forEach(file => {
      const expectedLines = expectedFiles[file] || [];
      const actualLines = actualFiles[file] || [];

      const missingLines = lodash.difference(expectedLines, actualLines);
      if (missingLines.length > 0) {
        passed = false;
        console.log("Missing issues:");
        console.log("  * Rule:", rule);
        console.log("  * File:", file);
        console.log("  * Lines:", missingLines.join(", "));
        console.log();
      }

      const extraLines = lodash.difference(actualLines, expectedLines);
      if (extraLines.length > 0) {
        passed = false;
        console.log("Extra issues:");
        console.log("  * Rule:", rule);
        console.log("  * File:", file);
        console.log("  * Lines:", extraLines.join(", "));
        console.log();
      }
    });
  });

  return passed;
}

function writeSnapshot(rule: string, content: string): void {
  const fileName = path.join(__dirname, "snapshots", rule);
  fs.writeFileSync(fileName, content);
}

function readSnapshots(rules: string[]): Results {
  const snapshotsDir = path.join(__dirname, "snapshots");
  const results: Results = {};

  rules.forEach(rule => {
    results[rule] = {};
    const content = readSnapshotFile(snapshotsDir, rule);
    content.forEach(line => {
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        const file = line.substring(0, colonIndex);
        const lines = line
          .substr(colonIndex + 1)
          .split(",")
          .map(s => parseInt(s, 10));
        results[rule][file] = lines;
      }
    });
  });

  return results;
}

function readSnapshotFile(snapshotsDir: string, ruleName: string) {
  const rulePath = path.join(snapshotsDir, ruleName);
  if (fs.existsSync(rulePath)) {
    return fs.readFileSync(rulePath, "utf-8").split("\n");
  } else {
    return [];
  }
}
