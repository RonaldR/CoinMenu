const webpack = require('webpack');

module.exports = {
    lintOnSave: true,
    publicPath: '',
    pwa: {
        name: 'CoinMenu',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',
        workboxOptions: {
            runtimeCaching: [
                {
                    // eslint-disable-next-line
                    urlPattern: new RegExp('^https:\/\/cors-anywhere\.herokuapp\.com.*'),
                    handler: 'networkFirst',
                    options: {
                        networkTimeoutSeconds: 10,
                        cacheName: 'listingsdata',
                        cacheableResponse: {
                            statuses: [0, 200],
                        },
                    },
                },
            ],
        },
    },
    configureWebpack: {
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    PACKAGE_JSON: JSON.stringify(require('./package.json')),
                },
            }),
        ],
    },
};
