module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 8,
  },
  ignorePatterns: ["node_modules/*", ".next/*", ".out/*"],
  extends: ["eslint:recommended"],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      settings: {
        react: {
          version: "detect",
        },
        "import/resolver": {
          typescript: {},
        },
        "import/internal-regex": "^@/",
      },
      env: {
        browser: true,
        node: true,
        es6: true,
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended",
        "prettier/react",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
      ],
      rules: {
        "react/prop-types": "off",
        "@typescript-eslint/no-unused-vars": "error",
        "prettier/prettier": ["error", {}, { usePrettierrc: true }],
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "import/no-named-as-default": "off",
        "import/order": ["warn", { "newlines-between": "always" }],
      },
    },
  ],
}
