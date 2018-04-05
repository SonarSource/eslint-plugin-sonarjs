import * as fs from "fs";
import * as path from "path";
import { configs, rules } from "../src/index";

it("should declare configs", () => {
  expect(configs.recommended).toBeDefined();
});

it("should declare all rules", () => {
  const rulesPath = path.join(__dirname, "../src/rules");
  const existingRules = fs.readdirSync(rulesPath).map(file => file.substring(0, file.indexOf(".ts")));
  existingRules.forEach(rule => {
    expect(rules).toHaveProperty(rule);
  });
  expect(Object.keys(rules)).toHaveLength(existingRules.length);
});
