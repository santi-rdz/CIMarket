import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

const eslintConfig = defineConfig([...tseslint.configs.recommended, prettierConfig])

export default eslintConfig
