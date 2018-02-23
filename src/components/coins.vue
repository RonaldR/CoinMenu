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

      <div class="header__edit-button">
        <a @click="toggleEditMode()" :class="{ editMode: editMode }">{{ editButtonLabel }}</a>
      </div>
    </div>

    <table id="coinlist" class="coinlist">
      <tr>
        <transition name="fade">
          <th class="coinlist__delete" v-if="editMode"></th>
        </transition>
        <th colspan="2">Coin</th>
        <th class="right">24h %</th>
        <th class="right">Latest price</th>
      </tr>
      <tablerow v-for="coin in coins" :key="coin.id" :coin="coin" :coins="coins" :currency="currency" :editMode="editMode" />
    </table>

    <transition name="fade">
      <addcoin v-if="editMode" />
    </transition>

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
      currency: 'dollar',
      editMode: false,
      editButtonLabel: 'Edit'
    }
  },
  methods: {
    getCoins: function() {
      // coinmarketcap api url
      let url = 'https://api.coinmarketcap.com/v1/ticker/?convert=EUR';

      const personalCoinList = JSON.parse(localStorage.getItem("personalCoinList"));

      // if no personal coin list, get the top 10
      if (!personalCoinList || personalCoinList.length < 1) {
        url += '&limit=10';
      }

      // fetch the data
      axios.get(url)
        .then((response) => {
          const coinData = response.data;

          if (!personalCoinList || personalCoinList.length < 1) {
            this.coins = coinData;
          } else {
            // only the once in the personal list
            this.coins = coinData.filter(item => personalCoinList.indexOf(item.symbol) !== -1);
          }

          // update the date
          this.refreshDate = moment().format('DD-MM-YYYY HH:mm:ss');
        })
        .catch((error) => {
          console.log(error);
          this.coins = null; // reset on error
        });
    },
    switchCurrency: function(currency) {
      // dollar, euro or btc
      this.currency = currency;
    },
    toggleEditMode: function() {
      this.editMode = !this.editMode;
      this.editButtonLabel = this.editMode ?  'Done' : 'Edit';
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
  width: 100%;
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
  padding: 12px 0 14px 0;
  border-bottom: 1px solid rgba(255,255,255,0.12);
}

.header__logo-title {
  display: flex;
  align-items: center;
}

.header__logo {
  margin-right: 12px;
}

.header__edit-button {
  a {
    transition: all .2s ease-in-out;
    display: inline-block;
    background: #353535;
    color: white;
    padding: 5px 8px;
    border-radius: 3px;
    min-width: 50px;
    text-align: center;

    &.editMode {
      background: #2E8DFF;
    }
  }
}
</style>
