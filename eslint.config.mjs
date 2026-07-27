import nextConfig from "eslint-config-next";

const config = [
  {
    ignores: [".next/**", "node_modules/**", "out/**"],
  },
  ...nextConfig,
  {
    rules: {
      // React Compiler rules newly bundled in eslint-config-next 16 —
      // downgraded to warn until the flagged effects are refactored.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
    },
  },
];

export default config;
