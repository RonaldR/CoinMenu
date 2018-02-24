<template>
  <tr>
    <transition name="fade">
      <td class="coinlist__delete" v-if="editMode">
        <a class="remove-link" @click="remove(coin.symbol)">
          <img src="../assets/icons/remove.svg" />
        </a>
      </td>
    </transition>
    <td class="coinlist__coin-short">
      <a @click="openExternalLink('https://coinmarketcap.com/currencies/' + coin.id)" target="_blank">
        {{ coin.symbol }}
      </a>
    </td>
    <td class="coinlist__coin">
      <a @click="openExternalLink('https://coinmarketcap.com/currencies/' + coin.id)" target="_blank">
        {{ coin.name }}
      </a>
    </td>
    <td class="coinlist__percent-change-24h right"
       :class="{ positive: coin.percent_change_24h >= 0, negative: coin.percent_change_24h < 0 }">
      {{ coin.percent_change_24h }}%
      <img src="../assets/icons/positive.svg" v-if="coin.percent_change_24h >= 0" />
      <img src="../assets/icons/negative.svg" v-if="coin.percent_change_24h < 0" />
    </td>
    <td class="coinlist__price">
      <span v-if="currency === 'dollar'">
        {{ coin.price_usd | currency('$', 3, { thousandsSeparator: '.', decimalSeparator: ',' }) }}
        <small class="coinlist__btc-price">
          {{ coin.price_btc | currency('', 8, { thousandsSeparator: '.', decimalSeparator: ',' }) }}
        </small>
      </span>
      <span v-if="currency === 'euro'">
        {{ coin.price_eur | currency('€', 3, { thousandsSeparator: '.', decimalSeparator: ',' }) }}
        <small class="coinlist__btc-price">
          {{ coin.price_btc | currency('', 8, { thousandsSeparator: '.', decimalSeparator: ',' }) }}
        </small>
      </span>
    </td>
  </tr>
</template>

<script>
import mixins from '../mixins';

export default {
  name: 'tablerow',
  props: {
    'coins': {
      type: Array,
      required: true
    },
    'coin': {
      type: Object,
      required: true
    },
    'currency': {
      type: String,
      required: true
    },
    'editMode': {
      type: Boolean,
      required: true
    }
  },
  mixins: [mixins],
  methods: {
    remove: function(symbol) {
      let personalCoinList = JSON.parse(localStorage.getItem("personalCoinList"));

      if (!personalCoinList || personalCoinList.length < 1) {
        // If there is no personal coin list yet, and the user removes one from the list,
        // we simply create a personalCoinList from all the coins so that remove works.
        personalCoinList = this.coins.map(coin => coin.symbol);
      }

      // get coin symbol from list
      let index = personalCoinList.indexOf(symbol);

      // if found remove and store in local storage
      if (index > -1) {
        personalCoinList.splice(index, 1);
        localStorage.setItem("personalCoinList", JSON.stringify(personalCoinList));

        // refresh coin list in parent component
        this.$parent.getCoins();
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.coinlist__coin {
  min-width: 110px;

  a {
    color: #888;
  }

  img {
    position: relative;
    top: 2px;
  }
}

.coinlist__price {
  text-align: right;
  min-width: 92px;
}

.coinlist__percent-change-24h {
  position: relative;
  padding-right: 24px;

  img {
    content: '';
    position: absolute;
    top: 8px;
    right: 6px;
    display: block;
    width: 14px;
    height: 14px;
    background-size: contain;
  }

  &.positive {
    color: #00CA7F;
  }
  &.negative {
    color: #FF504F;
  }
}

.coinlist__btc-price {
  display: block;
  color: #888;
  font-size: 10px;
}

.remove-link {
  color: red;
  text-decoration: none;
}
</style>
