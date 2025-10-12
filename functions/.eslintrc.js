
module.exports = {
  "env": {
    "es6": true,
    "node": true,
  },
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
  },
  "extends": [
    "eslint:recommended",
    "google",
  ],
  "rules": {
    "quotes": ["error", "double"],
    "max-len": ["error", { "code": 120 }],
  },
};
