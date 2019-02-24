module.exports = {
    lintOnSave: true,
    publicPath: '',
    pwa: {
        name: 'CoinMenu',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',
        workboxOptions: {
            runtimeCaching: [{
                urlPattern: new RegExp(`^https:\/\/cors-anywhere\.herokuapp\.com\/https:\/\/pro-api\.coinmarketcap\.com\/v1\/cryptocurrency\/listings\/latest\?convert=USD.*`),
                handler: 'networkFirst',
                options: {
                    networkTimeoutSeconds: 10,
                    cacheName: 'listingsdata',
                    cacheableResponse: {
                        statuses: [0, 200],
                    },
                },
            },
            {
                urlPattern: new RegExp(`^https:\/\/cors-anywhere\.herokuapp\.com\/https:\/\/pro-api\.coinmarketcap\.com\/v1\/global-metrics\/quotes\/latest\?convert\=USD`),
                handler: 'networkFirst',
                options: {
                    networkTimeoutSeconds: 10,
                    cacheName: 'quotesdata',
                    cacheableResponse: {
                        statuses: [0, 200],
                    },
                },
            }]
        }
    }
};
