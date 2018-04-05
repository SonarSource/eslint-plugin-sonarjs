import { Linter } from "eslint";

const sonarjsRules: [string, Linter.RuleLevel][] = [
  ["no-identical-expressions", "error"],
  ["no-redundant-boolean", "error"],
  ["no-small-switch", "error"],
];

const sonarjsRuleModules: any = {};

const configs: { recommended: Linter.Config } = {
  recommended: { rules: {} },
};

sonarjsRules.forEach(rule => (sonarjsRuleModules[rule[0]] = require(`./rules/${rule[0]}`)));
sonarjsRules.forEach(rule => (configs.recommended.rules![`sonarjs/${rule[0]}`] = rule[1]));

export { sonarjsRuleModules as rules, configs };
