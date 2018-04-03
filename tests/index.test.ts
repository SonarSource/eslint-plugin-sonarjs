import { configs, rules } from "../src/index";

it("should declare configs", () => {
  expect(configs.recommended).toBeDefined();
});

it("should declare rules", () => {
  expect(Object.keys(rules)).toHaveLength(1);
});
