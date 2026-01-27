// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended, // 기본 권장 설정
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // 여기에 기존에 사용하던 커스텀 규칙들을 옮겨 적으세요.
      "no-unused-vars": "warn", 
    },
  },
  {
    // 특정 파일 제외 설정 (기존 .eslintignore 역할)
    ignores: ["node_modules/", "dist/", "build/"],
  },
];
