<template>
  <div class="coins">

    <div class="header">
      <div class="header__logo-title">
        <img src="../assets/logo.svg" class="header__logo" />
        <span class="header__title">CoinMenu</span>
      </div>

      <div class="header__currency-switcher">
        <span class="currency" :class="{ active: currency === 'dollar' }" @click="switchCurrency('dollar')">USD</span>
        <span class="currency" :class="{ active: currency === 'euro' }" @click="switchCurrency('euro')">EUR</span>
        <span class="currency" :class="{ active: currency === 'btc' }" @click="switchCurrency('btc')">BTC</span>
      </div>
    </div>

    <table id="coinlist" class="coinlist">
      <tr>
        <th colspan="2">Coin</th>
        <th class="right">24h %</th>
        <th class="right">Latest price</th>
        <th class="right"></th>
      </tr>
      <tablerow v-for="coin in coins" :key="coin.id" :coin="coin" :coins="coins" :currency="currency" />
    </table>

    <addcoin />

    <foot :refresh-date="refreshDate" />
  </div>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import tablerow from './tablerow';
import foot from './foot';
import addcoin from './addcoin';

export default {
  name: 'coins',
  components: {
    tablerow,
    foot,
    addcoin
  },
  data() {
    return {
      coins: [],
      refreshDate: '',
      addcoin: '',
      currency: 'dollar'
    }
  },
  methods: {
    getCoins: function() {
      let url = 'https://api.coinmarketcap.com/v1/ticker/?convert=EUR';
      const personalCoinList = JSON.parse(localStorage.getItem("personalCoinList"));

      if (!personalCoinList || personalCoinList.length < 1) {
        url += '&limit=10';
      }

      axios.get(url)
        .then((response) => {
          const coinData = response.data;

          if (!personalCoinList || personalCoinList.length < 1) {
            this.coins = coinData;
          } else {
            this.coins = coinData.filter(item => personalCoinList.indexOf(item.symbol) !== -1);
          }

          this.refreshDate = moment().format('DD-MM-YYYY HH:mm:ss');
        })
        .catch((error) => {
          console.log(error);
          this.coins = null;
        });
    },
    switchCurrency: function(currency) {
      this.currency = currency;
    }
  },
  mounted() {
    this.getCoins();
  }
};
</script>

<style lang="scss" scoped>
th {
  font-size: 12px;
}

td {
  font-size: 14px;
}

.coinlist {
  margin-bottom: 16px;
}

.currency {
  cursor: pointer;
  color: #777;
  transition: all .2s ease-in-out;
  position: relative;
  margin-left: 16px;
  font-size: 12px;

  &:after {
    content: '';
    transition: all .2s ease-in-out;
    position: absolute;
    bottom: -20px;
    left: 0;
    width: 100%;
    height: 0;
    background: transparent;
  }

  &:hover,
  &.active {
    color: #fff;

    &:after {
      content: '';
      height: 2px;
      background: #2E8DFF;
    }
  }

  &.active {
    cursor: default;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255,255,255,0.12);
}

.header__logo-title {
  display: flex;
  align-items: center;
}

.header__logo {
  margin-right: 12px;
}
</style>
