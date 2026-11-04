import globals from 'globals';
import pluginJs from '@eslint/js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default [
  { languageOptions: { globals: { ...globals.browser, process: true } } },
  pluginJs.configs.recommended,
  {
    rules: {},
  },
]; 
