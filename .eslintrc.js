module.exports = {
  root: true,
  ignorePatterns: ['webpack.config.js'],
  overrides: [
    {
      files: ['*.ts'],
      excludedFiles: ['*.d.ts', '*.spec.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:prettier/recommended',
        'prettier/@typescript-eslint',
        'plugin:import/recommended',
        'plugin:import/stage-0',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
      ],
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: __dirname,
      },
      rules: {
        'import/no-cycle': 'error',
      },
    },
    {
      files: ['*.spec.ts'],
      extends: ['plugin:jest/recommended', 'plugin:jest/style'],
      env: {
        'jest/globals': true,
      },
    },
    {
      files: ['*.js'],
      extends: ['plugin:prettier/recommended'],
    },
    {
      files: ['*.json'],
      extends: ['plugin:json/recommended-with-comments'],
    },
  ],
};
