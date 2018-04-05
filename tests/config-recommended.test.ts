import * as fs from "fs";
import * as path from "path";
import config = require("../src/config-recommended");

it("should declare all rules", () => {
  const rulesPath = path.join(__dirname, "../src/rules");
  const existingRules = fs.readdirSync(rulesPath).map(file => file.substring(0, file.indexOf(".ts")));
  existingRules.forEach(rule => {
    expect(config.rules).toHaveProperty(`sonarjs/${rule}`);
  });
  expect(Object.keys(config.rules)).toHaveLength(existingRules.length);
});
