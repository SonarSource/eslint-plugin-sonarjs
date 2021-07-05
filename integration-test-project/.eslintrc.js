module.exports = {
  root: true,
  env: { es6: true, node: true },
  extends: ["plugin:sonarjs/recommended"],
  plugins: ["sonarjs"],
  rules: {
    // activate all disabled by default rules
    "sonarjs/elseif-without-else": "error",
  },
};
