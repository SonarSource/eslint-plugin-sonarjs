import config = require("../src/config-recommended");

it("should declare rules", () => {
  expect(Object.keys(config.rules)).toHaveLength(1);
});
