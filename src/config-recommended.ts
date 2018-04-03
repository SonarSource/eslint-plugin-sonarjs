import { Linter } from "eslint";

const config: Linter.Config = {
  rules: {
    "sonarjs/no-small-switch": "error",
  },
};

export = config;
