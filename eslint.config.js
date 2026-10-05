import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
    { ignores: ['dist/', 'out/', 'release/', 'node_modules/'] },
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['src/**/*.{js,vue}'],
        languageOptions: {
            globals: { ...globals.browser, __APP_VERSION__: 'readonly' },
        },
    },
    {
        files: ['electron/**/*.cjs'],
        languageOptions: { sourceType: 'commonjs', globals: globals.node },
    },
    {
        files: ['public/service-worker.js'],
        languageOptions: { globals: globals.serviceworker },
    },
    {
        files: ['*.config.js'],
        languageOptions: { globals: globals.node },
    },
    {
        rules: {
            'vue/html-indent': ['error', 4],
            'vue/max-attributes-per-line': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'vue/html-self-closing': ['error', { html: { void: 'never', normal: 'never', component: 'always' }, svg: 'always' }],
        },
    },
];
