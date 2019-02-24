import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

/* eslint-disable */
export default new Vuex.Store({
    state: {
        personalCoinList: JSON.parse(localStorage.getItem('personalCoinList')),
    },
    getters: {
        // return personalCoinList state
        getPersonalCoinList: state => state.personalCoinList,
        getCoinListWithHoldings: state => coinData =>
            coinData.filter(item =>
                state.personalCoinList.find((coin) => {
                    if (coin && coin.symbol && coin.symbol === item.symbol) {
                        // add holding amount to coin object
                        // TODO:
                        // eslint-disable-next-line
                        item.holding = coin.holding;
                        return true;
                    }

                    return false;
                })),
        getHoldingAmount: state => (coinSymbol) => {
            if (state.personalCoinList) {
                const coin = state.personalCoinList.find(coinItem =>
                    coinItem && coinItem.symbol &&
                    coinItem.symbol === coinSymbol);
                return coin ? coin.holding : null;
            }
            
            return null;
        },
    },
    mutations: {
        createCoinList: (state, coinList) => {
            // create coin list with objects
            state.personalCoinList = coinList.map(coin => ({
                symbol: coin.symbol,
                holding: null,
            }));

            state = state;

            // save to localStorage
            localStorage.setItem('personalCoinList', JSON.stringify(state.personalCoinList));
        },
        addCoins: (state, coinsToAdd) => {
            // add a coin to the list
            state.personalCoinList = state.personalCoinList.concat(coinsToAdd
                .split(',') // split string to Array
            // filter checks if coin is valid and not already in list
                .filter(coin =>
                    coin &&
                            coin.length > 2 &&
                            !state.personalCoinList.find(item => item && item.symbol === coin))
            // maps to object
                .map(coin => ({
                    symbol: coin,
                    holding: null,
                })));

            // save to localStorage
            localStorage.setItem('personalCoinList', JSON.stringify(state.personalCoinList));
        },
        removeCoin: (state, symbol) => {
            state.personalCoinList = state.personalCoinList.filter(coin =>
                coin.symbol !== symbol);
            // save to localStorage
            localStorage.setItem('personalCoinList', JSON.stringify(state.personalCoinList));
        },
        saveHoldingAmount: (state, obj) => {
            state = state.personalCoinList.map((coinItem) => {
                if (coinItem.symbol === obj.symbol) {
                    // eslint-disable-next-line
                    coinItem.holding = obj.holdingAmount;
                }
                return coinItem;
            });

            // save to localStorage
            localStorage.setItem('personalCoinList', JSON.stringify(state.personalCoinList));
        },
    },
    actions: {},
});
