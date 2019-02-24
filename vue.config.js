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
                    urlPattern: new RegExp('^https:\/\/cors-anywhere\.herokuapp\.com.*'),
                    handler: 'networkFirst',
                    options: {
                        networkTimeoutSeconds: 10,
                        cacheName: 'listingsdata',
                        cacheableResponse: {
                            statuses: [0, 200],
                        },
                    },
                }
            ],
        },
    },
};
