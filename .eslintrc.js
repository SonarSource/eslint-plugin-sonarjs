// eslint-disable-next-line notice/notice
module.exports = {
  env: { es6: true, node: true, jest: true },
  extends: ['eslint:recommended', 'plugin:import/errors', 'prettier', 'plugin:sonarjs/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: { modules: true },
    sourceType: 'module',
  },
  plugins: ['import', 'notice', 'sonarjs'],
  rules: {
    // possible errors
    'for-direction': 'error',
    'no-prototype-builtins': 'error',
    'no-template-curly-in-string': 'error',
    'no-unsafe-negation': 'error',

    // best practices
    'array-callback-return': 'error',
    'block-scoped-var': 'error',
    complexity: 'error',
    'consistent-return': 'error',
    eqeqeq: ['error', 'smart'],
    'guard-for-in': 'error',
    'no-alert': 'error',
    'no-caller': 'error',
    'no-div-regex': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-extra-label': 'error',
    'no-floating-decimal': 'error',
    'no-implied-eval': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-proto': 'error',
    'no-restricted-properties': 'error',
    'no-return-assign': 'error',
    'no-return-await': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-expressions': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-useless-escape': 'error',
    'no-useless-return': 'error',
    'no-void': 'error',
    'no-with': 'error',
    radix: 'error',
    'require-await': 'error',
    'wrap-iife': 'error',
    yoda: 'error',

    // stylistic
    camelcase: 'warn',
    'consistent-this': ['warn', 'that'],
    'func-name-matching': 'error',
    'func-style': ['warn', 'declaration', { allowArrowFunctions: true }],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'max-depth': 'warn',
    'max-lines': ['warn', 1000],
    'max-params': ['warn', 4],
    'no-array-constructor': 'warn',
    'no-bitwise': 'warn',
    'no-lonely-if': 'error',
    'no-multi-assign': 'warn',
    'no-nested-ternary': 'warn',
    'no-new-object': 'warn',
    'no-underscore-dangle': 'warn',
    'no-unneeded-ternary': 'warn',
    'one-var': ['warn', 'never'],
    'operator-assignment': 'warn',
    'padding-line-between-statements': 'error',

    // es2015
    'no-duplicate-imports': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-rename': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-destructuring': ['warn', { object: true, array: false }],
    'prefer-numeric-literals': 'warn',
    'prefer-rest-params': 'warn',
    'prefer-spread': 'warn',

    // disabled because of the usage of typescript-eslint-parser
    // https://github.com/eslint/typescript-eslint-parser/issues/77
    'no-undef': 'off',
    'no-unused-vars': 'off',

    // import
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['tests/**/*', 'ruling/**/*'],
      },
    ],
    'import/extensions': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-absolute-path': 'error',
    'import/no-amd': 'error',
    'import/no-deprecated': 'error',
    'import/no-duplicates': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-named-as-default': 'error',
    'import/no-named-as-default-member': 'error',
    'import/no-named-default': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', ['index', 'sibling'], ['parent', 'internal']],
        'newlines-between': 'never',
      },
    ],

    // does not properly work with ts
    'import/no-unresolved': 'off',

    // notice
    'notice/notice': ['error', { templateFile: 'scripts/file-header.ts' }],

    // sonarjs
    'sonarjs/cognitive-complexity': 'warn',
  },
};
