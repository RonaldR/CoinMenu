import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    personalCoinList: JSON.parse(localStorage.getItem('personalCoinList')),
  },
  getters: {
    getPersonalCoinList: state => state.personalCoinList,// return personalCoinList state
    getCoinListWithHoldings: state => coinData => // filter the ones in the personal list
      coinData.filter(item => state.personalCoinList.find((coin) => {
        if (coin && coin.symbol && coin.symbol === item.symbol) {
          // add holding amount to coin object
          item.holding = coin.holding;
          return true;
        }
      })
    ),
    getHoldingAmount: state => (coinSymbol) => {
      const coin = state.personalCoinList.find(coinItem => coinItem && coinItem.symbol && coinItem.symbol === coinSymbol);
      if (coin) {
        return coin.holding;
      }
    },
  },
  mutations: {
    createCoinList: (state, coinList) => { // create coin list with objects
      state.personalCoinList = coinList.map(coin => ({
        symbol: coin.symbol,
        holding: null,
      }));

      // save to localStorage
      localStorage.setItem('personalCoinList', JSON.stringify(state.personalCoinList));
    },
    addCoins: (state, coinsToAdd) => {
      // add a coin to the list
      state.personalCoinList = state.personalCoinList.concat(coinsToAdd.split(',') // split string to Array
        // filter checks if coin is valid and not already in list
        .filter(coin => coin && coin.length > 2 && !state.personalCoinList.find(item => item && item.symbol === coin))
        // maps to object
        .map(coin => ({
          symbol: coin,
          holding: null,
        })));

      // save to localStorage
      localStorage.setItem('personalCoinList', JSON.stringify(state.personalCoinList));
    },
    removeCoin: (state, symbol) => {
      state.personalCoinList = state.personalCoinList.filter(coin => coin.symbol !== symbol);
      // save to localStorage
      localStorage.setItem('personalCoinList', JSON.stringify(state.personalCoinList));
    },
    saveHoldingAmount: (state, obj) => {
      const coin = state.personalCoinList.find(coinItem => coinItem.symbol === obj.symbol);
      if (coin) {
        coin.holding = obj.holdingAmount;
      }
      // save to localStorage
      localStorage.setItem('personalCoinList', JSON.stringify(state.personalCoinList));
    },
  },
  actions: {

  },
});
