import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // .claude/worktrees holds git worktrees of this same repo, so linting it
  // reports every error N extra times, once per worktree.
  globalIgnores(['dist', '.claude']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // shadcn generates these verbatim from its registry, and its canonical
    // shape exports a component next to its cva variants. Keeping the files
    // unedited is what lets a component be re-added or copied from the app
    // repo without a diff, so the fast-refresh rule yields here instead.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // react-three-fiber scene code mutates Three.js objects (uniforms,
    // material opacity) inside useFrame — the imperative escape hatch the
    // immutability rule doesn't model.
    files: ['src/scene/**/*.{ts,tsx}', 'src/designer/scene/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
])
