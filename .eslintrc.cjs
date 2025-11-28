module.exports = {
  root: true,
  env: { browser: true, node: true, es2021: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['import', '@typescript-eslint'],
  settings: {
    'import/resolver': {
      node: { extensions: ['.ts', '.tsx', '.js', '.vue'] }
    }
  },
  rules: {
    'import/no-unresolved': 'off'
  }
}