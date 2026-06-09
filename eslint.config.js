// Flat ESLint config (ESLint v9+).
//
// Deliberately self-contained: no external plugins or shared configs, so `npm
// run lint` works from a clean `npm ci` without pulling anything extra from the
// registry. Rules are intentionally light — they catch real mistakes (unused
// bindings, leftover debuggers) without forcing a reformat of existing code.
// Tighten these to "error" once the codebase is clean if you want a hard gate.
export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'shots/**', 'public/**'],
  },
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-constant-condition': ['warn', { checkLoops: false }],
      'no-debugger': 'warn',
      'no-var': 'warn',
      'prefer-const': 'warn',
    },
  },
]
