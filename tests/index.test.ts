import * as fs from "fs";
import * as path from "path";
import { configs, rules } from "../src/index";

const rulesPath = path.join(__dirname, "../src/rules");
const existingRules = fs.readdirSync(rulesPath).map(file => file.substring(0, file.indexOf(".ts")));

it("should declare all rules in recommended config", () => {
  existingRules.forEach(rule => {
    expect(configs.recommended.rules).toHaveProperty(`sonarjs/${rule}`);
  });
  expect(Object.keys(configs.recommended.rules!)).toHaveLength(existingRules.length);
});

it("should declare all rules", () => {
  existingRules.forEach(rule => {
    expect(rules).toHaveProperty(rule);
  });
  expect(Object.keys(rules)).toHaveLength(existingRules.length);
});
