module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: ['plugin:vue/essential', '@vue/airbnb'],
    rules: {
        'no-console': 'off',
        indent: ['error', 4],
    },
    parserOptions: {
        parser: 'babel-eslint',
    },
};
