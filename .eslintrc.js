module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    'ecmaVersion': 2018
  },
  env: {
    browser: true,
    node: true
  },
  globals: {
    __static: true
  },
  plugins: [
    'html'
  ],
  rules: {
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'extends': 'eslint:recommended',
    'indent': [
      'error',
      2,
      {
        'SwitchCase': 1
      }
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'no-unused-vars': [
      'warn'
    ],
    'no-undef': [
      'error'
    ],
    'no-console': 'off'
  }
}
