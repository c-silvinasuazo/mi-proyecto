// Lint rules for the Playwright tests. The typed rules catch the most common test bug: a promise that isn't awaited
// (an action or assertion that runs after the test has moved on, or never).
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'mobile/'] },
  {
    files: ['tests/**/*.ts', 'playwright.config.ts'],
    extends: [...tseslint.configs.recommended],
    languageOptions: { parserOptions: { project: './tsconfig.json' } },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      // Notion-style page internals (Dropzone, window globals) are reached through `any` on purpose.
      '@typescript-eslint/no-explicit-any': 'off',
      // `const { defaultBrowserType, ...device } = devices[...]` drops a key on purpose.
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    settings: { playwright: { globalAliases: { test: ['setup'] } } },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-focused-test': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-networkidle': 'warn',
      'playwright/no-force-option': 'error',
      // Preconditions skip with a reason while eph lacks something (tests/eph/preconditions.ts); an unconditional skip
      // is still flagged.
      'playwright/no-skipped-test': ['warn', { allowConditional: true }],
      // Helpers that assert inside: the login helpers, the page and attendee checks, and the placeholders, which fail
      // with "steps not recorded yet" once their precondition is met.
      'playwright/expect-expect': ['warn', { assertFunctionNames: ['login', 'logInToEphEditor', 'expectPageWorks', 'addAttendee', 'stepsNotRecordedYet'] }],
    },
  },
  {
    // Placeholder groups: every test is a test.fixme with an empty body until its steps are recorded.
    files: ['tests/dev2/**', 'tests/cfp/**'],
    rules: { 'playwright/expect-expect': 'off' },
  },
);
