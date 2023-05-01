module.exports = {
  env: {
    browser: true,
  },
  plugins: ['eslint-comments', 'jest', 'promise', '@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: [
    'airbnb-typescript',
    'plugin:eslint-comments/recommended',
    'plugin:jest/recommended',
    'plugin:promise/recommended',
    'eslint-config-prettier',
    'plugin:react/recommended',
    'plugin:import/recommended',
  ],
  rules: {
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: false,
      },
    ],
    'implicit-arrow-linebreak': 0,
    'react/sort-comp': [
      1,
      {
        order: [
          'type-annotations',
          'static-methods',
          'instance-variables',
          'lifecycle',
          'everything-else',
          'render',
        ],
      },
    ],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/dot-notation': 'off',
  },
};
