export const apiKey = env =>
    env === 'prod'
        ? '75fd4134-682c-4358-89cd-222e395c4ac1'
        : '83ee45ca-7023-4dc5-8670-e2fdbb48b405';

// environment url with cors proxy
export const envUrl = env =>
    env === 'prod'
        ? 'https://cors-anywhere.herokuapp.com/https://pro-api.coinmarketcap.com/'
        : 'https://cors-anywhere.herokuapp.com/https://sandbox-api.coinmarketcap.com/';
