module.exports = {
  "extends": ["react-app"],
  "rules": {
  },
  "overrides": [
    {
      "files": ["**/*.js?(x)"],
      "rules": {
        "array-callback-return": "off",
        "eqeqeq": "off",
        "import/no-anonymous-default-export": "off",
        "jsx-a11y/img-redundant-alt": "off",
        "jsx-a11y/anchor-has-content": "off",
        "jsx-a11y/anchor-is-valid": "off",
        "jsx-a11y/alt-text": "off",
        "no-mixed-operators": "off",
        "no-self-assign": "off",
        "no-useless-escape": "off",
        "no-unused-vars": "off",
        "react/display-name": "off",
        "react/jsx-no-duplicate-props": "off",
        "react/jsx-no-target-blank": "off",
        "react/no-unescaped-entities": "off",
        "react/prop-types": "off",
        "react-hooks/exhaustive-deps": "off",
      }
    }
  ]
}
