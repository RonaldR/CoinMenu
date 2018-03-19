import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    personalCoinList: JSON.parse(localStorage.getItem('personalCoinList'))
  },
  getters: {
    getPersonalCoinList: state => { // return personalCoinList state
      return state.personalCoinList;
    },
    getCoinListWithHoldings: (state)  => (coinData) => { // filter the ones in the personal list
      return coinData.filter(item => state.personalCoinList.find(coin => {
        if (coin && coin.symbol && coin.symbol === item.symbol) {
          // add holding amount to coin object
          item.holding = coin.holding;
          return true;
        }
      }));
    },
  },
  mutations: {
    createCoinList: (state, coinList) => { // create coin list with objects
      state.personalCoinList = coinList.map(coin => {
        return {
          symbol: coin.symbol,
          holding: null
        };
      });

      // save to localStorage
      localStorage.setItem('personalCoinList', JSON.stringify(state.personalCoinList));
    },
    addCoins: (state, coinsToAdd) => {
      // add a coin to the list
      state.personalCoinList = state.personalCoinList.concat(
        coinsToAdd.split(',') // split string to Array
        // filter checks if coin is valid and not already in list
        .filter(coin => coin && coin.length > 2 && ! state.personalCoinList.find(item => {
          return item && item.symbol === coin;
        }))
        // maps to object
        .map(coin => {
          return {
            symbol: coin,
            holding: null
          };
        })
      );

      // save to localStorage
      localStorage.setItem('personalCoinList', JSON.stringify(state.personalCoinList));
    },
    removeCoin: (state, symbol) => {
      state.personalCoinList = state.personalCoinList.filter(coin => coin.symbol !== symbol);
      // save to localStorage
      localStorage.setItem('personalCoinList', JSON.stringify(state.personalCoinList));
    }
  },
  actions: {

  },
});
