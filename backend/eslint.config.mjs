import { defineConfig } from 'eslint/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url))

const eslintConfig = defineConfig(
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir,
      },
    },
  },
  prettierConfig,
)

export default eslintConfig
